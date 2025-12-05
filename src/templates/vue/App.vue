<script setup lang="ts">
import { ref } from 'vue'
import Comp from './Comp.vue'

const msg = ref<string>('Hello World!')
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <input v-model="msg">
    <Comp />
  </div>
</template>
