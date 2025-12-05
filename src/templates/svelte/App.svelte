<script lang="ts">
  import Counter from './Counter.svelte';
  import { greeting } from './utils.ts';

  // Svelte 5 runes with TypeScript
  let name: string = $state('World');
  let message = $derived(`${greeting} ${name}!`);
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-orange-500 mb-4">{message}</h1>
    <input
      bind:value={name}
      placeholder="Enter your name"
      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white mb-4"
    />
    <Counter />
  </div>
</div>
