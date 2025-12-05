<!--
  Framework Select Component

  A dropdown select component for choosing the active framework in the playground.
  Uses @destyler/select for accessible and customizable select functionality.

  Events:
  - Dispatches 'framework:change' when user selects a different framework
  - Listens for 'url:framework-restored' to sync with URL state

  @component Select
-->
<script setup lang="ts">
import type { Framework } from '../../templates/types'
import * as select from '@destyler/select'
import { normalizeProps, useMachine } from '@destyler/vue'
import { computed, onMounted, useId } from 'vue'
import { FRAMEWORK_OPTIONS, state } from '../../libs/state'

// ============================================================================
// Constants
// ============================================================================

/** Custom event names for framework changes */
const EVENTS = {
  FRAMEWORK_CHANGE: 'framework:change',
  URL_FRAMEWORK_RESTORED: 'url:framework-restored',
} as const

/** Positioning offset for dropdown */
const DROPDOWN_OFFSET = {
  mainAxis: 2,
  crossAxis: 2,
} as const

/** Delay before allowing framework change events (ms) */
const INIT_DELAY = 300

// ============================================================================
// State
// ============================================================================

/** Flag to prevent triggering framework:change during initialization */
let isInitializing = true

// ============================================================================
// Select Machine
// ============================================================================

const [current, send] = useMachine(
  select.machine({
    collection: select.collection({
      items: FRAMEWORK_OPTIONS,
    }),
    id: useId(),
    value: [state.activeFramework],
    multiple: false,
    positioning: {
      offset: DROPDOWN_OFFSET,
    },
    onValueChange(details) {
      if (details.value[0] && !isInitializing) {
        const framework = details.value[0] as Framework
        window.dispatchEvent(new CustomEvent(EVENTS.FRAMEWORK_CHANGE, {
          detail: { framework },
        }))
      }
    },
  }),
)

const api = computed(() => select.connect(current.value, send, normalizeProps))

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  /**
   * Handle framework restoration from URL state
   */
  const handleUrlStateRestore = (e: CustomEvent<{ framework: Framework }>) => {
    const framework = e.detail.framework
    if (framework && api.value.value[0] !== framework) {
      // Set value without triggering framework:change
      isInitializing = true
      api.value.setValue([framework])
      isInitializing = false
    }
  }

  window.addEventListener(EVENTS.URL_FRAMEWORK_RESTORED, handleUrlStateRestore as EventListener)

  // Sync initial value from state (in case URL was loaded before component mounted)
  if (state.activeFramework && api.value.value[0] !== state.activeFramework) {
    api.value.setValue([state.activeFramework])
  }

  // Mark initialization as complete after a short delay
  setTimeout(() => {
    isInitializing = false
  }, INIT_DELAY)
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
        <option v-for="option in FRAMEWORK_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </form>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getPositionerProps()" class="bg-popover z-99999! p-1 w-28 shadow-md border border-solid border-border rounded-md">
        <ul v-bind="api.getContentProps()" class="w-full text-popover-foreground">
          <li
            v-for="item in FRAMEWORK_OPTIONS"
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
