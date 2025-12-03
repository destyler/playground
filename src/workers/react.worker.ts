/**
 * React Language Service Worker
 *
 * This worker provides TypeScript language service for React/TSX files
 * with full type support from CDN.
 */
import type { LanguageServiceEnvironment } from '@volar/monaco/worker'
import type * as monaco from 'monaco-editor-core'
import { createNpmFileSystem } from '@volar/jsdelivr'
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker'
// @ts-expect-error - worker export
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
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

// Handle init message to load TypeScript
// eslint-disable-next-line no-restricted-globals
self.onmessage = async (msg: MessageEvent<WorkerMessage>) => {
  if (msg.data?.event === 'init') {
    console.warn('[React Worker] Received init message, loading TypeScript...')
    locale = msg.data.tsLocale
    ts = await importTsFromCdn(msg.data.tsVersion)
    console.warn('[React Worker] TypeScript loaded successfully')
    // eslint-disable-next-line no-restricted-globals
    self.postMessage('inited')
    return
  }

  console.warn('[React Worker] Received message, initializing worker service...')

  // Initialize the worker service
  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies }: CreateData,
    ) => {
      console.warn('[React Worker] worker.initialize callback called')
      console.warn('[React Worker] tsconfig:', JSON.stringify(tsconfig))
      console.warn('[React Worker] dependencies:', Object.keys(dependencies))

      const env: LanguageServiceEnvironment = {
        workspaceFolders: [URI.file('/')],
        locale,
        fs: createNpmFileSystem(
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
        ),
      }

      const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(
        tsconfig?.compilerOptions || {},
        '',
      )

      const workerService = createTypeScriptWorkerLanguageService({
        typescript: ts,
        compilerOptions,
        workerContext: ctx,
        env,
        uriConverter: {
          asFileName,
          asUri,
        },
        languagePlugins: [],
        languageServicePlugins: [],
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
