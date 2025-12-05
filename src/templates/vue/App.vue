<script setup lang="ts">
import { ref } from 'vue'
import Comp from './Comp.vue'

const msg = ref<string>('Hello World!')
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">{{ msg }}</h1>
      <input
        v-model="msg"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Type something..."
      />
      <Comp class="mt-4" />
    </div>
  </div>
</template>
