/**
 * Destyler Dependencies Configuration
 *
 * This file contains all the destyler component and adapter packages
 * that are automatically included in the playground's import map.
 * These dependencies are resolved from esm.sh CDN based on the selected
 * framework and version.
 */

import type { Framework } from '../templates/types'

// ============================================================================
// Constants
// ============================================================================

/**
 * CDN base URL for resolving package dependencies
 */
const CDN_BASE_URL = 'https://esm.sh'

/**
 * All destyler component packages available in the playground
 * These are the packages from packages/components in the destyler monorepo
 */
export const DESTYLER_COMPONENTS = [
  'aspect-ratio',
  'breadcrumbs',
  'calendar',
  'carousel',
  'checkbox',
  'clipboard',
  'collapse',
  'collapsible',
  'color-picker',
  'combobox',
  'dialog',
  'dynamic',
  'edit',
  'file-upload',
  'floating-panel',
  'hover-card',
  'image',
  'label',
  'menu',
  'number-input',
  'otp-input',
  'pagination',
  'popover',
  'presence',
  'progress',
  'qr-code',
  'radio',
  'select',
  'separator',
  'signature',
  'slider',
  'splitter',
  'steps',
  'switch',
  'tabs',
  'timer',
  'toast',
  'toggle',
  'tooltip',
  'tour',
  'tree',
] as const

/**
 * Framework adapter packages
 * These are loaded based on the selected framework
 */
export const DESTYLER_ADAPTERS: Record<Framework, string> = {
  vue: '@destyler/vue',
  react: '@destyler/react',
  solid: '@destyler/solid',
  svelte: '@destyler/svelte',
}

/**
 * Shared/utility packages that are always included
 * These are from packages/shareds and packages/utils in the destyler monorepo
 */
export const DESTYLER_SHARED_PACKAGES = [
  '@destyler/anatomy',
  '@destyler/dismissable',
  '@destyler/aria-hidden',
  '@destyler/auto-resize',
  '@destyler/collection',
  '@destyler/color',
  '@destyler/date',
  '@destyler/element-rect',
  '@destyler/file',
  '@destyler/focus-trap',
  '@destyler/focus-visible',
  '@destyler/highlight-text',
  '@destyler/i18n',
  '@destyler/interact-outside',
  '@destyler/live-region',
  '@destyler/popper',
  '@destyler/rect',
  '@destyler/remove-scroll',
  '@destyler/scroll-snap',
  '@destyler/size',
  '@destyler/stringify',
  '@destyler/dom',
  '@destyler/types',
  '@destyler/utils',
  '@destyler/xstate',
] as const

// ============================================================================
// Types
// ============================================================================

export type DestylerComponent = typeof DESTYLER_COMPONENTS[number]
export type DestylerSharedPackage = typeof DESTYLER_SHARED_PACKAGES[number]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a CDN URL for a destyler package.
 * Pins a concrete version (`@x.y.z`) when selected; leaves `latest` unpinned.
 */
export function getPackageCdnUrl(packageName: string, version: string): string {
  const versionTag = !version || version === 'latest' ? '' : `@${version}`
  return `${CDN_BASE_URL}/${packageName}${versionTag}`
}

interface SourceToken {
  kind: 'punctuation' | 'string' | 'word'
  value: string
}

function isIdentifierStart(char: string | undefined): boolean {
  return char !== undefined && /[a-z_$]/i.test(char)
}

function isIdentifierPart(char: string | undefined): boolean {
  return char !== undefined && /[\w$]/.test(char)
}

function readIdentifier(source: string, start: number): { end: number, value: string } | null {
  if (!isIdentifierStart(source[start]))
    return null

  let end = start + 1
  while (isIdentifierPart(source[end]))
    end++

  return { value: source.slice(start, end), end }
}

function readString(source: string, start: number): { end: number, value: string } | null {
  const quote = source[start]
  if (quote !== '\'' && quote !== '"')
    return null

  let value = ''
  let index = start + 1
  while (index < source.length) {
    const char = source[index]
    if (char === quote)
      return { value, end: index + 1 }
    if (char === '\\' && index + 1 < source.length) {
      value += source[index + 1]
      index += 2
      continue
    }
    if (char === '\n' || char === '\r')
      return null
    value += char
    index++
  }

  return null
}

function tokenizeTemplateLiteral(source: string, start: number, tokens: SourceToken[]): number {
  let index = start + 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === '`')
      return index + 1
    if (source[index] === '$' && source[index + 1] === '{') {
      index = tokenizeSource(source, index + 2, tokens, true)
      continue
    }
    index++
  }
  return source.length
}

function tokenizeSource(
  source: string,
  start: number,
  tokens: SourceToken[],
  stopAtClosingBrace = false,
): number {
  let index = start
  let braceDepth = 0

  while (index < source.length) {
    const char = source[index]
    if (char === '\'' || char === '"') {
      const string = readString(source, index)
      if (string) {
        tokens.push({ kind: 'string', value: string.value })
        index = string.end
      }
      else {
        index = source.length
      }
      continue
    }
    if (char === '`') {
      index = tokenizeTemplateLiteral(source, index, tokens)
      continue
    }
    if (char === '/' && source[index + 1] === '/') {
      const newline = source.indexOf('\n', index + 2)
      index = newline === -1 ? source.length : newline + 1
      continue
    }
    if (char === '/' && source[index + 1] === '*') {
      const close = source.indexOf('*/', index + 2)
      index = close === -1 ? source.length : close + 2
      continue
    }
    if (char === '{') {
      braceDepth++
      tokens.push({ kind: 'punctuation', value: char })
      index++
      continue
    }
    if (char === '}') {
      if (stopAtClosingBrace && braceDepth === 0)
        return index + 1
      braceDepth = Math.max(0, braceDepth - 1)
      tokens.push({ kind: 'punctuation', value: char })
      index++
      continue
    }

    if (/\s/.test(char)) {
      index++
      continue
    }

    const token = readIdentifier(source, index)
    if (token) {
      tokens.push({ kind: 'word', value: token.value })
      index = token.end
    }
    else {
      tokens.push({ kind: 'punctuation', value: char })
      index++
    }
  }

  return source.length
}

function findFrom(tokens: SourceToken[], start: number): number | undefined {
  let braceDepth = 0

  for (let index = start; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.value === '{')
      braceDepth++
    else if (token.value === '}')
      braceDepth = Math.max(0, braceDepth - 1)
    else if (braceDepth === 0 && token.value === ';')
      return undefined
    else if (braceDepth === 0 && token.value === 'from' && tokens[index + 1]?.kind === 'string')
      return index
    else if (braceDepth === 0 && index > start && (token.value === 'import' || token.value === 'export'))
      return undefined
  }

  return undefined
}

function isTypeOnlyNamedClause(tokens: SourceToken[], start: number, end: number): boolean {
  if (tokens[start]?.value !== '{')
    return false

  let entryStart = start + 1
  let hasEntries = false
  for (let index = entryStart; index <= end; index++) {
    if (tokens[index]?.value !== ',' && tokens[index]?.value !== '}')
      continue

    const entry = tokens.slice(entryStart, index)
    if (entry.length > 0) {
      hasEntries = true
      // `{ type }` and `{ type as value }` import a value named "type".
      if (entry[0].value !== 'type' || !entry[1] || entry[1].value === 'as')
        return false
    }
    entryStart = index + 1
    if (tokens[index]?.value === '}')
      break
  }

  return hasEntries
}

function collectSpecifiers(tokens: SourceToken[]): string[] {
  const specifiers = new Set<string>()

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    const next = tokens[index + 1]

    if (token.value === 'require' && next?.value === '(' && tokens[index + 2]?.kind === 'string') {
      specifiers.add(tokens[index + 2].value)
      index += 2
      continue
    }

    if (token.value === 'import') {
      if (next?.value === '.')
        continue
      if (next?.value === 'type' || next?.value === 'typeof') {
        const from = findFrom(tokens, index + 2)
        if (from !== undefined) {
          index = from + 1
        }
        else if (tokens[index + 3]?.value === '='
          && tokens[index + 4]?.value === 'require'
          && tokens[index + 5]?.value === '('
          && tokens[index + 6]?.kind === 'string') {
          index += 6
        }
        continue
      }
      if (next?.kind === 'string') {
        specifiers.add(next.value)
        index++
        continue
      }
      if (next?.value === '(' && tokens[index + 2]?.kind === 'string') {
        specifiers.add(tokens[index + 2].value)
        index += 2
        continue
      }

      const from = findFrom(tokens, index + 1)
      if (from !== undefined) {
        if (!isTypeOnlyNamedClause(tokens, index + 1, from))
          specifiers.add(tokens[from + 1].value)
        index = from + 1
      }
      continue
    }

    if (token.value === 'export' && (next?.value === '*' || next?.value === '{')) {
      const from = findFrom(tokens, index + 1)
      if (from !== undefined) {
        if (next.value === '*' || !isTypeOnlyNamedClause(tokens, index + 1, from))
          specifiers.add(tokens[from + 1].value)
        index = from + 1
      }
    }
  }

  return [...specifiers]
}

/**
 * Collects runtime module specifiers without treating comments, strings, or
 * type-only imports as dependencies.
 */
export function collectImportSpecifiers(sources: Iterable<string>): string[] {
  const specifiers = new Set<string>()

  for (const source of sources) {
    const tokens: SourceToken[] = []
    tokenizeSource(source, 0, tokens)
    for (const specifier of collectSpecifiers(tokens))
      specifiers.add(specifier)
  }

  return [...specifiers]
}

export function isDestylerSpecifier(specifier: string): boolean {
  return specifier === '@destyler' || specifier.startsWith('@destyler/')
}

/**
 * Import map entries for destyler packages actually referenced by playground files.
 * Unused components/shared packages are omitted and lazy-loaded on demand.
 */
export function getUsedDestylerImports(
  files: { content: string }[],
  version: string,
  framework: Framework,
): Record<string, string> {
  const imports: Record<string, string> = {
    ...getDestylerAdapterImport(version, framework),
  }

  for (const specifier of collectImportSpecifiers(files.map(file => file.content))) {
    if (!isDestylerSpecifier(specifier))
      continue
    imports[specifier] = getPackageCdnUrl(specifier, version)
  }

  return imports
}

/**
 * Generates import map entries for all destyler components
 */
export function getDestylerComponentImports(
  version: string,
): Record<string, string> {
  const imports: Record<string, string> = {}

  for (const component of DESTYLER_COMPONENTS) {
    const packageName = `@destyler/${component}`
    imports[packageName] = getPackageCdnUrl(packageName, version)
  }

  return imports
}

/**
 * Generates import map entry for the framework adapter
 */
export function getDestylerAdapterImport(
  version: string,
  framework: Framework,
): Record<string, string> {
  const packageName = DESTYLER_ADAPTERS[framework]
  return {
    [packageName]: getPackageCdnUrl(packageName, version),
  }
}

/**
 * Generates import map entries for shared/utility packages
 */
export function getDestylerSharedImports(
  version: string,
): Record<string, string> {
  const imports: Record<string, string> = {}

  for (const packageName of DESTYLER_SHARED_PACKAGES) {
    imports[packageName] = getPackageCdnUrl(packageName, version)
  }

  return imports
}

/**
 * Generates all destyler-related import map entries
 * Includes components, adapter, and shared packages
 */
export function getAllDestylerImports(
  version: string,
  framework: Framework,
): Record<string, string> {
  return {
    ...getDestylerComponentImports(version),
    ...getDestylerAdapterImport(version, framework),
    ...getDestylerSharedImports(version),
  }
}

/**
 * Gets the list of component names for documentation/UI purposes
 */
export function getComponentDisplayNames(): { name: string, package: string }[] {
  return DESTYLER_COMPONENTS.map(component => ({
    name: getComponentLabel(component),
    package: `@destyler/${component}`,
  }))
}

/**
 * Default playground component (matches existing checkbox demos).
 */
export const DEFAULT_COMPONENT: DestylerComponent = 'checkbox'

const COMPONENT_SET = new Set<string>(DESTYLER_COMPONENTS)

export function isDestylerComponent(name: string): name is DestylerComponent {
  return COMPONENT_SET.has(name)
}

/**
 * Title-case a kebab component id (`color-picker` → `Color Picker`).
 */
export function getComponentLabel(component: string): string {
  return component.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1),
  ).join(' ')
}

/**
 * Volar/CDN type-resolution map for every destyler component package.
 */
export function getDestylerComponentTypeDeps(): Record<string, string> {
  const deps: Record<string, string> = {}
  for (const component of DESTYLER_COMPONENTS)
    deps[`@destyler/${component}`] = 'latest'
  return deps
}
