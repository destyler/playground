import type { WorkerLanguageService } from '@volar/monaco/worker'
import type { FrameworkConfig, WorkerMessage } from '../utils/frameworks'
import type { File, Framework } from '../utils/templates'
import * as volar from '@volar/monaco'
import * as monaco from 'monaco-editor-core'
import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import { getFrameworkConfig, hasLanguageServiceSupport } from '../utils/frameworks'
import { registerHighlighter } from '../utils/highlight'
import ReactWorker from '../workers/react.worker?worker'
import SolidWorker from '../workers/solid.worker?worker'
import SvelteWorker from '../workers/svelte.worker?worker'
import VueWorker from '../workers/vue.worker?worker'
import { IMPORT_MAP_FILE, state, TSCONFIG_FILE } from './state'

// Monaco editor variables
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let volarWorker: monaco.editor.MonacoWebWorker<WorkerLanguageService> | null = null
let disposeVolar: (() => void) | undefined
let editorOpenerDispose: monaco.IDisposable | undefined
let isEditorInitialized = false
let themeObserver: MutationObserver | null = null

// Callbacks
let onFileChangeCallback: ((fileName: string, content: string) => void) | null = null
let onConfigChangeCallback: ((configFile: string, content: string) => void) | null = null

/**
 * Get Monaco theme based on current document theme
 */
function getMonacoTheme(): string {
  const isDark = document.documentElement.classList.contains('dark')
    || document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? 'vitesse-dark' : 'vitesse-light'
}

/**
 * Update editor theme based on document theme
 */
function updateEditorTheme() {
  if (editorInstance) {
    monaco.editor.setTheme(getMonacoTheme())
  }
}

/**
 * Setup theme observer to watch for theme changes
 */
function setupThemeObserver() {
  if (themeObserver) {
    themeObserver.disconnect()
  }

  themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes'
        && (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
        updateEditorTheme()
        break
      }
    }
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  })
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
    case 'vue': return VueWorker
    case 'react': return ReactWorker
    case 'solid': return SolidWorker
    case 'svelte': return SvelteWorker
    default: return null
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
  if (config.type === 'vue') {
    monaco.languages.register({ id: 'vue', extensions: ['.vue'] })
    monaco.languages.setLanguageConfiguration('vue', config.languageConfiguration)
  }
  else if (config.type === 'svelte') {
    monaco.languages.register({ id: 'svelte', extensions: ['.svelte'] })
    monaco.languages.setLanguageConfiguration('svelte', config.languageConfiguration)
  }

  monaco.languages.register({ id: 'javascript', extensions: ['.js'] })
  monaco.languages.register({ id: 'typescript', extensions: ['.ts'] })
  monaco.languages.register({ id: 'jsx', extensions: ['.jsx'] })
  monaco.languages.register({ id: 'tsx', extensions: ['.tsx'] })
  monaco.languages.register({ id: 'css', extensions: ['.css'] })
  monaco.languages.register({ id: 'json', extensions: ['.json'] })
}

// Setup Monaco environment
if (typeof window !== 'undefined') {
  registerHighlighter()
  ;(globalThis as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      const framework = label as Framework
      const WorkerClass = getWorkerConstructor(framework)
      if (WorkerClass) {
        return await initializeWorker(WorkerClass)
      }
      return new EditorWorker()
    },
  }
}

/**
 * Set callback for file changes
 */
export function onEditorFileChange(callback: (fileName: string, content: string) => void) {
  onFileChangeCallback = callback
}

/**
 * Set callback for config file changes
 */
export function onEditorConfigChange(callback: (configFile: string, content: string) => void) {
  onConfigChangeCallback = callback
}

/**
 * Initialize the Monaco editor
 */
export async function initEditor() {
  if (isEditorInitialized)
    return

  const container = document.getElementById('editor-container')
  if (!container) {
    console.error('[Editor] Container not found')
    return
  }

  editorInstance = monaco.editor.create(container, {
    model: null,
    theme: getMonacoTheme(),
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    padding: { top: 16 },
    scrollBeyondLastLine: false,
    fixedOverflowWidgets: true,
  })

  // Setup theme observer to watch for light/dark mode changes
  setupThemeObserver()

  editorInstance.onDidChangeModelContent(() => {
    const model = editorInstance?.getModel()
    if (model) {
      const newValue = model.getValue()
      let fileName = model.uri.path.substring(1)

      // Check if this is a config file
      if (fileName === TSCONFIG_FILE || fileName === IMPORT_MAP_FILE) {
        if (fileName === TSCONFIG_FILE && state.tsconfigContent !== newValue) {
          state.tsconfigContent = newValue
          onConfigChangeCallback?.(fileName, newValue)
        }
        else if (fileName === IMPORT_MAP_FILE && state.importMapContent !== newValue) {
          state.importMapContent = newValue
          onConfigChangeCallback?.(fileName, newValue)
        }
        return
      }

      const config = getFrameworkConfig(state.activeFramework)
      if (config?.filePathPrefix && fileName.startsWith(config.filePathPrefix)) {
        fileName = fileName.substring(config.filePathPrefix.length)
      }

      const currentFile = state.files.find((f: File) => f.name === fileName)
      if (currentFile && currentFile.content !== newValue) {
        state.files = state.files.map((f: File) =>
          f.name === fileName ? { ...f, content: newValue } : f,
        )
        onFileChangeCallback?.(fileName, newValue)
      }
    }
  })

  isEditorInitialized = true

  await setupLanguageService(state.activeFramework)
  syncFilesToModels()
  updateActiveModel()
}

/**
 * Setup language service for a framework
 */
export async function setupLanguageService(framework: Framework, clearModels: boolean = false) {
  const config = getFrameworkConfig(framework)

  disposeVolar?.()
  disposeVolar = undefined
  editorOpenerDispose?.dispose()
  editorOpenerDispose = undefined
  volarWorker?.dispose()
  volarWorker = null

  if (clearModels) {
    monaco.editor.getModels().forEach(model => model.dispose())
  }

  if (!config || !hasLanguageServiceSupport(framework))
    return

  registerLanguages(config)

  // Get custom tsconfig from state if available
  let tsconfig = config.tsconfig
  if (state.tsconfigContent) {
    try {
      const customTsconfig = JSON.parse(state.tsconfigContent)
      // Merge custom tsconfig with framework defaults
      tsconfig = {
        ...config.tsconfig,
        compilerOptions: {
          ...config.tsconfig.compilerOptions,
          ...customTsconfig.compilerOptions,
        },
        ...(config.type === 'vue' && customTsconfig.vueCompilerOptions
          ? {
              vueCompilerOptions: {
                ...config.tsconfig.vueCompilerOptions,
                ...customTsconfig.vueCompilerOptions,
              },
            }
          : {}),
      }
    }
    catch (e) {
      console.warn('[Editor] Failed to parse custom tsconfig, using defaults', e)
    }
  }

  const worker = monaco.editor.createWebWorker<WorkerLanguageService>({
    moduleId: `vs/language/${config.type}/${config.type}Worker`,
    label: config.workerLabel,
    host: new MonacoWorkerHost(),
    createData: {
      tsconfig,
      dependencies: config.dependencies,
    },
  })

  volarWorker = worker

  const getSyncUris = () => {
    return monaco.editor.getModels()
      .filter(model => !model.uri.path.includes('node_modules'))
      .map(model => model.uri)
  }

  try {
    const { dispose: disposeMarkers } = volar.activateMarkers(
      worker,
      config.languageIds,
      config.type,
      getSyncUris,
      monaco.editor,
    )
    const { dispose: disposeAutoInsertion } = volar.activateAutoInsertion(
      worker,
      config.languageIds,
      getSyncUris,
      monaco.editor,
    )
    const { dispose: disposeProviders } = await volar.registerProviders(
      worker,
      config.languageIds,
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
    console.error(`[Editor] Volar setup failed for ${framework}:`, err)
  }

  editorOpenerDispose = monaco.editor.registerEditorOpener({
    openCodeEditor(_source, resource) {
      if (resource.toString().startsWith('file:///node_modules'))
        return true

      const path = resource.path
      if (/^\//.test(path)) {
        let fileName = path.replace('/', '')
        if (config.filePathPrefix && fileName.startsWith(config.filePathPrefix)) {
          fileName = fileName.substring(config.filePathPrefix.length)
        }
        const fileExists = state.files.some((f: File) => f.name === fileName)
        if (fileExists && fileName !== state.activeFile) {
          state.activeFile = fileName
          updateActiveModel()
          // Dispatch event for UI update
          window.dispatchEvent(new CustomEvent('editor:file-selected'))
          return true
        }
      }
      return false
    },
  })
}

/**
 * Sync files to Monaco models
 */
export function syncFilesToModels() {
  const config = getFrameworkConfig(state.activeFramework)
  const files = state.files

  if (files.length === 0)
    return

  if (config && hasLanguageServiceSupport(state.activeFramework)) {
    const tsconfigUri = monaco.Uri.parse('file:///tsconfig.json')
    if (!monaco.editor.getModel(tsconfigUri)) {
      monaco.editor.createModel(JSON.stringify(config.tsconfig, null, 2), 'json', tsconfigUri)
    }

    if (config.generateGlobalTypes) {
      const globalTypesFileName = config.type === 'vue' ? 'vue_3.4_0.d.ts' : `${config.type}-global.d.ts`
      const globalTypesUri = monaco.Uri.parse(`file:///node_modules/${globalTypesFileName}`)
      if (!monaco.editor.getModel(globalTypesUri)) {
        monaco.editor.createModel(config.generateGlobalTypes(), 'typescript', globalTypesUri)
      }
    }
  }

  files.forEach((file: File) => {
    const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${file.name}` : file.name
    const uri = monaco.Uri.parse(`file:///${filePath}`)
    let model = monaco.editor.getModel(uri)

    const ext = file.name.split('.').pop()
    let lang = 'plaintext'
    if (ext === 'vue')
      lang = 'vue'
    else if (ext === 'svelte')
      lang = 'svelte'
    else if (ext === 'tsx')
      lang = 'tsx'
    else if (ext === 'jsx')
      lang = 'jsx'
    else if (ext === 'ts')
      lang = 'typescript'
    else if (ext === 'js')
      lang = 'javascript'
    else if (ext === 'css')
      lang = 'css'
    else if (ext === 'html')
      lang = 'html'
    else if (ext === 'json')
      lang = 'json'

    if (!model) {
      model = monaco.editor.createModel(file.content, lang, uri)
    }
    else {
      if (model.getValue() !== file.content)
        model.setValue(file.content)
      if (model.getLanguageId() !== lang)
        monaco.editor.setModelLanguage(model, lang)
    }
  })

  const currentFilePaths = files.map((f: File) =>
    config?.filePathPrefix ? `${config.filePathPrefix}${f.name}` : f.name,
  )
  monaco.editor.getModels().forEach((model) => {
    const filePath = model.uri.path.substring(1)
    if (filePath === 'tsconfig.json' || model.uri.path.includes('node_modules'))
      return
    if (!currentFilePaths.includes(filePath))
      model.dispose()
  })
}

/**
 * Update the active model in the editor
 */
export function updateActiveModel() {
  if (!editorInstance || !state.activeFile)
    return

  const config = getFrameworkConfig(state.activeFramework)
  const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${state.activeFile}` : state.activeFile
  const uri = monaco.Uri.parse(`file:///${filePath}`)
  const model = monaco.editor.getModel(uri)

  if (model && editorInstance.getModel() !== model) {
    editorInstance.setModel(model)
  }
}

/**
 * Dispose old model by file name (used when renaming files)
 */
export function disposeOldModel(fileName: string) {
  const config = getFrameworkConfig(state.activeFramework)
  const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${fileName}` : fileName
  const uri = monaco.Uri.parse(`file:///${filePath}`)
  const model = monaco.editor.getModel(uri)

  if (model) {
    // If the editor is currently showing this model, set to null first
    if (editorInstance?.getModel() === model) {
      editorInstance.setModel(null)
    }
    model.dispose()
  }
}

/**
 * Get default import map for the current framework
 */
function getDefaultImportMap(): object {
  const config = getFrameworkConfig(state.activeFramework)
  if (!config)
    return { imports: {} }

  // Generate import map based on framework dependencies
  const imports: Record<string, string> = {}

  if (config.type === 'vue') {
    imports.vue = 'https://esm.sh/vue@3'
  }
  else if (config.type === 'react') {
    imports.react = 'https://esm.sh/react@18'
    imports['react-dom'] = 'https://esm.sh/react-dom@18'
    imports['react-dom/client'] = 'https://esm.sh/react-dom@18/client'
  }
  else if (config.type === 'solid') {
    imports['solid-js'] = 'https://esm.sh/solid-js@1'
    imports['solid-js/web'] = 'https://esm.sh/solid-js@1/web'
  }
  else if (config.type === 'svelte') {
    imports.svelte = 'https://esm.sh/svelte@5'
  }

  return { imports }
}

/**
 * Get default tsconfig for the current framework
 */
function getDefaultTsconfig(): object {
  const config = getFrameworkConfig(state.activeFramework)
  return config?.tsconfig || {}
}

/**
 * Initialize config file content in state if not already set
 */
export function initConfigContent() {
  if (!state.tsconfigContent) {
    state.tsconfigContent = JSON.stringify(getDefaultTsconfig(), null, 2)
  }
  if (!state.importMapContent) {
    state.importMapContent = JSON.stringify(getDefaultImportMap(), null, 2)
  }
}

/**
 * Reset config content when framework changes
 */
export function resetConfigContent() {
  state.tsconfigContent = JSON.stringify(getDefaultTsconfig(), null, 2)
  state.importMapContent = JSON.stringify(getDefaultImportMap(), null, 2)

  // Update existing models if they exist
  const tsconfigUri = monaco.Uri.parse(`file:///${TSCONFIG_FILE}`)
  const tsconfigModel = monaco.editor.getModel(tsconfigUri)
  if (tsconfigModel) {
    tsconfigModel.setValue(state.tsconfigContent)
  }

  const importMapUri = monaco.Uri.parse(`file:///${IMPORT_MAP_FILE}`)
  const importMapModel = monaco.editor.getModel(importMapUri)
  if (importMapModel) {
    importMapModel.setValue(state.importMapContent)
  }
}

/**
 * Get current import map from state
 */
export function getImportMap(): object {
  try {
    return JSON.parse(state.importMapContent || '{}')
  }
  catch {
    return getDefaultImportMap()
  }
}

/**
 * Set editor to show a config file (tsconfig.json or import-map.json)
 */
export function setEditorToConfigFile(configFile: typeof TSCONFIG_FILE | typeof IMPORT_MAP_FILE) {
  if (!editorInstance)
    return

  // Initialize config content if needed
  initConfigContent()

  const uri = monaco.Uri.parse(`file:///${configFile}`)
  let model = monaco.editor.getModel(uri)

  const content = configFile === TSCONFIG_FILE ? state.tsconfigContent : state.importMapContent

  if (!model) {
    // Create the model with content from state
    model = monaco.editor.createModel(content, 'json', uri)
  }
  else {
    // Update existing model content if different
    if (model.getValue() !== content) {
      model.setValue(content)
    }
  }

  editorInstance.setModel(model)
}

/**
 * Set editor back to showing a user file
 */
export function setEditorToUserFile() {
  updateActiveModel()
}

/**
 * Refresh language service with updated tsconfig
 * This should be called when tsconfig is modified by the user
 */
export async function refreshLanguageService() {
  // Remember current config file being edited
  const currentConfigFile = state.activeConfigFile

  // Re-setup language service with the current framework
  // This will pick up the new tsconfig from state
  await setupLanguageService(state.activeFramework, false)

  // Re-sync files to ensure models are properly registered
  syncFilesToModels()

  // If we were editing a config file, stay on it
  if (currentConfigFile) {
    setEditorToConfigFile(currentConfigFile)
  }
  else {
    // Update active model
    updateActiveModel()
  }
}
