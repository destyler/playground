import Counter from './Counter'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">React App</h1>
        <Counter />
      </div>
    </div>
  )
}
