import type { ReactNode } from 'react'
import { normalizeProps, useMachine } from '@destyler/react'
import * as splitter from '@destyler/splitter'
import { useId } from 'react'

interface SplitterProps {
  children?: ReactNode
}

export default function Splitter({ children }: SplitterProps) {
  const [state, send] = useMachine(
    splitter.machine({
      id: useId(),
      size: [
        { id: 'editor', size: 50, minSize: 20 },
        { id: 'preview', size: 50, minSize: 20 },
      ],
    }),
  )

  const api = splitter.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()} className="flex flex-1 overflow-hidden">
      {/* Editor Panel */}
      <div {...api.getPanelProps({ id: 'editor' })} className="flex flex-col min-w-0 overflow-hidden" id="editor-panel">
        {/* Editor content will be portaled here */}
      </div>

      {/* Resize Trigger */}
      <div
        {...api.getResizeTriggerProps({ id: 'editor:preview' })}
        className="outline-none border-none"
      >
        <div className="w-2 h-full outline-none border-none ring-0 bg-background/50 hover:bg-background focus:outline-none" />
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
