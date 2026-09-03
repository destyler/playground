import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import {
  collectImportSpecifiers,
  getUsedDestylerImports,
} from '../src/libs/destyler-deps.ts'
import { generateCSSFromFiles } from '../src/libs/unocss.ts'

test('collects runtime ESM and CommonJS dependencies', () => {
  const source = `
    import checkbox from '@destyler/checkbox'
    import '@destyler/presence'
    export { connect } from '@destyler/dialog'
    const dynamicModule = import(/* load on demand */ '@destyler/menu')
    const requiredModule = require /* legacy source */ ('@destyler/slider')
  `

  assert.deepEqual(collectImportSpecifiers([source]), [
    '@destyler/checkbox',
    '@destyler/presence',
    '@destyler/dialog',
    '@destyler/menu',
    '@destyler/slider',
  ])
})

test('ignores comments, string contents, and type-only dependencies', () => {
  const source = `
    // import fake from '@destyler/comment'
    /* require('@destyler/block-comment') */
    const quoted = "import fake from '@destyler/double-quoted'"
    const otherQuote = 'require("@destyler/single-quoted")'
    const template = \`export * from '@destyler/template-text'\`
    import type { Machine } from '@destyler/types-only'
    import { type Context } from '@destyler/named-types-only'
    export type { Service } from '@destyler/export-types-only'
    export { type State } from '@destyler/export-named-types-only'
    import { type Api, connect } from '@destyler/mixed'
  `

  assert.deepEqual(collectImportSpecifiers([source]), ['@destyler/mixed'])
})

test('distinguishes runtime and type-only TypeScript import-equals declarations', () => {
  const source = `
    import Checkbox = require('@destyler/checkbox')
    import type TypeOnlyCheckbox = require('@destyler/type-only-checkbox')
    import type {
      Machine,
      Service,
    } from '@destyler/multiline-types-only'
  `

  assert.deepEqual(collectImportSpecifiers([source]), ['@destyler/checkbox'])
})

test('scans runtime imports inside template expressions but not template text', () => {
  const source = [
    'const value = `require(\'@destyler/text-only\') $',
    '{import(\'@destyler/expression\')}`',
  ].join('')

  assert.deepEqual(collectImportSpecifiers([source]), ['@destyler/expression'])
})

test('builds the import map from runtime dependencies only', () => {
  const imports = getUsedDestylerImports([
    {
      content: `
        import type { Machine } from '@destyler/types-only'
        const checkbox = require('@destyler/checkbox')
      `,
    },
  ], '0.2.0', 'react')

  assert.deepEqual(imports, {
    '@destyler/react': 'https://esm.sh/@destyler/react@0.2.0',
    '@destyler/checkbox': 'https://esm.sh/@destyler/checkbox@0.2.0',
  })
})

test('runs file-aware extractors with each source filename', async () => {
  const result = await generateCSSFromFiles([
    {
      name: 'App.svelte',
      content: '<div class:bg-red-500={active}></div>',
    },
    {
      name: 'utilities.ts',
      content: 'export const classes = "text-blue-500"',
    },
  ], 'export default defineConfig({ presets: [presetWind3()] })', 'svelte')

  assert.equal(result.matched.includes('bg-red-500'), true)
  assert.equal(result.matched.includes('text-blue-500'), true)
  assert.match(result.css, /\.bg-red-500/)
})
