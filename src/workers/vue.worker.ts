import type * as monaco from 'monaco-editor'
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker'
import { createVueLanguagePlugin, getDefaultCompilerOptions } from '@vue/language-core'
import { createVueLanguageServicePlugins } from '@vue/language-service'
// @ts-expect-error - worker import
import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import * as ts from 'typescript'
import { URI } from 'vscode-uri'
import { vueDtsMap } from '../utils/vue-dts'

const CDN_BASE = 'https://unpkg.com/typescript@5.6.2/lib/'
const LIBS = [
  'lib.esnext.d.ts',
  'lib.dom.d.ts',
  'lib.dom.iterable.d.ts',
  'lib.es2015.d.ts',
  'lib.es5.d.ts',
  'lib.es2015.core.d.ts',
  'lib.es2015.collection.d.ts',
  'lib.es2015.generator.d.ts',
  'lib.es2015.iterable.d.ts',
  'lib.es2015.promise.d.ts',
  'lib.es2015.proxy.d.ts',
  'lib.es2015.reflect.d.ts',
  'lib.es2015.symbol.d.ts',
  'lib.es2015.symbol.wellknown.d.ts',
]

const libContent = new Map<string, string>()

async function loadLibs () {
  await Promise.all(LIBS.map(async (lib) => {
    try {
      const res = await fetch(CDN_BASE + lib)
            if (res.ok) {
        libContent.set(`/${  lib}`, await res.text())
            }
    }
 catch (e) {
      console.error(`Failed to load ${lib}`, e)
        }
  }))
}

globalThis.onmessage = () => {
  worker.initialize(async (ctx: monaco.worker.IWorkerContext) => {
    await loadLibs()

    const compilerOptions: ts.CompilerOptions = {
      ...ts.getDefaultCompilerOptions(),
      allowJs: true,
      checkJs: true,
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowNonTsExtensions: true,
      lib: ['esnext', 'dom', 'dom.iterable'],
    }

    const vueCompilerOptions = getDefaultCompilerOptions()

    const service = createTypeScriptWorkerLanguageService({
      typescript: ts,
      compilerOptions,
      workerContext: ctx,
      env: {
        workspaceFolders: [URI.file('/')],
        fs: {
          stat: (uri) => {
            const uriString = uri.toString()
            if (vueDtsMap.has(uriString)) {
              return {
                type: 1, // File
                ctime: Date.now(),
                mtime: Date.now(),
                size: vueDtsMap.get(uriString)!.length,
              }
            }
            if (uriString === 'file:///node_modules/vue/package.json') {
              return {
                type: 1,
                ctime: Date.now(),
                mtime: Date.now(),
                size: 0,
              }
            }
            if (libContent.has(uri.path)) {
              return { type: 1, ctime: Date.now(), mtime: Date.now(), size: libContent.get(uri.path)!.length }
            }
            return undefined
          },
          readDirectory: _uri => [],
          readFile: (uri) => {
            const uriString = uri.toString()
            if (vueDtsMap.has(uriString)) {
              return vueDtsMap.get(uriString)
            }
            if (uriString === 'file:///node_modules/vue/package.json') {
              return JSON.stringify({
                name: 'vue',
                version: '3.5.25',
                types: './index.d.ts',
              })
            }
            if (libContent.has(uri.path)) {
              return libContent.get(uri.path)
            }
            return undefined
          },
        },
      },
      uriConverter: {
        asUri: fileName => URI.file(fileName),
        asFileName: uri => uri.fsPath,
      },
      languagePlugins: [
        createVueLanguagePlugin(ts, compilerOptions, vueCompilerOptions, uri => uri.fsPath),
      ],
      languageServicePlugins: createVueLanguageServicePlugins(ts) as any,
    })

    // Fix: Missing getSemanticTokenLegend method
    if (!('getSemanticTokenLegend' in service)) {
      (service as any).getSemanticTokenLegend = () => ({ tokenTypes: [], tokenModifiers: [] })
    }

    return service
  })
}
