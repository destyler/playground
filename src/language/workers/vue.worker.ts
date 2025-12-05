/**
 * Vue Language Service Worker
 *
 * This version follows vuejs/repl implementation for full component props support.
 */
import type { LanguageServiceEnvironment, Language } from '@volar/monaco/worker'
import type { VueCompilerOptions } from '@vue/language-core'
import type * as monaco from 'monaco-editor-core'
import { createNpmFileSystem } from '@volar/jsdelivr'
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker'
import {
  VueVirtualCode,
  createVueLanguagePlugin,
  generateGlobalTypes,
  getDefaultCompilerOptions,
  getGlobalTypesFileName,
} from '@vue/language-core'
import type { LanguageService } from '@vue/language-service'
import { createVueLanguageServicePlugins } from '@vue/language-service'
// @ts-expect-error - worker export
import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { create as createTypeScriptDirectiveCommentPlugin } from 'volar-service-typescript/lib/plugins/directiveComment'
import { create as createTypeScriptSemanticPlugin } from 'volar-service-typescript/lib/plugins/semantic'
import { URI } from 'vscode-uri'

// Import @vue/typescript-plugin helpers
import { createVueLanguageServiceProxy } from '@vue/typescript-plugin/lib/common'
import { getComponentDirectives } from '@vue/typescript-plugin/lib/requests/getComponentDirectives'
import { getComponentEvents } from '@vue/typescript-plugin/lib/requests/getComponentEvents'
import { getComponentNames } from '@vue/typescript-plugin/lib/requests/getComponentNames'
import { getComponentProps } from '@vue/typescript-plugin/lib/requests/getComponentProps'
import { getComponentSlots } from '@vue/typescript-plugin/lib/requests/getComponentSlots'
import { getElementAttrs } from '@vue/typescript-plugin/lib/requests/getElementAttrs'
import { getElementNames } from '@vue/typescript-plugin/lib/requests/getElementNames'
import { isRefAtPosition } from '@vue/typescript-plugin/lib/requests/isRefAtPosition'

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

  // Initialize the worker service - this captures subsequent Monaco messages
  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies }: CreateData,
    ) => {
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
          ...getTsLanguageServicePlugins(),
          ...getVueLanguageServicePlugins(),
        ],
      })

      return workerService

      function setupGlobalTypes(
        options: VueCompilerOptions,
        envArg: LanguageServiceEnvironment,
      ) {
        const globalTypes = generateGlobalTypes(options)
        const globalTypesPath = `/node_modules/${getGlobalTypesFileName(options)}`
        options.globalTypesPath = () => globalTypesPath
        const { stat, readFile } = envArg.fs!
        const ctime = Date.now()
        envArg.fs!.stat = async (uri: URI) => {
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
        envArg.fs!.readFile = async (uri: URI) => {
          if (uri.path === globalTypesPath) {
            return globalTypes
          }
          return readFile(uri)
        }
      }

      function getTsLanguageServicePlugins() {
        const semanticPlugin = createTypeScriptSemanticPlugin(ts)
        const { create } = semanticPlugin
        semanticPlugin.create = (context) => {
          const created = create(context)
          const ls = created.provide[
            'typescript/languageService'
          ]() as import('typescript').LanguageService
          const proxy = createVueLanguageServiceProxy(
            ts,
            new Proxy(
              {},
              {
                get(_target, prop, receiver) {
                  return Reflect.get(context.language, prop, receiver)
                },
              },
            ) as unknown as Language,
            ls,
            vueCompilerOptions,
            asUri,
          )
          ls.getCompletionsAtPosition = proxy.getCompletionsAtPosition
          ls.getCompletionEntryDetails = proxy.getCompletionEntryDetails
          ls.getCodeFixesAtPosition = proxy.getCodeFixesAtPosition
          ls.getDefinitionAndBoundSpan = proxy.getDefinitionAndBoundSpan
          ls.getQuickInfoAtPosition = proxy.getQuickInfoAtPosition
          return created
        }
        return [semanticPlugin, createTypeScriptDirectiveCommentPlugin()]
      }

      function getVueLanguageServicePlugins() {
        const plugins = createVueLanguageServicePlugins(ts, {
          getComponentDirectives(fileName: string) {
            return getComponentDirectives(ts, getProgram(), fileName)
          },
          getComponentEvents(fileName: string, tag: string) {
            return getComponentEvents(ts, getProgram(), fileName, tag)
          },
          getComponentNames(fileName: string) {
            const result = getComponentNames(ts, getProgram(), fileName)
            return result
          },
          getComponentProps(fileName: string, tag: string) {

            const program = getProgram()
            const checker = program.getTypeChecker()
            const sourceFiles = program.getSourceFiles()

            // Check Vue types availability
            const vueFiles = sourceFiles.filter(sf => sf.fileName.includes('/vue/') || sf.fileName.includes('/vue.d.ts'))

            // Check the current file's __VLS_self type
            const currentFile = program.getSourceFile(fileName)
            if (currentFile) {
              // Helper to find nodes
              const findNode = (name: string) => {
                const find = (node: any): any => {
                  if (ts.isVariableDeclaration(node) && node.name.getText() === name) {
                    return node
                  }
                  let result: any
                  ts.forEachChild(node, (child) => {
                    if (!result) result = find(child)
                  })
                  return result
                }
                return find(currentFile)
              }

              const selfNode = findNode('__VLS_self')
              if (selfNode) {
                const selfType = checker.getTypeAtLocation(selfNode)

                // Try to get the construct signatures
                const constructSigs = selfType.getConstructSignatures()
                if (constructSigs.length > 0) {
                  const instanceType = constructSigs[0].getReturnType()
                }
              }

              const ctxNode = findNode('__VLS_ctx')
              if (ctxNode) {
                const ctxType = checker.getTypeAtLocation(ctxNode)
              }

              const componentsNode = findNode('__VLS_components')
              if (componentsNode) {
                const componentsType = checker.getTypeAtLocation(componentsNode)
              }

              // Print the generated code around __VLS_self
              const code = currentFile.getText()
              const selfIndex = code.indexOf('const __VLS_self')
            }

            // Call the actual getComponentProps
            const result = getComponentProps(ts, program, fileName, tag)
            return result
          },
          getComponentSlots(fileName: string) {
            const { virtualCode } = getVirtualCode(fileName)
            return getComponentSlots(ts, getProgram(), virtualCode)
          },
          getElementAttrs(fileName: string, tag: string) {
            return getElementAttrs(ts, getProgram(), fileName, tag)
          },
          getElementNames(fileName: string) {
            return getElementNames(ts, getProgram(), fileName)
          },
          isRefAtPosition(fileName: string, position: number) {
            const { sourceScript, virtualCode } = getVirtualCode(fileName)
            return isRefAtPosition(
              ts,
              getLanguageService().context.language,
              getProgram(),
              sourceScript,
              virtualCode,
              position,
            )
          },
          async getQuickInfoAtPosition(fileName: string, position: { line: number, character: number }) {
            const uri = asUri(fileName)
            const sourceScript = getLanguageService().context.language.scripts.get(uri)
            if (!sourceScript) {
              return ''
            }
            const hover = await getLanguageService().getHover(uri, position)
            let text = ''
            if (typeof hover?.contents === 'string') {
              text = hover.contents
            } else if (Array.isArray(hover?.contents)) {
              text = hover.contents
                .map((c: string | { value: string }) => (typeof c === 'string' ? c : c.value))
                .join('\n')
            } else if (hover) {
              text = hover.contents.value
            }
            text = text.replace(/```typescript/g, '')
            text = text.replace(/```/g, '')
            text = text.replace(/---/g, '')
            text = text.trim()
            while (true) {
              const newText = text.replace(/\n\n/g, '\n')
              if (newText === text) {
                break
              }
              text = newText
            }
            text = text.replace(/\n/g, ' | ')
            return text
          },
          collectExtractProps() {
            throw new Error('Not implemented')
          },
          getImportPathForFile() {
            throw new Error('Not implemented')
          },
          getDocumentHighlights() {
            throw new Error('Not implemented')
          },
          getEncodedSemanticClassifications() {
            throw new Error('Not implemented')
          },
          getReactiveReferences() {
            throw new Error('Not implemented')
          },
        })

        const ignoreVueServicePlugins = new Set([
          'vue-extract-file',
          'vue-document-drop',
          'vue-document-highlights',
          'typescript-semantic-tokens',
        ])
        return plugins.filter(
          (plugin) => !ignoreVueServicePlugins.has(plugin.name!),
        )

        function getVirtualCode(fileName: string) {
          const uri = asUri(fileName)
          const sourceScript = getLanguageService().context.language.scripts.get(uri)
          if (!sourceScript) {
            throw new Error('No source script found for file: ' + fileName)
          }
          const virtualCode = sourceScript.generated?.root
          if (!(virtualCode instanceof VueVirtualCode)) {
            throw new Error('No virtual code found for file: ' + fileName)
          }
          return {
            sourceScript,
            virtualCode,
          }
        }

        function getProgram() {
          const tsService: import('typescript').LanguageService =
            getLanguageService().context.inject('typescript/languageService')
          return tsService.getProgram()!
        }

        function getLanguageService() {
          return (workerService as any).languageService as LanguageService
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
