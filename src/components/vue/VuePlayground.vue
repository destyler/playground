<script setup lang="ts">
import Codemirror from '@vue/repl/codemirror-editor'
import { File, Repl, type ImportMap, useStore } from '@vue/repl'
import { ref } from 'vue'
import '@vue/repl/style.css'

const destylerVersion = '0.2.0'
const proxyCompareVersion = '3.0.1'
const vueVersion = '3.5.25'

const importMap: ImportMap = {
  imports: {
    'vue': `https://cdn.jsdelivr.net/npm/vue@${vueVersion}/dist/vue.esm-browser.js`,
    '@destyler/dialog': `https://cdn.jsdelivr.net/npm/@destyler/dialog@${destylerVersion}/dist/index.mjs`,
    '@destyler/vue': `https://cdn.jsdelivr.net/npm/@destyler/vue@${destylerVersion}/dist/index.mjs`,
    '@destyler/anatomy': `https://cdn.jsdelivr.net/npm/@destyler/anatomy@${destylerVersion}/dist/index.mjs`,
    '@destyler/aria-hidden': `https://cdn.jsdelivr.net/npm/@destyler/aria-hidden@${destylerVersion}/dist/index.mjs`,
    '@destyler/dismissable': `https://cdn.jsdelivr.net/npm/@destyler/dismissable@${destylerVersion}/dist/index.mjs`,
    '@destyler/dom': `https://cdn.jsdelivr.net/npm/@destyler/dom@${destylerVersion}/dist/index.mjs`,
    '@destyler/focus-trap': `https://cdn.jsdelivr.net/npm/@destyler/focus-trap@${destylerVersion}/dist/index.mjs`,
    '@destyler/interact-outside': `https://cdn.jsdelivr.net/npm/@destyler/interact-outside@${destylerVersion}/dist/index.mjs`,
    '@destyler/remove-scroll': `https://cdn.jsdelivr.net/npm/@destyler/remove-scroll@${destylerVersion}/dist/index.mjs`,
    '@destyler/types': `https://cdn.jsdelivr.net/npm/@destyler/types@${destylerVersion}/dist/index.mjs`,
    '@destyler/utils': `https://cdn.jsdelivr.net/npm/@destyler/utils@${destylerVersion}/dist/index.mjs`,
    '@destyler/xstate': `https://cdn.jsdelivr.net/npm/@destyler/xstate@${destylerVersion}/dist/index.mjs`,
    '@destyler/store': `https://cdn.jsdelivr.net/npm/@destyler/store@${destylerVersion}/dist/index.mjs`,
    'proxy-compare': `https://cdn.jsdelivr.net/npm/proxy-compare@${proxyCompareVersion}/dist/index.js`,
  },
}

const appCode = `<script setup lang="ts">
import * as dialog from '@destyler/dialog'
import { normalizeProps, useMachine } from '@destyler/vue'
import { computed, useId } from 'vue'

const [state, send] = useMachine(dialog.machine({
  id: useId(),
}))

const api = computed(() => dialog.connect(state.value, send, normalizeProps))
<\/script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Import map · CDN</p>
      <h1>Destyler dialog in the browser</h1>
      <p class="lede">
        All packages resolve from jsDelivr, so you can tweak the markup, state machine config,
        or styling right here without installing dependencies.
      </p>
      <button class="primary" v-bind="api.getTriggerProps()">
        Open dialog
      </button>
    </section>

    <Teleport v-if="api.open" to="body">
      <div class="dialog">
        <div class="dialog__backdrop" v-bind="api.getBackdropProps()" />
        <div class="dialog__positioner" v-bind="api.getPositionerProps()">
          <div class="dialog__content" v-bind="api.getContentProps()">
            <header class="dialog__header">
              <p class="chip">Headless UI from Destyler</p>
              <h2 v-bind="api.getTitleProps()">Edit profile</h2>
              <p class="muted" v-bind="api.getDescriptionProps()">
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
              <button class="ghost" v-bind="api.getCloseTriggerProps()">
                Cancel
              </button>
              <button class="primary">
                Save changes
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.page {
  display: grid;
  gap: 22px;
  padding: 22px;
  background: radial-gradient(circle at 10% 20%, #eef2ff 0, #f8fafc 32%, #ffffff 55%);
  min-height: 100vh;
  color: #0f172a;
}
.hero {
  display: grid;
  gap: 10px;
  max-width: 640px;
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
  line-height: 1.6;
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
  background: rgba(15, 23, 42, 0.4);
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
@media (max-width: 640px) {
  .dialog__content {
    padding: 18px;
  }
}
</style>
`

const files = ref({
  'src/App.vue': new File('src/App.vue', appCode),
  'import-map.json': new File(
    'import-map.json',
    JSON.stringify(importMap, null, 2),
    true,
  ),
})

const previewOptions = {
  headHTML: `
    <style>
      :root { color-scheme: light; }
      body { background: #f6f7fb; font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif; }
      * { box-sizing: border-box; }
    </style>
  `,
}

const store = useStore({
  files,
  mainFile: ref('src/App.vue'),
  template: ref({
    welcomeSFC: appCode,
    newSFC: `<script setup><\\/script>

<template>
  <div>
    <slot />
  </div>
</template>
`,
  }),
  builtinImportMap: ref(importMap),
  vueVersion: ref(vueVersion),
  typescriptVersion: ref('5.6.2'),
  showOutput: ref(true),
})
</script>

<template>
  <div class="playground-shell">
    <div class="toolbar">
      <div class="title">
        <span class="dot dot--green" />
        Vue (CDN)
      </div>
      <div class="meta">
        <span class="pill">Vue {{ vueVersion }}</span>
        <span class="pill">Destyler {{ destylerVersion }}</span>
        <span class="pill">Import map</span>
      </div>
    </div>
    <Repl
      class="repl"
      :store="store"
      :preview-options="previewOptions"
      :clear-console="false"
      :editor="Codemirror"
    />
  </div>
</template>

<style scoped>
.playground-shell {
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  box-shadow: 0 14px 60px -34px rgba(15, 23, 42, 0.45);
  overflow: hidden;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(120deg, #0f172a, #1e293b);
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
.repl {
  height: 75vh;
}
@media (max-width: 960px) {
  .repl {
    height: 70vh;
  }
}
</style>
