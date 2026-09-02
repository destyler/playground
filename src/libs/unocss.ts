/**
 * UnoCSS Browser Runtime Service
 *
 * Provides UnoCSS generation capabilities in the browser for the playground.
 * Uses @unocss/core and presets for runtime CSS generation.
 *
 * @module libs/unocss
 */

import type { GenerateResult, UnoGenerator, UserConfig } from '@unocss/core'
import type { Framework } from '../templates'
import { createGenerator } from '@unocss/core'
// Eager: used by the default Vue template
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import presetIcons from '@unocss/preset-icons/browser'
import presetWind3 from '@unocss/preset-wind3'

/**
 * Helper function that just returns the config (same as unocss's defineConfig)
 * We define it here to avoid importing from the main unocss package
 */
function defineConfig<T extends UserConfig>(config: T): T {
  return config
}

/**
 * List of available presets for user reference
 */
export const AVAILABLE_PRESETS = [
  'presetMini',
  'presetWind3',
  'presetWind4',
  'presetUno',
  'presetWind',
  'presetAttributify',
  'presetTagify',
  'presetIcons',
  'presetWebFonts',
  'presetTypography',
  'presetRemToPx',
] as const

/**
 * List of available transformers for user reference
 * Note: transformerAttributifyJsx is not available (requires Babel/Node.js)
 */
export const AVAILABLE_TRANSFORMERS = [
  'transformerVariantGroup',
  'transformerDirectives',
  'transformerCompileClass',
] as const

/**
 * List of available extractors for user reference
 */
export const AVAILABLE_EXTRACTORS = [
  'extractorPug',
  'extractorSvelte',
  'extractorArbitraryVariants',
] as const

/**
 * Presets / transformers / extractors not needed for the default Vue config.
 * Loaded only when the user's uno.config (or Svelte mode) names them.
 */
const LAZY_UNOCSS: Record<string, () => Promise<unknown>> = {
  presetMini: () => import('@unocss/preset-mini').then(m => m.default),
  presetWind4: () => import('@unocss/preset-wind4').then(m => m.default),
  presetUno: () => import('@unocss/preset-uno').then(m => m.default),
  presetWind: () => import('@unocss/preset-wind').then(m => m.default),
  presetAttributify: () => import('@unocss/preset-attributify').then(m => m.default),
  presetTagify: () => import('@unocss/preset-tagify').then(m => m.default),
  presetWebFonts: () => import('@unocss/preset-web-fonts').then(m => m.default),
  presetTypography: () => import('@unocss/preset-typography').then(m => m.default),
  presetRemToPx: () => import('@unocss/preset-rem-to-px').then(m => m.default),
  transformerVariantGroup: () => import('@unocss/transformer-variant-group').then(m => m.default),
  transformerDirectives: () => import('@unocss/transformer-directives').then(m => m.default),
  transformerCompileClass: () => import('@unocss/transformer-compile-class').then(m => m.default),
  extractorPug: () => import('@unocss/extractor-pug').then(m => m.default),
  extractorSvelte: () => import('@unocss/extractor-svelte').then(m => m.default),
}

const lazyUnoCache = new Map<string, unknown>()

async function loadLazyUnoModule(name: string): Promise<unknown | undefined> {
  const loader = LAZY_UNOCSS[name]
  if (!loader)
    return undefined
  if (!lazyUnoCache.has(name))
    lazyUnoCache.set(name, await loader())
  return lazyUnoCache.get(name)
}

function referencedLazyUnoNames(configRaw: string): string[] {
  return Object.keys(LAZY_UNOCSS).filter(name => new RegExp(`\\b${name}\\b`).test(configRaw))
}

function needsSvelteExtractor(framework?: Framework, files?: Array<{ name: string }>, configRaw?: string): boolean {
  if (framework === 'svelte')
    return true
  if (files?.some(f => f.name.endsWith('.svelte')))
    return true
  if (configRaw && /\bextractorSvelte\b/.test(configRaw))
    return true
  return false
}

function needsPugExtractor(configRaw?: string): boolean {
  return Boolean(configRaw && /\bextractorPug\b/.test(configRaw))
}

// ============================================================================
// Types
// ============================================================================

export interface UnoGenerateResult {
  css: string
  matched: string[]
  layers: string[]
}

export interface UnoConfigResult {
  config: UserConfig | null
  error: Error | null
}

// ============================================================================
// Module State
// ============================================================================

let unoGenerator: UnoGenerator | null = null
let currentConfigRaw: string = ''

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default UnoCSS configuration
 */
export const DEFAULT_UNO_CONFIG = `import { defineConfig, presetWind3, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600',
    'card': 'p-4 rounded-lg shadow-md bg-white',
  },
})
`

/**
 * Default preset configuration when no config is provided
 */
function getDefaultConfig(): UserConfig {
  return {
    presets: [
      presetWind3(),
      presetIcons({
        scale: 1.2,
        cdn: 'https://esm.sh/',
      }),
    ],
  }
}

// ============================================================================
// Configuration Parsing
// ============================================================================

/**
 * Evaluates user's UnoCSS configuration string
 * Uses Function constructor to dynamically execute the config code
 *
 * @param configRaw - Raw configuration string
 * @returns Parsed configuration or error
 */
export async function evaluateUnoConfig(configRaw: string, extraLazyNames: string[] = []): Promise<UnoConfigResult> {
  if (!configRaw.trim()) {
    return { config: getDefaultConfig(), error: null }
  }

  try {
    const config = await executeConfigCode(configRaw, extraLazyNames)
    return { config, error: null }
  }
  catch (e) {
    const error = e as Error

    // Provide helpful error message for undefined presets
    if (error.message?.includes('is not defined')) {
      const match = error.message.match(/(\w+) is not defined/)
      const undefinedName = match?.[1]
      console.error(`[UnoCSS] "${undefinedName}" is not available.\n  Presets: ${AVAILABLE_PRESETS.join(', ')}\n  Transformers: ${AVAILABLE_TRANSFORMERS.join(', ')}\n  Extractors: ${AVAILABLE_EXTRACTORS.join(', ')}`)
    }
    else {
      console.error('[UnoCSS] Config evaluation error:', e)
    }

    // Return default config on error so the playground still works
    return { config: getDefaultConfig(), error }
  }
}

/**
 * Executes UnoCSS configuration code and returns the config object
 * Uses Function constructor to safely execute user code in a sandboxed environment
 *
 * @param configRaw - Raw configuration string
 * @returns Parsed UserConfig
 */
async function executeConfigCode(configRaw: string, extraLazyNames: string[] = []): Promise<UserConfig> {
  // Transform the config code to be executable
  let code = configRaw

  // Remove import statements (we'll provide the imports via sandbox)
  // Match: import xxx from 'yyy' or import { xxx } from 'yyy'
  code = code.replace(/import\s[^;]+from\s*['"][^'"]+['"]\s*;?/g, '')

  // Handle export default
  // Convert "export default defineConfig({...})" to "return defineConfig({...})"
  // or "export default {...}" to "return {...}"
  code = code.replace(/export\s+default\s+/, 'return ')

  const lazyNames = new Set([...referencedLazyUnoNames(configRaw), ...extraLazyNames])
  const lazyModules: Record<string, unknown> = {}
  await Promise.all([...lazyNames].map(async (name) => {
    const mod = await loadLazyUnoModule(name)
    if (mod !== undefined)
      lazyModules[name] = mod
  }))

  // Create a sandbox with available presets and utilities
  const sandbox: Record<string, unknown> = {
    // Core
    defineConfig,

    // Eager default-Vue presets / extractors
    presetWind3,
    presetIcons,
    extractorArbitraryVariants,

    // Lazy modules referenced by this config or the active framework
    ...lazyModules,

    // Utilities
    console,
  }

  // Create parameter names and values for the Function constructor
  const paramNames = Object.keys(sandbox)
  const paramValues = Object.values(sandbox)

  try {
    // Create and execute the function
    // eslint-disable-next-line no-new-func
    const configFn = new Function(...paramNames, code)
    const result = configFn(...paramValues)

    // Handle async config (if user returns a promise)
    const config = result instanceof Promise ? await result : result

    // Validate the config
    if (!config || typeof config !== 'object') {
      console.warn('[UnoCSS] Invalid config returned, using default')
      return getDefaultConfig()
    }

    // Ensure presets array exists and has at least a default preset
    if (!config.presets || !Array.isArray(config.presets) || config.presets.length === 0) {
      const presetUno = await loadLazyUnoModule('presetUno') as (() => unknown) | undefined
      config.presets = [presetUno ? presetUno() : presetWind3()]
    }

    return config
  }
  catch (e) {
    console.error('[UnoCSS] Failed to execute config:', e)
    throw e
  }
}

// ============================================================================
// Generator Management
// ============================================================================

/**
 * Creates or updates the UnoCSS generator with new configuration
 *
 * @param configRaw - Raw configuration string
 * @returns The UnoCSS generator instance
 */
export async function createUnoGenerator(configRaw: string, extraLazyNames: string[] = []): Promise<{
  generator: UnoGenerator
  error: Error | null
}> {
  const { config, error } = await evaluateUnoConfig(configRaw, extraLazyNames)

  if (error || !config) {
    // Use default config on error
    unoGenerator = await createGenerator(getDefaultConfig())
    currentConfigRaw = ''
    return { generator: unoGenerator, error }
  }

  unoGenerator = await createGenerator(config)
  currentConfigRaw = configRaw

  return { generator: unoGenerator, error: null }
}

/**
 * Gets the current UnoCSS generator, creating one if needed
 */
export async function getUnoGenerator(): Promise<UnoGenerator> {
  if (!unoGenerator) {
    const { generator } = await createUnoGenerator('')
    return generator
  }
  return unoGenerator
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generates CSS from HTML content using UnoCSS
 *
 * @param html - HTML content to scan for utility classes
 * @param configRaw - Optional configuration string to update generator
 * @returns Generated CSS result
 */
export async function generateCSS(
  html: string,
  configRaw?: string,
  options?: { framework?: Framework, files?: Array<{ name: string }> },
): Promise<UnoGenerateResult> {
  try {
    const extraLazyNames: string[] = []
    const injectSvelte = needsSvelteExtractor(options?.framework, options?.files, configRaw)
    const injectPug = needsPugExtractor(configRaw)
    if (injectSvelte)
      extraLazyNames.push('extractorSvelte')
    if (injectPug)
      extraLazyNames.push('extractorPug')

    // Update generator if config changed (include extra extractors in the cache key)
    const configKey = `${configRaw ?? ''}\0${extraLazyNames.join(',')}`
    if (configRaw !== undefined && configKey !== currentConfigRaw) {
      const { config, error } = await evaluateUnoConfig(configRaw, extraLazyNames)
      const resolved = config ?? getDefaultConfig()
      if (!error && config && injectSvelte) {
        const extractorSvelte = await loadLazyUnoModule('extractorSvelte')
        if (extractorSvelte) {
          const extractors = [...(resolved.extractors ?? [])]
          const already = Boolean(configRaw && /\bextractorSvelte\b/.test(configRaw))
          if (!already) {
            const extractor = typeof extractorSvelte === 'function' ? extractorSvelte() : extractorSvelte
            extractors.push(extractor as any)
          }
          resolved.extractors = extractors
        }
      }
      unoGenerator = await createGenerator(error || !config ? getDefaultConfig() : resolved)
      currentConfigRaw = configKey
    }

    const generator = await getUnoGenerator()
    const result: GenerateResult = await generator.generate(html, {
      preflights: true,
      minify: false,
    })

    return {
      css: result.css,
      matched: Array.from(result.matched),
      layers: result.layers,
    }
  }
  catch (e) {
    console.error('[UnoCSS] Generation error:', e)
    return {
      css: '',
      matched: [],
      layers: [],
    }
  }
}

/**
 * Generates CSS from multiple file contents
 *
 * @param files - Array of file contents to scan
 * @param configRaw - Optional configuration string
 * @returns Generated CSS result
 */
export async function generateCSSFromFiles(
  files: Array<{ name: string, content: string }>,
  configRaw?: string,
  framework?: Framework,
): Promise<UnoGenerateResult> {
  // Combine all file contents for scanning
  const combinedContent = files.map(f => f.content).join('\n')
  return generateCSS(combinedContent, configRaw, { framework, files })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if a class name is a valid UnoCSS utility
 *
 * @param className - Class name to check
 * @returns Whether the class is a valid UnoCSS utility
 */
export async function isValidUtility(className: string): Promise<boolean> {
  const generator = await getUnoGenerator()
  const result = await generator.generate(className, {
    preflights: false,
    minify: false,
  })
  return result.matched.size > 0
}

/**
 * Gets all matched utilities from HTML content
 *
 * @param html - HTML content to scan
 * @returns Array of matched utility class names
 */
export async function getMatchedUtilities(html: string): Promise<string[]> {
  const generator = await getUnoGenerator()
  const result = await generator.generate(html, {
    preflights: false,
    minify: false,
  })
  return Array.from(result.matched)
}

// ============================================================================
// Reset CSS
// ============================================================================

/**
 * Get the reset CSS (Tailwind reset/preflight)
 */
export function getResetCSS(): string {
  return `/*! modern-normalize v2.0.0 | MIT License | https://github.com/sindresorhus/modern-normalize */
*,::before,::after{box-sizing:border-box}html{font-family:system-ui,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji';line-height:1.15;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4}body{margin:0}hr{height:0;color:inherit}abbr[title]{text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}button,[type='button'],[type='reset'],[type='submit']{-webkit-appearance:button}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}legend{padding:0}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type='search']{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}`
}
