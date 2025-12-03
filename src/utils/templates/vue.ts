import type { File } from './types'

export const VUE_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Vue',
  color: '#42b883',
  cdn: [
    'https://unpkg.com/vue@3/dist/vue.global.js',
    'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
  ],
  defaultFiles: [
    {
      name: 'App.vue',
      content: `<script setup>
import { ref } from 'vue'
import Comp from './Comp.vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
  <Comp />
</template>`,
      active: true,
    },
    {
      name: 'Comp.vue',
      content: `<template>
  <div class="comp">
    I am a component
  </div>
</template>

<style scoped>
.comp {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}
</style>`,
    },
  ],
}


