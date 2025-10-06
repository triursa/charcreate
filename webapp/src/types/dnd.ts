// Base types for all D&D content
export interface BaseEntry {
  name: string
  source: string
  page?: number
  srd?: boolean
  basicRules?: boolean
}

// Spell types
export interface Spell extends BaseEntry {
  level: number
  school: string
  time: Array<{
    number: number
    unit: string
  }>
  range: {
    type: string
    distance?: {
      type: string
      amount: number
    }
  }
  components: {
    v?: boolean
    s?: boolean
    m?: string | boolean
  }
  duration: Array<{
    type: string
    duration?: {
      type: string
      amount?: number
    }
  }>
  entries: string[]
  damageInflict?: string[]
  savingThrow?: string[]
  spellAttack?: string[]
  classes?: {
    fromClassList: Array<{
      name: string
      source: string
    }>
  }
}

// Race types
export interface Race extends BaseEntry {
  size: string[]
  speed: {
    walk?: number
    fly?: number
    swim?: number
    climb?: number
  }
  ability?: Array<Record<string, number>>
  traitTags?: string[]
  languageProficiencies?: Array<Record<string, boolean | number>>
  skillProficiencies?: Array<Record<string, boolean>>
  entries: Array<{
    name: string
    entries: string[]
    type: string
  }>
}

// Class types
export interface DndClass extends BaseEntry {
  hd: {
    number: number
    faces: number
  }
  proficiency: string[]
  spellcastingAbility?: string
  casterProgression?: string
  startingProficiencies: {
    armor?: string[]
    weapons?: string[]
    tools?: string[]
    skills?: Array<{
      choose?: {
        from: string[]
        count: number
      }
    }>
  }
  startingEquipment?: {
    additionalFromBackground?: boolean
    default?: string[]
    goldAlternative?: string
  }
  classTableGroups?: Array<{
    title?: string
    subclasses?: Array<{
      name: string
      source: string
    }>
    colLabels?: string[]
    rows?: Array<string | number>[]
  }>
  classFeatures?: string[]
}

// Item types
export interface Item extends BaseEntry {
  type?: string
  rarity?: string
  reqAttune?: string | boolean
  reqAttuneTags?: Array<{
    class?: string
    race?: string
  }>
  wondrous?: boolean
  weapon?: boolean
  armor?: boolean
  shield?: boolean
  weight?: number
  value?: number
  entries: string[]
  bonusSpellAttack?: string
  bonusSpellSaveDc?: string
  focus?: string[]
}

// Background types
export interface Background extends BaseEntry {
  skillProficiencies?: Array<Record<string, boolean>>
  languageProficiencies?: Array<Record<string, boolean | number>>
  startingEquipment?: Array<{
    _?: Array<{
      item?: string
      special?: string
      quantity?: number
      displayName?: string
      containsValue?: number
    }>
  }>
  entries: Array<{
    name: string
    entries: string[]
    type: string
  }>
}

// Adventure types
export interface Adventure extends BaseEntry {
  id: string
  level?: {
    start: number
    end: number
  }
  storyline?: string
  published?: string
  publishedOrder?: number
  group?: string
  contents?: Array<{
    name: string
    headers?: string[]
  }>
}

// Generic content containers
export interface ContentFile<T> {
  _meta?: {
    internalCopies?: string[]
  }
  [key: string]: T[] | any
}

// Search and filter types
export interface SearchResult {
  item: any
  type: string
  score: number
}

export interface FilterOptions {
  contentType?: string[]
  source?: string[]
  level?: number[]
  rarity?: string[]
  school?: string[]
}

// UI Component types
export interface ContentCardProps {
  content: any
  type: string
  onSelect?: (content: any, type: string) => void
}

export interface NavigationItem {
  id: string
  label: string
  icon?: string
  count?: number
  subcategories?: NavigationItem[]
}