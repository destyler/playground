import type { File } from './types'

export const SVELTE_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Svelte',
  color: '#ff3e00',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: [
    {
      name: 'App.svelte',
      content: `<script>
  import Counter from './Counter.svelte';
</script>

<div class="container">
  <h1>Svelte App</h1>
  <Counter />
</div>

<style>
  h1 { color: #ff3e00; }
</style>`,
      active: true,
    },
    {
      name: 'Counter.svelte',
      content: `<script>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count is: {count}
</button>`,
    },
  ],
}


