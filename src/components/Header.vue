<script setup lang="ts">
import type { Store, VersionKey } from '@/composables/store'
import type { Ref } from 'vue'
import {
  getSupportedTSVersions,
  getSupportedUIVersions,
  getSupportedVueVersions,
} from '@/utils/dependency'
import { languageToolsVersion } from '@vue/repl'

const { store } = defineProps<{
  store: Store
}>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const appVersion = import.meta.env.APP_VERSION
const replVersion = import.meta.env.REPL_VERSION

const dark = useDark()
const toggleDark = useToggle(dark)

interface Version {
  text: string
  published: Ref<string[]>
  active: string
}

const versions = reactive<Record<VersionKey, Version>>({
  destyler: {
    text: 'Destyler',
    published: getSupportedUIVersions(),
    active: store.versions.destyler,
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue,
  },
  typescript: {
    text: 'TypeScript',
    published: getSupportedTSVersions(),
    active: store.versions.typescript,
  },
})

const copyStatus = ref<boolean>(false)

async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  copyStatus.value = true
  setTimeout(() => {
    copyStatus.value = false
  }, 2000)
}

function refreshView() {
  emit('refresh')
}
</script>

<template>
  <nav>
    <div leading="[var(--nav-height)]" m-0 flex items-center font-medium>
      <!-- logo -->
      <Logo class="relative mr-2 h-24px v-mid top-[-2px]" />
      <div flex="~ gap-1" items-center lt-sm-hidden>
        <!-- title -->
        <div text-xl>
          Destyler Playground
        </div>
        <!-- tag -->
        <InfoRoot
          as="span"
          class="
          px-7px w-auto h-20px rounded-md
          flex justify-center items-center
          border-transparent shadow cursor-default
          bg-#18181B dark:bg-#FAFAFA
          text-#FAFAFA dark:text-#18181B
          hover:bg-#18181B/80 dark:hover:bg-#FAFAFA/80
          "
        >
          v{{ appVersion }}, repl v{{ replVersion }}, volar v{{
            languageToolsVersion
          }}
        </InfoRoot>
      </div>
    </div>

    <div class="flex gap-2 items-center z-99">
      <!-- version select group -->
      <div
        v-for="(v, key) of versions"
        :key="key"
        class="
        flex gap-2 items-center lt-lg-hidden
        "
      >
        <span>{{ v.text }}:</span>
        <SelectRoot v-model="v.active">
          <SelectTrigger
            class="
            h-6 w-140px whitespace-nowrap
            flex items-center justify-between
            bg-transparent pl-2 pr-1 py-2 text-sm
            rounded-md border shadow-sm
            border-#18181B/10 dark:border-#FAFAFA/10
            text-#18181B dark:text-#FAFAFA
            placeholder:text-#18181B dark:placeholder:text-#18181B
            "
          >
            <SelectValue placeholder="lastet" />
            <Icon name="carbon:chevron-sort" class="h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent
              class="
              relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md
              border border-#18181B/10 dark:border-#FAFAFA/10 shadow-md
              bg-#FAFAFA text-#18181B dark:bg-#18181B dark:text-#FAFAFA
              data-[state=open]:animate-in data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
              data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
              data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
              data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1
              data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1
              "
              :side-offset="5"
              position="popper"
            >
              <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
                <Icon name="carbon:chevron-up" class="h-4 w-4" />
              </SelectScrollUpButton>
              <SelectViewport
                class="
                p-1 h-[var(--destyler-select-trigger-height)]
                w-full min-w-[var(--destyler-select-trigger-width)]
                "
              >
                <SelectItem
                  value="latest"
                  class="
                  relative flex w-full cursor-default select-none
                  items-center rounded-sm py-1.5 pl-2 pr-8 text-sm
                  outline-none data-[disabled]:pointer-events-none
                  data-[disabled]:opacity-50 cursor-pointer
                dark:focus:bg-#27272A dark:focus:text-#FAFAFA
                focus:bg-#F4F4F5 focus:text-#18181B
                  "
                >
                  <SelectItemText>
                    latest
                  </SelectItemText>
                  <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectItemIndicator>
                      <Icon name="carbon:checkmark" class="h-4 w-4" />
                    </SelectItemIndicator>
                  </span>
                </SelectItem>
                <SelectItem
                  v-for="ver of v.published"
                  :key="ver"
                  :value="ver"
                  class="
                  relative flex w-full cursor-default select-none
                  items-center rounded-sm py-1.5 pl-2 pr-8 text-sm
                  outline-none data-[disabled]:pointer-events-none
                  data-[disabled]:opacity-50 cursor-pointer
                dark:focus:bg-#27272A dark:focus:text-#FAFAFA
                focus:bg-#F4F4F5 focus:text-#18181B
                  "
                >
                  <SelectItemText>
                    {{ ver }}
                  </SelectItemText>
                  <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectItemIndicator>
                      <Icon name="carbon:checkmark" class="h-4 w-4" />
                    </SelectItemIndicator>
                  </span>
                </SelectItem>
              </SelectViewport>
              <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
                <Icon name="carbon:chevron-down" class="h-4 w-4" />
              </SelectScrollDownButton>
            </SelectContent>
          </SelectPortal>
        </SelectRoot>
      </div>
      <!-- icon group -->
      <div class="flex gap-4 text-lg">
        <Button @click="refreshView">
          <Icon
            class="
          dark:text-#FAFAFA/80 text-#18181B/80
          hover:text-#18181B dark:hover:text-#FAFAFA
            "
            name="radix-icons:update"
          />
        </Button>
        <Button @click="copyLink">
          <Icon
            class="
          dark:text-#FAFAFA/80 text-#18181B/80
          hover:text-#18181B dark:hover:text-#FAFAFA
            "
            :name="copyStatus ? 'radix-icons:check' : 'radix-icons:share-1'"
          />
        </Button>
        <Button @click="toggleDark()">
          <Icon
            class="
            dark:text-#FAFAFA/80 text-#18181B/80
            hover:text-#18181B dark:hover:text-#FAFAFA
            "
            :name="dark ? 'radix-icons:moon' : 'radix-icons:sun'"
          />
        </Button>
        <Link to="https://github.com/destyler/destyler" target="_blank">
          <Icon
            class="
            dark:text-#FAFAFA/80 text-#18181B/80
            hover:text-#18181B dark:hover:text-#FAFAFA
              "
            name="radix-icons:github-logo"
          />
        </Link>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;

  --at-apply: 'box-border flex justify-between px-4 z-40 relative text-dark dark:text-light';

  height: var(--nav-height);
  background-color: var(--bg);
  box-shadow: 0 0 6px #18181B;

  .el-select {
    width: 140px;
  }
}

.dark nav {
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;

  --at-apply: 'shadow-none';
  border-bottom: 1px solid var(--border);
  box-shadow: 0 0 6px #FAFAFA;
}
</style>
