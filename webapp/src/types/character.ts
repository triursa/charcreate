export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export type Skill =
  | 'Acrobatics'
  | 'Animal Handling'
  | 'Arcana'
  | 'Athletics'
  | 'Deception'
  | 'History'
  | 'Insight'
  | 'Intimidation'
  | 'Investigation'
  | 'Medicine'
  | 'Nature'
  | 'Perception'
  | 'Performance'
  | 'Persuasion'
  | 'Religion'
  | 'Sleight of Hand'
  | 'Stealth'
  | 'Survival'

export type AbilityScore = Ability

export interface AbilityBlock {
  base: Record<AbilityScore, number>
  racial: Record<AbilityScore, number>
  asi: Record<AbilityScore, number>
  total: Record<AbilityScore, number>
}

export interface CharacterOverview {
  fullName?: string
  race?: string
  gender?: string
  age?: number
  alignment?: string
  occupation?: string
  affiliations?: string[]
  origin?: string
  campaignNotes?: string
}

export interface FeatureInstance {
  id: string
  name: string
  source: string[]
  description?: string
  payload?: Record<string, unknown>
  mergeStrategy?: 'max' | 'sum' | 'set' | 'custom'
}

export interface Decision {
  id: string
  type: 'choose-skill' | 'choose-feat' | 'asi' | 'choose-tool' | 'choose-language'
  options: any[]
  min: number
  max: number
  prerequisites?: string[]
  label?: string
}

export interface LevelSnapshot {
  level: number
  classId: string
  hpGained: number
  featuresGained: FeatureInstance[]
  decisionsRaised: Decision[]
}

export interface CharacterClassLevel {
  classId: string
  levels: number
  subclassId?: string
}

export interface Character {
  id: string
  name: string
  descriptor?: string
  overview: CharacterOverview
  abilities: AbilityBlock
  level: number
  classes: CharacterClassLevel[]
  profBonus: number
  hp: number
  ac?: number
  speed?: number
  passivePerception?: number
  saves: { proficient: Ability[] }
  skills: { proficient: Skill[] }
  languages: string[]
  proficiencies: { armor: string[]; weapons: string[]; tools: string[] }
  features: FeatureInstance[]
  decisions: Decision[]
  history: LevelSnapshot[]
}
