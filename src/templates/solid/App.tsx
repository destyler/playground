import * as checkbox from '@destyler/checkbox'
import { normalizeProps, useMachine } from '@destyler/solid'
import { createMemo, createUniqueId, Show } from 'solid-js'
import { render } from 'solid-js/web'
import Counter from './Counter'

function App() {
  const [state, send] = useMachine(checkbox.machine({
    id: createUniqueId(),
  }))

  const api = createMemo(() => checkbox.connect(state, send, normalizeProps))

  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler Solid Playground
        </h1>

        <div class="mb-4">
          <label {...api().getRootProps()} class="flex items-center gap-2 cursor-pointer">
            <div
              {...api().getControlProps()}
              class="w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center transition-colors"
              classList={{ 'bg-blue-500': api().checked }}
            >
              <Show when={api().checked}>
                <span class="text-white text-sm">✓</span>
              </Show>
            </div>
            <span {...api().getLabelProps()} class="text-gray-700 dark:text-gray-300">
              Accept terms and conditions
            </span>
            <input {...api().getHiddenInputProps()} />
          </label>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Checked: {String(api().checked)}
          </p>
        </div>

        <Counter />
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
