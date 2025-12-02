import { useEffect, useMemo, useRef, useState } from 'react'
import * as Babel from '@babel/standalone'
import type * as Monaco from 'monaco-editor'

type Framework = 'react' | 'vue' | 'svelte' | 'solid'

type FrameworkState = {
  code: string
  error: string | null
}

const defaultCodes: Record<Framework, string> = {
  react: `import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  return (
    <main className="body">
      <div className="hero">
        <p className="eyebrow">React · esm.sh</p>
        <h2>React CDN REPL</h2>
        <p className="lede">编辑右侧代码，点击 Run 查看效果。</p>
        <div className="actions">
          <button className="primary" onClick={() => alert('Hello from React CDN!')}>
            Click me
          </button>
        </div>
      </div>
    </main>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
`,
  vue: `<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <main class="body">
    <div class="hero">
      <p class="eyebrow">Vue · esm.sh</p>
      <h2>Vue CDN REPL</h2>
      <p class="lede">支持 SFC，浏览器内编译。</p>
      <div class="actions">
        <button class="primary" @click="count++">Count is {{ count }}</button>
      </div>
    </div>
  </main>
</template>
`,
  svelte: `<script>
  let count = 0
</script>

<main class="body">
  <div class="hero">
    <p class="eyebrow">Svelte · esm.sh</p>
    <h2>Svelte CDN REPL</h2>
    <p class="lede">Svelte 单文件组件，浏览器内编译。</p>
    <div class="actions">
      <button class="primary" on:click={() => count++}>Count is {count}</button>
    </div>
  </div>
</main>
`,
  solid: `import { render } from 'solid-js/web'
import { createSignal } from 'solid-js'

function App() {
  const [count, setCount] = createSignal(0)
  return (
    <main class="body">
      <div class="hero">
        <p class="eyebrow">Solid · esm.sh</p>
        <h2>Solid CDN REPL</h2>
        <p class="lede">Solid JSX 通过 Babel + preset-solid 编译。</p>
        <div class="actions">
          <button class="primary" onClick={() => setCount((n) => n + 1)}>
            Count is {count()}
          </button>
        </div>
      </div>
    </main>
  )
}

render(() => <App />, document.getElementById('root'))
`,
}

const sharedStyles = `
:root {
  color-scheme: light;
  font-family: "Inter", -apple-system, system-ui, sans-serif;
  background: #f6f7fb;
  color: #0f172a;
}
* { box-sizing: border-box; }
body { margin: 0; background: #f6f7fb; }
.body {
  padding: 18px 18px 20px;
  display: grid;
  gap: 12px;
  background: radial-gradient(circle at 10% 20%, #eef2ff 0, #f7f9ff 32%, #ffffff 55%);
}
.hero { display: grid; gap: 8px; }
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
.lede { color: #475569; margin: 0; line-height: 1.55; }
.actions { display: flex; align-items: center; gap: 10px; }
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
.primary:hover { transform: translateY(-1px); box-shadow: 0 18px 50px -22px rgba(37, 99, 235, 0.7); }
`

const importMaps = {
  react: {
    imports: {
      react: 'https://esm.sh/react@latest',
      'react-dom': 'https://esm.sh/react-dom@latest',
      'react-dom/client': 'https://esm.sh/react-dom@latest/client',
      'react/jsx-runtime': 'https://esm.sh/react@latest/jsx-runtime',
    },
  },
  vue: {
    imports: {
      vue: 'https://esm.sh/vue@latest',
      '@vue/compiler-sfc': 'https://esm.sh/@vue/compiler-sfc@latest',
    },
  },
  svelte: {
    imports: {
      svelte: 'https://esm.sh/svelte@latest',
      'svelte/internal': 'https://esm.sh/svelte@latest/internal',
    },
  },
  solid: {
    imports: {
      'solid-js': 'https://esm.sh/solid-js@latest',
      'solid-js/web': 'https://esm.sh/solid-js@latest/web',
      'solid-js/store': 'https://esm.sh/solid-js@latest/store',
    },
  },
}

let solidPresetPromise: Promise<void> | null = null
const ensureSolidPreset = () => {
  if (!solidPresetPromise) {
    solidPresetPromise = import(
      /* @vite-ignore */ 'https://esm.sh/babel-preset-solid@1.8.15?bundle'
    ).then((mod: any) => {
      const preset = mod.default || mod
      Babel.registerPreset('solid', preset)
    })
  }
  return solidPresetPromise
}

async function compileVueSfc(source: string): Promise<string> {
  // @ts-expect-error external CDN import without types
  const compiler = (await import(/* @vite-ignore */ 'https://esm.sh/@vue/compiler-sfc@latest')) as any
  const { descriptor } = compiler.parse(source, { filename: 'App.vue' })
  const script = compiler.compileScript(descriptor, {
    id: 'app',
    inlineTemplate: false,
    genDefaultAs: '__sfc__',
  })

  let renderCode = 'const render = () => null'
  if (descriptor.template) {
    const tpl = compiler.compileTemplate({
      source: descriptor.template.content,
      filename: 'App.vue',
      id: 'app',
    })
    renderCode = tpl.code.replace('export function render', 'function render')
  }

  return `
import * as Vue from 'vue'
${script.content}
${renderCode}
__sfc__.render = render
const app = Vue.createApp(__sfc__)
app.mount('#root')
`
}

const MultiCdnRepl = () => {
  const [active, setActive] = useState<Framework>('vue')
  const [states, setStates] = useState<Record<Framework, FrameworkState>>({
    react: { code: defaultCodes.react, error: null },
    vue: { code: defaultCodes.vue, error: null },
    svelte: { code: defaultCodes.svelte, error: null },
    solid: { code: defaultCodes.solid, error: null },
  })
  const [status, setStatus] = useState<'idle' | 'building'>('idle')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const editorElRef = useRef<HTMLDivElement | null>(null)

  const importMapJson = useMemo(() => JSON.stringify(importMaps[active]), [active])

  const buildPreview = async () => {
    setStatus('building')
    setStates((prev) => ({ ...prev, [active]: { ...prev[active], error: null } }))

    try {
      let compiled = ''
      if (active === 'react') {
        compiled =
          Babel.transform(states.react.code, {
            presets: [
              ['env', { modules: false, targets: { esmodules: true } }],
              ['react', { runtime: 'automatic' }],
            ],
            filename: 'App.jsx',
          }).code || ''
      } else if (active === 'vue') {
        compiled = await compileVueSfc(states.vue.code)
      } else if (active === 'svelte') {
        // @ts-expect-error external CDN import without types
        const svelteCompiler = (await import(/* @vite-ignore */ 'https://esm.sh/svelte/compiler@latest')).default as any
        const svelteCompiled = svelteCompiler.compile(states.svelte.code, {
          filename: 'App.svelte',
          format: 'esm',
          generate: 'dom',
          name: 'App',
        })
        compiled =
          (svelteCompiled.js?.code || '') +
          '\n' +
          'const app = new App({ target: document.getElementById("root") }); window.app = app;'
      } else if (active === 'solid') {
        await ensureSolidPreset()
        compiled =
          Babel.transform(states.solid.code, {
            presets: [
              ['env', { modules: false, targets: { esmodules: true } }],
              ['solid', { generate: 'dom', hydratable: false }],
            ],
            filename: 'App.jsx',
          }).code || ''
      }

      const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>${sharedStyles}</style>
    <script type="importmap">${importMapJson}</script>
    <script type="module">
      window.addEventListener('error', (event) => {
        parent.postMessage({ type: 'runtime-error', message: event.message, stack: event.error?.stack }, '*')
      })
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${compiled}
    </script>
  </body>
</html>
      `

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = url
      if (iframeRef.current) iframeRef.current.src = url
    } catch (err: any) {
      const message = err?.message || 'Failed to compile'
      setStates((prev) => ({ ...prev, [active]: { ...prev[active], error: message } }))
    } finally {
      setStatus('idle')
    }
  }

  useEffect(() => {
    buildPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'runtime-error') {
        setStates((prev) => ({ ...prev, [active]: { ...prev[active], error: event.data.message } }))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [active])

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  const onCodeChange = (value: string) => {
    setStates((prev) => ({ ...prev, [active]: { ...prev[active], code: value } }))
  }

  useEffect(() => {
    let disposed = false
    const loadEditor = async () => {
      const [monaco] = await Promise.all([
        import('monaco-editor'),
        import('monaco-editor/min/vs/editor/editor.main.css'),
      ])
      if (disposed) return
      monacoRef.current = monaco
      editorRef.current = monaco.editor.create(editorElRef.current as HTMLElement, {
        value: states[active].code,
        language: active === 'react' || active === 'solid' ? 'typescript' : 'html',
        theme: 'vs-dark',
        minimap: { enabled: false },
        automaticLayout: true,
      })
      editorRef.current.onDidChangeModelContent(() => {
        const value = editorRef.current?.getValue() || ''
        onCodeChange(value)
      })
    }
    loadEditor()
    return () => {
      disposed = true
      editorRef.current?.dispose()
      editorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return
    const model = editorRef.current.getModel()
    if (model) {
      monacoRef.current.editor.setModelLanguage(
        model,
        active === 'react' || active === 'solid' ? 'typescript' : 'html',
      )
      editorRef.current.setValue(states[active].code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div className="cdn-shell">
      <div className="cdn-toolbar">
        <div className="title">
          <span className="dot" />
          Astro CDN Multi-REPL
        </div>
        <div className="meta">
          {(['vue', 'react', 'svelte', 'solid'] as Framework[]).map((fw) => (
            <button
              key={fw}
              className={`pill-btn ${active === fw ? 'is-active' : ''}`}
              onClick={() => setActive(fw)}
            >
              {fw.toUpperCase()}
            </button>
          ))}
          <button className="pill-btn run" onClick={buildPreview} disabled={status === 'building'}>
            {status === 'building' ? 'Building…' : 'Run'}
          </button>
        </div>
      </div>

      <div className="cdn-grid">
        <div className="editor">
          <div className="editor__pane" ref={editorElRef} />
        </div>
        <div className="preview">
          <iframe ref={iframeRef} title="CDN preview" sandbox="allow-scripts allow-same-origin" />
        </div>
      </div>

      {states[active].error ? <div className="error">⚠️ {states[active].error}</div> : null}

      <style>{`
        .cdn-shell {
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          box-shadow: 0 14px 60px -34px rgba(15, 23, 42, 0.45);
          overflow: hidden;
          display: grid;
          grid-auto-rows: auto 1fr;
        }
        .cdn-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: linear-gradient(120deg, #0f172a, #2563eb);
          color: #e5e7eb;
          gap: 12px;
        }
        .title { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.2); }
        .meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
        .pill-btn {
          padding: 7px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          color: #e5e7eb;
          border: 1px solid rgba(255, 255, 255, 0.28);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .pill-btn.is-active {
          background: #ffffff;
          color: #0f172a;
        }
        .pill-btn.run { background: #0ea5e9; color: #0b1220; border-color: rgba(255, 255, 255, 0.4); }
        .pill-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cdn-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; min-height: 70vh; }
        .editor { background: #0b1220; color: #e5e7eb; padding: 12px; }
        .editor__pane {
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .preview { background: #0b1220; border-left: 1px solid rgba(255, 255, 255, 0.08); }
        .preview iframe { width: 100%; height: 100%; border: none; background: white; }
        .error { padding: 12px 14px; background: #fef2f2; color: #b91c1c; font-size: 14px; border-top: 1px solid rgba(15, 23, 42, 0.08); }
        @media (max-width: 960px) { .cdn-grid { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; } }
      `}</style>
    </div>
  )
}

export default MultiCdnRepl
