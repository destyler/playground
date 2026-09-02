import type { ReactNode } from 'react'
import { normalizeProps, useMachine } from '@destyler/react'
import * as splitter from '@destyler/splitter'
import { useEffect, useId } from 'react'

const STORAGE_KEY = 'playground-splitter-sizes'

function getSavedSizes(): splitter.PanelSizeData[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  }
  catch {
    // ignore errors
  }
  return null
}

function getInitialSizes(): splitter.PanelSizeData[] {
  const saved = getSavedSizes()
  if (saved) {
    return saved.map(panel => ({
      ...panel,
      minSize: 20,
    }))
  }
  return [
    { id: 'editor', size: 50, minSize: 20 },
    { id: 'preview', size: 50, minSize: 20 },
  ]
}

interface SplitterProps {
  children?: ReactNode
}

export default function Splitter({ children }: SplitterProps) {
  const [state, send] = useMachine(
    splitter.machine({
      id: useId(),
      size: getInitialSizes(),
      onSizeChange: (details) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(details.size))
        }
        catch {
          // ignore errors
        }
      },
    }),
  )

  const api = splitter.connect(state, send, normalizeProps)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('splitter:ready'))
  }, [])

  return (
    <div {...api.getRootProps()} className="flex flex-1 overflow-hidden">
      {/* Editor Panel */}
      <div {...api.getPanelProps({ id: 'editor' })} className="flex flex-col min-w-0 overflow-hidden" id="editor-panel">
        {/* Editor content will be portaled here */}
      </div>

      {/* Resize Trigger */}
      <div
        {...api.getResizeTriggerProps({ id: 'editor:preview' })}
        className="outline-none border-none cursor-ew-resize"
      >
        <div className="w-1 h-full outline-none border-none ring-0 bg-background/50 hover:bg-background focus:outline-none cursor-ew-resize" />
      </div>

      {/* Preview Panel */}
      <div {...api.getPanelProps({ id: 'preview' })} className="flex min-w-0 overflow-hidden" id="preview-panel">
        {/* Preview content will be portaled here */}
      </div>

      {/* Hidden container for Astro content */}
      <div style={{ display: 'none' }} id="splitter-content-source">
        {children}
      </div>
    </div>
  )
}
