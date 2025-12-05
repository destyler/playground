import { createSignal } from 'solid-js'

export default function Counter() {
  const [count, setCount] = createSignal(0)

  return (
    <div class="border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
      <p class="text-gray-600 dark:text-gray-300 mb-2">Counter Component</p>
      <div class="flex items-center gap-4">
        <button
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => setCount(c => c - 1)}
        >
          -
        </button>
        <span class="text-xl font-semibold text-gray-800 dark:text-white">{count()}</span>
        <button
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => setCount(c => c + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
