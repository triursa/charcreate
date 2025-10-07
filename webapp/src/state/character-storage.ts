const CURRENT_STATE_STORAGE_KEY = 'character-planner:current-state'
const SAVED_BUILDS_STORAGE_KEY = 'character-planner:saved-builds'

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorageValue<T>(key: string): T | undefined {
  if (!isBrowser()) {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return undefined
    }
    return JSON.parse(raw) as T
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error)
    return undefined
  }
}

function writeStorageValue<T>(key: string, value: T) {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}":`, error)
  }
}

export interface SavedBuildRecord<State> {
  name: string
  savedAt: string
  state: State
}

export type SavedBuildSummary = Pick<SavedBuildRecord<unknown>, 'name' | 'savedAt'>

export function loadCurrentState<State>(): State | undefined {
  return readStorageValue<State>(CURRENT_STATE_STORAGE_KEY)
}

export function persistCurrentState<State>(state: State) {
  writeStorageValue(CURRENT_STATE_STORAGE_KEY, state)
}

function normalizeRecords<State>(records: SavedBuildRecord<State>[] | undefined) {
  if (!records) {
    return [] as SavedBuildRecord<State>[]
  }

  if (!Array.isArray(records)) {
    return [] as SavedBuildRecord<State>[]
  }

  return records.filter((record) => Boolean(record && record.name && record.state))
}

export function listSavedBuilds<State>(): SavedBuildRecord<State>[] {
  const records = readStorageValue<SavedBuildRecord<State>[]>(SAVED_BUILDS_STORAGE_KEY)
  return normalizeRecords(records)
}

export function loadSavedBuild<State>(name: string): SavedBuildRecord<State> | undefined {
  const records = listSavedBuilds<State>()
  return records.find((record) => record.name === name)
}

export function saveBuild<State>(name: string, state: State) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return
  }

  const records = listSavedBuilds<State>()
  const savedAt = new Date().toISOString()
  const existingIndex = records.findIndex((record) => record.name === trimmedName)

  if (existingIndex >= 0) {
    records[existingIndex] = { name: trimmedName, savedAt, state }
  } else {
    records.push({ name: trimmedName, savedAt, state })
  }

  writeStorageValue(SAVED_BUILDS_STORAGE_KEY, records)
}

export function deleteBuild<State>(name: string) {
  const records = listSavedBuilds<State>()
  const nextRecords = records.filter((record) => record.name !== name)
  writeStorageValue(SAVED_BUILDS_STORAGE_KEY, nextRecords)
}
