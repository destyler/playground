import type { WorkerLanguageService } from '@volar/monaco/worker'
import type { FrameworkConfig, WorkerMessage } from '../language/frameworks'
import type { File, Framework } from '../templates'
import * as volar from '@volar/monaco'
import * as monaco from 'monaco-editor-core'
import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import { getFrameworkConfig, hasLanguageServiceSupport } from '../language/frameworks'
import ReactWorker from '../language/workers/react.worker?worker'
import SolidWorker from '../language/workers/solid.worker?worker'
import SvelteWorker from '../language/workers/svelte.worker?worker'
import VueWorker from '../language/workers/vue.worker?worker'
import { FRAMEWORKS } from '../templates'
import { registerHighlighter } from '../theme/highlighter'
import { CONFIG_FILES, READ_ONLY_CONFIG_FILES, state } from './state'

// ============================================================================
// Types
// ============================================================================

type FileChangeCallback = (fileName: string, content: string) => void
type ConfigChangeCallback = (configFile: string, content: string) => void

// ============================================================================
// Constants
// ============================================================================

/**
 * Worker constructors for each framework
 */
const WORKER_CONSTRUCTORS: Record<Framework, new () => Worker> = {
  vue: VueWorker,
  react: ReactWorker,
  solid: SolidWorker,
  svelte: SvelteWorker,
}

/**
 * Language ID mapping by file extension
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  vue: 'vue',
  svelte: 'svelte',
  tsx: 'tsx',
  jsx: 'jsx',
  ts: 'typescript',
  js: 'javascript',
  css: 'css',
  html: 'html',
  json: 'json',
}

/**
 * Default language for unknown extensions
 */
const DEFAULT_LANGUAGE = 'plaintext'

// ============================================================================
// Module State
// ============================================================================

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let volarWorker: monaco.editor.MonacoWebWorker<WorkerLanguageService> | null = null
let disposeVolar: (() => void) | undefined
let editorOpenerDispose: monaco.IDisposable | undefined
let isEditorInitialized = false
let themeObserver: MutationObserver | null = null

// Callbacks
let onFileChangeCallback: FileChangeCallback | null = null
let onConfigChangeCallback: ConfigChangeCallback | null = null

// ============================================================================
// Theme Management
// ============================================================================

/**
 * Gets Monaco theme based on current document theme
 */
function getMonacoTheme(): string {
  const isDark = document.documentElement.classList.contains('dark')
    || document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? 'vitesse-dark' : 'vitesse-light'
}

/**
 * Updates editor theme based on document theme
 */
function updateEditorTheme(): void {
  if (editorInstance) {
    monaco.editor.setTheme(getMonacoTheme())
  }
}

/**
 * Sets up theme observer to watch for theme changes
 */
function setupThemeObserver(): void {
  themeObserver?.disconnect()

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

// ============================================================================
// Worker Management
// ============================================================================

/**
 * Cache of CDN file URIs that have already been processed
 * This prevents duplicate model creation across worker reinitializations
 */
const processedCdnUris = new Set<string>()

/**
 * Monaco worker host for handling CDN files (singleton instance)
 */
class MonacoWorkerHost {
  onFetchCdnFile(uri: string, text: string): void {
    // Check if we've already processed this URI
    if (processedCdnUris.has(uri)) {
      return
    }

    const monacoUri = monaco.Uri.parse(uri)
    if (!monaco.editor.getModel(monacoUri)) {
      monaco.editor.createModel(text, undefined, monacoUri)
    }

    // Mark as processed
    processedCdnUris.add(uri)
  }
}

// Singleton instance of the worker host
const workerHost = new MonacoWorkerHost()

/**
 * Gets worker constructor for a framework
 */
function getWorkerConstructor(framework: Framework): (new () => Worker) | null {
  return WORKER_CONSTRUCTORS[framework] ?? null
}

/**
 * Initializes worker for a framework
 */
async function initializeWorker(WorkerClass: new () => Worker): Promise<Worker> {
  const worker = new WorkerClass()
  return new Promise((resolve) => {
    worker.addEventListener('message', (event) => {
      if (event.data === 'inited') {
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

// ============================================================================
// Language Registration
// ============================================================================

/**
 * Registers languages for a framework
 */
function registerLanguages(config: FrameworkConfig): void {
  // Register framework-specific language
  if (config.type === 'vue') {
    monaco.languages.register({ id: 'vue', extensions: ['.vue'] })
    monaco.languages.setLanguageConfiguration('vue', config.languageConfiguration)
  }
  else if (config.type === 'svelte') {
    monaco.languages.register({ id: 'svelte', extensions: ['.svelte'] })
    monaco.languages.setLanguageConfiguration('svelte', config.languageConfiguration)
  }

  // Register common languages
  monaco.languages.register({ id: 'javascript', extensions: ['.js'] })
  monaco.languages.register({ id: 'typescript', extensions: ['.ts'] })
  monaco.languages.register({ id: 'jsx', extensions: ['.jsx'] })
  monaco.languages.register({ id: 'tsx', extensions: ['.tsx'] })
  monaco.languages.register({ id: 'css', extensions: ['.css'] })
  monaco.languages.register({ id: 'json', extensions: ['.json'] })
}

/**
 * Gets language ID for a file based on its extension
 */
function getLanguageForFile(fileName: string): string {
  const ext = fileName.split('.').pop() ?? ''
  return EXTENSION_TO_LANGUAGE[ext] ?? DEFAULT_LANGUAGE
}

// ============================================================================
// Monaco Environment Setup
// ============================================================================

// Setup Monaco environment
if (typeof window !== 'undefined') {
  registerHighlighter()
  ;(globalThis as any).MonacoEnvironment = {
    async getWorker(_: unknown, label: string): Promise<Worker> {
      const framework = label as Framework
      const WorkerClass = getWorkerConstructor(framework)
      if (WorkerClass) {
        return await initializeWorker(WorkerClass)
      }
      return new EditorWorker()
    },
  }
}

// ============================================================================
// Callback Registration
// ============================================================================

/**
 * Sets callback for file changes
 */
export function onEditorFileChange(callback: FileChangeCallback): void {
  onFileChangeCallback = callback
}

/**
 * Sets callback for config file changes
 */
export function onEditorConfigChange(callback: ConfigChangeCallback): void {
  onConfigChangeCallback = callback
}

// ============================================================================
// Editor Initialization
// ============================================================================

/**
 * Initializes the Monaco editor
 */
export async function initEditor(): Promise<void> {
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

  setupThemeObserver()
  setupContentChangeHandler()

  isEditorInitialized = true

  await setupLanguageService(state.activeFramework)
  syncFilesToModels()
  updateActiveModel()
}

/**
 * Sets up the content change handler for the editor
 */
function setupContentChangeHandler(): void {
  editorInstance?.onDidChangeModelContent(() => {
    const model = editorInstance?.getModel()
    if (!model)
      return

    const newValue = model.getValue()
    const rawFileName = model.uri.path.substring(1)

    // Handle config files
    if (rawFileName === CONFIG_FILES.TSCONFIG
      || rawFileName === CONFIG_FILES.IMPORT_MAP
      || rawFileName === CONFIG_FILES.UNO_CONFIG) {
      handleConfigFileChange(rawFileName, newValue)
      return
    }

    // Handle user files
    handleUserFileChange(rawFileName, newValue)
  })
}

/**
 * Handles config file content changes
 */
function handleConfigFileChange(fileName: string, newValue: string): void {
  if (fileName === CONFIG_FILES.TSCONFIG && state.tsconfigContent !== newValue) {
    state.tsconfigContent = newValue
    onConfigChangeCallback?.(fileName, newValue)
  }
  else if (fileName === CONFIG_FILES.IMPORT_MAP && state.importMapContent !== newValue) {
    state.importMapContent = newValue
    onConfigChangeCallback?.(fileName, newValue)
  }
  else if (fileName === CONFIG_FILES.UNO_CONFIG && state.unoConfigContent !== newValue) {
    state.unoConfigContent = newValue
    onConfigChangeCallback?.(fileName, newValue)
  }
}

/**
 * Handles user file content changes
 */
function handleUserFileChange(rawFileName: string, newValue: string): void {
  const config = getFrameworkConfig(state.activeFramework)
  let fileName = rawFileName

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

// ============================================================================
// Language Service
// ============================================================================

/**
 * Sets up language service for a framework
 */
export async function setupLanguageService(framework: Framework, clearModels = false): Promise<void> {
  const config = getFrameworkConfig(framework)

  // Cleanup previous language service
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

  const tsconfig = buildTsConfig(config)
  const worker = createLanguageWorker(config, tsconfig)
  volarWorker = worker

  await setupVolarProviders(config, worker)
  setupEditorOpener(config)
}

/**
 * Builds the TypeScript config, merging defaults with user customizations
 */
function buildTsConfig(config: FrameworkConfig): typeof config.tsconfig {
  if (!state.tsconfigContent) {
    return config.tsconfig
  }

  try {
    const customTsconfig = JSON.parse(state.tsconfigContent)
    return {
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
  catch (error) {
    console.warn('[Editor] Failed to parse custom tsconfig, using defaults', error)
    return config.tsconfig
  }
}

/**
 * Creates the language worker
 */
function createLanguageWorker(
  config: FrameworkConfig,
  tsconfig: typeof config.tsconfig,
): monaco.editor.MonacoWebWorker<WorkerLanguageService> {
  return monaco.editor.createWebWorker<WorkerLanguageService>({
    moduleId: `vs/language/${config.type}/${config.type}Worker`,
    label: config.workerLabel,
    host: workerHost,
    createData: {
      tsconfig,
      dependencies: config.dependencies,
    },
  })
}

/**
 * Sets up Volar providers
 */
async function setupVolarProviders(
  config: FrameworkConfig,
  worker: monaco.editor.MonacoWebWorker<WorkerLanguageService>,
): Promise<void> {
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
  catch (error) {
    console.error(`[Editor] Volar setup failed for ${config.type}:`, error)
  }
}

/**
 * Sets up the editor opener for go-to-definition
 */
function setupEditorOpener(config: FrameworkConfig): void {
  editorOpenerDispose = monaco.editor.registerEditorOpener({
    openCodeEditor(_source, resource) {
      if (resource.toString().startsWith('file:///node_modules')) {
        return true
      }

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
          window.dispatchEvent(new CustomEvent('editor:file-selected'))
          return true
        }
      }
      return false
    },
  })
}

// ============================================================================
// Model Synchronization
// ============================================================================

/**
 * Syncs files to Monaco models
 */
export function syncFilesToModels(): void {
  const config = getFrameworkConfig(state.activeFramework)
  const { files } = state

  if (files.length === 0)
    return

  // Create tsconfig and global types models if needed
  if (config && hasLanguageServiceSupport(state.activeFramework)) {
    createConfigModels(config)
  }

  // Sync user files
  for (const file of files) {
    syncFileToModel(file, config)
  }

  // Clean up orphaned models
  cleanupOrphanedModels(files, config)
}

/**
 * Creates config models for language service
 */
function createConfigModels(config: FrameworkConfig): void {
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

/**
 * Syncs a single file to its Monaco model
 */
function syncFileToModel(file: File, config: FrameworkConfig | null): void {
  const filePath = config?.filePathPrefix ? `${config.filePathPrefix}${file.name}` : file.name
  const uri = monaco.Uri.parse(`file:///${filePath}`)
  const lang = getLanguageForFile(file.name)

  let model = monaco.editor.getModel(uri)

  if (!model) {
    model = monaco.editor.createModel(file.content, lang, uri)
  }
  else {
    if (model.getValue() !== file.content) {
      model.setValue(file.content)
    }
    if (model.getLanguageId() !== lang) {
      monaco.editor.setModelLanguage(model, lang)
    }
  }
}

/**
 * Cleans up models that no longer have corresponding files
 */
function cleanupOrphanedModels(files: File[], config: FrameworkConfig | null): void {
  const currentFilePaths = files.map((f: File) =>
    config?.filePathPrefix ? `${config.filePathPrefix}${f.name}` : f.name,
  )

  // Config files that should never be cleaned up
  const protectedFiles = [
    CONFIG_FILES.TSCONFIG,
    CONFIG_FILES.IMPORT_MAP,
    CONFIG_FILES.UNO_CONFIG,
  ]

  monaco.editor.getModels().forEach((model) => {
    const uri = model.uri
    const filePath = uri.path.substring(1)

    // Skip protected config files
    if (protectedFiles.includes(filePath as any)) {
      return
    }

    // Skip CDN/external files (node_modules, https, http, cdn URLs)
    if (uri.path.includes('node_modules')
      || uri.scheme === 'https'
      || uri.scheme === 'http'
      || uri.authority.includes('cdn')
      || uri.authority.includes('esm.sh')
      || uri.authority.includes('unpkg')
      || uri.authority.includes('jsdelivr')) {
      return
    }

    // Only dispose user files that are no longer in the file list
    if (!currentFilePaths.includes(filePath)) {
      model.dispose()
    }
  })
}

// ============================================================================
// Active Model Management
// ============================================================================

/**
 * Updates the active model in the editor
 */
export function updateActiveModel(): void {
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
 * Disposes old model by file name (used when renaming files)
 */
export function disposeOldModel(fileName: string): void {
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

// ============================================================================
// Config File Management
// ============================================================================

/**
 * Gets default import map for the current framework
 */
function getDefaultImportMap(): object {
  const template = FRAMEWORKS[state.activeFramework]
  return template?.importMap ?? { imports: {} }
}

/**
 * Gets default tsconfig for the current framework
 */
function getDefaultTsconfig(): object {
  const template = FRAMEWORKS[state.activeFramework]
  return template?.tsconfig ?? {}
}

/**
 * Gets default uno config for the current framework
 */
function getDefaultUnoConfig(): string {
  const template = FRAMEWORKS[state.activeFramework]
  return template?.unoConfig ?? ''
}

/**
 * Initializes config file content in state if not already set
 */
export function initConfigContent(): void {
  if (!state.tsconfigContent) {
    state.tsconfigContent = JSON.stringify(getDefaultTsconfig(), null, 2)
  }
  if (!state.importMapContent) {
    state.importMapContent = JSON.stringify(getDefaultImportMap(), null, 2)
  }
  if (!state.unoConfigContent) {
    state.unoConfigContent = getDefaultUnoConfig()
  }
}

/**
 * Resets config content when framework changes
 */
export function resetConfigContent(): void {
  state.tsconfigContent = JSON.stringify(getDefaultTsconfig(), null, 2)
  state.importMapContent = JSON.stringify(getDefaultImportMap(), null, 2)
  state.unoConfigContent = getDefaultUnoConfig()

  // Update existing models if they exist
  const tsconfigUri = monaco.Uri.parse(`file:///${CONFIG_FILES.TSCONFIG}`)
  const tsconfigModel = monaco.editor.getModel(tsconfigUri)
  tsconfigModel?.setValue(state.tsconfigContent)

  const importMapUri = monaco.Uri.parse(`file:///${CONFIG_FILES.IMPORT_MAP}`)
  const importMapModel = monaco.editor.getModel(importMapUri)
  importMapModel?.setValue(state.importMapContent)

  const unoConfigUri = monaco.Uri.parse(`file:///${CONFIG_FILES.UNO_CONFIG}`)
  const unoConfigModel = monaco.editor.getModel(unoConfigUri)
  unoConfigModel?.setValue(state.unoConfigContent)
}

/**
 * Gets current import map from state
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
 * Sets editor to show a config file (tsconfig.json, import-map.json or uno.config.ts)
 * Note: import-map.json is read-only
 */
export function setEditorToConfigFile(configFile: typeof CONFIG_FILES.TSCONFIG | typeof CONFIG_FILES.IMPORT_MAP | typeof CONFIG_FILES.UNO_CONFIG): void {
  if (!editorInstance)
    return

  initConfigContent()

  const uri = monaco.Uri.parse(`file:///${configFile}`)
  let model = monaco.editor.getModel(uri)

  let content: string
  let language: string

  if (configFile === CONFIG_FILES.TSCONFIG) {
    content = state.tsconfigContent
    language = 'json'
  }
  else if (configFile === CONFIG_FILES.IMPORT_MAP) {
    content = state.importMapContent
    language = 'json'
  }
  else {
    content = state.unoConfigContent
    language = 'typescript'
  }

  if (!model) {
    model = monaco.editor.createModel(content, language, uri)
  }
  else if (model.getValue() !== content) {
    model.setValue(content)
  }

  editorInstance.setModel(model)

  // Set editor to read-only for import-map.json
  const isReadOnly = READ_ONLY_CONFIG_FILES.includes(configFile)
  editorInstance.updateOptions({ readOnly: isReadOnly })

  // For TypeScript files, trigger a delayed refresh to ensure semantic highlighting
  // works after type definitions are loaded from CDN
  if (language === 'typescript' && model) {
    scheduleSemanticRefresh(model)
  }
}

/**
 * Schedules a semantic refresh for the model after types are loaded
 * This ensures deprecated APIs show strikethrough on first open
 */
function scheduleSemanticRefresh(model: monaco.editor.ITextModel): void {
  setTimeout(() => {
    if (model.isDisposed()) 
return

    // Force Monaco to re-validate by pushing a no-op edit
    const fullRange = model.getFullModelRange()
    const currentContent = model.getValue()

    model.pushEditOperations(
      [],
      [{
        range: fullRange,
        text: currentContent,
        forceMoveMarkers: false,
      }],
      () => null,
    )
  }, 1500)
}

/**
 * Sets editor back to showing a user file
 */
export function setEditorToUserFile(): void {
  // Restore editor to editable mode when switching to user files
  if (editorInstance) {
    editorInstance.updateOptions({ readOnly: false })
  }
  updateActiveModel()
}

/**
 * Refreshes language service with updated tsconfig
 * This should be called when tsconfig is modified by the user
 */
export async function refreshLanguageService(): Promise<void> {
  const currentConfigFile = state.activeConfigFile

  await setupLanguageService(state.activeFramework, false)
  syncFilesToModels()

  if (currentConfigFile) {
    setEditorToConfigFile(currentConfigFile as typeof CONFIG_FILES.TSCONFIG | typeof CONFIG_FILES.IMPORT_MAP | typeof CONFIG_FILES.UNO_CONFIG)
  }
  else {
    updateActiveModel()
  }
}
