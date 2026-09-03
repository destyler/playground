import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { TYPESCRIPT_DEPENDENCY, TYPESCRIPT_VERSION } from '../src/language/typescript.ts'

test('the CDN standard library inherits the language worker TypeScript version', () => {
  assert.equal(TYPESCRIPT_DEPENDENCY.typescript, TYPESCRIPT_VERSION)
})
