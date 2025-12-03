import type { WorkerLanguageService } from '@volar/monaco/worker'
import type { File, Framework } from '../utils/templates'
import type { CreateData, WorkerHost, WorkerMessage } from '../workers/vue.worker'
import * as volar from '@volar/monaco'
import * as monaco from 'monaco-editor-core'

import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import React, { useEffect, useRef } from 'react'
import { registerHighlighter } from '../utils/highlight'
import VueWorker from '../workers/vue.worker?worker'

// Register Shiki highlighter for syntax highlighting
if (typeof window !== 'undefined') {
  registerHighlighter()
}

// Vue language configuration (simplified from monaco's html config)

const vueLanguageConf: monaco.languages.LanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[\]{}\\|;:'",.<>/\s]+)/g,
  brackets: [
    ['<!--', '-->'],
    ['<', '>'],
    ['{', '}'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
    { open: '<', close: '>' },
  ],
}

// Monaco worker host for handling CDN files
class MonacoWorkerHost implements WorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    const monacoUri = monaco.Uri.parse(uri)
    if (!monaco.editor.getModel(monacoUri)) {
      monaco.editor.createModel(text, undefined, monacoUri)
    }
  }
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-restricted-globals
  ;(self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === 'vue') {
        const worker = new VueWorker()
        const init = new Promise<void>((resolve) => {
          worker.addEventListener('message', (data) => {
            if (data.data === 'inited') {
              resolve()
            }
          })
          worker.postMessage({
            event: 'init',
            tsVersion: '5.6.2',
            tsLocale: undefined,
          } satisfies WorkerMessage)
        })
        await init
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

  // Setup Volar for Vue - following vuejs/repl pattern exactly
  useEffect(() => {
    if (activeFramework !== 'vue') {
      disposeVolar?.()
      disposeVolar = undefined
      volarWorkerRef.current?.dispose()
      volarWorkerRef.current = null
      return
    }

    // Register languages
    monaco.languages.register({ id: 'vue', extensions: ['.vue'] })
    monaco.languages.register({ id: 'javascript', extensions: ['.js'] })
    monaco.languages.register({ id: 'typescript', extensions: ['.ts'] })
    monaco.languages.register({ id: 'css', extensions: ['.css'] })
    monaco.languages.setLanguageConfiguration('vue', vueLanguageConf)

    // Dependencies for Vue
    const dependencies: Record<string, string> = {
      'vue': '3.5.25',
      '@vue/compiler-core': '3.5.25',
      '@vue/compiler-dom': '3.5.25',
      '@vue/compiler-sfc': '3.5.25',
      '@vue/compiler-ssr': '3.5.25',
      '@vue/reactivity': '3.5.25',
      '@vue/runtime-core': '3.5.25',
      '@vue/runtime-dom': '3.5.25',
      '@vue/shared': '3.5.25',
    }

    // tsconfig
    const tsconfig = {
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        jsx: 'Preserve',
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        allowImportingTsExtensions: true,
      },
      vueCompilerOptions: {
        target: 3.5,
      },
    }

    // Create the web worker with Volar - following Monaco 0.52 API
    const worker = monaco.editor.createWebWorker<WorkerLanguageService>({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
      host: new MonacoWorkerHost(),
      createData: {
        tsconfig,
        dependencies,
      } satisfies CreateData,
    })

    volarWorkerRef.current = worker

    const languageId = ['vue', 'javascript', 'typescript']
    const getSyncUris = () =>
      monaco.editor.getModels()
        .filter(model => !model.uri.path.includes('node_modules'))
        .map(model => model.uri)

    // Setup Volar providers
    const setupProviders = async () => {
      try {
        const { dispose: disposeMarkers } = volar.activateMarkers(
          worker,
          languageId,
          'vue',
          getSyncUris,
          monaco.editor,
        )
        const { dispose: disposeAutoInsertion } = volar.activateAutoInsertion(
          worker,
          languageId,
          getSyncUris,
          monaco.editor,
        )
        const { dispose: disposeProviders } = await volar.registerProviders(
          worker,
          languageId,
          getSyncUris,
          monaco.languages,
        )

        disposeVolar = () => {
          disposeMarkers()
          disposeAutoInsertion()
          disposeProviders()
        }
      }
      catch (err) {
        console.error('[Editor] Volar setup failed:', err)
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
          // Remove src/ prefix for Vue files
          if (fileName.startsWith('src/')) {
            fileName = fileName.substring(4)
          }
          // Check if file exists and navigate to it (use refs to avoid stale closures)
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
    files.forEach((file) => {
      // Use src/ prefix for Vue files to match vuejs/repl pattern
      const filePath = activeFramework === 'vue' ? `src/${file.name}` : file.name
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      let model = monaco.editor.getModel(uri)

      // Determine language
      const ext = file.name.split('.').pop()
      let lang = 'plaintext'
      if (ext === 'vue')
        lang = 'vue'
      else if (ext === 'ts' || ext === 'tsx')
        lang = 'typescript'
      else if (ext === 'js' || ext === 'jsx')
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
    const currentFilePaths = files.map(f => activeFramework === 'vue' ? `src/${f.name}` : f.name)
    monaco.editor.getModels().forEach((model) => {
      const filePath = model.uri.path.substring(1)
      if (!currentFilePaths.includes(filePath) && !model.uri.path.includes('node_modules')) {
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
          // Remove src/ prefix for Vue files
          if (fileName.startsWith('src/')) {
            fileName = fileName.substring(4)
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
      // Use src/ prefix for Vue files
      const filePath = activeFramework === 'vue' ? `src/${activeFile}` : activeFile
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
