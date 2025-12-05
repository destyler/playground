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

<div class="border border-gray-200 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
  <p class="text-gray-600 dark:text-gray-300 mb-2">Count: <strong class="text-orange-500">{count}</strong></p>
  <p class="text-gray-600 dark:text-gray-300 mb-4">Doubled: <strong class="text-orange-500">{doubled}</strong></p>
  <div class="flex gap-2 justify-center">
    <button class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" onclick={decrement}>-</button>
    <button class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors" onclick={reset}>Reset</button>
    <button class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" onclick={increment}>+</button>
  </div>
</div>
