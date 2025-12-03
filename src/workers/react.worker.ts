/**
 * React Language Service Worker
 *
 * This worker provides TypeScript language service for React/TSX files
 * with full type support from CDN.
 */
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
 * Generate React global types for better type inference
 */
function generateReactGlobalTypes(): string {
  return `
/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
`
}

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
      const globalTypes = generateReactGlobalTypes()
      const globalTypesPath = '/node_modules/react-global.d.ts'
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
          if (filePath === globalTypesPath) {
            return {
              type: 1, // FileType.File
              ctime,
              mtime: ctime,
              size: globalTypes.length,
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

          // Handle global types
          if (filePath === globalTypesPath) {
            return globalTypes
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
