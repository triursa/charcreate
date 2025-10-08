'use client'

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

import { abilityList } from '@/lib/abilities'
import { buildCharacter } from '@/lib/rules/engine'
import type { ClassDefinition } from '@/data/classes'
import type { AncestryRecord, BackgroundRecord } from '@/types/character-builder'
import type { Character, Decision } from '@/types/character'
import type { Ability, Skill } from '@/types/character'

import { loadCurrentState, persistCurrentState } from './character-storage'

export type AbilityMethod = 'boss-array' | 'manual'

export interface BasicsState {
  name: string
  descriptor?: string
  campaignNotes?: string
  alignment?: string
  occupation?: string
  origin?: string
  affiliations: string[]
  raceDetail?: string
  gender?: string
  age?: number
}

export type ResolvedDecisionValue =
  | { type: 'choose-skill'; choices: Skill[] }
  | { type: 'choose-language'; choices: string[] }
  | { type: 'choose-tool'; choices: string[] }
  | { type: 'choose-feat'; featId: string }
  | { type: 'asi'; mode: 'ability'; abilities: Ability[] }
  | { type: 'asi'; mode: 'feat'; featId: string; abilitySelection?: Ability }
  | { type: 'choose-subclass'; choice: string }
  | { type: 'custom'; data: unknown }

export interface CharacterBuilderState {
  id: string
  basics: BasicsState
  abilityMethod: AbilityMethod
  baseAbilities: Record<Ability, number>
  ancestryId?: string
  ancestryData?: AncestryRecord
  backgroundId?: string
  backgroundData?: BackgroundRecord
  classId?: string
  classData?: ClassDefinition
  level: number
  resolvedDecisions: Partial<Record<string, ResolvedDecisionValue>>
}

const defaultBaseAbilities: Record<Ability, number> = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10
}

const initialState: CharacterBuilderState = {
  id: 'charplanner-1',
  basics: {
    name: 'New Character',
    descriptor: '',
    campaignNotes: '',
    alignment: '',
    occupation: '',
    origin: '',
    affiliations: []
  },
  abilityMethod: 'manual',
  baseAbilities: { ...defaultBaseAbilities },
  ancestryId: undefined,
  classId: 'fighter',
  classData: undefined,
  level: 1,
  resolvedDecisions: {}
}

type Action =
  | { type: 'SET_BASICS'; payload: Partial<BasicsState> }
  | { type: 'SET_ABILITY_METHOD'; payload: AbilityMethod }
  | { type: 'SET_BASE_ABILITY'; ability: Ability; value: number }
  | { type: 'APPLY_BOSS_ARRAY' }
  | { type: 'SET_ANCESTRY'; payload: string | undefined | AncestryRecord }
  | { type: 'SET_BACKGROUND'; payload: string | undefined | BackgroundRecord }
  | { type: 'SET_CLASS'; payload: string | undefined | ClassDefinition }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'RESOLVE_DECISION'; id: string; value: ResolvedDecisionValue }
  | { type: 'CLEAR_DECISION'; id: string }
  | { type: 'LOAD_STATE'; payload: CharacterBuilderState }

function reducer(state: CharacterBuilderState, action: Action): CharacterBuilderState {
  switch (action.type) {
    case 'SET_BACKGROUND': {
      if (typeof action.payload === 'object' && action.payload !== null) {
        return {
          ...state,
          backgroundId: action.payload.id,
          backgroundData: action.payload
        }
      } else {
        return {
          ...state,
          backgroundId: action.payload,
          backgroundData: undefined
        }
      }
    }
    case 'SET_BASICS':
      return {
        ...state,
        basics: {
          ...state.basics,
          ...action.payload
        }
      }
    case 'SET_ABILITY_METHOD':
      return {
        ...state,
        abilityMethod: action.payload
      }
    case 'SET_BASE_ABILITY':
      return {
        ...state,
        baseAbilities: {
          ...state.baseAbilities,
          [action.ability]: action.value
        }
      }
    case 'APPLY_BOSS_ARRAY': {
      const bossArray = [17, 15, 13, 13, 11, 9]
      const updated: Record<Ability, number> = { ...state.baseAbilities }
      abilityList.forEach((ability, index) => {
        updated[ability] = bossArray[index] ?? updated[ability]
      })
      return {
        ...state,
        baseAbilities: updated,
        abilityMethod: 'boss-array'
      }
    }
    case 'SET_ANCESTRY': {
      // action.payload can be a race object or id
      if (typeof action.payload === 'object' && action.payload !== null) {
        return {
          ...state,
          ancestryId: action.payload.id,
          ancestryData: action.payload
        }
      } else {
        return {
          ...state,
          ancestryId: action.payload,
          ancestryData: undefined
        }
      }
    }
    case 'SET_CLASS':
      if (typeof action.payload === 'object' && action.payload !== null) {
        return {
          ...state,
          classId: action.payload.id,
          classData: action.payload,
          resolvedDecisions: {}
        }
      }
      return {
        ...state,
        classId: action.payload ?? state.classId,
        classData: undefined,
        resolvedDecisions: {}
      }
    case 'SET_LEVEL':
      return {
        ...state,
        level: Math.max(0, Math.min(20, action.payload))
      }
    case 'RESOLVE_DECISION':
      return {
        ...state,
        resolvedDecisions: {
          ...state.resolvedDecisions,
          [action.id]: action.value
        }
      }
    case 'CLEAR_DECISION': {
      const updated = { ...state.resolvedDecisions }
      delete updated[action.id]
      return {
        ...state,
        resolvedDecisions: updated
      }
    }
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
        basics: {
          ...initialState.basics,
          ...(action.payload.basics ?? {})
        },
        baseAbilities: {
          ...defaultBaseAbilities,
          ...(action.payload.baseAbilities ?? {})
        },
        resolvedDecisions: {
          ...(action.payload.resolvedDecisions ?? {})
        }
      }
    default:
      return state
  }
}

interface CharacterBuilderContextValue {
  state: CharacterBuilderState
  character: Character
  pendingDecisions: Decision[]
  warnings: string[]
  actions: {
    setBasics: (payload: Partial<BasicsState>) => void
    setAbilityMethod: (method: AbilityMethod) => void
    setBaseAbility: (ability: Ability, value: number) => void
    applyBossArray: () => void
    setAncestry: (id: string | undefined | AncestryRecord) => void
    setBackground: (id: string | undefined | BackgroundRecord) => void
    setClass: (id: string | undefined | ClassDefinition) => void
    setLevel: (level: number) => void
    resolveDecision: (id: string, value: ResolvedDecisionValue) => void
    clearDecision: (id: string) => void
    loadState: (nextState: CharacterBuilderState) => void
  }
}

const CharacterBuilderContext = createContext<CharacterBuilderContextValue | undefined>(undefined)

export function CharacterBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (baseState) => {
      const stored = loadCurrentState<CharacterBuilderState>()
      if (!stored) {
        return baseState
      }
      return reducer(baseState, { type: 'LOAD_STATE', payload: stored })
    }
  )

  useEffect(() => {
    persistCurrentState(state)
  }, [state])

  const buildResult = useMemo(() => buildCharacter(state), [state])

  const actions = useMemo(
    () => ({
      setBasics: (payload: Partial<BasicsState>) => dispatch({ type: 'SET_BASICS', payload }),
      setAbilityMethod: (method: AbilityMethod) => dispatch({ type: 'SET_ABILITY_METHOD', payload: method }),
      setBaseAbility: (ability: Ability, value: number) =>
        dispatch({ type: 'SET_BASE_ABILITY', ability, value }),
      applyBossArray: () => dispatch({ type: 'APPLY_BOSS_ARRAY' }),
      setAncestry: (id: string | undefined | AncestryRecord) => dispatch({ type: 'SET_ANCESTRY', payload: id }),
      setBackground: (id: string | undefined | BackgroundRecord) => dispatch({ type: 'SET_BACKGROUND', payload: id }),
      setClass: (id: string | undefined | ClassDefinition) => dispatch({ type: 'SET_CLASS', payload: id }),
      setLevel: (level: number) => dispatch({ type: 'SET_LEVEL', payload: level }),
      resolveDecision: (id: string, value: ResolvedDecisionValue) =>
        dispatch({ type: 'RESOLVE_DECISION', id, value }),
      clearDecision: (id: string) => dispatch({ type: 'CLEAR_DECISION', id }),
      loadState: (nextState: CharacterBuilderState) => dispatch({ type: 'LOAD_STATE', payload: nextState })
    }),
    []
  )

  const value = useMemo(
    () => ({
      state,
      character: buildResult.character,
      pendingDecisions: buildResult.pendingDecisions,
      warnings: buildResult.warnings,
      actions
    }),
    [actions, buildResult, state]
  )

  return <CharacterBuilderContext.Provider value={value}>{children}</CharacterBuilderContext.Provider>
}

export function useCharacterBuilder() {
  const context = useContext(CharacterBuilderContext)
  if (!context) {
    throw new Error('useCharacterBuilder must be used within a CharacterBuilderProvider')
  }
  return context
}
