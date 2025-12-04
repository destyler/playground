import type { File, Framework } from '../utils/templates'
import { FRAMEWORKS, generateHtml } from '../utils/templates'
import { disposeOldModel, initEditor, onEditorFileChange, setupLanguageService, syncFilesToModels, updateActiveModel } from './editor'
import { state } from './state'

// Playground variables
let iframeRef: HTMLIFrameElement | null = null
let isIframeLoaded = false
let previousFramework: Framework = 'vue'
let updateTimer: ReturnType<typeof setTimeout> | null = null

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

  // Set initial state
  state.activeFramework = 'vue'
  state.files = FRAMEWORKS.vue.defaultFiles
  state.activeFile = FRAMEWORKS.vue.defaultFiles.find(f => f.active)?.name || FRAMEWORKS.vue.defaultFiles[0].name

  // Setup callbacks
  onEditorFileChange(() => {
    renderFileTabs()
    scheduleIframeUpdate()
  })

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
  updateIframe()

  // Initialize editor
  await initEditor()
}

/**
 * Handle framework change
 */
async function handleFrameworkChange(framework: Framework) {
  state.activeFramework = framework
  state.files = FRAMEWORKS[framework].defaultFiles
  state.activeFile = state.files.find(f => f.active)?.name || state.files[0].name

  await setupLanguageService(framework, true)
  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()

  isIframeLoaded = false
  updateIframe()
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
    tab.className = `file-tab${state.activeFile === file.name ? ' active' : ''}`
    tab.dataset.fileName = file.name

    const nameSpan = document.createElement('span')
    nameSpan.className = 'file-tab-name'
    nameSpan.textContent = file.name
    tab.appendChild(nameSpan)

    if (state.files.length > 1) {
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
        if (state.activeFile !== file.name) {
          state.activeFile = file.name
          updateActiveModel()
          renderFileTabs()
        }
      }, 200)
    })

    tab.addEventListener('dblclick', () => {
      if (clickTimer) {
        clearTimeout(clickTimer)
        clickTimer = null
      }
      startRenaming(file.name, tab)
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
 * Start renaming a file
 */
function startRenaming(fileName: string, tabElement: HTMLButtonElement) {
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
  if (state.files.length <= 1)
    return

  state.files = state.files.filter((f: File) => f.name !== name)

  if (state.activeFile === name) {
    state.activeFile = state.files[0].name
  }

  syncFilesToModels()
  updateActiveModel()
  renderFileTabs()
  scheduleIframeUpdate()
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
    iframeRef.srcdoc = generateHtml(state.activeFramework, state.files)
    setTimeout(() => { isIframeLoaded = true }, 500)
  }
}
