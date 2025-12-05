<script lang="ts">
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
</style>
