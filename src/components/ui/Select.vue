<script setup lang="ts">
import type { Framework } from '../../utils/templates'
import * as select from '@destyler/select'
import { normalizeProps, useMachine } from '@destyler/vue'
import { computed, onMounted, useId } from 'vue'
import { frameworks, state } from '../../libs/state'

const [current, send] = useMachine(
  select.machine({
    collection: select.collection({
      items: frameworks,
    }),
    id: useId(),
    value: [state.activeFramework],
    multiple: false,
    positioning: {
      offset: {
        mainAxis: 2,
        crossAxis: 2,
      },
    },
    onValueChange(details) {
      if (details.value[0]) {
        const framework = details.value[0] as Framework
        // 触发自定义事件通知 playground 切换框架
        window.dispatchEvent(new CustomEvent('framework:change', {
          detail: { framework },
        }))
      }
    },
  }),
)

const api = computed(() => select.connect(current.value, send, normalizeProps))

// Expose setValue method for external access (e.g., when restoring from URL)
onMounted(() => {
  // Watch for framework changes from URL restoration
  const handleUrlStateRestore = (e: CustomEvent<{ framework: Framework }>) => {
    const framework = e.detail.framework
    if (framework && api.value.value[0] !== framework) {
      api.value.setValue([framework])
    }
  }

  window.addEventListener('url:framework-restored', handleUrlStateRestore as EventListener)

  // Sync initial value from state (in case URL was loaded before component mounted)
  if (state.activeFramework && api.value.value[0] !== state.activeFramework) {
    api.value.setValue([state.activeFramework])
  }
})
</script>

<template>
  <div v-bind="api.getRootProps()" class="flex items-center w-28">
    <div v-bind="api.getControlProps()" class="w-28">
      <button v-bind="api.getTriggerProps()" class="justify-between flex items-center w-full border border-solid border-border p-1 rounded-md transition-all duration-200 hover:border-accent-foreground/50">
        <span>{{ api.valueAsString || "Select option" }}</span>
        <span v-bind="api.getIndicatorProps()" class="i-ph-caret-down-bold size-4 transition-transform duration-200" :class="{ 'rotate-180': api.open }" />
      </button>
    </div>
    <form>
      <select v-bind="api.getHiddenSelectProps()">
        <option v-for="option in frameworks" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </form>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getPositionerProps()" class="bg-popover z-99999! p-1 w-28 shadow-md border border-solid border-border rounded-md">
        <ul v-bind="api.getContentProps()" class="w-full text-popover-foreground">
          <li
            v-for="item in frameworks"
            :key="item.value"
            v-bind="api.getItemProps({ item })"
            class="flex justify-between cursor-pointer mb-2 last:mb-0
              data-[highlighted]:bg-accent px-2 py-1 rounded-md items-center
              transition-colors duration-150"
          >
            <span
              v-bind="api.getItemTextProps({ item })"
              class="text-popover-foreground"
            >
              {{ item.label }}
            </span>
            <span
              v-bind="api.getItemIndicatorProps({ item })"
              class="i-ph-check-bold size-4"
            />
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
