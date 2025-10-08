import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

import type { AncestryRecord } from '../../src/types/character-builder.js'
import { __resetAncestryCacheForTests, useAncestries } from '../../src/hooks/useAncestries.js'
import { type RenderHookController, renderHook } from '../utils/renderHook.js'

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

async function settleHook<T>(hook: RenderHookController<T>) {
  await hook.flush()
  await hook.flush()
}

beforeEach(() => {
  __resetAncestryCacheForTests()
})

test('loads ancestries when enabled and exposes ids', async () => {
  const sample: AncestryRecord[] = [
    { id: 'elf', name: 'Elf' } as AncestryRecord,
    { id: 'human', name: 'Human' } as AncestryRecord
  ]
  const deferred = createDeferred<void>()
  const calls: string[] = []
  const mockFetch: typeof fetch = async (input) => {
    calls.push(String(input))
    await deferred.promise
    return {
      ok: true,
      json: async () => sample
    } as unknown as Response
  }

  const hook = renderHook(() => useAncestries({ enabled: true, fetcher: mockFetch }))
  await settleHook(hook)

  assert.equal(hook.result.current.loading, true)
  assert.equal(hook.result.current.error, null)

  deferred.resolve()
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.equal(hook.result.current.error, null)
  assert.deepEqual(hook.result.current.ancestries, sample)
  assert.deepEqual(hook.result.current.ancestryIds, ['elf', 'human'])
  assert.deepEqual(calls, ['/api/races'])
})

test('captures fetch errors', async () => {
  const mockFetch: typeof fetch = async () => {
    return {
      ok: false,
      json: async () => []
    } as unknown as Response
  }

  const hook = renderHook(() => useAncestries({ enabled: true, fetcher: mockFetch }))
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.equal(hook.result.current.ancestries.length, 0)
  assert.equal(hook.result.current.error, 'Unable to load ancestries')
})

test('refresh triggers a refetch and updates the cache', async () => {
  const payloads: AncestryRecord[][] = [
    [{ id: 'dwarf', name: 'Dwarf' } as AncestryRecord],
    [{ id: 'halfling', name: 'Halfling' } as AncestryRecord]
  ]
  const firstDeferred = createDeferred<void>()
  const secondDeferred = createDeferred<void>()
  const deferreds = [firstDeferred, secondDeferred]
  const calls: string[] = []

  const mockFetch: typeof fetch = async (input) => {
    calls.push(String(input))
    const deferred = deferreds.shift()
    if (!deferred) {
      throw new Error('Unexpected fetch')
    }
    await deferred.promise
    const next = payloads.shift() ?? []
    return {
      ok: true,
      json: async () => next
    } as unknown as Response
  }

  const hook = renderHook(() => useAncestries({ enabled: true, fetcher: mockFetch }))
  await settleHook(hook)

  assert.equal(hook.result.current.loading, true)
  firstDeferred.resolve()
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.deepEqual(hook.result.current.ancestryIds, ['dwarf'])

  await hook.act(() => {
    hook.result.current.refresh()
  })
  await settleHook(hook)

  assert.equal(hook.result.current.loading, true)
  secondDeferred.resolve()
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.deepEqual(hook.result.current.ancestryIds, ['halfling'])
  assert.deepEqual(calls, ['/api/races', '/api/races'])

  // Mount a new hook instance to confirm cache reuse
  const second = renderHook(() => useAncestries({ enabled: false, fetcher: mockFetch }))
  await settleHook(second)
  assert.deepEqual(second.result.current.ancestryIds, ['halfling'])
  assert.equal(second.result.current.loading, false)
  assert.equal(calls.length, 2)
})
