<script setup>
import { ref } from 'vue'
import { Button } from '@destyler/button'
import { InfoRoot, InfoClose } from '@destyler/info'
import { Icon } from '@destyler/icon'

const msg = ref('Hello World!')

const status = ref(true)
</script>

<template>
  <Button class="button" @click="status = true">Open Info</Button>
  <br/>
  <br/>
  <InfoRoot v-model:open="status">
    <h1>{{ msg }}</h1>
    <InfoClose @click="status = false" >
      <Icon name="radix-icons:cross-1" />
    </InfoClose>
  </InfoRoot>
</template>
