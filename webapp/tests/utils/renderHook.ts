import React from 'react'

interface EffectState {
  deps?: unknown[]
  cleanup?: void | (() => void)
  create: () => void | (() => void)
  shouldRun: boolean
}

interface MemoState<T = unknown> {
  deps?: unknown[]
  value: T
}

function areHookInputsEqual(nextDeps?: unknown[], prevDeps?: unknown[]) {
  if (!nextDeps || !prevDeps) {
    return false
  }

  if (nextDeps.length !== prevDeps.length) {
    return false
  }

  for (let index = 0; index < nextDeps.length; index += 1) {
    if (!Object.is(nextDeps[index], prevDeps[index])) {
      return false
    }
  }

  return true
}

export interface RenderHookResult<T> {
  current: T
}

export interface RenderHookController<T> {
  result: RenderHookResult<T>
  rerender: () => void
  unmount: () => void
  flush: () => Promise<void>
  act: (callback: () => void | Promise<void>) => Promise<void>
}

export function renderHook<T>(callback: () => T): RenderHookController<T> {
  const { ReactCurrentDispatcher } = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

  const hookStates: unknown[] = []
  const effectStates: EffectState[] = []

  let hookIndex = 0
  let effectIndex = 0
  let pendingPromise: Promise<void> | null = null
  let tailPromise: Promise<void> | null = null

  const result: RenderHookResult<T> = {
    current: undefined as unknown as T
  }

  const flushEffects = () => {
    for (const effect of effectStates) {
      if (!effect.shouldRun) {
        continue
      }

      effect.shouldRun = false
      if (typeof effect.cleanup === 'function') {
        effect.cleanup()
        effect.cleanup = undefined
      }

      const cleanup = effect.create()
      if (typeof cleanup === 'function') {
        effect.cleanup = cleanup
      }
    }
  }

  const scheduleUpdate = () => {
    const promise = new Promise<void>((resolve) => {
      queueMicrotask(() => {
        run()
        flushEffects()
        resolve()
      })
    })

    if (pendingPromise) {
      pendingPromise = pendingPromise.then(() => promise)
    } else {
      pendingPromise = promise
    }

    tailPromise = promise
    promise.then(() => {
      if (tailPromise === promise) {
        pendingPromise = null
        tailPromise = null
      }
    })
  }

  const dispatcher = {
    useState<S>(initialState: S | (() => S)) {
      const stateIndex = hookIndex
      if (hookStates.length <= stateIndex) {
        hookStates[stateIndex] =
          typeof initialState === 'function'
            ? (initialState as () => S)()
            : initialState
      }

      const setState = (value: React.SetStateAction<S>) => {
        const current = hookStates[stateIndex] as S
        const next =
          typeof value === 'function'
            ? (value as (input: S) => S)(current)
            : value

        if (Object.is(current, next)) {
          return
        }

        hookStates[stateIndex] = next
        scheduleUpdate()
      }

      const state = hookStates[stateIndex] as S
      hookIndex += 1
      return [state, setState] as const
    },
    useEffect(create: () => void | (() => void), deps?: unknown[]) {
      const index = effectIndex
      const previous = effectStates[index]

      let shouldRun = true
      if (previous) {
        if (deps) {
          shouldRun = !areHookInputsEqual(deps, previous.deps)
        } else if (!previous.deps) {
          shouldRun = true
        }
      }

      effectStates[index] = {
        create,
        deps,
        cleanup: previous?.cleanup,
        shouldRun
      }

      effectIndex += 1
    },
    useMemo<M>(factory: () => M, deps?: unknown[]) {
      const index = hookIndex
      const previous = hookStates[index] as MemoState<M> | undefined

      if (previous && deps && previous.deps && areHookInputsEqual(deps, previous.deps)) {
        hookIndex += 1
        return previous.value
      }

      const value = factory()
      hookStates[index] = { value, deps } satisfies MemoState<M>
      hookIndex += 1
      return value
    },
    useCallback<C extends (...args: any[]) => any>(fn: C, deps?: unknown[]) {
      const index = hookIndex
      const previous = hookStates[index] as MemoState<C> | undefined

      if (previous && deps && previous.deps && areHookInputsEqual(deps, previous.deps)) {
        hookIndex += 1
        return previous.value
      }

      hookStates[index] = { value: fn, deps } satisfies MemoState<C>
      hookIndex += 1
      return fn
    },
    useRef<R>(initialValue: R) {
      const index = hookIndex
      if (!hookStates[index]) {
        hookStates[index] = { current: initialValue }
      }
      const ref = hookStates[index] as React.MutableRefObject<R>
      hookIndex += 1
      return ref
    }
  }

  const run = () => {
    hookIndex = 0
    effectIndex = 0
    const previous = ReactCurrentDispatcher.current
    ReactCurrentDispatcher.current = dispatcher as any
    try {
      result.current = callback()
    } finally {
      ReactCurrentDispatcher.current = previous
    }
  }

  const flush = async () => {
    while (true) {
      await Promise.resolve()
      const pending = pendingPromise
      if (!pending) {
        break
      }
      await pending
    }
  }

  const act = async (callback: () => void | Promise<void>) => {
    const value = callback()
    if (value && typeof (value as PromiseLike<void>).then === 'function') {
      await value
    }
    await flush()
  }

  const rerender = () => {
    run()
    flushEffects()
  }

  const unmount = () => {
    for (const effect of effectStates) {
      if (typeof effect.cleanup === 'function') {
        effect.cleanup()
      }
    }
    effectStates.length = 0
    hookStates.length = 0
  }

  run()
  flushEffects()

  return { result, rerender, unmount, flush, act }
}
