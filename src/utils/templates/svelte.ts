import type { File } from './types'

export const SVELTE_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Svelte',
  color: '#ff3e00',
  cdn: [
    'https://unpkg.com/@babel/standalone@7.26.2/babel.min.js',
  ],
  defaultFiles: [
    {
      name: 'App.svelte',
      content: `<script lang="ts">
  import Counter from './Counter.svelte';
  import { greeting } from './utils.ts';

  // Svelte 5 runes with TypeScript
  let name: string = $state('World');
  let message = $derived(\`\${greeting} \${name}!\`);
</script>

<div class="container">
  <h1>{message}</h1>
  <input bind:value={name} placeholder="Enter your name" />
  <Counter />
</div>

<style>
  .container {
    text-align: center;
    padding: 20px;
    font-family: system-ui, sans-serif;
  }
  h1 {
    color: #ff3e00;
  }
  input {
    padding: 8px 12px;
    font-size: 16px;
    border: 2px solid #ff3e00;
    border-radius: 4px;
    margin-bottom: 20px;
  }
</style>`,
      active: true,
    },
    {
      name: 'Counter.svelte',
      content: `<script lang="ts">
  // Svelte 5 runes with TypeScript types
  interface CounterState {
    count: number;
    doubled: number;
  }

  let count: number = $state(0);
  let doubled: number = $derived(count * 2);

  // Effect to log changes
  $effect(() => {
    console.log('Count changed to:', count);
  });

  function increment(): void {
    count += 1;
  }

  function decrement(): void {
    count -= 1;
  }

  function reset(): void {
    count = 0;
  }
</script>

<div class="counter">
  <p>Count: <strong>{count}</strong></p>
  <p>Doubled: <strong>{doubled}</strong></p>
  <div class="buttons">
    <button onclick={decrement}>-</button>
    <button onclick={reset}>Reset</button>
    <button onclick={increment}>+</button>
  </div>
</div>

<style>
  .counter {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    display: inline-block;
  }
  .buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 10px;
  }
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    transition: background 0.2s;
  }
  button:hover {
    background: #ff5722;
  }
  p {
    margin: 5px 0;
    font-size: 18px;
  }
  strong {
    color: #ff3e00;
  }
</style>`,
    },
    {
      name: 'utils.ts',
      content: `// TypeScript utilities for Svelte
export const greeting: string = 'Hello';

export interface User {
  id: number;
  name: string;
  email: string;
}

export function formatUser(user: User): string {
  return \`\${user.name} <\${user.email}>\`;
}

export function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  };
}
`,
    },
  ],
}
