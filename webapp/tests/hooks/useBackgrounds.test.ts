import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

import type { BackgroundRecord } from '../../src/components/character/BackgroundSelector.js'
import { __resetBackgroundCacheForTests, useBackgrounds } from '../../src/hooks/useBackgrounds.js'
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
  __resetBackgroundCacheForTests()
})

test('loads backgrounds on demand', async () => {
  const sample: BackgroundRecord[] = [
    { id: 'acolyte', name: 'Acolyte' } as BackgroundRecord
  ]
  const deferred = createDeferred<void>()
  const mockFetch: typeof fetch = async () => {
    await deferred.promise
    return {
      ok: true,
      json: async () => sample
    } as unknown as Response
  }

  const hook = renderHook(() => useBackgrounds({ enabled: true, fetcher: mockFetch }))
  await settleHook(hook)
  assert.equal(hook.result.current.loading, true)

  deferred.resolve()
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.deepEqual(hook.result.current.backgrounds, sample)
  assert.deepEqual(hook.result.current.backgroundIds, ['acolyte'])
})

test('reports background fetch failures', async () => {
  const mockFetch: typeof fetch = async () => {
    return {
      ok: false,
      json: async () => []
    } as unknown as Response
  }

  const hook = renderHook(() => useBackgrounds({ enabled: true, fetcher: mockFetch }))
  await settleHook(hook)

  assert.equal(hook.result.current.loading, false)
  assert.equal(hook.result.current.backgrounds.length, 0)
  assert.equal(hook.result.current.error, 'Unable to load backgrounds')
})

test('returns cached backgrounds for new consumers', async () => {
  const mockFetch: typeof fetch = async () => {
    return {
      ok: true,
      json: async () => [{ id: 'sage', name: 'Sage' } as BackgroundRecord]
    } as unknown as Response
  }

  const first = renderHook(() => useBackgrounds({ enabled: true, fetcher: mockFetch }))
  await settleHook(first)

  assert.deepEqual(first.result.current.backgroundIds, ['sage'])

  const second = renderHook(() => useBackgrounds({ enabled: false, fetcher: mockFetch }))
  await settleHook(second)
  assert.deepEqual(second.result.current.backgroundIds, ['sage'])
  assert.equal(second.result.current.loading, false)
})
