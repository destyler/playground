import type { Versions } from '@/composables/store'
import type { ImportMap } from '@vue/repl'
import type { MaybeRef } from '@vueuse/core'
import type { Ref } from 'vue'
import { gte } from 'semver'

export interface Dependency {
  pkg?: string
  version?: string
  path: string
}

export type Cdn = 'unpkg' | 'jsdelivr' | 'jsdelivr-fastly'
export const cdn = useLocalStorage<Cdn>('setting-cdn', 'jsdelivr')

export function genCdnLink(pkg: string, version: string | undefined, path: string) {
  version = version ? `@${version}` : ''
  switch (cdn.value) {
    case 'jsdelivr':
      return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`
    case 'jsdelivr-fastly':
      return `https://fastly.jsdelivr.net/npm/${pkg}${version}${path}`
    case 'unpkg':
      return `https://unpkg.com/${pkg}${version}${path}`
  }
}

export function genCompilerSfcLink(version: string) {
  return genCdnLink(
    '@vue/compiler-sfc',
    version,
    '/dist/compiler-sfc.esm-browser.js',
  )
}

export function genImportMap({ vue, destyler }: Partial<Versions> = {}): ImportMap {
  const deps: Record<string, Dependency> = {
    'vue': {
      pkg: '@vue/runtime-dom',
      version: vue,
      path: '/dist/runtime-dom.esm-browser.js',
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js',
    },
    '@destyler/aspect-radio': {
      pkg: '@destyler/aspect-radio',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/aspect-radio/component': {
      pkg: '@destyler/aspect-radio',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/back-top': {
      pkg: '@destyler/back-top',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/back-top/component': {
      pkg: '@destyler/back-top',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/breadcrumbs': {
      pkg: '@destyler/breadcrumbs',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/breadcrumbs/component': {
      pkg: '@destyler/breadcrumbs',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/button': {
      pkg: '@destyler/button',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/button/component': {
      pkg: '@destyler/button',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/checkbox': {
      pkg: '@destyler/checkbox',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/checkbox/component': {
      pkg: '@destyler/checkbox',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/collapse': {
      pkg: '@destyler/collapse',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/collapse/component': {
      pkg: '@destyler/collapse',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/collapsible': {
      pkg: '@destyler/collapsible',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/collapsible/component': {
      pkg: '@destyler/collapsible',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/combobox': {
      pkg: '@destyler/combobox',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/combobox/component': {
      pkg: '@destyler/combobox',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/context-menu': {
      pkg: '@destyler/context-menu',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/context-menu/component': {
      pkg: '@destyler/context-menu',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/countdown': {
      pkg: '@destyler/countdown',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/countdown/component': {
      pkg: '@destyler/countdown',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/dialog': {
      pkg: '@destyler/dialog',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/dialog/component': {
      pkg: '@destyler/dialog',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/divider': {
      pkg: '@destyler/divider',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/divider/component': {
      pkg: '@destyler/divider',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/dropdown': {
      pkg: '@destyler/dropdown',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/dropdown/component': {
      pkg: '@destyler/dropdown',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/hover-card': {
      pkg: '@destyler/hover-card',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/hover-card/component': {
      pkg: '@destyler/hover-card',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/icon': {
      pkg: '@destyler/icon',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/icon/component': {
      pkg: '@destyler/icon',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/image': {
      pkg: '@destyler/image',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/image/component': {
      pkg: '@destyler/image',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/info': {
      pkg: '@destyler/info',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/info/component': {
      pkg: '@destyler/info',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/label': {
      pkg: '@destyler/label',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/label/component': {
      pkg: '@destyler/label',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/link': {
      pkg: '@destyler/link',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/link/component': {
      pkg: '@destyler/link',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/menubar': {
      pkg: '@destyler/menubar',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/menubar/component': {
      pkg: '@destyler/menubar',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/modal': {
      pkg: '@destyler/modal',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/modal/component': {
      pkg: '@destyler/modal',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/navigation': {
      pkg: '@destyler/navigation',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/navigation/component': {
      pkg: '@destyler/navigation',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/online': {
      pkg: '@destyler/online',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/online/component': {
      pkg: '@destyler/online',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/pagination': {
      pkg: '@destyler/pagination',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/pagination/component': {
      pkg: '@destyler/pagination',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/popover': {
      pkg: '@destyler/popover',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/popover/component': {
      pkg: '@destyler/popover',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/preview': {
      pkg: '@destyler/preview',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/preview/component': {
      pkg: '@destyler/preview',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/progress': {
      pkg: '@destyler/progress',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/progress/component': {
      pkg: '@destyler/progress',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/radio': {
      pkg: '@destyler/radio',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/radio/component': {
      pkg: '@destyler/radio',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/scroll-area': {
      pkg: '@destyler/scroll-area',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/scroll-area/component': {
      pkg: '@destyler/scroll-area',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/select': {
      pkg: '@destyler/select',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/select/component': {
      pkg: '@destyler/select',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/slider': {
      pkg: '@destyler/slider',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/slider/component': {
      pkg: '@destyler/slider',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/switch': {
      pkg: '@destyler/switch',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/switch/component': {
      pkg: '@destyler/switch',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/tabs': {
      pkg: '@destyler/tabs',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/tabs/component': {
      pkg: '@destyler/tabs',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/toast': {
      pkg: '@destyler/toast',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/toast/component': {
      pkg: '@destyler/toast',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/toggle': {
      pkg: '@destyler/toggle',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/toggle/component': {
      pkg: '@destyler/toggle',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/toolbar': {
      pkg: '@destyler/toolbar',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/toolbar/component': {
      pkg: '@destyler/toolbar',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/tooltip': {
      pkg: '@destyler/tooltip',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/tooltip/component': {
      pkg: '@destyler/tooltip',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/dynamic': {
      pkg: '@destyler/dynamic',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/dynamic/component': {
      pkg: '@destyler/dynamic',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/otp-input': {
      pkg: '@destyler/otp-input',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/otp-input/component': {
      pkg: '@destyler/otp-input',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/draggable': {
      pkg: '@destyler/draggable',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/draggable/component': {
      pkg: '@destyler/draggable',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/qr-code': {
      pkg: '@destyler/qr-code',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/qr-code/component': {
      pkg: '@destyler/qr-code',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/splitter': {
      pkg: '@destyler/splitter',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/splitter/component': {
      pkg: '@destyler/splitter',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/ellipsis': {
      pkg: '@destyler/ellipsis',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/ellipsis/component': {
      pkg: '@destyler/ellipsis',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/calendar': {
      pkg: '@destyler/calendar',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/calendar/component': {
      pkg: '@destyler/calendar',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/range-calendar': {
      pkg: '@destyler/range-calendar',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/range-calendar/component': {
      pkg: '@destyler/range-calendar',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/primitive': {
      pkg: '@destyler/primitive',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/primitive/component': {
      pkg: '@destyler/primitive',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/shared': {
      pkg: '@destyler/shared',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/composition': {
      pkg: '@destyler/composition',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/directives': {
      pkg: '@destyler/directives',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/presence': {
      pkg: '@destyler/presence',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/presence/component': {
      pkg: '@destyler/presence',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/popper': {
      pkg: '@destyler/popper',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/popper/component': {
      pkg: '@destyler/popper',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/arrow': {
      pkg: '@destyler/arrow',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/arrow/component': {
      pkg: '@destyler/arrow',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/menu': {
      pkg: '@destyler/menu',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/menu/component': {
      pkg: '@destyler/menu',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/focus-scope': {
      pkg: '@destyler/focus-scope',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/focus-scope/component': {
      pkg: '@destyler/focus-scope',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/roving-focus': {
      pkg: '@destyler/roving-focus',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/roving-focus/component': {
      pkg: '@destyler/roving-focus',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/collection': {
      pkg: '@destyler/collection',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/dismissable-layer': {
      pkg: '@destyler/dismissable-layer',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/dismissable-layer/component': {
      pkg: '@destyler/dismissable-layer',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/teleport': {
      pkg: '@destyler/teleport',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/teleport/component': {
      pkg: '@destyler/teleport',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/visually-hidden': {
      pkg: '@destyler/visually-hidden',
      version: destyler,
      path: '/dist/index.mjs',
    },
    '@destyler/visually-hidden/component': {
      pkg: '@destyler/visually-hidden',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/collection/composition': {
      pkg: '@destyler/collection',
      version: destyler,
      path: '/dist/component.mjs',
    },
    '@destyler/calendar/composition': {
      pkg: '@destyler/calendar',
      version: destyler,
      path: '/dist/composition.mjs',
    },
    '@destyler/focus-scope/utils': {
      pkg: '@destyler/focus-scope',
      version: destyler,
      path: '/dist/utils.mjs',
    },
    '@internationalized/date': {
      pkg: '@internationalized/date',
      version: '3.5.2',
      path: '/+esm',
    },
    'aria-hidden': {
      pkg: 'aria-hidden',
      version: '1.2.3',
      path: '/dist/es2015/index.min.js',
    },
    '@vueuse/core': {
      pkg: '@vueuse/core',
      version: '10.9.0',
      path: '/+esm',
    },
    '@vueuse/shared': {
      pkg: '@vueuse/shared',
      version: '10.9.0',
      path: '/+esm',
    },
    'defu': {
      pkg: 'defu',
      version: '6.1.4',
      path: '/dist/defu.mjs',
    },
    'scule': {
      pkg: 'scule',
      version: '1.3.0',
      path: '/dist/index.mjs',
    },
    'fast-deep-equal': {
      pkg: 'fast-deep-equal',
      version: '3.1.3',
      path: '/index.min.js',
    },
    '@floating-ui/vue': {
      pkg: '@floating-ui/vue',
      version: '1.0.6',
      path: '/dist/floating-ui.vue.mjs',
    },
    '@floating-ui/dom': {
      pkg: '@floating-ui/vue',
      version: '1.0.6',
      path: '/dist/floating-ui.dom.mjs',
    },
    '@floating-ui/core': {
      pkg: '@floating-ui/vue',
      version: '1.0.6',
      path: '/dist/floating-ui.core.mjs',
    },
    '@floating-ui/utils/dom': {
      pkg: '@floating-ui/vue',
      version: '1.0.6',
      path: '/dist/floating-ui.utils.dom.esm.js',
    },
    'vue-demi': {
      pkg: 'vue-demi',
      version: '1.0.6',
      path: '/lib/index.mjs',
    },
    '@iconify/vue': {
      pkg: '@iconify/vue',
      version: '4.1.1',
      path: '/dist/iconify.mjs',
    },
    'nanoid/non-secure': {
      pkg: 'nanoid',
      version: '5.0.6',
      path: '/non-secure/index.js',
    },
  }

  return {
    imports: Object.fromEntries(
      Object.entries(deps).map(([key, dep]) => [
        key,
        genCdnLink(dep.pkg ?? key, dep.version, dep.path),
      ]),
    ),
  }
}

export function getVersions(pkg: MaybeRef<string>) {
  const url = computed(
    () => `https://data.jsdelivr.com/v1/package/npm/${unref(pkg)}`,
  )
  return useFetch(url, {
    initialData: [],
    // eslint-disable-next-line no-sequences
    afterFetch: ctx => ((ctx.data = ctx.data.versions), ctx),
    refetch: true,
  }).json<string[]>().data as Ref<string[]>
}

export function getSupportedVueVersions() {
  const versions = getVersions('vue')
  return computed(() =>
    versions.value.filter(version => gte(version, '3.2.0')),
  )
}

export function getSupportedTSVersions() {
  const versions = getVersions('typescript')
  return computed(() =>
    versions.value.filter(
      version => !version.includes('dev') && !version.includes('insiders'),
    ),
  )
}

export function getSupportedUIVersions() {
  const pkg = computed(() => 'destyler')
  const versions = getVersions(pkg)
  return computed(() => versions.value)
}
