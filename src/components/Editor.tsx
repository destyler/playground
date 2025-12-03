import type { WorkerLanguageService } from '@volar/monaco/worker'
import type { File, Framework } from '../utils/templates'
import type { CreateData, WorkerHost, WorkerMessage } from '../workers/vue.worker'
import * as volar from '@volar/monaco'
import * as monaco from 'monaco-editor-core'

import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import React, { useEffect, useRef } from 'react'
import { registerHighlighter } from '../utils/highlight'
import VueWorker from '../workers/vue.worker?worker'

// Register Shiki highlighter for syntax highlighting
if (typeof window !== 'undefined') {
  registerHighlighter()
}

// Vue language configuration (simplified from monaco's html config)

const vueLanguageConf: monaco.languages.LanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[\]{}\\|;:'",.<>/\s]+)/g,
  brackets: [
    ['<!--', '-->'],
    ['<', '>'],
    ['{', '}'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
    { open: '<', close: '>' },
  ],
}

// Monaco worker host for handling CDN files
class MonacoWorkerHost implements WorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    const monacoUri = monaco.Uri.parse(uri)
    if (!monaco.editor.getModel(monacoUri)) {
      monaco.editor.createModel(text, undefined, monacoUri)
    }
  }
}

// Generate Vue global types content
// This must match what @vue/language-core generateGlobalTypes produces for target=3.4
function generateVueGlobalTypes(): string {
  const lib = 'vue'
  // target = 3.4 is used in the template string below
  // checkUnknownProps = false means we add ' & Record<string, unknown>' to allow any props
  const fnPropsType = `(T extends { $props: infer Props } ? Props : {}) & Record<string, unknown>`

  return `// @ts-nocheck
export {};

; declare module '${lib}' {
  export interface GlobalComponents { }
  export interface GlobalDirectives { }
}
; declare global {
  const __VLS_directiveBindingRestFields: { instance: null, oldValue: null, modifiers: any, dir: any };
  const __VLS_unref: typeof import('${lib}').unref;
  const __VLS_placeholder: any;

  type __VLS_NativeElements = __VLS_SpreadMerge<SVGElementTagNameMap, HTMLElementTagNameMap>;
  type __VLS_IntrinsicElements = import('${lib}/jsx-runtime').JSX.IntrinsicElements;
  type __VLS_Element = import('${lib}/jsx-runtime').JSX.Element;
  type __VLS_GlobalComponents = import('${lib}').GlobalComponents & Pick<typeof import('${lib}'), 'Transition' | 'TransitionGroup' | 'KeepAlive' | 'Suspense' | 'Teleport'>;
  type __VLS_GlobalDirectives = import('${lib}').GlobalDirectives;
  type __VLS_IsAny<T> = 0 extends 1 & T ? true : false;
  type __VLS_PickNotAny<A, B> = __VLS_IsAny<A> extends true ? B : A;
  type __VLS_SpreadMerge<A, B> = Omit<A, keyof B> & B;
  type __VLS_WithComponent<N0 extends string, LocalComponents, Self, N1 extends string, N2 extends string, N3 extends string> =
    N1 extends keyof LocalComponents ? N1 extends N0 ? Pick<LocalComponents, N0 extends keyof LocalComponents ? N0 : never> : { [K in N0]: LocalComponents[N1] } :
    N2 extends keyof LocalComponents ? N2 extends N0 ? Pick<LocalComponents, N0 extends keyof LocalComponents ? N0 : never> : { [K in N0]: LocalComponents[N2] } :
    N3 extends keyof LocalComponents ? N3 extends N0 ? Pick<LocalComponents, N0 extends keyof LocalComponents ? N0 : never> : { [K in N0]: LocalComponents[N3] } :
    Self extends object ? { [K in N0]: Self } :
    N1 extends keyof __VLS_GlobalComponents ? N1 extends N0 ? Pick<__VLS_GlobalComponents, N0 extends keyof __VLS_GlobalComponents ? N0 : never> : { [K in N0]: __VLS_GlobalComponents[N1] } :
    N2 extends keyof __VLS_GlobalComponents ? N2 extends N0 ? Pick<__VLS_GlobalComponents, N0 extends keyof __VLS_GlobalComponents ? N0 : never> : { [K in N0]: __VLS_GlobalComponents[N2] } :
    N3 extends keyof __VLS_GlobalComponents ? N3 extends N0 ? Pick<__VLS_GlobalComponents, N0 extends keyof __VLS_GlobalComponents ? N0 : never> : { [K in N0]: __VLS_GlobalComponents[N3] } :
    {};
  type __VLS_FunctionalComponentCtx<T, K> = __VLS_PickNotAny<'__ctx' extends keyof __VLS_PickNotAny<K, {}>
    ? K extends { __ctx?: infer Ctx } ? NonNullable<Ctx> : never : any
    , T extends (props: any, ctx: infer Ctx) => any ? Ctx : any
  >;
  type __VLS_FunctionalComponentProps<T, K> = '__ctx' extends keyof __VLS_PickNotAny<K, {}>
    ? K extends { __ctx?: { props?: infer P } } ? NonNullable<P> : never
    : T extends (props: infer P, ...args: any) => any ? P
    : {};
  type __VLS_FunctionalComponent<T> = (props: ${fnPropsType}, ctx?: any) => __VLS_Element & {
    __ctx?: {
      attrs?: any;
      slots?: T extends { $slots: infer Slots } ? Slots : Record<string, any>;
      emit?: T extends { $emit: infer Emit } ? Emit : {};
      props?: ${fnPropsType};
      expose?: (exposed: T) => void;
    };
  };
  type __VLS_IsFunction<T, K> = K extends keyof T
    ? __VLS_IsAny<T[K]> extends false
    ? unknown extends T[K]
    ? false
    : true
    : false
    : false;
  type __VLS_NormalizeComponentEvent<
    Props,
    Emits,
    onEvent extends keyof Props,
    Event extends keyof Emits,
    CamelizedEvent extends keyof Emits,
  > = __VLS_IsFunction<Props, onEvent> extends true
    ? Props
    : __VLS_IsFunction<Emits, Event> extends true
      ? { [K in onEvent]?: Emits[Event] }
      : __VLS_IsFunction<Emits, CamelizedEvent> extends true
        ? { [K in onEvent]?: Emits[CamelizedEvent] }
        : Props;
  type __VLS_UnionToIntersection<U> = (U extends unknown ? (arg: U) => unknown : never) extends ((arg: infer P) => unknown) ? P : never;
  type __VLS_OverloadUnionInner<T, U = unknown> = U & T extends (...args: infer A) => infer R
    ? U extends T
    ? never
    : __VLS_OverloadUnionInner<T, Pick<T, keyof T> & U & ((...args: A) => R)> | ((...args: A) => R)
    : never;
  type __VLS_OverloadUnion<T> = Exclude<
    __VLS_OverloadUnionInner<(() => never) & T>,
    T extends () => never ? never : () => never
  >;
  type __VLS_ConstructorOverloads<T> = __VLS_OverloadUnion<T> extends infer F
    ? F extends (event: infer E, ...args: infer A) => any
    ? { [K in E & string]: (...args: A) => void; }
    : never
    : never;
  type __VLS_NormalizeEmits<T> = __VLS_PrettifyGlobal<
    __VLS_UnionToIntersection<
      __VLS_ConstructorOverloads<T> & {
        [K in keyof T]: T[K] extends any[] ? { (...args: T[K]): void } : never
      }
    >
  >;
  type __VLS_ResolveEmits<
    Comp,
    Emits,
    TypeEmits = {},
    NormalizedEmits = __VLS_NormalizeEmits<Emits> extends infer E ? string extends keyof E ? {} : E : never,
  > = __VLS_SpreadMerge<NormalizedEmits, TypeEmits>;
  type __VLS_ResolveDirectives<T> = {
    [K in Exclude<keyof T, keyof __VLS_GlobalDirectives> & string as \`v\${Capitalize<K>}\`]: T[K];
  };
  type __VLS_PrettifyGlobal<T> = { [K in keyof T as K]: T[K]; } & {};
  type __VLS_UseTemplateRef<T> = Readonly<import('${lib}').ShallowRef<T | null>>;

  function __VLS_getVForSourceType<T extends number | string | any[] | Iterable<any>>(source: T): [
    item: T extends number ? number
      : T extends string ? string
      : T extends any[] ? T[number]
      : T extends Iterable<infer T1> ? T1
      : any,
    index: number,
  ][];
  function __VLS_getVForSourceType<T>(source: T): [
    item: T[keyof T],
    key: keyof T,
    index: number,
  ][];
  function __VLS_getSlotParameters<S, D extends S>(slot: S, decl?: D):
    D extends (...args: infer P) => any ? P : any[];
  function __VLS_asFunctionalDirective<T>(dir: T): T extends import('${lib}').ObjectDirective
    ? NonNullable<T['created' | 'beforeMount' | 'mounted' | 'beforeUpdate' | 'updated' | 'beforeUnmount' | 'unmounted']>
    : T extends (...args: any) => any
      ? T
      : (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown) => void;
  function __VLS_makeOptional<T>(t: T): { [K in keyof T]?: T[K] };
  function __VLS_asFunctionalComponent<T, K = T extends new (...args: any) => any ? InstanceType<T> : unknown>(t: T, instance?: K):
    T extends new (...args: any) => any ? __VLS_FunctionalComponent<K>
    : T extends () => any ? (props: {}, ctx?: any) => ReturnType<T>
    : T extends (...args: any) => any ? T
    : __VLS_FunctionalComponent<{}>;
  function __VLS_functionalComponentArgsRest<T extends (...args: any) => any>(t: T): 2 extends Parameters<T>['length'] ? [any] : [];
  function __VLS_asFunctionalElement<T>(tag: T, endTag?: T): (attrs: T & Record<string, unknown>) => void;
  function __VLS_asFunctionalSlot<S>(slot: S): S extends () => infer R ? (props: {}) => R : NonNullable<S>;
  function __VLS_tryAsConstant<const T>(t: T): T;
}
`
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-restricted-globals
  ;(self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === 'vue') {
        const worker = new VueWorker()
        const init = new Promise<void>((resolve) => {
          worker.addEventListener('message', (data) => {
            if (data.data === 'inited') {
              resolve()
            }
          })
          worker.postMessage({
            event: 'init',
            tsVersion: 'latest',
            tsLocale: undefined,
          } satisfies WorkerMessage)
        })
        await init
        return worker
      }
      return new EditorWorker()
    },
  }
}

interface EditorProps {
  files: File[]
  activeFile: string
  activeFramework: Framework
  onFileChange: (fileName: string, newContent: string) => void
  onFileSelect?: (fileName: string) => void
}

// Volar dispose function
let disposeVolar: (() => void) | undefined

export default function Editor({ files, activeFile, activeFramework, onFileChange, onFileSelect }: EditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const volarWorkerRef = useRef<monaco.editor.MonacoWebWorker<WorkerLanguageService> | null>(null)

  // Use refs to avoid stale closures in registerEditorOpener
  const filesRef = useRef(files)
  const activeFileRef = useRef(activeFile)
  const onFileSelectRef = useRef(onFileSelect)

  // Keep refs in sync
  useEffect(() => {
    filesRef.current = files
    activeFileRef.current = activeFile
    onFileSelectRef.current = onFileSelect
  }, [files, activeFile, onFileSelect])

  // Setup Volar for Vue - following vuejs/repl pattern exactly
  useEffect(() => {
    if (activeFramework !== 'vue') {
      disposeVolar?.()
      disposeVolar = undefined
      volarWorkerRef.current?.dispose()
      volarWorkerRef.current = null
      return
    }

    // Register languages
    monaco.languages.register({ id: 'vue', extensions: ['.vue'] })
    monaco.languages.register({ id: 'javascript', extensions: ['.js'] })
    monaco.languages.register({ id: 'typescript', extensions: ['.ts'] })
    monaco.languages.register({ id: 'css', extensions: ['.css'] })
    monaco.languages.setLanguageConfiguration('vue', vueLanguageConf)

    // Dependencies for Vue - following vuejs/repl pattern exactly
    // The typescript dependency is critical for CDN type resolution
    // Using 'latest' to always get the newest version from CDN
    const dependencies: Record<string, string> = {
      'typescript': 'latest',
      'vue': 'latest',
      '@vue/compiler-core': 'latest',
      '@vue/compiler-dom': 'latest',
      '@vue/compiler-sfc': 'latest',
      '@vue/compiler-ssr': 'latest',
      '@vue/reactivity': 'latest',
      '@vue/runtime-core': 'latest',
      '@vue/runtime-dom': 'latest',
      '@vue/shared': 'latest',
    }

    // tsconfig - exactly matching vuejs/repl
    const tsconfig = {
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        jsx: 'Preserve',
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        allowImportingTsExtensions: true,
      },
      vueCompilerOptions: {
        target: 3.4,
      },
    }

    // Create the web worker with Volar - following Monaco 0.52 API
    const worker = monaco.editor.createWebWorker<WorkerLanguageService>({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
      host: new MonacoWorkerHost(),
      createData: {
        tsconfig,
        dependencies,
      } satisfies CreateData,
    })

    volarWorkerRef.current = worker

    const languageId = ['vue', 'javascript', 'typescript']
    const getSyncUris = () => {
      const models = monaco.editor.getModels()
        .filter(model => !model.uri.path.includes('node_modules'))
        .map(model => model.uri)
      console.warn('[Editor] getSyncUris called, returning:', models.map(m => m.toString()))
      return models
    }

    // Setup Volar providers
    const setupProviders = async () => {
      console.warn('[Editor] Setting up Volar providers...')
      try {
        const { dispose: disposeMarkers } = volar.activateMarkers(
          worker,
          languageId,
          'vue',
          getSyncUris,
          monaco.editor,
        )
        console.warn('[Editor] Markers activated')
        const { dispose: disposeAutoInsertion } = volar.activateAutoInsertion(
          worker,
          languageId,
          getSyncUris,
          monaco.editor,
        )
        console.warn('[Editor] AutoInsertion activated')
        const { dispose: disposeProviders } = await volar.registerProviders(
          worker,
          languageId,
          getSyncUris,
          monaco.languages,
        )
        console.warn('[Editor] Providers registered successfully')

        disposeVolar = () => {
          disposeMarkers()
          disposeAutoInsertion()
          disposeProviders()
        }
      }
      catch (err) {
        console.error('[Editor] Volar setup failed:', err)
      }
    }

    setupProviders()

    // Support for go to definition
    monaco.editor.registerEditorOpener({
      openCodeEditor(_source, resource) {
        if (resource.toString().startsWith('file:///node_modules')) {
          return true
        }

        const path = resource.path
        if (/^\//.test(path)) {
          let fileName = path.replace('/', '')
          // Remove src/ prefix for Vue files
          if (fileName.startsWith('src/')) {
            fileName = fileName.substring(4)
          }
          // Check if file exists and navigate to it (use refs to avoid stale closures)
          const fileExists = filesRef.current.some(f => f.name === fileName)
          if (fileExists && fileName !== activeFileRef.current) {
            onFileSelectRef.current?.(fileName)
            return true
          }
        }

        return false
      },
    })

    return () => {
      disposeVolar?.()
      disposeVolar = undefined
      volarWorkerRef.current?.dispose()
      volarWorkerRef.current = null
    }
  }, [activeFramework])

  // Sync files to Monaco Models
  useEffect(() => {
    if (activeFramework === 'vue') {
      // Add tsconfig.json for Vue language service - matching vuejs/repl exactly
      const tsconfigUri = monaco.Uri.parse('file:///tsconfig.json')
      const tsconfigContent = JSON.stringify({
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          jsx: 'Preserve',
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          allowImportingTsExtensions: true,
        },
        vueCompilerOptions: {
          target: 3.4,
        },
      }, null, 2)
      const tsconfigModel = monaco.editor.getModel(tsconfigUri)
      if (!tsconfigModel) {
        monaco.editor.createModel(tsconfigContent, 'json', tsconfigUri)
      }

      // Add Vue global types file - this is CRITICAL for component props IntelliSense
      // The file name follows the pattern: {lib}_{target}_{checkUnknownProps}.d.ts
      // With lib='vue', target=3.4, checkUnknownProps=false(0), it becomes vue_3.4_0.d.ts
      const globalTypesFileName = 'vue_3.4_0.d.ts'
      const globalTypesUri = monaco.Uri.parse(`file:///node_modules/${globalTypesFileName}`)
      const globalTypesModel = monaco.editor.getModel(globalTypesUri)
      if (!globalTypesModel) {
        // Generate Vue global types content
        // This content must match what @vue/language-core generateGlobalTypes produces
        const globalTypesContent = generateVueGlobalTypes()
        monaco.editor.createModel(globalTypesContent, 'typescript', globalTypesUri)
        console.warn('[Editor] Created Vue global types model:', globalTypesFileName)
      }
    }

    files.forEach((file) => {
      // Use src/ prefix for Vue files to match vuejs/repl pattern
      const filePath = activeFramework === 'vue' ? `src/${file.name}` : file.name
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      let model = monaco.editor.getModel(uri)

      // Determine language
      const ext = file.name.split('.').pop()
      let lang = 'plaintext'
      if (ext === 'vue')
        lang = 'vue'
      else if (ext === 'ts' || ext === 'tsx')
        lang = 'typescript'
      else if (ext === 'js' || ext === 'jsx')
        lang = 'javascript'
      else if (ext === 'css')
        lang = 'css'
      else if (ext === 'html' || ext === 'svelte')
        lang = 'html'
      else if (ext === 'json')
        lang = 'json'

      if (!model) {
        model = monaco.editor.createModel(file.content, lang, uri)
      }
      else {
        if (model.getValue() !== file.content) {
          model.setValue(file.content)
        }
        // Update language if needed
        if (model.getLanguageId() !== lang) {
          monaco.editor.setModelLanguage(model, lang)
        }
      }
    })

    // Dispose models for deleted files
    const currentFilePaths = files.map(f => activeFramework === 'vue' ? `src/${f.name}` : f.name)
    monaco.editor.getModels().forEach((model) => {
      const filePath = model.uri.path.substring(1)
      // Don't dispose tsconfig.json or node_modules
      if (filePath === 'tsconfig.json' || model.uri.path.includes('node_modules')) {
        return
      }
      if (!currentFilePaths.includes(filePath)) {
        model.dispose()
      }
    })
  }, [files, activeFramework])

  // Initialize Editor
  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        model: null,
        theme: 'dark-plus',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        fixedOverflowWidgets: true,
      })

      editorRef.current.onDidChangeModelContent(() => {
        const model = editorRef.current?.getModel()
        if (model) {
          const newValue = model.getValue()
          let fileName = model.uri.path.substring(1)
          // Remove src/ prefix for Vue files
          if (fileName.startsWith('src/')) {
            fileName = fileName.substring(4)
          }
          onFileChange(fileName, newValue)
        }
      })
    }

    return () => {
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [])

  // Update editor model when activeFile changes
  useEffect(() => {
    if (editorRef.current) {
      // Use src/ prefix for Vue files
      const filePath = activeFramework === 'vue' ? `src/${activeFile}` : activeFile
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      const model = monaco.editor.getModel(uri)
      if (model && editorRef.current.getModel() !== model) {
        editorRef.current.setModel(model)
      }
    }
  }, [activeFile, activeFramework])

  return (
    <div ref={editorContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  )
}
