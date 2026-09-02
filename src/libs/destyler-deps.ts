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

const STATIC_IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g

/**
 * Collects bare module specifiers from `from '...'` / `import('...')` / side-effect imports.
 */
export function collectImportSpecifiers(sources: Iterable<string>): string[] {
  const specifiers = new Set<string>()

  for (const source of sources) {
    STATIC_IMPORT_RE.lastIndex = 0
    DYNAMIC_IMPORT_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = STATIC_IMPORT_RE.exec(source)))
      specifiers.add(match[1])
    while ((match = DYNAMIC_IMPORT_RE.exec(source)))
      specifiers.add(match[1])
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
    name: component.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1),
    ).join(' '),
    package: `@destyler/${component}`,
  }))
}
