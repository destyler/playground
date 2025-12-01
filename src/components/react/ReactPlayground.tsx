import * as dialog from '@destyler/dialog'
import { normalizeProps, Portal, useMachine } from '@destyler/react'
import { useId, useMemo } from 'react'

const destylerVersion = '0.2.0'
const reactVersion = '19.2.0'

const styles = `
.playground-shell {
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  box-shadow: 0 14px 60px -34px rgba(15, 23, 42, 0.45);
  overflow: hidden;
  display: grid;
  grid-auto-rows: auto 1fr;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(120deg, #111827, #1f2937);
  color: #e5e7eb;
}
.title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.2);
}
.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.pill {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.body {
  padding: 18px 18px 20px;
  display: grid;
  gap: 12px;
  background: radial-gradient(circle at 10% 20%, #eef2ff 0, #f7f9ff 32%, #ffffff 55%);
}
.hero {
  display: grid;
  gap: 8px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  width: fit-content;
}
.lede {
  color: #475569;
  margin: 0;
  line-height: 1.55;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  background: linear-gradient(120deg, #2563eb, #0ea5e9);
  color: #f8fafc;
  border: none;
  font-weight: 700;
  box-shadow: 0 14px 40px -20px rgba(37, 99, 235, 0.7);
  cursor: pointer;
}
.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 50px -22px rgba(37, 99, 235, 0.7);
}
.dialog {
  position: fixed;
  inset: 0;
}
.dialog__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
}
.dialog__positioner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
}
.dialog__content {
  position: relative;
  width: min(640px, 100%);
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px -22px rgba(15, 23, 42, 0.6);
  display: grid;
  gap: 16px;
}
.dialog__header {
  display: grid;
  gap: 8px;
}
.chip {
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.15);
  color: #bfdbfe;
  font-size: 12px;
  width: fit-content;
}
.muted {
  margin: 0;
  color: #cbd5e1;
}
.dialog__body {
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 8px;
  color: #e2e8f0;
}
.field input {
  width: 100%;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
}
.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.ghost {
  padding: 11px 16px;
  border-radius: 12px;
  background: rgba(226, 232, 240, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(226, 232, 240, 0.2);
  cursor: pointer;
}
.ghost:hover {
  background: rgba(226, 232, 240, 0.12);
}
`;

export default function ReactPlayground() {
  const [state, send] = useMachine(dialog.machine({ id: useId() }))
  const api = useMemo(() => dialog.connect(state, send, normalizeProps), [state, send])

  return (
    <div className="playground-shell">
      <div className="toolbar">
        <div className="title">
          <span className="dot" />
          React (bundled)
        </div>
        <div className="meta">
          <span className="pill">React {reactVersion}</span>
          <span className="pill">Destyler {destylerVersion}</span>
          <span className="pill">Local deps</span>
        </div>
      </div>

      <div className="body">
        <div className="hero">
          <p className="eyebrow">Bundled import</p>
          <h2>Destyler dialog · React</h2>
          <p className="lede">
            This playground ships the Destyler packages via npm and bundles them at build time—no CDN import
            map required.
          </p>
          <div className="actions">
            <button className="primary" {...api.getTriggerProps()}>
              Open dialog
            </button>
          </div>
        </div>
      </div>

      {api.open ? (
        <Portal>
          <div className="dialog">
            <div className="dialog__backdrop" {...api.getBackdropProps()} />
            <div className="dialog__positioner" {...api.getPositionerProps()}>
              <div className="dialog__content" {...api.getContentProps()}>
                <header className="dialog__header">
                  <p className="chip">Headless UI from Destyler</p>
                  <h3 {...api.getTitleProps()}>Edit profile</h3>
                  <p className="muted" {...api.getDescriptionProps()}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                </header>

                <div className="dialog__body">
                  <label className="field">
                    <span>Display name</span>
                    <input placeholder="Enter name..." />
                  </label>
                </div>

                <footer className="dialog__footer">
                  <button className="ghost" {...api.getCloseTriggerProps()}>
                    Cancel
                  </button>
                  <button className="primary">Save changes</button>
                </footer>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}

      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  )
}
