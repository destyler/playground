import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
      <p className="text-gray-600 dark:text-gray-300 mb-2">Counter Component</p>
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => setCount(count - 1)}
        >
          -
        </button>
        <span className="text-xl font-semibold text-gray-800 dark:text-white">{count}</span>
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
