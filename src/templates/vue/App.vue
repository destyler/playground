<script setup lang="ts">
import * as checkbox from '@destyler/checkbox'
import { normalizeProps, useMachine } from '@destyler/vue'
import { computed, useId } from 'vue'
import Comp from './Comp.vue'

const [state, send] = useMachine(checkbox.machine({
  id: useId(),
}))

const api = computed(() => checkbox.connect(state.value, send, normalizeProps))
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Destyler Vue Playground
      </h1>

      <div class="mb-4">
        <label v-bind="api.getRootProps()" class="flex items-center gap-2 cursor-pointer">
          <div
            v-bind="api.getControlProps()"
            class="w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center transition-colors"
            :class="{ 'bg-blue-500': api.checked }"
          >
            <span v-if="api.checked" class="text-white text-sm">✓</span>
          </div>
          <span v-bind="api.getLabelProps()" class="text-gray-700 dark:text-gray-300">
            Accept terms and conditions
          </span>
          <input v-bind="api.getHiddenInputProps()">
        </label>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Checked: {{ api.checked }}
        </p>
      </div>

      <Comp class="mt-4" />
    </div>
  </div>
</template>
