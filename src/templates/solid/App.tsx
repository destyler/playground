import { render } from 'solid-js/web'
import Counter from './Counter'

function App() {
  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Solid App</h1>
        <Counter />
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
