import { createSignal } from 'solid-js'

export default function Counter() {
  const [count, setCount] = createSignal(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count is:
      {' '}
      {count()}
    </button>
  )
}
