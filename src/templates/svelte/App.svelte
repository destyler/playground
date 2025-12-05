<script lang="ts">
  import * as checkbox from '@destyler/checkbox';
  import { normalizeProps, useMachine } from '@destyler/svelte';
  import Counter from './Counter.svelte';

  // Setup checkbox machine
  const id = crypto.randomUUID();
  const [snapshot, send] = useMachine(checkbox.machine({ id }));
  const api = $derived(checkbox.connect(snapshot, send, normalizeProps));
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
  <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
      Destyler Svelte Playground
    </h1>

    <div class="mb-4">
      <label {...api.getRootProps()} class="flex items-center gap-2 cursor-pointer">
        <div
          {...api.getControlProps()}
          class="w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center transition-colors {api.checked ? 'bg-blue-500' : ''}"
        >
          {#if api.checked}
            <span class="text-white text-sm">✓</span>
          {/if}
        </div>
        <span {...api.getLabelProps()} class="text-gray-700 dark:text-gray-300">
          Accept terms and conditions
        </span>
        <input {...api.getHiddenInputProps()} />
      </label>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Checked: {api.checked}
      </p>
    </div>

    <Counter />
  </div>
</div>
