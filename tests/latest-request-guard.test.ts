import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { createLatestRequestGuard, isCurrentRequestKey } from '../src/language/frameworks/types.ts'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

test('an older request cannot overwrite a newer result for the same key', async () => {
  const guard = createLatestRequestGuard<string>()
  const slowResult = deferred<string>()
  const commits: string[] = []

  const slowRequest = guard.begin('vue')
  const slowTask = slowResult.promise.then((value) => {
    if (guard.isCurrent(slowRequest, 'vue'))
      commits.push(value)
  })

  const fastRequest = guard.begin('vue')
  if (guard.isCurrent(fastRequest, 'vue'))
    commits.push('new')

  slowResult.resolve('old')
  await slowTask

  assert.deepEqual(commits, ['new'])
})

test('changing the active key invalidates work before another request starts', async () => {
  const guard = createLatestRequestGuard<string>()
  const slowResult = deferred<string>()
  const commits: string[] = []
  let activeFramework = 'react'

  const reactRequest = guard.begin(activeFramework)
  const reactTask = slowResult.promise.then((value) => {
    if (guard.isCurrent(reactRequest, activeFramework))
      commits.push(value)
  })

  activeFramework = 'vue'
  slowResult.resolve('react')
  await reactTask

  assert.deepEqual(commits, [])
})

test('a stale scheduled callback does not invalidate the active request', () => {
  const guard = createLatestRequestGuard<string>()
  const activeFramework = 'react'
  const activeRequest = guard.begin(activeFramework)
  let staleCallbackStarted = false

  if (isCurrentRequestKey('vue', activeFramework)) {
    staleCallbackStarted = true
    guard.begin('vue')
  }

  assert.equal(staleCallbackStarted, false)
  assert.equal(guard.isCurrent(activeRequest, activeFramework), true)
})
