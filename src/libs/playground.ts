import type { File, Framework } from '../templates'
import { FRAMEWORKS } from '../templates'
import { generateHtml } from '../utils/html'
import { getStateFromUrl, recordToFiles, updateUrlHash } from '../utils/url'
import {
  disposeOldModel,
  getImportMap,
  initConfigContent,
  initEditor,
  onEditorConfigChange,
  onEditorFileChange,
  refreshLanguageService,
  resetConfigContent,
  setEditorToConfigFile,
  setEditorToUserFile,
  setupLanguageService,
  syncFilesToModels,
  updateActiveModel,
} from './editor'
import { CONFIG_FILES, state } from './state'
import { generateCSSFromFiles } from './unocss'

// ============================================================================
// Constants
// ============================================================================

/**
 * Debounce delays in milliseconds
 */
const DEBOUNCE_DELAYS = {
  IFRAME_UPDATE: 1000,
  URL_UPDATE: 500,
  TSCONFIG_UPDATE: 1000,
  UNO_UPDATE: 300,
  CLICK: 200,
  URL_RESTORE: 100,
  URL_RESTORE_COMPLETE: 200,
  IFRAME_LOAD: 500,
} as const

/**
 * Default framework when no URL state is present
 */
const DEFAULT_FRAMEWORK: Framework = 'vue'

// ============================================================================
// Module State
// ============================================================================

let iframeRef: HTMLIFrameElement | null = null
let isIframeLoaded = false
let previousFramework: Framework = DEFAULT_FRAMEWORK
let isRestoringFromUrl = false

// Debounce timers
let updateTimer: ReturnType<typeof setTimeout> | null = null
let urlUpdateTimer: ReturnType<typeof setTimeout> | null = null
let tsconfigUpdateTimer: ReturnType<typeof setTimeout> | null = null
let unoUpdateTimer: ReturnType<typeof setTimeout> | null = null

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the playground application
 * Sets up the editor, preview iframe, and event listeners
 */
export async function initPlayground(): Promise<void> {
  iframeRef = document.getElementById('preview-iframe') as HTMLIFrameElement
  const fileTabsContainer = document.getElementById('file-tabs')

  if (!iframeRef || !fileTabsContainer) {
    console.error('[Playground] Required DOM elements not found')
    return
  }

  // Initialize state from URL or use defaults
  const urlState = getStateFromUrl()
  initializeState(urlState)

  // Notify components that state is ready (for version select, etc.)
  window.dispatchEvent(new CustomEvent('playground:state-ready', {
    detail: {
      framework: state.activeFramework,
      destylerVersion: state.destylerVersion,
    },
  }))

  // Setup callbacks and event listeners
  setupEditorCallbacks()
  setupEventListeners()

  // Initialize UI
  initConfigContent()
  renderFileTabs()
  setupConfigButtons()

  // Generate initial UnoCSS
  await generateUnoCSS()

  updateIframe()

  // Initialize editor
  await initEditor()

  // Handle special case for non-default framework from URL
  if (urlState && urlState.framework !== DEFAULT_FRAMEWORK) {
    await setupLanguageService(urlState.framework, true)
    syncFilesToModels()
    updateActiveModel()
  }
}

/**
 * Initializes state from URL or sets defaults
 */
function initializeState(urlState: ReturnType<typeof getStateFromUrl>): void {
  if (urlState) {
    restoreStateFromUrl(urlState)
  }
  else {
    setDefaultState()
  }
}

/**
 * Restores state from URL parameters
 */
function restoreStateFromUrl(urlState: NonNullable<ReturnType<typeof getStateFromUrl>>): void {
  const { framework, files: filesRecord, tsconfig, importMap, unoConfig, destylerVersion } = urlState
  const files = recordToFiles(filesRecord)

  state.activeFramework = framework
  state.files = files.length > 0 ? files : FRAMEWORKS[framework].defaultFiles
  state.activeFile = state.files.find(f => f.active)?.name ?? state.files[0].name

  if (tsconfig) {
    state.tsconfigContent = tsconfig
  }

  if (importMap) {
    state.importMapContent = importMap
  }

  if (unoConfig) {
    state.unoConfigContent = unoConfig
  }

  if (destylerVersion) {
    state.destylerVersion = destylerVersion
  }

  // Prevent handleFrameworkChange from resetting files
  isRestoringFromUrl = true

  // Notify Select component about the framework change
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('url:framework-restored', {
      detail: { framework, destylerVersion },
    }))
    setTimeout(() => {
      isRestoringFromUrl = false
    }, DEBOUNCE_DELAYS.URL_RESTORE_COMPLETE)
  }, DEBOUNCE_DELAYS.URL_RESTORE)
}

/**
 * Sets the default state for a fresh playground
 */
function setDefaultState(): void {
  state.activeFramework = DEFAULT_FRAMEWORK
  state.files = FRAMEWORKS[DEFAULT_FRAMEWORK].defaultFiles
  state.activeFile = state.files.find(f => f.active)?.name ?? state.files[0].name
}

// ============================================================================
// Event Setup
// ============================================================================

/**
 * Sets up editor change callbacks
 */
function setupEditorCallbacks(): void {
  onEditorFileChange(() => {
    renderFileTabs()
    scheduleUnoUpdate()
    scheduleIframeUpdate()
    scheduleUrlUpdate()
  })

  onEditorConfigChange((fileName) => {
    // Schedule URL update for any config change
    scheduleUrlUpdate()

    if (fileName === CONFIG_FILES.TSCONFIG) {
      // tsconfig changed - schedule language service refresh
      scheduleTsconfigUpdate()
    }
    else if (fileName === CONFIG_FILES.IMPORT_MAP) {
      // import-map changed - refresh preview to apply new dependencies
      scheduleIframeUpdate()
    }
    else if (fileName === CONFIG_FILES.UNO_CONFIG) {
      // uno config changed - regenerate CSS
      scheduleUnoUpdate()
      scheduleIframeUpdate()
    }
  })
}

/**
 * Sets up window event listeners
 */
function setupEventListeners(): void {
  // Listen for file selection from editor (go to definition)
  window.addEventListener('editor:file-selected', () => {
    renderFileTabs()
  })

  // Listen for framework change from select component
  window.addEventListener('framework:change', ((e: CustomEvent<{ framework: Framework }>) => {
    handleFrameworkChange(e.detail.framework)
  }) as EventListener)

  // Listen for version change from version select component
  window.addEventListener('destyler:version-change', ((e: CustomEvent<{ version: string }>) => {
    state.destylerVersion = e.detail.version
    // Version change requires full iframe reload to update import map
    isIframeLoaded = false
    scheduleUrlUpdate()
    scheduleIframeUpdate()
  }) as EventListener)
}

// ============================================================================
// Framework Handling
// ============================================================================

/**
 * Handles framework change from the UI
 */
async function handleFrameworkChange(framework: Framework): Promise<void> {
  // Skip if we're restoring from URL (files are already set)
  if (isRestoringFromUrl) {
    return
  }

  state.activeFramework = framework
  state.files = FRAMEWORKS[framework].defaultFiles
  state.activeFile = state.files.find(f => f.active)?.name ?? state.files[0].name
  state.activeConfigFile = null

  // Reset config content for new framework
  resetConfigContent()

  await setupLanguageService(framework, true)
  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  updateConfigButtonStates()

  isIframeLoaded = false
  updateIframe()
  scheduleUrlUpdate()
}

// ============================================================================
// File Tab UI
// ============================================================================

/**
 * Renders the file tabs in the editor header
 */
export function renderFileTabs(): void {
  const container = document.getElementById('file-tabs')
  if (!container)
    return

  container.innerHTML = ''

  for (const file of state.files) {
    const tab = createFileTab(file)
    container.appendChild(tab)
  }

  const addBtn = createAddFileButton()
  container.appendChild(addBtn)
}

/**
 * Creates a file tab element
 */
function createFileTab(file: File): HTMLButtonElement {
  const tab = document.createElement('button')
  const isActive = state.activeConfigFile === null && state.activeFile === file.name
  tab.className = `file-tab${isActive ? ' active' : ''}`
  tab.dataset.fileName = file.name

  // File name span
  const nameSpan = document.createElement('span')
  nameSpan.className = 'file-tab-name'
  nameSpan.textContent = file.name
  tab.appendChild(nameSpan)

  // Close button (only for non-main files when multiple files exist)
  const isMainFile = file.name.startsWith('App.')
  if (state.files.length > 1 && !isMainFile) {
    const closeBtn = createCloseButton(file.name)
    tab.appendChild(closeBtn)
  }

  // Click handlers with debounce to avoid interfering with double-click
  setupTabClickHandlers(tab, file)

  return tab
}

/**
 * Creates a close button for file tabs
 */
function createCloseButton(fileName: string): HTMLButtonElement {
  const closeBtn = document.createElement('button')
  closeBtn.className = 'file-tab-close'
  closeBtn.textContent = '✕'
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    deleteFile(fileName)
  })
  return closeBtn
}

/**
 * Sets up click handlers for file tabs
 */
function setupTabClickHandlers(tab: HTMLButtonElement, file: File): void {
  let clickTimer: ReturnType<typeof setTimeout> | null = null

  tab.addEventListener('click', () => {
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
      return
    }
    clickTimer = setTimeout(() => {
      clickTimer = null
      handleFileTabClick(file.name)
    }, DEBOUNCE_DELAYS.CLICK)
  })

  tab.addEventListener('dblclick', () => {
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }
    // Don't allow renaming App files
    if (!file.name.startsWith('App.')) {
      startRenaming(file.name, tab)
    }
  })
}

/**
 * Handles file tab click
 */
function handleFileTabClick(fileName: string): void {
  // Clear config file selection when clicking user file
  if (state.activeConfigFile !== null) {
    state.activeConfigFile = null
    updateConfigButtonStates()
  }
  if (state.activeFile !== fileName) {
    state.activeFile = fileName
    setEditorToUserFile()
    renderFileTabs()
  }
  else if (state.activeConfigFile === null) {
    // Re-render to ensure user file tab is active
    setEditorToUserFile()
    renderFileTabs()
  }
}

/**
 * Creates the add file button
 */
function createAddFileButton(): HTMLButtonElement {
  const addBtn = document.createElement('button')
  addBtn.className = 'add-file-btn'
  addBtn.textContent = '+'
  addBtn.title = 'New File'
  addBtn.addEventListener('click', addNewFile)
  return addBtn
}

// ============================================================================
// Config Buttons UI
// ============================================================================

/**
 * Sets up config buttons (tsconfig.json and import-map.json are both editable)
 */
function setupConfigButtons(): void {
  const tsconfigBtn = document.getElementById('tsconfig-btn')
  const importMapBtn = document.getElementById('import-map-btn')
  const unoConfigBtn = document.getElementById('uno-config-btn')

  tsconfigBtn?.addEventListener('click', () => toggleConfigFile(CONFIG_FILES.TSCONFIG))
  importMapBtn?.addEventListener('click', () => toggleConfigFile(CONFIG_FILES.IMPORT_MAP))
  unoConfigBtn?.addEventListener('click', () => toggleConfigFile(CONFIG_FILES.UNO_CONFIG))
}

/**
 * Toggles a config file in the editor
 */
function toggleConfigFile(configFile: typeof CONFIG_FILES.TSCONFIG | typeof CONFIG_FILES.IMPORT_MAP | typeof CONFIG_FILES.UNO_CONFIG): void {
  if (state.activeConfigFile === configFile) {
    // Toggle off - go back to user file
    state.activeConfigFile = null
    setEditorToUserFile()
  }
  else {
    state.activeConfigFile = configFile
    setEditorToConfigFile(configFile)
  }
  updateConfigButtonStates()
  renderFileTabs()
}

/**
 * Updates config button active states
 */
function updateConfigButtonStates(): void {
  const tsconfigBtn = document.getElementById('tsconfig-btn')
  const importMapBtn = document.getElementById('import-map-btn')
  const unoConfigBtn = document.getElementById('uno-config-btn')

  tsconfigBtn?.classList.toggle('active', state.activeConfigFile === CONFIG_FILES.TSCONFIG)
  importMapBtn?.classList.toggle('active', state.activeConfigFile === CONFIG_FILES.IMPORT_MAP)
  unoConfigBtn?.classList.toggle('active', state.activeConfigFile === CONFIG_FILES.UNO_CONFIG)
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Starts renaming a file
 */
function startRenaming(fileName: string, tabElement: HTMLButtonElement): void {
  // Don't allow renaming App files
  if (fileName.startsWith('App.'))
    return

  const nameSpan = tabElement.querySelector('.file-tab-name') as HTMLSpanElement
  if (!nameSpan)
    return

  const spanWidth = nameSpan.offsetWidth

  const input = document.createElement('input')
  input.className = 'file-tab-input'
  input.value = fileName
  input.style.width = `${spanWidth}px`
  input.addEventListener('blur', () => finishRenaming(fileName, input))
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')
      finishRenaming(fileName, input)
    else if (e.key === 'Escape')
      renderFileTabs()
  })
  input.addEventListener('click', e => e.stopPropagation())

  nameSpan.replaceWith(input)
  input.focus()
  input.select()
}

/**
 * Finishes renaming a file
 */
function finishRenaming(oldName: string, input: HTMLInputElement): void {
  const newName = input.value.trim()
  if (!newName || newName === oldName) {
    renderFileTabs()
    return
  }

  if (state.files.some(f => f.name === newName)) {
    // eslint-disable-next-line no-alert
    alert('File name already exists')
    renderFileTabs()
    return
  }

  // Dispose old model before updating file name
  disposeOldModel(oldName)

  state.files = state.files.map(f =>
    f.name === oldName ? { ...f, name: newName } : f,
  )

  if (state.activeFile === oldName) {
    state.activeFile = newName
  }

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
  scheduleUrlUpdate()
}

/**
 * Adds a new file to the playground
 */
function addNewFile(): void {
  const extension = getFileExtensionForFramework(state.activeFramework)
  const name = generateUniqueFileName('Component', extension)

  state.files = [...state.files, { name, content: '' }]
  state.activeFile = name

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
  scheduleUrlUpdate()

  // Start renaming the new file immediately
  setTimeout(() => {
    const tab = document.querySelector(`[data-file-name="${name}"]`) as HTMLButtonElement
    if (tab)
      startRenaming(name, tab)
  }, 0)
}

/**
 * Gets the appropriate file extension for a framework
 */
function getFileExtensionForFramework(framework: Framework): string {
  switch (framework) {
    case 'vue': return '.vue'
    case 'svelte': return '.svelte'
    default: return '.tsx'
  }
}

/**
 * Generates a unique file name
 */
function generateUniqueFileName(baseName: string, extension: string): string {
  let name = `${baseName}${extension}`
  let count = 1

  while (state.files.some(f => f.name === name)) {
    name = `${baseName}${count}${extension}`
    count++
  }

  return name
}

/**
 * Deletes a file from the playground
 */
function deleteFile(name: string): void {
  // Don't allow deleting the main App file or the last file
  if (name.startsWith('App.') || state.files.length <= 1)
    return

  state.files = state.files.filter(f => f.name !== name)

  if (state.activeFile === name) {
    state.activeFile = state.files[0].name
  }

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
  scheduleUrlUpdate()
}

// ============================================================================
// Debounced Updates
// ============================================================================

/**
 * Schedules iframe update with debounce
 */
function scheduleIframeUpdate(): void {
  if (updateTimer)
    clearTimeout(updateTimer)
  updateTimer = setTimeout(updateIframe, DEBOUNCE_DELAYS.IFRAME_UPDATE)
}

/**
 * Schedules URL update with debounce
 */
function scheduleUrlUpdate(): void {
  if (urlUpdateTimer)
    clearTimeout(urlUpdateTimer)
  urlUpdateTimer = setTimeout(() => {
    updateUrlHash(state.activeFramework, state.files, state.tsconfigContent, state.importMapContent, state.unoConfigContent, state.destylerVersion)
  }, DEBOUNCE_DELAYS.URL_UPDATE)
}

/**
 * Schedules tsconfig update with debounce
 */
function scheduleTsconfigUpdate(): void {
  if (tsconfigUpdateTimer)
    clearTimeout(tsconfigUpdateTimer)
  tsconfigUpdateTimer = setTimeout(refreshLanguageService, DEBOUNCE_DELAYS.TSCONFIG_UPDATE)
}

/**
 * Schedules UnoCSS update with debounce
 */
function scheduleUnoUpdate(): void {
  if (unoUpdateTimer)
    clearTimeout(unoUpdateTimer)
  unoUpdateTimer = setTimeout(async () => {
    await generateUnoCSS()
    sendUnoCSSToIframe()
  }, DEBOUNCE_DELAYS.UNO_UPDATE)
}

/**
 * Generates UnoCSS from all files
 */
async function generateUnoCSS(): Promise<void> {
  if (!state.unoEnabled) {
    state.generatedUnoCSS = ''
    state.matchedUtilities = []
    return
  }

  try {
    const result = await generateCSSFromFiles(
      state.files,
      state.unoConfigContent,
    )

    state.generatedUnoCSS = result.css
    state.matchedUtilities = result.matched
    state.unoConfigError = null
  }
  catch (e) {
    console.error('[UnoCSS] Generation error:', e)
    state.unoConfigError = e as Error
  }
}

/**
 * Sends UnoCSS to iframe via postMessage
 */
function sendUnoCSSToIframe(): void {
  if (!iframeRef)
    return
  iframeRef.contentWindow?.postMessage({
    type: 'UPDATE_UNOCSS',
    css: state.generatedUnoCSS,
  }, '*')
}

// ============================================================================
// Preview Iframe
// ============================================================================

/**
 * Updates the preview iframe
 */
async function updateIframe(): Promise<void> {
  if (!iframeRef)
    return

  if (previousFramework !== state.activeFramework) {
    isIframeLoaded = false
    previousFramework = state.activeFramework
  }

  // Always regenerate UnoCSS before updating iframe
  await generateUnoCSS()

  if (isIframeLoaded) {
    // Hot update: send files via postMessage
    const filesMap = state.files.reduce<Record<string, string>>((acc, file) => {
      acc[file.name] = file.content
      return acc
    }, {})

    iframeRef.contentWindow?.postMessage({ type: 'UPDATE_FILES', files: filesMap }, '*')
    // Also send updated UnoCSS
    sendUnoCSSToIframe()
  }
  else {
    // Full reload: regenerate HTML with UnoCSS included
    const importMap = getImportMap()
    iframeRef.srcdoc = generateHtml(
      state.activeFramework,
      state.files,
      importMap,
      state.generatedUnoCSS,
      state.destylerVersion,
    )
    setTimeout(() => {
      isIframeLoaded = true
    }, DEBOUNCE_DELAYS.IFRAME_LOAD)
  }
}

/**
 * Forces a full refresh of the preview iframe
 */
export function refreshPreview(): void {
  isIframeLoaded = false
  updateIframe()
}
