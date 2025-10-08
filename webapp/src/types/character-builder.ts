import type { FeatureInstance, Skill } from '@/types/character'

export interface ChoiceDefinition<T = string> {
  count?: number
  from?: T[]
}

export interface StructuredEntry {
  name?: string
  entries?: EntryLike
  type?: string
  choose?: ChoiceDefinition<string>
  from?: string[]
  [key: string]: unknown
}

export type EntryLike = string | StructuredEntry | Array<EntryLike>

export interface AbilityScoreEntry extends StructuredEntry {
  [ability: string]: number | ChoiceDefinition<string> | string[] | unknown
}

export type AbilityScoreDefinition = string | AbilityScoreEntry | AbilityScoreEntry[]

export type SpeedDefinition =
  | number
  | (Record<string, number | ChoiceDefinition<string> | undefined> & {
      walk?: number
      fly?: number
      swim?: number
      climb?: number
    })

export interface FeatureLike extends StructuredEntry {
  id?: string
  source?: string[]
  description?: string
  payload?: Record<string, unknown>
  mergeStrategy?: 'max' | 'sum' | 'set' | 'custom'
}

export type ListValue = EntryLike

export interface AncestryRecord {
  id: string
  name: string
  source?: string
  size?: string | string[]
  traitTags?: string[]
  ability?: AbilityScoreDefinition
  abilityBonuses?: Partial<Record<string, number>>
  speed?: SpeedDefinition
  languageProficiencies?: ListValue
  languages?: ListValue
  entries?: EntryLike
  features?: Array<FeatureLike | FeatureInstance>
  skillProficiencies?: Array<Skill | ListValue>
}

export interface BackgroundRecord {
  id: string
  name: string
  source?: string
  entries?: EntryLike
  skillProficiencies?: ListValue
  toolProficiencies?: ListValue
  languages?: ListValue
  feature?: FeatureLike | FeatureLike[] | EntryLike
}
