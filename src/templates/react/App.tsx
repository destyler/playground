import * as checkbox from '@destyler/checkbox'
import { normalizeProps, useMachine } from '@destyler/react'
import { useId } from 'react'
import Counter from './Counter'

export default function App() {
  const [state, send] = useMachine(checkbox.machine({
    id: useId(),
  }))

  const api = checkbox.connect(state, send, normalizeProps)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Destyler React Playground
        </h1>

        <div className="mb-4">
          <label {...api.getRootProps()} className="flex items-center gap-2 cursor-pointer">
            <div
              {...api.getControlProps()}
              className={`w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center transition-colors ${api.checked ? 'bg-blue-500' : ''}`}
            >
              {api.checked && <span className="text-white text-sm">✓</span>}
            </div>
            <span {...api.getLabelProps()} className="text-gray-700 dark:text-gray-300">
              Accept terms and conditions
            </span>
            <input {...api.getHiddenInputProps()} />
          </label>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Checked: {String(api.checked)}
          </p>
        </div>

        <Counter />
      </div>
    </div>
  )
}
