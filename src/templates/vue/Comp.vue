<script setup lang="ts">
const props = defineProps<{
  message: string
  count?: number
}>()
</script>

<template>
  <div class="comp">
    <p>Message: {{ props.message }}</p>
    <p v-if="props.count !== undefined">Count: {{ props.count }}</p>
  </div>
</template>

<style scoped>
.comp {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}
</style>
