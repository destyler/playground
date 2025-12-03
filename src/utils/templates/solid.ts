import type { File } from './types'

export const SOLID_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Solid',
  color: '#2c4f7c',
  cdn: [],
  defaultFiles: [
    {
      name: 'App.tsx',
      content: `import { render } from 'solid-js/web'
import Counter from './Counter.tsx'

function App() {
  return (
    <div class="container">
      <h1>Solid App</h1>
      <Counter />
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
`,
      active: true,
    },
    {
      name: 'Counter.tsx',
      content: `import { createSignal } from 'solid-js'

export default function Counter() {
  const [count, setCount] = createSignal(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count is: {count()}
    </button>
  )
}
`,
    },
  ],
}
