import type { editor, IDisposable, languages } from 'monaco-editor-core'
import * as volar from '@volar/monaco'

export interface WorkerHost {
  onFetchCdnFile: (uri: string, text: string) => void
}

export interface CreateData {
  tsconfig: {
    compilerOptions?: import('typescript').CompilerOptions
    vueCompilerOptions?: Record<string, unknown>
  }
  dependencies: Record<string, string>
}

export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  tsLocale?: string
}

export class VolarWorkerHost implements WorkerHost {
  constructor(private getOrCreateModel: (uri: string, content: string) => void) {}

  onFetchCdnFile(uri: string, text: string) {
    this.getOrCreateModel(uri, text)
  }
}

export async function setupVolar(
  worker: editor.MonacoWebWorker<any>,
  languageId: string | string[],
  getSyncUris: () => any[],
  monacoLanguages: typeof languages,
  monacoEditor: typeof editor,
): Promise<IDisposable> {
  const disposables: IDisposable[] = []
  const languageIds = Array.isArray(languageId) ? languageId : [languageId]

  const providerDisposable = await volar.registerProviders(
    worker,
    languageIds,
    getSyncUris,
    monacoLanguages,
  )

  disposables.push(providerDisposable)
  disposables.push(
    volar.activateMarkers(
      worker,
      languageIds,
      languageIds[0],
      getSyncUris,
      monacoEditor,
    ),
  )
  disposables.push(
    volar.activateAutoInsertion(worker, languageIds, getSyncUris, monacoEditor),
  )

  return {
    dispose: () => disposables.forEach(d => d.dispose()),
  }
}
