import type { Ability, FeatureInstance, Skill } from '@/types/character'

export interface SubclassDefinition {
  id: string
  name: string
  description?: string
  source?: string
  spellcastingAbility?: Ability
}

export interface ClassDefinition {
  id: string
  name: string
  primaryAbility: Ability | Ability[]
  hitDie: number
  savingThrows: Ability[]
  skillChoices: {
    count: number
    options: Skill[]
  }
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  otherProficiencies?: string[]
  spellcastingAbility?: Ability
  subclasses?: SubclassDefinition[]
  subclassLevel?: number
  featuresByLevel: Record<number, FeatureInstance[]>
  asiLevels: number[]
}

export interface CatalogueClass extends ClassDefinition {
  source?: string
  description?: string
  raw?: any
}

export interface FeatDefinition {
  id: string
  name: string
  description?: string
  abilityIncreases?: Partial<Record<Ability, number>>
  features?: FeatureInstance[]
  prerequisites?: string[]
  source?: string
  raw?: any
}
