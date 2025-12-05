<script lang="ts">
  import Counter from './Counter.svelte';
  import { greeting } from './utils.ts';

  // Svelte 5 runes with TypeScript
  let name: string = $state('World');
  let message = $derived(`${greeting} ${name}!`);
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
</style>
