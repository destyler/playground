import type { File, Framework } from './types'
import { DEFAULT_COMPONENT, getComponentLabel } from '../libs/destyler-deps'

import reactCounter from './react/Counter.tsx?raw'
import solidCounter from './solid/Counter.tsx?raw'
import svelteCounter from './svelte/Counter.svelte?raw'
import svelteUtils from './svelte/utils.ts?raw'
import vueComp from './vue/Comp.vue?raw'

const FRAMEWORK_LABELS: Record<Framework, string> = {
  vue: 'Vue',
  react: 'React',
  solid: 'Solid',
  svelte: 'Svelte',
}

const RESERVED_IDENTS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while',
  'with', 'yield', 'await', 'let', 'static', 'implements', 'interface', 'package',
  'private', 'protected', 'public',
])

function toIdent(component: string): string {
  const camel = component.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
  return RESERVED_IDENTS.has(camel) ? `${camel}Primitive` : camel
}

function companionFiles(framework: Framework): File[] {
  switch (framework) {
    case 'vue':
      return [{ name: 'Comp.vue', content: vueComp }]
    case 'react':
      return [{ name: 'Counter.tsx', content: reactCounter }]
    case 'solid':
      return [{ name: 'Counter.tsx', content: solidCounter }]
    case 'svelte':
      return [
        { name: 'Counter.svelte', content: svelteCounter },
        { name: 'utils.ts', content: svelteUtils },
      ]
  }
}

function vueApp(component: string, ident: string, label: string, frameworkLabel: string): string {
  return `<script setup lang="ts">
import * as ${ident} from '@destyler/${component}'
import { normalizeProps, useMachine } from '@destyler/vue'
import { computed, useId } from 'vue'
import Comp from './Comp.vue'

const [state, send] = useMachine(${ident}.machine({
  id: useId(),
}))

const api = computed(() => ${ident}.connect(state.value, send, normalizeProps))
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Destyler ${frameworkLabel} — ${label}
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Edit this file; only imported @destyler packages are preloaded.
      </p>
      <div v-bind="api.getRootProps()" class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        ${label}
      </div>
      <Comp class="mt-4" />
    </div>
  </div>
</template>
`
}

function reactApp(component: string, ident: string, label: string, frameworkLabel: string): string {
  return `import * as ${ident} from '@destyler/${component}'
import { normalizeProps, useMachine } from '@destyler/react'
import { useId } from 'react'
import Counter from './Counter'

export default function App() {
  const [state, send] = useMachine(${ident}.machine({
    id: useId(),
  }))

  const api = ${ident}.connect(state, send, normalizeProps)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler ${frameworkLabel} — ${label}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Edit this file; only imported @destyler packages are preloaded.
        </p>
        <div {...api.getRootProps()} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          {${JSON.stringify(label)}}
        </div>
        <Counter />
      </div>
    </div>
  )
}
`
}

function solidApp(component: string, ident: string, label: string, frameworkLabel: string): string {
  return `import * as ${ident} from '@destyler/${component}'
import { normalizeProps, useMachine } from '@destyler/solid'
import { createMemo, createUniqueId } from 'solid-js'
import { render } from 'solid-js/web'
import Counter from './Counter'

function App() {
  const [state, send] = useMachine(${ident}.machine({
    id: createUniqueId(),
  }))

  const api = createMemo(() => ${ident}.connect(state, send, normalizeProps))

  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler ${frameworkLabel} — ${label}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Edit this file; only imported @destyler packages are preloaded.
        </p>
        <div {...api().getRootProps()} class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          {${JSON.stringify(label)}}
        </div>
        <Counter />
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
`
}

function svelteApp(component: string, ident: string, label: string, frameworkLabel: string): string {
  return `<script lang="ts">
  import * as ${ident} from '@destyler/${component}';
  import { normalizeProps, useMachine } from '@destyler/svelte';
  import Counter from './Counter.svelte';

  const id = crypto.randomUUID();
  const [snapshot, send] = useMachine(${ident}.machine({ id }));
  const api = $derived(${ident}.connect(snapshot, send, normalizeProps));
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
      Destyler ${frameworkLabel} — ${label}
    </h1>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Edit this file; only imported @destyler packages are preloaded.
    </p>
    <div {...api.getRootProps()} class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
      ${label}
    </div>
    <Counter />
  </div>
</div>
`
}

/**
 * Generated destyler demo files for a framework + component (not checkbox).
 * Checkbox remains the hand-written templates in FRAMEWORKS.defaultFiles.
 */
export function generateComponentExampleFiles(framework: Framework, component: string): File[] {
  if (component === DEFAULT_COMPONENT)
    throw new Error('checkbox demos must reuse FRAMEWORKS defaultFiles')

  const ident = toIdent(component)
  const label = getComponentLabel(component)
  const frameworkLabel = FRAMEWORK_LABELS[framework]

  let app: File
  switch (framework) {
    case 'vue':
      app = { name: 'App.vue', content: vueApp(component, ident, label, frameworkLabel), active: true }
      break
    case 'react':
      app = { name: 'App.tsx', content: reactApp(component, ident, label, frameworkLabel), active: true }
      break
    case 'solid':
      app = { name: 'App.tsx', content: solidApp(component, ident, label, frameworkLabel), active: true }
      break
    case 'svelte':
      app = { name: 'App.svelte', content: svelteApp(component, ident, label, frameworkLabel), active: true }
      break
  }

  return [app, ...companionFiles(framework)]
}

