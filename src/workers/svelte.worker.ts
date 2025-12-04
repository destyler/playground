/**
 * Svelte Language Service Worker
 *
 * This worker provides TypeScript language service for Svelte files
 * with full type support from CDN.
 *
 * Note: We use a simplified Svelte-to-TypeScript conversion since svelte2tsx
 * depends on Node.js 'path' module which is not available in browser workers.
 */
import type { CodeInformation, CodeMapping, IScriptSnapshot, LanguagePlugin, VirtualCode } from '@volar/language-core'
import type { FileStat, FileSystem, LanguageServiceEnvironment } from '@volar/monaco/worker'
import type * as monaco from 'monaco-editor-core'
import { createNpmFileSystem } from '@volar/jsdelivr'
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker'
// @ts-expect-error - worker export
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { create as createTypeScriptDirectiveCommentPlugin } from 'volar-service-typescript/lib/plugins/directiveComment'
import { create as createTypeScriptSemanticPlugin } from 'volar-service-typescript/lib/plugins/semantic'
import { create as createTypeScriptSyntacticPlugin } from 'volar-service-typescript/lib/plugins/syntactic'
import { URI } from 'vscode-uri'

export interface CreateData {
  tsconfig: {
    compilerOptions?: Record<string, any>
  }
  dependencies: Record<string, string>
}

export interface WorkerHost {
  onFetchCdnFile: (uri: string, text: string) => void
}

export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  tsLocale?: string
}

const asFileName = (uri: URI) => uri.path
const asUri = (fileName: string): URI => URI.file(fileName)

let ts: typeof import('typescript')
let locale: string | undefined

/**
 * Generate Svelte global types for better type inference
 */
function generateSvelteGlobalTypes(): string {
  return `
/// <reference types="svelte" />

declare module '*.svelte' {
  import type { ComponentType, SvelteComponent } from 'svelte';
  const component: ComponentType<SvelteComponent>;
  export default component;
}

// Svelte 5 runes ambient declarations
declare function $state<T>(initial: T): T;
declare function $state<T>(): T | undefined;
declare namespace $state {
  export function raw<T>(initial: T): T;
  export function snapshot<T>(state: T): T;
}
declare function $derived<T>(expression: T): T;
declare namespace $derived {
  export function by<T>(fn: () => T): T;
}
declare function $effect(fn: () => void | (() => void)): void;
declare namespace $effect {
  export function pre(fn: () => void | (() => void)): void;
  export function tracking(): boolean;
  export function root(fn: () => void | (() => void)): () => void;
}
declare function $props<T>(): T;
declare function $bindable<T>(fallback?: T): T;
declare function $inspect<T>(...values: T[]): { with: (fn: (type: 'init' | 'update', ...values: T[]) => void) => void };
declare function $host<T extends HTMLElement>(): T;

export {};
`
}

/**
 * Generate Svelte shims for type definitions
 * This provides core Svelte types that svelte2tsx needs
 */
function generateSvelteShims(): string {
  return `
// Svelte 2 TSX helper types
declare class __sveltets_1_createSvelte2TsxComponent<Props extends Record<string, any>, Events extends Record<string, any>, Slots extends Record<string, any>> {
  $$prop_def: Props;
  $$events_def: Events;
  $$slot_def: Slots;
  $on<K extends keyof Events & string>(type: K, callback: (e: Events[K]) => void): () => void;
  $set(props: Partial<Props>): void;
}

declare function __sveltets_2_createSvelte2TsxComponent<Props extends Record<string, any>, Events extends Record<string, any> = {}, Slots extends Record<string, any> = {}>(
  render: () => { props?: Props; events?: Events; slots?: Slots }
): new (options: { target: Element; props?: Props }) => { $$prop_def: Props; $$events_def: Events; $$slot_def: Slots; $set(props: Partial<Props>): void };

declare function __sveltets_2_partial<T>(obj: T): Partial<T>;
declare function __sveltets_2_partial_with_any<T>(obj: T): Partial<T> & Record<string, any>;
declare function __sveltets_2_with_any<T>(obj: T): T & Record<string, any>;
declare function __sveltets_2_with_any_event<T>(obj: T): T;
declare function __sveltets_2_store_get<T>(store: { subscribe: (cb: (value: T) => void) => any }): T;
declare function __sveltets_2_any(...args: any[]): any;
declare function __sveltets_2_empty(...args: any[]): {};
declare function __sveltets_2_union<T>(...args: T[]): T;
declare function __sveltets_2_invalidate<T>(getValue: () => T): T;

// Svelte 5 specific helpers
declare function __sveltets_2_snippet<T extends any[]>(fn: (...args: T) => any): { (this: void, ...args: T): any };
declare function __sveltets_2_ensureSnippet(s: any): any;
declare function __sveltets_2_isSnippet(s: any): boolean;

// For component props
declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    [key: string]: any;
  }
  interface SVGAttributes<T> {
    [key: string]: any;
  }
  interface IntrinsicElements {
    [key: string]: any;
  }
}

export {};
`
}

/**
 * Create a simple snapshot from string
 */
function createSnapshot(content: string): IScriptSnapshot {
  return {
    getText: (start: number, end: number) => content.substring(start, end),
    getLength: () => content.length,
    getChangeRange: () => undefined,
  }
}

/**
 * Convert Svelte code to TypeScript for type checking
 * This is a simplified version that handles the most common cases
 */
function convertSvelteToTs(svelteCode: string, fileName: string): { code: string, scriptStart: number, scriptLength: number } {
  // Extract script content
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
  let scriptContent = ''
  let scriptStart = 0
  let scriptLength = 0

  const scriptMatch = scriptRegex.exec(svelteCode)
  if (scriptMatch) {
    scriptContent = scriptMatch[1]
    scriptStart = svelteCode.indexOf(scriptMatch[1])
    scriptLength = scriptContent.length
  }

  // Extract template bindings and reactive statements
  const templateBindings = extractTemplateBindings(svelteCode)

  // Process script content to handle Svelte 5 runes and special syntax
  const processedScript = processScriptContent(scriptContent)

  const tsCode = `
// Generated TypeScript from Svelte component: ${fileName}
// This code is for type checking purposes only

${generateSvelteImports()}

${processedScript}

${templateBindings}

// Component type declaration
declare const __component: import('svelte').Component<typeof $$props, {}, ''>;
export default __component;

// Helper for props typing
declare const $$props: {
${extractPropsFromScript(scriptContent).map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n')}
};
`.trim()

  return { code: tsCode, scriptStart, scriptLength }
}

/**
 * Generate necessary Svelte imports
 */
function generateSvelteImports(): string {
  return `
// Svelte core imports
import type { Snippet } from 'svelte';
`.trim()
}

/**
 * Process script content to handle Svelte-specific syntax
 */
function processScriptContent(script: string): string {
  let processed = script

  // Handle $: reactive statements (Svelte 4 style)
  processed = processed.replace(/^\s*\$:\s*/gm, '/* $: */ ')

  return processed
}

/**
 * Extract template bindings from Svelte markup
 */
function extractTemplateBindings(svelteCode: string): string {
  const bindings: string[] = []

  // Extract {#each} loop variables
  const eachRegex = /\{#each\s+(\w+)\s+as\s+(\w+)(?:\s*,\s*(\w+))?\}/g
  let match = eachRegex.exec(svelteCode)
  while (match !== null) {
    const [, array, item, index] = match
    bindings.push(`// Template binding: {#each ${array} as ${item}${index ? `, ${index}` : ''}}`)
    match = eachRegex.exec(svelteCode)
  }

  // Extract bind:value and other bindings
  const bindRegex = /bind:(\w+)(?:=\{(\w+)\})?/g
  let bindMatch = bindRegex.exec(svelteCode)
  while (bindMatch !== null) {
    const [, prop, variable] = bindMatch
    if (variable) {
      bindings.push(`// Template binding: bind:${prop}={${variable}}`)
    }
    bindMatch = bindRegex.exec(svelteCode)
  }

  return bindings.length > 0 ? bindings.join('\n') : ''
}

/**
 * Extract props from script content
 */
function extractPropsFromScript(script: string): Array<{ name: string, type: string, required: boolean }> {
  const props: Array<{ name: string, type: string, required: boolean }> = []

  // Handle Svelte 5 $props() syntax
  // let { prop1, prop2 = defaultValue }: { prop1: Type1, prop2?: Type2 } = $props();
  const propsMatch = script.match(/let\s+\{([^}]+)\}(?:\s*:\s*\{([^}]+)\})?\s*=\s*\$props\(\)/)
  if (propsMatch) {
    const [, destructured, typeAnnotation] = propsMatch
    const propNames = destructured.split(',').map((p) => {
      const [name] = p.trim().split('=')
      return {
        name: name.trim(),
        hasDefault: p.includes('='),
      }
    })

    if (typeAnnotation) {
      // Parse type annotation
      const typeProps = typeAnnotation.split(',').map(t => t.trim())
      for (const typeProp of typeProps) {
        const typeMatch = typeProp.match(/(\w+)\s*(\?)?:\s*(.+)/)
        if (typeMatch) {
          const [, name, optional, type] = typeMatch
          props.push({
            name,
            type: type.trim(),
            required: !optional,
          })
        }
      }
    }
    else {
      // No type annotation, infer as any
      for (const { name, hasDefault } of propNames) {
        if (name) {
          props.push({
            name,
            type: 'any',
            required: !hasDefault,
          })
        }
      }
    }
  }

  // Handle Svelte 4 export let syntax
  const exportLetRegex = /export\s+let\s+(\w+)\s*(?::\s*([^=;]+))?\s*(?:=\s*([^;]+))?/g
  let exportMatch = exportLetRegex.exec(script)
  while (exportMatch !== null) {
    const [, name, type, defaultValue] = exportMatch
    // Don't add if already added from $props
    if (!props.some(p => p.name === name)) {
      props.push({
        name,
        type: type?.trim() || 'any',
        required: defaultValue === undefined,
      })
    }
    exportMatch = exportLetRegex.exec(script)
  }

  return props
}

/**
 * Create a Svelte language plugin that converts Svelte to TypeScript
 */
function createSvelteLanguagePlugin(): LanguagePlugin<URI> {
  return {
    getLanguageId(uri: URI): string | undefined {
      const path = uri.path
      if (path.endsWith('.svelte')) {
        return 'svelte'
      }
      if (path.endsWith('.ts')) {
        return 'typescript'
      }
      if (path.endsWith('.js')) {
        return 'javascript'
      }
      return undefined
    },

    createVirtualCode(uri: URI, languageId: string, snapshot: IScriptSnapshot): VirtualCode | undefined {
      if (languageId !== 'svelte') {
        return undefined
      }

      const fileName = uri.path
      const svelteCode = snapshot.getText(0, snapshot.getLength())

      try {
        const { code: tsCode, scriptStart, scriptLength } = convertSvelteToTs(svelteCode, fileName)

        const mappings: CodeMapping[] = []

        // Create source mappings for the script content
        if (scriptLength > 0) {
          // Find where the script content appears in the generated TypeScript
          const scriptContent = svelteCode.substring(scriptStart, scriptStart + scriptLength)
          const processedScript = processScriptContent(scriptContent)
          const generatedScriptStart = tsCode.indexOf(processedScript)

          if (generatedScriptStart >= 0) {
            mappings.push({
              sourceOffsets: [scriptStart],
              generatedOffsets: [generatedScriptStart],
              lengths: [scriptLength],
              data: {
                verification: true,
                completion: true,
                semantic: true,
                navigation: true,
                structure: true,
                format: false,
              } satisfies CodeInformation,
            })
          }
        }

        // Add a fallback mapping if no script mapping was created
        if (mappings.length === 0) {
          mappings.push({
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [Math.min(svelteCode.length, tsCode.length, 1)],
            data: {
              verification: true,
              completion: true,
              semantic: true,
              navigation: true,
              structure: true,
              format: false,
            } satisfies CodeInformation,
          })
        }

        return {
          id: 'ts',
          languageId: 'typescript',
          snapshot: createSnapshot(tsCode),
          mappings,
        }
      }
      catch (error) {
        console.warn('[Svelte Worker] Conversion failed:', error)

        // Fallback: Extract script content directly
        const scriptMatch = svelteCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
        const scriptContent = scriptMatch ? scriptMatch[1] : ''

        const tsCode = `
// Svelte component fallback TypeScript code
import type { Component } from 'svelte';

${scriptContent}

// Export default component type
declare const __component: Component<{}, {}, ''>;
export default __component;
`.trim()

        const mappings: CodeMapping[] = []

        if (scriptMatch && scriptContent.length > 0) {
          const scriptStart = svelteCode.indexOf(scriptMatch[1])
          const generatedStart = tsCode.indexOf(scriptContent)

          if (scriptStart >= 0 && generatedStart >= 0) {
            mappings.push({
              sourceOffsets: [scriptStart],
              generatedOffsets: [generatedStart],
              lengths: [scriptContent.length],
              data: {
                verification: true,
                completion: true,
                semantic: true,
                navigation: true,
                structure: true,
                format: false,
              } satisfies CodeInformation,
            })
          }
        }

        if (mappings.length === 0) {
          mappings.push({
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [1],
            data: {
              verification: false,
              completion: true,
              semantic: false,
              navigation: false,
              structure: false,
              format: false,
            } satisfies CodeInformation,
          })
        }

        return {
          id: 'ts',
          languageId: 'typescript',
          snapshot: createSnapshot(tsCode),
          mappings,
        }
      }
    },
  }
}

// Handle init message to load TypeScript
// eslint-disable-next-line no-restricted-globals
self.onmessage = async (msg: MessageEvent<WorkerMessage>) => {
  if (msg.data?.event === 'init') {
    console.warn('[Svelte Worker] Received init message, loading TypeScript...')
    locale = msg.data.tsLocale

    // Load TypeScript
    ts = await importTsFromCdn(msg.data.tsVersion)
    console.warn('[Svelte Worker] TypeScript loaded successfully')

    // eslint-disable-next-line no-restricted-globals
    self.postMessage('inited')
    return
  }

  console.warn('[Svelte Worker] Received message, initializing worker service...')

  // Initialize the worker service
  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies }: CreateData,
    ) => {
      console.warn('[Svelte Worker] worker.initialize callback called')
      console.warn('[Svelte Worker] tsconfig:', JSON.stringify(tsconfig))
      console.warn('[Svelte Worker] dependencies:', Object.keys(dependencies))

      // Create npm file system for node_modules
      const npmFs = createNpmFileSystem(
        (uri: URI) => {
          if (uri.scheme === 'file') {
            if (uri.path === '/node_modules') {
              return ''
            }
            else if (uri.path.startsWith('/node_modules/')) {
              return uri.path.slice('/node_modules/'.length)
            }
          }
        },
        (pkgName: string) => dependencies[pkgName],
        (path: string, content: string) => {
          ctx.host.onFetchCdnFile(
            asUri(`/node_modules/${path}`).toString(),
            content,
          )
        },
      )

      // Create a combined file system that handles both user files and node_modules
      const globalTypes = generateSvelteGlobalTypes()
      const svelteShims = generateSvelteShims()
      const globalTypesPath = '/node_modules/svelte-global.d.ts'
      const svelteShimsPath = '/node_modules/svelte-shims.d.ts'
      const ctime = Date.now()

      // Helper to get user file from mirror models
      const getUserFile = (filePath: string): string | undefined => {
        // Normalize path - remove leading slash for comparison
        const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`
        const model = ctx.getMirrorModels().find((m) => {
          const modelPath = m.uri.path
          return modelPath === normalizedPath || modelPath === filePath
        })
        return model?.getValue()
      }

      const combinedFs: FileSystem = {
        async stat(uri: URI): Promise<FileStat | undefined> {
          const filePath = uri.path

          // Handle global types
          if (filePath === globalTypesPath || filePath === svelteShimsPath) {
            const content = filePath === globalTypesPath ? globalTypes : svelteShims
            return {
              type: 1, // FileType.File
              ctime,
              mtime: ctime,
              size: content.length,
            }
          }

          // Handle user files from mirror models
          const userFileContent = getUserFile(filePath)
          if (userFileContent !== undefined) {
            return {
              type: 1, // FileType.File
              ctime,
              mtime: ctime,
              size: userFileContent.length,
            }
          }

          // Handle root directory - check if it's a directory containing user files
          if (filePath === '/' || filePath === '') {
            return {
              type: 2, // FileType.Directory
              ctime,
              mtime: ctime,
              size: 0,
            }
          }

          // Handle node_modules directory
          if (filePath === '/node_modules') {
            return {
              type: 2, // FileType.Directory
              ctime,
              mtime: ctime,
              size: 0,
            }
          }

          // Handle node_modules files
          if (filePath.startsWith('/node_modules/')) {
            return npmFs.stat(uri)
          }

          return undefined
        },

        async readFile(uri: URI): Promise<string | undefined> {
          const filePath = uri.path

          // Handle global types and shims
          if (filePath === globalTypesPath) {
            return globalTypes
          }
          if (filePath === svelteShimsPath) {
            return svelteShims
          }

          // Handle user files from mirror models
          const userFileContent = getUserFile(filePath)
          if (userFileContent !== undefined) {
            return userFileContent
          }

          // Handle node_modules
          if (filePath.startsWith('/node_modules/')) {
            return npmFs.readFile(uri)
          }

          return undefined
        },

        async readDirectory(uri: URI): Promise<[string, number][]> {
          const filePath = uri.path

          // For root directory, return user files and node_modules
          if (filePath === '/' || filePath === '') {
            const entries: [string, number][] = []

            // Add user files
            ctx.getMirrorModels().forEach((m) => {
              const modelPath = m.uri.path
              // Only include files in root directory
              const parts = modelPath.split('/').filter(Boolean)
              if (parts.length === 1) {
                entries.push([parts[0], 1]) // FileType.File
              }
            })

            // Add node_modules directory
            entries.push(['node_modules', 2]) // FileType.Directory

            return entries
          }

          // Handle node_modules
          if (filePath === '/node_modules' || filePath.startsWith('/node_modules/')) {
            return npmFs.readDirectory(uri)
          }

          return []
        },
      }

      const env: LanguageServiceEnvironment = {
        workspaceFolders: [URI.file('/')],
        locale,
        fs: combinedFs,
      }

      const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(
        tsconfig?.compilerOptions || {},
        '',
      )

      // Create Svelte language plugin
      const svelteLanguagePlugin = createSvelteLanguagePlugin()

      const workerService = createTypeScriptWorkerLanguageService({
        typescript: ts,
        compilerOptions,
        workerContext: ctx,
        env,
        uriConverter: {
          asFileName,
          asUri,
        },
        languagePlugins: [svelteLanguagePlugin],
        languageServicePlugins: [
          createTypeScriptSyntacticPlugin(ts),
          createTypeScriptSemanticPlugin(ts),
          createTypeScriptDirectiveCommentPlugin(),
        ],
      })

      return workerService
    },
  )
}

async function importTsFromCdn(tsVersion: string) {
  const _module = globalThis.module
  ;(globalThis as any).module = { exports: {} }
  const tsUrl = `https://cdn.jsdelivr.net/npm/typescript@${tsVersion}/lib/typescript.js`
  await import(/* @vite-ignore */ tsUrl)
  const tsModule = globalThis.module.exports
  globalThis.module = _module
  return tsModule as typeof import('typescript')
}
