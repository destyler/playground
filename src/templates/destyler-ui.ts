import type { File, Framework, PlaygroundLayer } from './types'

const CHECKBOX_CONTROL_CLASS = 'w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center text-white transition-colors data-[state=checked]:bg-blue-500'
const CHECKBOX_ROOT_CLASS = 'flex items-center gap-2 cursor-pointer'

const CHECK_SVG_HTML = `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="12">
          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`

const CHECK_SVG_REACT = `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="12">
            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>`

const vueApp = `<script setup lang="ts">
import { Checkbox } from '@destyler-ui/vue'
import Comp from './Comp.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Destyler UI Vue Playground
      </h1>

      <div class="mb-4">
        <Checkbox.Root class="${CHECKBOX_ROOT_CLASS}">
          <Checkbox.Control class="${CHECKBOX_CONTROL_CLASS}">
            <Checkbox.Indicator>
              ${CHECK_SVG_HTML}
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label class="text-gray-700 dark:text-gray-300">Accept terms and conditions</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </div>

      <Comp class="mt-4" />
    </div>
  </div>
</template>
`

const reactApp = `import { Checkbox } from '@destyler-ui/react'
import Counter from './Counter'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler UI React Playground
        </h1>

        <div className="mb-4">
          <Checkbox.Root className="${CHECKBOX_ROOT_CLASS}">
            <Checkbox.Control className="${CHECKBOX_CONTROL_CLASS}">
              <Checkbox.Indicator>
                ${CHECK_SVG_REACT}
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label className="text-gray-700 dark:text-gray-300">
              Accept terms and conditions
            </Checkbox.Label>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </div>

        <Counter />
      </div>
    </div>
  )
}
`

const solidApp = `import { Checkbox } from '@destyler-ui/solid'
import { render } from 'solid-js/web'
import Counter from './Counter'

function App() {
  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler UI Solid Playground
        </h1>

        <div class="mb-4">
          <Checkbox.Root class="${CHECKBOX_ROOT_CLASS}">
            <Checkbox.Control class="${CHECKBOX_CONTROL_CLASS}">
              <Checkbox.Indicator>
                ${CHECK_SVG_HTML}
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="text-gray-700 dark:text-gray-300">
              Accept terms and conditions
            </Checkbox.Label>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </div>

        <Counter />
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
`

const svelteApp = `<script lang="ts">
  import { Checkbox } from '@destyler-ui/svelte';
  import Counter from './Counter.svelte';
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
      Destyler UI Svelte Playground
    </h1>

    <div class="mb-4">
      <Checkbox.Root class="${CHECKBOX_ROOT_CLASS}">
        <Checkbox.Control class="${CHECKBOX_CONTROL_CLASS}">
          <Checkbox.Indicator>
            ${CHECK_SVG_HTML}
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label class="text-gray-700 dark:text-gray-300">
          Accept terms and conditions
        </Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
    </div>

    <Counter />
  </div>
</div>
`

export const DESTYLER_UI_APP_FILES: Record<Framework, File> = {
  vue: { name: 'App.vue', content: vueApp, active: true },
  react: { name: 'App.tsx', content: reactApp, active: true },
  solid: { name: 'App.tsx', content: solidApp, active: true },
  svelte: { name: 'App.svelte', content: svelteApp, active: true },
}

export function isPlaygroundLayer(value: unknown): value is PlaygroundLayer {
  return value === 'destyler' || value === 'destyler-ui'
}

export function parsePlaygroundLayer(value: unknown): PlaygroundLayer {
  return isPlaygroundLayer(value) ? value : 'destyler'
}
