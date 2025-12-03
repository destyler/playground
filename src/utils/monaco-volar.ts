import { activateAutoInsertion, activateMarkers, registerProviders } from '@volar/monaco'
import type { IDisposable, editor, languages } from 'monaco-editor'

export async function setupVolar(
  worker: editor.MonacoWebWorker<any>,
  languageId: string,
  getSyncUris: () => any[],
  monacoLanguages: typeof languages,
  monacoEditor: typeof editor,
): Promise<IDisposable> {
  const disposables: IDisposable[] = []

  const [providerDisposable] = await Promise.all([
    registerProviders(worker, languageId, getSyncUris, monacoLanguages),
  ])

  disposables.push(providerDisposable)
  disposables.push(activateMarkers(worker, [languageId], languageId, getSyncUris, monacoEditor))
  disposables.push(activateAutoInsertion(worker, [languageId], getSyncUris, monacoEditor))

  return {
    dispose: () => disposables.forEach(d => d.dispose()),
  }
}
