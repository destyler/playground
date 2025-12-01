<script setup lang="ts">
import { File, Repl, type ImportMap, useStore } from '@vue/repl'
import '@vue/repl/style.css'

const destylerVersion = '0.0.6'
const vueVersion = '3.5.25'

const importMap: ImportMap = {
  imports: {
    'vue': `https://cdn.jsdelivr.net/npm/vue@${vueVersion}/dist/vue.esm-browser.js`,
    '@destyler/button': `https://cdn.jsdelivr.net/npm/@destyler/button@${destylerVersion}/dist/index.mjs`,
    '@destyler/info': `https://cdn.jsdelivr.net/npm/@destyler/info@${destylerVersion}/dist/index.mjs`,
    '@destyler/icon': `https://cdn.jsdelivr.net/npm/@destyler/icon@${destylerVersion}/dist/index.mjs`,
    '@destyler/icon/component': `https://cdn.jsdelivr.net/npm/@destyler/icon@${destylerVersion}/dist/component.mjs`,
    '@iconify/vue': 'https://cdn.jsdelivr.net/npm/@iconify/vue@4.1.1/dist/iconify.mjs',
  },
}

const files = {
  'App.vue': new File(
    'App.vue',
    `<script setup>
import { ref } from 'vue'
import { Button } from '@destyler/button'
import { InfoClose, InfoRoot } from '@destyler/info'
import { Icon } from '@destyler/icon'

const open = ref(true)
<\/script>

<template>
  <div class="page">
    <header>
      <p class="eyebrow">CDN import map</p>
      <h1>Destyler · Vue</h1>
      <p>All deps load from jsDelivr, no npm install inside the preview.</p>
    </header>

    <div class="actions">
      <Button class="btn" @click="open = true">Open Info</Button>
    </div>

    <InfoRoot v-model:open="open" class="info">
      <div class="info__content">
        <div class="info__title">Hello from Destyler!</div>
        <p>Try editing App.vue to tweak the markup or styles.</p>
      </div>
      <InfoClose class="info__close" @click="open = false">
        <Icon name="radix-icons:cross-1" />
      </InfoClose>
    </InfoRoot>
  </div>
</template>

<style scoped>
.page {
  --surface: #0f172a;
  --text: #0b1222;
  --muted: #4b5563;
  --radius: 14px;
  display: grid;
  gap: 18px;
  padding: 20px;
  color: var(--text);
}
header {
  display: grid;
  gap: 6px;
}
.eyebrow {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: #0f172a;
  color: #f8fafc;
  font-size: 12px;
  width: fit-content;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
h1 {
  font-size: 28px;
  margin: 0;
  font-weight: 700;
}
p {
  margin: 0;
  color: var(--muted);
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn {
  min-width: 140px;
}
.info {
  position: relative;
  border-radius: var(--radius);
  padding: 18px 16px;
  background: linear-gradient(145deg, #e8ecf6, #f7f9fc);
  color: #0b1222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 14px 40px -22px rgba(15, 23, 42, 0.4);
}
.info__content {
  display: grid;
  gap: 8px;
}
.info__title {
  font-weight: 700;
  font-size: 18px;
}
.info__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #0f172a;
  color: #f8fafc;
}
</style>
`,
  ),
  'import-map.json': new File(
    'import-map.json',
    JSON.stringify(importMap, null, 2),
    true,
  ),
}

const previewOptions = {
  headHTML: `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/destyler@${destylerVersion}/dist/index.css">
    <style>
      body { background: #f7f9fc; font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif; }
    </style>
  `,
}

const store = useStore({
  files,
  activeFilename: 'App.vue',
  mainFile: 'App.vue',
  builtinImportMap: importMap,
  vueVersion,
  typescriptVersion: '5.6.2',
  showOutput: true,
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
