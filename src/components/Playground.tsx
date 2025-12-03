import type { File, Framework } from '../utils/templates'
import React, { useEffect, useRef, useState } from 'react'
import { FRAMEWORKS, generateHtml } from '../utils/templates'
import Editor from './Editor'

export default function Playground() {
  const [activeFramework, setActiveFramework] = useState<Framework>('vue')
  const [files, setFiles] = useState<File[]>(FRAMEWORKS.vue.defaultFiles)
  const [activeFile, setActiveFile] = useState<string>(FRAMEWORKS.vue.defaultFiles.find(f => f.active)?.name || FRAMEWORKS.vue.defaultFiles[0].name)
  const [editingFileName, setEditingFileName] = useState<string | null>(null)
  const [tempFileName, setTempFileName] = useState<string>('')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isIframeLoadedRef = useRef(false)
  const previousFrameworkRef = useRef<Framework>(activeFramework)

  // Handle Framework Change
  const handleFrameworkChange = (framework: Framework) => {
    setActiveFramework(framework)
    const newFiles = FRAMEWORKS[framework].defaultFiles
    setFiles(newFiles)
    setActiveFile(newFiles.find(f => f.active)?.name || newFiles[0].name)
    setEditingFileName(null)
  }

  // Update Iframe
  useEffect(() => {
    const updateIframe = () => {
      if (iframeRef.current) {
        // If framework changed, we must reload the iframe
        if (previousFrameworkRef.current !== activeFramework) {
          isIframeLoadedRef.current = false
          previousFrameworkRef.current = activeFramework
        }

        if (isIframeLoadedRef.current) {
          // Post message for updates
          const filesMap = files.reduce((acc, file) => {
            acc[file.name] = file.content
            return acc
          }, {} as Record<string, string>)

          iframeRef.current.contentWindow?.postMessage({
            type: 'UPDATE_FILES',
            files: filesMap,
          }, '*')
        }
        else {
          // Full reload
          const html = generateHtml(activeFramework, files)
          iframeRef.current.srcdoc = html
          // Mark as loaded after a short delay to allow script execution
          // Ideally we should listen for a 'LOADED' message from iframe
          setTimeout(() => {
            isIframeLoadedRef.current = true
          }, 500)
        }
      }
    }

    // Debounce
    const timer = setTimeout(updateIframe, 1000)
    return () => clearTimeout(timer)
  }, [files, activeFramework])

  const addNewFile = () => {
    const baseName = 'Component'
    const extension = activeFramework === 'vue' ? '.vue' : activeFramework === 'svelte' ? '.svelte' : '.tsx'
    let name = `${baseName}${extension}`
    let count = 1
    while (files.find(f => f.name === name)) {
      name = `${baseName}${count}${extension}`
      count++
    }

    setFiles([...files, { name, content: '' }])
    setActiveFile(name)
    setEditingFileName(name)
    setTempFileName(name)
  }

  const startRenaming = (name: string) => {
    setEditingFileName(name)
    setTempFileName(name)
  }

  const finishRenaming = () => {
    if (!editingFileName)
      return

    const newName = tempFileName.trim()
    if (!newName || newName === editingFileName) {
      setEditingFileName(null)
      return
    }

    if (files.find(f => f.name === newName)) {
      // eslint-disable-next-line no-alert
      alert('File name already exists')
      return
    }

    setFiles(files.map(f => f.name === editingFileName ? { ...f, name: newName } : f))
    if (activeFile === editingFileName) {
      setActiveFile(newName)
    }
    setEditingFileName(null)
  }

  const deleteFile = (name: string) => {
    if (files.length <= 1)
      return
    const newFiles = files.filter(f => f.name !== name)
    setFiles(newFiles)
    if (activeFile === name) {
      setActiveFile(newFiles[0].name)
    }
  }

  const handleFileChange = (fileName: string, newContent: string) => {
    setFiles((prev) => {
      const currentFile = prev.find(f => f.name === fileName)
      if (currentFile && currentFile.content === newContent) {
        return prev
      }
      return prev.map(f => f.name === fileName ? { ...f, content: newContent } : f)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        gap: '10px',
        padding: '10px 20px',
        borderBottom: '1px solid #333',
        alignItems: 'center',
      }}
      >
        <h2 style={{ margin: 0, marginRight: '20px', fontSize: '1.2rem' }}>Playground</h2>
        {Object.entries(FRAMEWORKS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handleFrameworkChange(key as Framework)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeFramework === key ? config.color : '#333',
              color: activeFramework === key ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            {config.name}
          </button>
        ))}
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor Section */}
        <div style={{ flex: 1, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* File Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#252526',
            borderBottom: '1px solid #333',
            overflowX: 'auto',
          }}
          >
            {files.map(file => (
              <div
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                onDoubleClick={() => startRenaming(file.name)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: activeFile === file.name ? '#1e1e1e' : 'transparent',
                  color: activeFile === file.name ? '#fff' : '#999',
                  borderRight: '1px solid #333',
                  borderTop: activeFile === file.name ? '2px solid #42b883' : '2px solid transparent', // Green highlight like Vue
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  userSelect: 'none',
                  minWidth: 'fit-content',
                }}
              >
                {editingFileName === file.name
                  ? (
                      <input
                        autoFocus
                        value={tempFileName}
                        onChange={e => setTempFileName(e.target.value)}
                        onBlur={finishRenaming}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            finishRenaming()
                          if (e.key === 'Escape')
                            setEditingFileName(null)
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          backgroundColor: '#333',
                          color: '#fff',
                          border: '1px solid #555',
                          borderRadius: '2px',
                          padding: '2px 4px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          width: '100px',
                        }}
                      />
                    )
                  : (
                      <span>{file.name}</span>
                    )}
                {files.length > 1 && editingFileName !== file.name && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file.name)
                    }}
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.8rem',
                      opacity: 0.6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                  >
                    ✕
                  </span>
                )}
              </div>
            ))}
            <button
              onClick={addNewFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '0 12px',
                fontSize: '1.2rem',
                outline: 'none',
              }}
              title="New File"
            >
              +
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              files={files}
              activeFile={activeFile}
              activeFramework={activeFramework}
              onFileChange={handleFileChange}
              onFileSelect={setActiveFile}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, backgroundColor: '#fff' }}>
          <iframe
            ref={iframeRef}
            title="preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-modals"
          />
        </div>
      </div>
    </div>
  )
}
