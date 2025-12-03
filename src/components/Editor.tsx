import type { File, Framework } from '../utils/templates'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import React, { useEffect, useRef } from 'react'

if (typeof window !== 'undefined') {
  globalThis.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new JSONWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new CSSWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new HTMLWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new TSWorker()
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
}

export default function Editor({ files, activeFile, activeFramework, onFileChange }: EditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  // Configure Monaco for different frameworks
  useEffect(() => {
    const ts = monaco.typescript
    const defaults = ts.typescriptDefaults
    const compilerOptions = defaults.getCompilerOptions()

    if (activeFramework === 'react') {
      defaults.setCompilerOptions({
        ...compilerOptions,
        jsx: ts.JsxEmit.React,
        jsxFactory: 'React.createElement',
        jsxFragmentFactory: 'React.Fragment',
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowNonTsExtensions: true,
        target: ts.ScriptTarget.Latest,
      })
      // Add a basic React type definition to silence "Cannot find module 'react'"
      defaults.addExtraLib(
        `declare module 'react' {
          export = React;
        }
        declare namespace React {
          function createElement(type: any, props?: any, ...children: any[]): any;
          function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
          function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          function useRef<T>(initialValue: T): { current: T };
          const Fragment: any;
        }
        declare namespace JSX {
          interface IntrinsicElements {
            [elemName: string]: any;
          }
        }
        `,
        'file:///node_modules/@types/react/index.d.ts',
      )
    }
    else if (activeFramework === 'solid') {
      defaults.setCompilerOptions({
        ...compilerOptions,
        jsx: ts.JsxEmit.Preserve,
        jsxImportSource: 'solid-js',
        allowNonTsExtensions: true,
      })
    }
    else {
      // Reset or default config
      defaults.setCompilerOptions({
        ...compilerOptions,
        jsx: ts.JsxEmit.Preserve,
        allowNonTsExtensions: true,
      })
    }
  }, [activeFramework])

  // Sync files to Monaco Models
  useEffect(() => {
    const ts = monaco.typescript
    ts.typescriptDefaults.setEagerModelSync(true)

    files.forEach((file) => {
      const uri = monaco.Uri.parse(`file:///${file.name}`)
      let model = monaco.editor.getModel(uri)

      if (!model) {
        model = monaco.editor.createModel(
          file.content,
          undefined,
          uri,
        )
      }

      if (model.getValue() !== file.content) {
        model.setValue(file.content)
      }

      // Update language
      const ext = file.name.split('.').pop()
      if (model) {
        if (ext === 'vue' || ext === 'html' || ext === 'svelte') {
          monaco.editor.setModelLanguage(model, 'html')
        }
        else if (ext === 'ts' || ext === 'tsx') {
          monaco.editor.setModelLanguage(model, 'typescript')
        }
        else if (ext === 'js' || ext === 'jsx') {
          monaco.editor.setModelLanguage(model, 'javascript')
        }
        else if (ext === 'css') {
          monaco.editor.setModelLanguage(model, 'css')
        }
        else if (ext === 'json') {
          monaco.editor.setModelLanguage(model, 'json')
        }
      }
    })

    // Dispose models for deleted files
    const currentFileNames = files.map(f => f.name)
    monaco.editor.getModels().forEach((model) => {
      const fileName = model.uri.path.substring(1)
      if (!currentFileNames.includes(fileName) && !model.uri.path.includes('node_modules')) {
        model.dispose()
      }
    })
  }, [files])

  // Initialize Editor
  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        model: null,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 16 },
      })

      editorRef.current.onDidChangeModelContent(() => {
        const model = editorRef.current?.getModel()
        if (model) {
          const newValue = model.getValue()
          const fileName = model.uri.path.substring(1)
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
      const uri = monaco.Uri.parse(`file:///${activeFile}`)
      const model = monaco.editor.getModel(uri)
      if (model) {
        editorRef.current.setModel(model)
      }
    }
  }, [activeFile])

  return (
    <div ref={editorContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  )
}
