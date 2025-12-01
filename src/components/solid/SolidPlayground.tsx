/** @jsxImportSource solid-js */
import * as dialog from '@destyler/dialog'
import { normalizeProps, useMachine } from '@destyler/solid'
import { createMemo, createUniqueId, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

const destylerVersion = '0.2.0'
const solidVersion = '1.9.10'

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
  background: linear-gradient(120deg, #0b1535, #111827);
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
  background: radial-gradient(circle at 14% 16%, #e6f5ff 0, #f7fbff 30%, #ffffff 55%);
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
  background: #0b1535;
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
  background: linear-gradient(120deg, #10b981, #22c55e);
  color: #f8fafc;
  border: none;
  font-weight: 700;
  box-shadow: 0 14px 40px -20px rgba(16, 185, 129, 0.7);
  cursor: pointer;
}
.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 50px -22px rgba(16, 185, 129, 0.7);
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
  background: #0b1535;
  color: #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px -22px rgba(12, 15, 35, 0.6);
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
  background: rgba(34, 197, 94, 0.15);
  color: #bbf7d0;
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

const SolidPlayground = () => {
  const [state, send] = useMachine(dialog.machine({ id: createUniqueId() }))
  const api = createMemo(() => dialog.connect(state, send, normalizeProps))

  return (
    <div class="playground-shell">
      <div class="toolbar">
        <div class="title">
          <span class="dot" />
          Solid (bundled)
        </div>
        <div class="meta">
          <span class="pill">Solid {solidVersion}</span>
          <span class="pill">Destyler {destylerVersion}</span>
          <span class="pill">Local deps</span>
        </div>
      </div>

      <div class="body">
        <div class="hero">
          <p class="eyebrow">Bundled import</p>
          <h2>Destyler dialog · Solid</h2>
          <p class="lede">
            Ships via npm and is bundled at build time—ready to mirror the React/Vue/Svelte demos without any
            CDN import map.
          </p>
          <div class="actions">
            <button class="primary" {...api().getTriggerProps()}>
              Open dialog
            </button>
          </div>
        </div>
      </div>

      <Show when={api().open}>
        <Portal>
          <div class="dialog">
            <div class="dialog__backdrop" {...api().getBackdropProps()} />
            <div class="dialog__positioner" {...api().getPositionerProps()}>
              <div class="dialog__content" {...api().getContentProps()}>
                <header class="dialog__header">
                  <p class="chip">Headless UI from Destyler</p>
                  <h3 {...api().getTitleProps()}>Edit profile</h3>
                  <p class="muted" {...api().getDescriptionProps()}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                </header>

                <div class="dialog__body">
                  <label class="field">
                    <span>Display name</span>
                    <input placeholder="Enter name..." />
                  </label>
                </div>

                <footer class="dialog__footer">
                  <button class="ghost" {...api().getCloseTriggerProps()}>
                    Cancel
                  </button>
                  <button class="primary">Save changes</button>
                </footer>
              </div>
            </div>
          </div>
        </Portal>
      </Show>

      <style>{styles}</style>
    </div>
  )
}

export default SolidPlayground
