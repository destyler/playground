/**
 * Svelte Language Service Worker
 *
 * This worker provides TypeScript language service for Svelte files
 * with full type support from CDN.
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
 */
function generateSvelteShims(): string {
  return `
declare module 'svelte' {
  export interface ComponentConstructorOptions<Props extends Record<string, any> = Record<string, any>> {
    target: Element | Document | ShadowRoot;
    anchor?: Element;
    props?: Props;
    context?: Map<any, any>;
    hydrate?: boolean;
    intro?: boolean;
  }

  export class SvelteComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any> {
    constructor(options: ComponentConstructorOptions<Props>);
    $set(props: Partial<Props>): void;
    $on<K extends Extract<keyof Events, string>>(type: K, callback: (e: Events[K]) => void): () => void;
    $destroy(): void;
    [prop: string]: any;
  }

  export type ComponentType<T extends SvelteComponent = SvelteComponent> = new (options: ComponentConstructorOptions) => T;
  export type ComponentProps<T extends SvelteComponent> = T extends SvelteComponent<infer P> ? P : never;

  // Svelte 5 Component type
  export interface Component<Props extends Record<string, any> = {}, Exports extends Record<string, any> = {}, Bindings extends string = string> {
    (
      this: void,
      internals: unknown,
      props: Props
    ): {
      exports: Exports;
      bindings: Bindings;
    };
  }

  export function mount<Props extends Record<string, any>, Exports extends Record<string, any>>(
    component: Component<Props, Exports> | ComponentType<SvelteComponent<Props>>,
    options: { target: Element | Document | ShadowRoot; props?: Props; events?: Record<string, (e: any) => void>; context?: Map<any, any>; intro?: boolean }
  ): Exports;

  export function unmount(component: Record<string, any>): void;
  export function untrack<T>(fn: () => T): T;
  export function tick(): Promise<void>;
  export function flushSync(fn?: () => void): void;
}

declare module 'svelte/store' {
  export interface Readable<T> {
    subscribe(run: (value: T) => void): () => void;
  }
  export interface Writable<T> extends Readable<T> {
    set(value: T): void;
    update(updater: (value: T) => T): void;
  }
  export function writable<T>(value: T): Writable<T>;
  export function readable<T>(value: T, start?: (set: (value: T) => void) => void | (() => void)): Readable<T>;
  export function derived<T, U>(stores: Readable<T>, fn: (value: T) => U): Readable<U>;
  export function get<T>(store: Readable<T>): T;
}

declare module 'svelte/transition' {
  export interface TransitionConfig {
    delay?: number;
    duration?: number;
    easing?: (t: number) => number;
    css?: (t: number, u: number) => string;
    tick?: (t: number, u: number) => void;
  }
  export function fade(node: Element, params?: { delay?: number; duration?: number; easing?: (t: number) => number }): TransitionConfig;
  export function fly(node: Element, params?: { delay?: number; duration?: number; easing?: (t: number) => number; x?: number; y?: number; opacity?: number }): TransitionConfig;
  export function slide(node: Element, params?: { delay?: number; duration?: number; easing?: (t: number) => number; axis?: 'x' | 'y' }): TransitionConfig;
  export function scale(node: Element, params?: { delay?: number; duration?: number; easing?: (t: number) => number; start?: number; opacity?: number }): TransitionConfig;
  export function blur(node: Element, params?: { delay?: number; duration?: number; easing?: (t: number) => number; amount?: number | string; opacity?: number }): TransitionConfig;
  export function draw(node: SVGElement & { getTotalLength(): number }, params?: { delay?: number; duration?: number | ((len: number) => number); easing?: (t: number) => number; speed?: number }): TransitionConfig;
  export function crossfade(params?: { delay?: number; duration?: number | ((len: number) => number); easing?: (t: number) => number; fallback?: (node: Element, params: any, intro: boolean) => TransitionConfig }): [(node: Element, params: { key: any }) => () => TransitionConfig, (node: Element, params: { key: any }) => () => TransitionConfig];
}

declare module 'svelte/animate' {
  export interface AnimationConfig {
    delay?: number;
    duration?: number;
    easing?: (t: number) => number;
    css?: (t: number, u: number) => string;
    tick?: (t: number, u: number) => void;
  }
  export function flip(node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params?: { delay?: number; duration?: number | ((d: number) => number); easing?: (t: number) => number }): AnimationConfig;
}

declare module 'svelte/motion' {
  import type { Readable } from 'svelte/store';
  export interface Spring<T> extends Readable<T> {
    set(value: T, opts?: { hard?: boolean; soft?: boolean | number }): Promise<void>;
    update(fn: (value: T) => T, opts?: { hard?: boolean; soft?: boolean | number }): Promise<void>;
    precision: number;
    damping: number;
    stiffness: number;
  }
  export interface Tweened<T> extends Readable<T> {
    set(value: T, opts?: { delay?: number; duration?: number; easing?: (t: number) => number; interpolate?: (a: T, b: T) => (t: number) => T }): Promise<void>;
    update(fn: (value: T) => T, opts?: { delay?: number; duration?: number; easing?: (t: number) => number; interpolate?: (a: T, b: T) => (t: number) => T }): Promise<void>;
  }
  export function spring<T>(value?: T, opts?: { stiffness?: number; damping?: number; precision?: number }): Spring<T>;
  export function tweened<T>(value?: T, opts?: { delay?: number; duration?: number; easing?: (t: number) => number; interpolate?: (a: T, b: T) => (t: number) => T }): Tweened<T>;
}
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
 * Create a Svelte language plugin that extracts script content for TypeScript
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

      const svelteCode = snapshot.getText(0, snapshot.getLength())

      // Extract script content from Svelte file
      const scriptMatch = svelteCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
      const scriptContent = scriptMatch ? scriptMatch[1] : ''

      // Create TypeScript wrapper with proper component typing
      const tsCode = `
// Svelte component virtual TypeScript code
import { type Component } from 'svelte';

${scriptContent}

// Export default component type
declare const __component: Component<{}, {}, ''>;
export default __component;
`.trim()

      const mappings: CodeMapping[] = []

      // Create mapping for the script content if found
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

      // Add a fallback mapping if no script was found
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
