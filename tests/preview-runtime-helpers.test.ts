import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import vm from 'node:vm'
import { generateRuntimeHelpers } from '../src/preview/runtime-helpers.ts'

interface RuntimeHarness {
  beginUpdate: () => number
  collectPreloadNames: (fileMap: Record<string, string>) => string[]
  isCurrentUpdate: (generation: number) => boolean
  resolveExternalUrl: (moduleName: string) => string | null
}

function createRuntime(
  builtinModules: readonly string[],
  externalModules: Record<string, string> = {},
): RuntimeHarness {
  const context = vm.createContext({ console, externalModules })
  vm.runInContext(generateRuntimeHelpers('0.2.0', builtinModules), context)

  const collectPreloadNames = vm.runInContext('collectPreloadNames', context) as RuntimeHarness['collectPreloadNames']

  return {
    beginUpdate: vm.runInContext('beginPreviewUpdate', context) as RuntimeHarness['beginUpdate'],
    collectPreloadNames: fileMap => [...collectPreloadNames(fileMap)],
    isCurrentUpdate: vm.runInContext('isCurrentPreviewUpdate', context) as RuntimeHarness['isCurrentUpdate'],
    resolveExternalUrl: vm.runInContext('resolveExternalUrl', context) as RuntimeHarness['resolveExternalUrl'],
  }
}

test('only modules built into the active runtime are skipped', () => {
  const runtime = createRuntime(
    ['react', 'react-dom', 'react-dom/client'],
    {
      '@vue/reactivity': 'https://esm.sh/@vue/reactivity',
      'react': 'https://esm.sh/react',
      'react-dom': 'https://esm.sh/react-dom',
      'react-dom/client': 'https://esm.sh/react-dom/client',
      'solid-js/store': 'https://esm.sh/solid-js/store',
    },
  )

  assert.deepEqual(runtime.collectPreloadNames({}), [
    '@vue/reactivity',
    'solid-js/store',
  ])
})

test('Vue core modules remain excluded from preload work', () => {
  const vueBuiltins = [
    'vue',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@vue/reactivity',
    '@vue/shared',
  ]
  const runtime = createRuntime(vueBuiltins, Object.fromEntries(
    vueBuiltins.map(name => [name, `https://esm.sh/${name}`]),
  ))

  assert.deepEqual(runtime.collectPreloadNames({}), [])
})

test('CommonJS require calls discover destyler packages missing from the import map', () => {
  const runtime = createRuntime(['react'])
  const fileMap = {
    'App.tsx': `
      const checkbox = require('@destyler/checkbox')
      const samePackage = require('@destyler/checkbox')
    `,
  }

  assert.deepEqual(runtime.collectPreloadNames(fileMap), ['@destyler/checkbox'])
  assert.equal(
    runtime.resolveExternalUrl('@destyler/checkbox'),
    'https://esm.sh/@destyler/checkbox@0.2.0',
  )
})

test('handles value and type-only TypeScript import-equals independently', () => {
  const runtime = createRuntime([])
  const fileMap = {
    'App.ts': `
      import Checkbox = require('@destyler/checkbox')
      import type Machine = require('@destyler/types-only')
    `,
  }

  assert.deepEqual(runtime.collectPreloadNames(fileMap), ['@destyler/checkbox'])
})

test('collects runtime imports while ignoring comments, strings, and type-only imports', () => {
  const runtime = createRuntime([])
  const source = `
    import checkbox from '@destyler/checkbox'
    import '@destyler/presence'
    export { connect } from '@destyler/dialog'
    const dynamicModule = import(/* load on demand */ '@destyler/menu')
    const requiredModule = require /* legacy source */ ('@destyler/slider')

    // import fake from '@destyler/comment'
    /* require('@destyler/block-comment') */
    const quoted = "import fake from '@destyler/double-quoted'"
    const otherQuote = 'require("@destyler/single-quoted")'
    import type { Machine } from '@destyler/types-only'
    import { type Context } from '@destyler/named-types-only'
    export type { Service } from '@destyler/export-types-only'
    export { type State } from '@destyler/export-named-types-only'
    import { type Api, connect as connectMixed } from '@destyler/mixed'
  `

  assert.deepEqual(runtime.collectPreloadNames({ 'App.tsx': source }), [
    '@destyler/checkbox',
    '@destyler/presence',
    '@destyler/dialog',
    '@destyler/menu',
    '@destyler/slider',
    '@destyler/mixed',
  ])
})

test('scans template expressions but ignores template text', () => {
  const runtime = createRuntime([])
  const source = [
    'const value = `require(\'@destyler/text-only\') $',
    '{import(\'@destyler/expression\')}`',
  ].join('')

  assert.deepEqual(runtime.collectPreloadNames({ 'App.ts': source }), [
    '@destyler/expression',
  ])
})

test('scans import-like adversarial input without backtracking across the file', {
  timeout: 750,
}, () => {
  const runtime = createRuntime([])
  const source = 'import value\n'.repeat(50_000)

  assert.deepEqual(runtime.collectPreloadNames({ 'App.ts': source }), [])
})

test('a newer preview update invalidates an older generation', () => {
  const runtime = createRuntime([])
  const firstUpdate = runtime.beginUpdate()
  const secondUpdate = runtime.beginUpdate()

  assert.equal(runtime.isCurrentUpdate(firstUpdate), false)
  assert.equal(runtime.isCurrentUpdate(secondUpdate), true)
})
