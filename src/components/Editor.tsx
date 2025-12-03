import type { WorkerLanguageService } from '@volar/monaco/worker'
import type { FrameworkConfig, WorkerMessage } from '../utils/frameworks'
import type { File, Framework } from '../utils/templates'
import * as volar from '@volar/monaco'
import * as monaco from 'monaco-editor-core'

import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import React, { useEffect, useRef } from 'react'
import { getFrameworkConfig, hasLanguageServiceSupport } from '../utils/frameworks'
import { registerHighlighter } from '../utils/highlight'

// Import workers dynamically
import ReactWorker from '../workers/react.worker?worker'
import VueWorker from '../workers/vue.worker?worker'

// Register Shiki highlighter for syntax highlighting
if (typeof window !== 'undefined') {
  registerHighlighter()
}

/**
 * Monaco worker host for handling CDN files
 */
class MonacoWorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    const monacoUri = monaco.Uri.parse(uri)
    if (!monaco.editor.getModel(monacoUri)) {
      monaco.editor.createModel(text, undefined, monacoUri)
    }
  }
}

/**
 * Get worker constructor for a framework
 */
function getWorkerConstructor(framework: Framework): (new () => Worker) | null {
  switch (framework) {
    case 'vue':
      return VueWorker
    case 'react':
      return ReactWorker
    default:
      return null
  }
}

/**
 * Initialize worker for a framework
 */
async function initializeWorker(WorkerClass: new () => Worker): Promise<Worker> {
  const worker = new WorkerClass()
  return new Promise((resolve) => {
    worker.addEventListener('message', (data) => {
      if (data.data === 'inited') {
        resolve(worker)
      }
    })
    worker.postMessage({
      event: 'init',
      tsVersion: 'latest',
      tsLocale: undefined,
    } satisfies WorkerMessage)
  })
}

/**
 * Register languages for a framework
 */
function registerLanguages(config: FrameworkConfig) {
  // Register framework-specific language
  if (config.type === 'vue') {
    monaco.languages.register({ id: 'vue', extensions: ['.vue'] })
    monaco.languages.setLanguageConfiguration('vue', config.languageConfiguration)
  }

  // Register common languages
  monaco.languages.register({ id: 'javascript', extensions: ['.js'] })
  monaco.languages.register({ id: 'typescript', extensions: ['.ts'] })
  monaco.languages.register({ id: 'javascriptreact', extensions: ['.jsx'] })
  monaco.languages.register({ id: 'typescriptreact', extensions: ['.tsx'] })
  monaco.languages.register({ id: 'css', extensions: ['.css'] })
  monaco.languages.register({ id: 'json', extensions: ['.json'] })
}

/**
 * Setup Monaco environment for framework workers
 */
if (typeof window !== 'undefined') {
  // Worker map for caching initialized workers
  const workerCache = new Map<string, Worker>()

  // eslint-disable-next-line no-restricted-globals
  ;(self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      const framework = label as Framework
      const WorkerClass = getWorkerConstructor(framework)

      if (WorkerClass) {
        // Check cache first
        if (workerCache.has(framework)) {
          return workerCache.get(framework)!
        }

        const worker = await initializeWorker(WorkerClass)
        workerCache.set(framework, worker)
        return worker
      }

      return new EditorWorker()
    },
  }
}

interface EditorProps {
  files: File[]
  activeFile: string
  activeFramework: Framework
  onFileChange: (fileName: string, newContent: string) => void
  onFileSelect?: (fileName: string) => void
}

// Volar dispose function
let disposeVolar: (() => void) | undefined

export default function Editor({ files, activeFile, activeFramework, onFileChange, onFileSelect }: EditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const volarWorkerRef = useRef<monaco.editor.MonacoWebWorker<WorkerLanguageService> | null>(null)

  // Use refs to avoid stale closures in registerEditorOpener
  const filesRef = useRef(files)
  const activeFileRef = useRef(activeFile)
  const onFileSelectRef = useRef(onFileSelect)

  // Keep refs in sync
  useEffect(() => {
    filesRef.current = files
    activeFileRef.current = activeFile
    onFileSelectRef.current = onFileSelect
  }, [files, activeFile, onFileSelect])

  // Setup language service for frameworks with full type support
  useEffect(() => {
    const config = getFrameworkConfig(activeFramework as any)

    // Clean up previous Volar setup
    disposeVolar?.()
    disposeVolar = undefined
    volarWorkerRef.current?.dispose()
    volarWorkerRef.current = null

    // Check if this framework has language service support
    if (!config || !hasLanguageServiceSupport(activeFramework as any)) {
      return
    }

    // Register languages
    registerLanguages(config)

    // Create the web worker with Volar
    const worker = monaco.editor.createWebWorker<WorkerLanguageService>({
      moduleId: `vs/language/${config.type}/${config.type}Worker`,
      label: config.workerLabel,
      host: new MonacoWorkerHost(),
      createData: {
        tsconfig: config.tsconfig,
        dependencies: config.dependencies,
      },
    })

    volarWorkerRef.current = worker

    const getSyncUris = () => {
      const models = monaco.editor.getModels()
        .filter(model => !model.uri.path.includes('node_modules'))
        .map(model => model.uri)
      console.warn(`[Editor] getSyncUris called for ${activeFramework}, returning:`, models.map(m => m.toString()))
      return models
    }

    // Setup Volar providers
    const setupProviders = async () => {
      console.warn(`[Editor] Setting up Volar providers for ${activeFramework}...`)
      try {
        const { dispose: disposeMarkers } = volar.activateMarkers(
          worker,
          config.languageIds,
          config.type,
          getSyncUris,
          monaco.editor,
        )
        console.warn('[Editor] Markers activated')

        const { dispose: disposeAutoInsertion } = volar.activateAutoInsertion(
          worker,
          config.languageIds,
          getSyncUris,
          monaco.editor,
        )
        console.warn('[Editor] AutoInsertion activated')

        const { dispose: disposeProviders } = await volar.registerProviders(
          worker,
          config.languageIds,
          getSyncUris,
          monaco.languages,
        )
        console.warn('[Editor] Providers registered successfully')

        disposeVolar = () => {
          disposeMarkers()
          disposeAutoInsertion()
          disposeProviders()
        }
      }
      catch (err) {
        console.error(`[Editor] Volar setup failed for ${activeFramework}:`, err)
      }
    }

    setupProviders()

    // Support for go to definition
    monaco.editor.registerEditorOpener({
      openCodeEditor(_source, resource) {
        if (resource.toString().startsWith('file:///node_modules')) {
          return true
        }

        const path = resource.path
        if (/^\//.test(path)) {
          let fileName = path.replace('/', '')
          // Remove file path prefix if exists
          if (config.filePathPrefix && fileName.startsWith(config.filePathPrefix)) {
            fileName = fileName.substring(config.filePathPrefix.length)
          }
          // Check if file exists and navigate to it
          const fileExists = filesRef.current.some(f => f.name === fileName)
          if (fileExists && fileName !== activeFileRef.current) {
            onFileSelectRef.current?.(fileName)
            return true
          }
        }

        return false
      },
    })

    return () => {
      disposeVolar?.()
      disposeVolar = undefined
      volarWorkerRef.current?.dispose()
      volarWorkerRef.current = null
    }
  }, [activeFramework])

  // Sync files to Monaco Models
  useEffect(() => {
    const config = getFrameworkConfig(activeFramework as any)

    // Add tsconfig.json for language service
    if (config && hasLanguageServiceSupport(activeFramework as any)) {
      const tsconfigUri = monaco.Uri.parse('file:///tsconfig.json')
      const tsconfigContent = JSON.stringify(config.tsconfig, null, 2)
      const tsconfigModel = monaco.editor.getModel(tsconfigUri)
      if (!tsconfigModel) {
        monaco.editor.createModel(tsconfigContent, 'json', tsconfigUri)
      }

      // Add framework-specific global types if needed
      if (config.generateGlobalTypes) {
        const globalTypesFileName = config.type === 'vue' ? 'vue_3.4_0.d.ts' : `${config.type}-global.d.ts`
        const globalTypesUri = monaco.Uri.parse(`file:///node_modules/${globalTypesFileName}`)
        const globalTypesModel = monaco.editor.getModel(globalTypesUri)
        if (!globalTypesModel) {
          const globalTypesContent = config.generateGlobalTypes()
          monaco.editor.createModel(globalTypesContent, 'typescript', globalTypesUri)
          console.warn(`[Editor] Created ${config.type} global types model:`, globalTypesFileName)
        }
      }
    }

    files.forEach((file) => {
      // Use file path prefix for frameworks that need it
      const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${file.name}` : file.name
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      let model = monaco.editor.getModel(uri)

      // Determine language
      const ext = file.name.split('.').pop()
      let lang = 'plaintext'
      if (ext === 'vue')
        lang = 'vue'
      else if (ext === 'tsx')
        lang = 'typescriptreact'
      else if (ext === 'jsx')
        lang = 'javascriptreact'
      else if (ext === 'ts')
        lang = 'typescript'
      else if (ext === 'js')
        lang = 'javascript'
      else if (ext === 'css')
        lang = 'css'
      else if (ext === 'html' || ext === 'svelte')
        lang = 'html'
      else if (ext === 'json')
        lang = 'json'

      if (!model) {
        model = monaco.editor.createModel(file.content, lang, uri)
      }
      else {
        if (model.getValue() !== file.content) {
          model.setValue(file.content)
        }
        // Update language if needed
        if (model.getLanguageId() !== lang) {
          monaco.editor.setModelLanguage(model, lang)
        }
      }
    })

    // Dispose models for deleted files
    const currentFilePaths = files.map(f => config?.filePathPrefix ? `${config.filePathPrefix}${f.name}` : f.name)
    monaco.editor.getModels().forEach((model) => {
      const filePath = model.uri.path.substring(1)
      // Don't dispose tsconfig.json or node_modules
      if (filePath === 'tsconfig.json' || model.uri.path.includes('node_modules')) {
        return
      }
      if (!currentFilePaths.includes(filePath)) {
        model.dispose()
      }
    })
  }, [files, activeFramework])

  // Initialize Editor
  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        model: null,
        theme: 'dark-plus',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        fixedOverflowWidgets: true,
      })

      editorRef.current.onDidChangeModelContent(() => {
        const model = editorRef.current?.getModel()
        if (model) {
          const newValue = model.getValue()
          let fileName = model.uri.path.substring(1)
          // Remove file path prefix
          const config = getFrameworkConfig(activeFramework as any)
          if (config?.filePathPrefix && fileName.startsWith(config.filePathPrefix)) {
            fileName = fileName.substring(config.filePathPrefix.length)
          }
          onFileChange(fileName, newValue)
        }
      })
    }

    return () => {
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [])

  // Update editor model when activeFile changes
  useEffect(() => {
    if (editorRef.current) {
      const config = getFrameworkConfig(activeFramework as any)
      const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${activeFile}` : activeFile
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      const model = monaco.editor.getModel(uri)
      if (model && editorRef.current.getModel() !== model) {
        editorRef.current.setModel(model)
      }
    }
  }, [activeFile, activeFramework])

  return (
    <div ref={editorContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  )
}
