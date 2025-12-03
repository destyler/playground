/**
 * Vue Language Service Worker (Simplified)
 *
 * This is a simplified version that doesn't use @vue/typescript-plugin
 * which has Node.js dependencies that don't work in browser workers.
 */
import type { LanguageServiceEnvironment } from '@volar/monaco/worker'
import type { VueCompilerOptions } from '@vue/language-core'
import type * as monaco from 'monaco-editor-core'
import { createNpmFileSystem } from '@volar/jsdelivr'
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker'
import {
  createVueLanguagePlugin,
  generateGlobalTypes,
  getDefaultCompilerOptions,
  getGlobalTypesFileName,
} from '@vue/language-core'
import { createVueLanguageServicePlugins } from '@vue/language-service'
// @ts-expect-error - worker export
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { create as createTypeScriptDirectiveCommentPlugin } from 'volar-service-typescript/lib/plugins/directiveComment'
import { create as createTypeScriptSemanticPlugin } from 'volar-service-typescript/lib/plugins/semantic'
import { URI } from 'vscode-uri'

export interface CreateData {
  tsconfig: {
    compilerOptions?: Record<string, any>
    vueCompilerOptions?: Partial<VueCompilerOptions>
  }
  dependencies: Record<string, string>
}

export interface WorkerHost {
  onFetchCdnFile(uri: string, text: string): void
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
self.onmessage = async (msg: MessageEvent<WorkerMessage>) => {
  if (msg.data?.event === 'init') {
    locale = msg.data.tsLocale
    ts = await importTsFromCdn(msg.data.tsVersion)
    self.postMessage('inited')
    return
  }

  // Initialize the worker service - must be inside onmessage after TS is loaded
  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies }: CreateData,
    ) => {
      const env: LanguageServiceEnvironment = {
        workspaceFolders: [URI.file('/')],
        locale,
        fs: createNpmFileSystem(
          (uri) => {
            if (uri.scheme === 'file') {
              if (uri.path === '/node_modules') {
                return ''
              }
              else if (uri.path.startsWith('/node_modules/')) {
                return uri.path.slice('/node_modules/'.length)
              }
            }
          },
          (pkgName) => dependencies[pkgName],
          (path, content) => {
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
      const vueCompilerOptions: VueCompilerOptions = {
        ...getDefaultCompilerOptions(),
        ...tsconfig.vueCompilerOptions,
      }
      setupGlobalTypes(vueCompilerOptions, env)

      const workerService = createTypeScriptWorkerLanguageService({
        typescript: ts,
        compilerOptions,
        workerContext: ctx,
        env,
        uriConverter: {
          asFileName,
          asUri,
        },
        languagePlugins: [
          createVueLanguagePlugin(
            ts,
            compilerOptions,
            vueCompilerOptions,
            asFileName,
          ),
        ],
        languageServicePlugins: [
          createTypeScriptSemanticPlugin(ts),
          createTypeScriptDirectiveCommentPlugin(),
          ...createVueLanguageServicePlugins(ts),
        ],
      })

      return workerService

      function setupGlobalTypes(
        options: VueCompilerOptions,
        envArg: LanguageServiceEnvironment,
      ) {
        const globalTypes = generateGlobalTypes(options)
        const globalTypesPath
          = `/node_modules/${getGlobalTypesFileName(options)}`
        options.globalTypesPath = () => globalTypesPath
        const { stat, readFile } = envArg.fs!
        const ctime = Date.now()
        envArg.fs!.stat = async (uri) => {
          if (uri.path === globalTypesPath) {
            return {
              type: 1,
              ctime,
              mtime: ctime,
              size: globalTypes.length,
            }
          }
          return stat(uri)
        }
        envArg.fs!.readFile = async (uri) => {
          if (uri.path === globalTypesPath) {
            return globalTypes
          }
          return readFile(uri)
        }
      }
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
