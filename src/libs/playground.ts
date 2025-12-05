import type { File, Framework } from '../templates'
import { FRAMEWORKS } from '../templates'
import { generateHtml } from '../utils/html'
import { getStateFromUrl, recordToFiles, updateUrlHash } from '../utils/url'
import { disposeOldModel, getImportMap, initConfigContent, initEditor, onEditorConfigChange, onEditorFileChange, refreshLanguageService, resetConfigContent, setEditorToConfigFile, setEditorToUserFile, setupLanguageService, syncFilesToModels, updateActiveModel } from './editor'
import { IMPORT_MAP_FILE, state, TSCONFIG_FILE } from './state'

// Playground variables
let iframeRef: HTMLIFrameElement | null = null
let isIframeLoaded = false
let previousFramework: Framework = 'vue'
let updateTimer: ReturnType<typeof setTimeout> | null = null
let urlUpdateTimer: ReturnType<typeof setTimeout> | null = null
let tsconfigUpdateTimer: ReturnType<typeof setTimeout> | null = null
let isRestoringFromUrl = false

/**
 * Initialize the playground
 */
export async function initPlayground() {
  iframeRef = document.getElementById('preview-iframe') as HTMLIFrameElement
  const fileTabsContainer = document.getElementById('file-tabs')

  if (!iframeRef || !fileTabsContainer) {
    console.error('[Playground] Required DOM elements not found')
    return
  }

  // Try to load state from URL first
  const urlState = getStateFromUrl()

  if (urlState) {
    // Restore state from URL
    const framework = urlState.framework
    const files = recordToFiles(urlState.files)

    state.activeFramework = framework
    state.files = files.length > 0 ? files : FRAMEWORKS[framework].defaultFiles
    state.activeFile = state.files.find(f => f.active)?.name || state.files[0].name

    // Restore config content if available
    if (urlState.tsconfig) {
      state.tsconfigContent = urlState.tsconfig
    }
    if (urlState.importMap) {
      state.importMapContent = urlState.importMap
    }

    // Set flag to prevent handleFrameworkChange from resetting files
    isRestoringFromUrl = true

    // Notify Select component about the framework change
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('url:framework-restored', {
        detail: { framework },
      }))
      // Reset flag after a short delay to allow Select to update
      setTimeout(() => {
        isRestoringFromUrl = false
      }, 200)
    }, 100)
  }
  else {
    // Set default state
    state.activeFramework = 'vue'
    state.files = FRAMEWORKS.vue.defaultFiles
    state.activeFile = FRAMEWORKS.vue.defaultFiles.find(f => f.active)?.name || FRAMEWORKS.vue.defaultFiles[0].name
  }

  // Setup callbacks
  onEditorFileChange(() => {
    renderFileTabs()
    scheduleIframeUpdate()
    scheduleUrlUpdate()
  })

  // Setup config file change callback
  onEditorConfigChange((configFile, _content) => {
    if (configFile === IMPORT_MAP_FILE) {
      // Import map changed - need to reload iframe
      isIframeLoaded = false
      scheduleIframeUpdate()
      scheduleUrlUpdate()
    }
    else if (configFile === TSCONFIG_FILE) {
      // tsconfig changed - schedule language service refresh with debounce
      scheduleTsconfigUpdate()
      scheduleUrlUpdate()
    }
  })

  // Initialize config content
  initConfigContent()

  // Listen for file selection from editor (go to definition)
  window.addEventListener('editor:file-selected', () => {
    renderFileTabs()
  })

  // Listen for framework change from select component
  window.addEventListener('framework:change', ((e: CustomEvent<{ framework: Framework }>) => {
    handleFrameworkChange(e.detail.framework)
  }) as EventListener)

  // Setup UI
  renderFileTabs()
  setupConfigButtons()
  updateIframe()

  // Initialize editor with correct framework
  await initEditor()

  // If we have URL state with a specific framework, setup language service for it
  if (urlState && urlState.framework !== 'vue') {
    await setupLanguageService(urlState.framework, true)
    syncFilesToModels()
    updateActiveModel()
  }
}

/**
 * Handle framework change
 */
async function handleFrameworkChange(framework: Framework) {
  // Skip if we're restoring from URL (files are already set)
  if (isRestoringFromUrl) {
    return
  }

  state.activeFramework = framework
  state.files = FRAMEWORKS[framework].defaultFiles
  state.activeFile = state.files.find(f => f.active)?.name || state.files[0].name
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

/**
 * Render file tabs
 */
export function renderFileTabs() {
  const container = document.getElementById('file-tabs')
  if (!container)
    return

  container.innerHTML = ''

  state.files.forEach((file: File) => {
    const tab = document.createElement('button')
    // When config file is active, no user file tab should be active
    const isActive = state.activeConfigFile === null && state.activeFile === file.name
    tab.className = `file-tab${isActive ? ' active' : ''}`
    tab.dataset.fileName = file.name

    const nameSpan = document.createElement('span')
    nameSpan.className = 'file-tab-name'
    nameSpan.textContent = file.name
    tab.appendChild(nameSpan)

    // Don't show delete button for App files (main entry file)
    const isMainFile = file.name.startsWith('App.')
    if (state.files.length > 1 && !isMainFile) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'file-tab-close'
      closeBtn.textContent = '✕'
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteFile(file.name)
      })
      tab.appendChild(closeBtn)
    }

    // 使用防抖处理点击，避免干扰双击事件
    let clickTimer: ReturnType<typeof setTimeout> | null = null
    tab.addEventListener('click', () => {
      if (clickTimer) {
        clearTimeout(clickTimer)
        clickTimer = null
        return
      }
      clickTimer = setTimeout(() => {
        clickTimer = null
        // Clear config file selection when clicking user file
        if (state.activeConfigFile !== null) {
          state.activeConfigFile = null
          updateConfigButtonStates()
        }
        if (state.activeFile !== file.name) {
          state.activeFile = file.name
          setEditorToUserFile()
          renderFileTabs()
        }
        else if (state.activeConfigFile === null) {
          // Re-render to ensure user file tab is active
          setEditorToUserFile()
          renderFileTabs()
        }
      }, 200)
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

    container.appendChild(tab)
  })

  const addBtn = document.createElement('button')
  addBtn.className = 'add-file-btn'
  addBtn.textContent = '+'
  addBtn.title = 'New File'
  addBtn.addEventListener('click', addNewFile)
  container.appendChild(addBtn)
}

/**
 * Setup config buttons (tsconfig.json and import-map.json)
 */
function setupConfigButtons() {
  const tsconfigBtn = document.getElementById('tsconfig-btn')
  const importMapBtn = document.getElementById('import-map-btn')

  if (tsconfigBtn) {
    tsconfigBtn.addEventListener('click', () => {
      if (state.activeConfigFile === TSCONFIG_FILE) {
        // Toggle off - go back to user file
        state.activeConfigFile = null
        setEditorToUserFile()
      }
      else {
        state.activeConfigFile = TSCONFIG_FILE
        setEditorToConfigFile(TSCONFIG_FILE)
      }
      updateConfigButtonStates()
      renderFileTabs()
    })
  }

  if (importMapBtn) {
    importMapBtn.addEventListener('click', () => {
      if (state.activeConfigFile === IMPORT_MAP_FILE) {
        // Toggle off - go back to user file
        state.activeConfigFile = null
        setEditorToUserFile()
      }
      else {
        state.activeConfigFile = IMPORT_MAP_FILE
        setEditorToConfigFile(IMPORT_MAP_FILE)
      }
      updateConfigButtonStates()
      renderFileTabs()
    })
  }
}

/**
 * Update config button active states
 */
function updateConfigButtonStates() {
  const tsconfigBtn = document.getElementById('tsconfig-btn')
  const importMapBtn = document.getElementById('import-map-btn')

  if (tsconfigBtn) {
    tsconfigBtn.classList.toggle('active', state.activeConfigFile === TSCONFIG_FILE)
  }
  if (importMapBtn) {
    importMapBtn.classList.toggle('active', state.activeConfigFile === IMPORT_MAP_FILE)
  }
}

/**
 * Start renaming a file
 */
function startRenaming(fileName: string, tabElement: HTMLButtonElement) {
  // Don't allow renaming App files
  if (fileName.startsWith('App.'))
    return

  const nameSpan = tabElement.querySelector('.file-tab-name') as HTMLSpanElement
  if (!nameSpan)
    return

  // 获取原 span 的宽度
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
 * Finish renaming a file
 */
function finishRenaming(oldName: string, input: HTMLInputElement) {
  const newName = input.value.trim()
  if (!newName || newName === oldName) {
    renderFileTabs()
    return
  }

  if (state.files.find((f: File) => f.name === newName)) {
    // eslint-disable-next-line no-alert
    alert('File name already exists')
    renderFileTabs()
    return
  }

  // 先删除旧模型，再更新文件名
  disposeOldModel(oldName)

  state.files = state.files.map((f: File) =>
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
 * Add a new file
 */
function addNewFile() {
  const baseName = 'Component'
  const extension = state.activeFramework === 'vue'
    ? '.vue'
    : state.activeFramework === 'svelte' ? '.svelte' : '.tsx'
  let name = `${baseName}${extension}`
  let count = 1

  while (state.files.find((f: File) => f.name === name)) {
    name = `${baseName}${count}${extension}`
    count++
  }

  state.files = [...state.files, { name, content: '' }]
  state.activeFile = name

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
  scheduleUrlUpdate()

  setTimeout(() => {
    const tab = document.querySelector(`[data-file-name="${name}"]`) as HTMLButtonElement
    if (tab)
      startRenaming(name, tab)
  }, 0)
}

/**
 * Delete a file
 */
function deleteFile(name: string) {
  // Don't allow deleting the main App file
  if (name.startsWith('App.') || state.files.length <= 1)
    return

  state.files = state.files.filter((f: File) => f.name !== name)

  if (state.activeFile === name) {
    state.activeFile = state.files[0].name
  }

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
  scheduleUrlUpdate()
}

/**
 * Schedule iframe update with de    bounce
 */
function scheduleIframeUpdate() {
  if (updateTimer)
    clearTimeout(updateTimer)
  updateTimer = setTimeout(updateIframe, 1000)
}

/**
 * Schedule URL update with debounce
 */
function scheduleUrlUpdate() {
  if (urlUpdateTimer)
    clearTimeout(urlUpdateTimer)
  urlUpdateTimer = setTimeout(() => {
    updateUrlHash(state.activeFramework, state.files, state.tsconfigContent, state.importMapContent)
  }, 500)
}

/**
 * Schedule tsconfig update with debounce
 */
function scheduleTsconfigUpdate() {
  if (tsconfigUpdateTimer)
    clearTimeout(tsconfigUpdateTimer)
  tsconfigUpdateTimer = setTimeout(() => {
    refreshLanguageService()
  }, 1000)
}

/**
 * Update the     preview iframe
 */
function updateIframe() {
  if (!iframeRef)
    return

  if (previousFramework !== state.activeFramework) {
    isIframeLoaded = false
    previousFramework = state.activeFramework
  }

  if (isIframeLoaded) {
    const filesMap = state.files.reduce((acc: Record<string, string>, file: File) => {
      acc[file.name] = file.content
      return acc
    }, {})

    iframeRef.contentWindow?.postMessage({ type: 'UPDATE_FILES', files: filesMap }, '*')
  }
  else {
    const importMap = getImportMap()
    iframeRef.srcdoc = generateHtml(state.activeFramework, state.files, importMap)
    setTimeout(() => {
      isIframeLoaded = true
    }, 500)
  }
}

/**
 * Force refresh the preview iframe
 */
export function refreshPreview() {
  isIframeLoaded = false
  updateIframe()
}
