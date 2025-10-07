'use client'

import { useEffect, useMemo, useState } from 'react'

import { classes as fallbackClasses, classMap, type ClassDefinition, type SubclassDefinition } from '@/data/classes'
import { getContentByCategory } from '@/lib/clientDataLoader'
import type { Ability, Skill } from '@/types/character'

const abilityLookup: Record<string, Ability> = {
  str: 'STR',
  strength: 'STR',
  dex: 'DEX',
  dexterity: 'DEX',
  con: 'CON',
  constitution: 'CON',
  int: 'INT',
  intelligence: 'INT',
  wis: 'WIS',
  wisdom: 'WIS',
  cha: 'CHA',
  charisma: 'CHA'
}

const skillLookup: Record<string, Skill> = {
  acrobatics: 'Acrobatics',
  'animal handling': 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  'sleight of hand': 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival'
}

function slugify(value?: string | null): string {
  if (!value) return ''
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeAbility(value: unknown): Ability | undefined {
  if (!value) return undefined
  const key = value.toString().trim().toLowerCase()
  return abilityLookup[key]
}

function normalizeAbilityList(value: unknown): Ability[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeAbility(entry))
      .filter((entry): entry is Ability => Boolean(entry))
  }
  const ability = normalizeAbility(value)
  return ability ? [ability] : []
}

function dedupe<T>(values: (T | undefined | null)[]): T[] {
  const seen = new Set<T>()
  const result: T[] = []
  for (const value of values) {
    if (value === undefined || value === null) continue
    if (seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

function extractText(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value
      .map((entry) => extractText(entry))
      .filter(Boolean)
      .join('\n')
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.entry === 'string') return record.entry
    if (Array.isArray(record.entries)) return extractText(record.entries)
    if (typeof record.text === 'string') return record.text
    if (typeof record.name === 'string' && Array.isArray(record.entries)) {
      const nested = extractText(record.entries)
      return nested ? `${record.name}: ${nested}` : record.name
    }
  }
  return undefined
}

function collectProficiencyStrings(raw: any): string[] {
  const result: string[] = []

  const pushValue = (value: any) => {
    if (!value) return
    if (typeof value === 'string') {
      result.push(value)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => pushValue(entry))
      return
    }
    if (typeof value === 'object') {
      const record = value as Record<string, any>
      if (typeof record.name === 'string') {
        result.push(record.name)
      }
      if (typeof record.entry === 'string') {
        result.push(record.entry)
      }
      if (typeof record.text === 'string') {
        result.push(record.text)
      }
      if (Array.isArray(record.entries)) {
        record.entries.forEach((entry) => pushValue(entry))
      }
      if (Array.isArray(record.from)) {
        record.from.forEach((entry) => pushValue(entry))
      }
    }
  }

  pushValue(raw?.proficiency)
  pushValue(raw?.proficiencies)
  pushValue(raw?.startingProficiency)
  pushValue(raw?.startingProficiencies)
  pushValue(raw?.startingProficiencyOptions)

  return result
}

interface ProficiencyBuckets {
  armor: string[]
  weapons: string[]
  tools: string[]
  other: string[]
  savingThrows: Ability[]
  skillText: string[]
}

function bucketProficiencies(entries: string[]): ProficiencyBuckets {
  const armor: string[] = []
  const weapons: string[] = []
  const tools: string[] = []
  const other: string[] = []
  const savingThrows: Ability[] = []
  const skillText: string[] = []

  for (const entry of entries) {
    if (!entry) continue
    const text = entry.trim()
    const lower = text.toLowerCase()

    if (lower.startsWith('saving throw')) {
      const [, abilities] = text.split(':')
      if (abilities) {
        abilities
          .split(/,|and|\//)
          .map((token) => normalizeAbility(token))
          .filter((token): token is Ability => Boolean(token))
          .forEach((token) => savingThrows.push(token))
      }
      continue
    }

    if (lower.startsWith('skills')) {
      const cleaned = text.replace(/^skills?:\s*/i, '')
      if (cleaned) skillText.push(cleaned)
      continue
    }

    if (lower.startsWith('armor')) {
      armor.push(text.replace(/^armor:\s*/i, ''))
      continue
    }

    if (lower.startsWith('weapons') || lower.startsWith('weapon')) {
      weapons.push(text.replace(/^weapons?:\s*/i, ''))
      continue
    }

    if (lower.startsWith('tools') || lower.includes('tool proficiency')) {
      tools.push(text.replace(/^tools?:\s*/i, ''))
      continue
    }

    other.push(text)
  }

  return {
    armor,
    weapons,
    tools,
    other,
    savingThrows: dedupe(savingThrows),
    skillText
  }
}

function normalizeSkillChoices(
  skillText: string[],
  fallback?: ClassDefinition['skillChoices']
): ClassDefinition['skillChoices'] {
  if (fallback && fallback.count > 0) {
    return fallback
  }

  if (skillText.length === 0) {
    return fallback ?? { count: 0, options: [] }
  }

  const primary = skillText[0]
  const countMatch = primary.match(/choose\s+(one|two|three|four|five|six|seven|eight|\d+)/i)

  let count = 0
  if (countMatch) {
    const keyword = countMatch[1].toLowerCase()
    const wordToNumber: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8
    }
    const resolvedCount = wordToNumber[keyword] ?? Number.parseInt(keyword, 10)
    count = Number.isNaN(resolvedCount) ? 0 : resolvedCount
  }

  const optionsText = primary.replace(/.*choose[^:]*from\s*/i, '')
  const optionCandidates = optionsText.split(/,| or | and /i)
  const options = optionCandidates
    .map((candidate) => skillLookup[candidate.trim().toLowerCase()])
    .filter((entry): entry is Skill => Boolean(entry))

  if (count > 0 && options.length >= count) {
    return { count, options }
  }

  return fallback ?? { count: 0, options: [] }
}

function buildSubclassDefinitions(
  rawSubclasses: any[] | undefined,
  parentId: string,
  fallback: SubclassDefinition[] | undefined
): SubclassDefinition[] {
  if (!Array.isArray(rawSubclasses) || rawSubclasses.length === 0) {
    return fallback ?? []
  }

  const mapped = rawSubclasses.map((entry) => {
    const name = entry?.name ?? entry?.subclass ?? 'Subclass'
    const slug = slugify(name)
    const description = extractText(entry?.entries ?? entry?.description)
    return {
      id: slug ? `${parentId}-${slug}` : `${parentId}-subclass`,
      name,
      description,
      source: entry?.source,
      spellcastingAbility: normalizeAbility(entry?.spellcastingAbility)
    }
  })

  if (fallback && fallback.length > 0) {
    const merged = [...mapped]
    const existing = new Set(merged.map((entry) => entry.id))
    fallback.forEach((entry) => {
      if (!existing.has(entry.id)) {
        merged.push(entry)
      }
    })
    return merged
  }

  return mapped
}

export interface CatalogueClass extends ClassDefinition {
  source?: string
  description?: string
  raw?: any
}

function normalizeClassEntry(raw: any, subclassesForClass: any[]): CatalogueClass {
  const idFromName = slugify(raw?.name)
  const fallback = (idFromName && classMap[idFromName]) || undefined
  const proficiencyEntries = collectProficiencyStrings(raw)
  const buckets = bucketProficiencies(proficiencyEntries)
  const abilityList = normalizeAbilityList(raw?.primaryAbility)

  const armor = dedupe([...(fallback?.armorProficiencies ?? []), ...buckets.armor])
  const weapons = dedupe([...(fallback?.weaponProficiencies ?? []), ...buckets.weapons])
  const tools = dedupe([...(fallback?.toolProficiencies ?? []), ...buckets.tools])
  const other = dedupe([...(fallback?.otherProficiencies ?? []), ...buckets.other])
  const savingThrows = buckets.savingThrows.length > 0 ? buckets.savingThrows : fallback?.savingThrows ?? []
  const skillChoices = normalizeSkillChoices(buckets.skillText, fallback?.skillChoices)

  const subclasses = buildSubclassDefinitions(subclassesForClass, idFromName, fallback?.subclasses)

  const spellcastingAbility = normalizeAbility(raw?.spellcastingAbility) ?? fallback?.spellcastingAbility

  let primaryAbility: ClassDefinition['primaryAbility'] = fallback?.primaryAbility ?? abilityList[0]
  if (abilityList.length > 1) {
    primaryAbility = abilityList
  } else if (abilityList.length === 1) {
    primaryAbility = abilityList[0]
  }

  return {
    id: idFromName || fallback?.id || raw?.id || raw?.slug || 'class',
    name: raw?.name ?? fallback?.name ?? 'Unknown Class',
    primaryAbility,
    hitDie: raw?.hd?.number ?? raw?.hitDie ?? fallback?.hitDie ?? 8,
    savingThrows,
    skillChoices,
    armorProficiencies: armor,
    weaponProficiencies: weapons,
    toolProficiencies: tools,
    otherProficiencies: other,
    spellcastingAbility,
    subclasses,
    subclassLevel: raw?.subclassTitle?.level ?? fallback?.subclassLevel ?? (subclasses.length > 0 ? 3 : undefined),
    featuresByLevel: fallback?.featuresByLevel ?? {},
    asiLevels: fallback?.asiLevels ?? [],
    source: raw?.source,
    description: extractText(raw?.description) ?? extractText(raw?.entries),
    raw
  }
}

function buildCatalogue(rawClasses: any[]): CatalogueClass[] {
  if (!Array.isArray(rawClasses) || rawClasses.length === 0) {
    return fallbackClasses as CatalogueClass[]
  }

  const baseClasses = rawClasses.filter((entry) => !entry?.isSubclass)
  const subclassEntries = rawClasses.filter((entry) => entry?.isSubclass)

  const subclassesByParent = subclassEntries.reduce<Record<string, any[]>>((acc, entry) => {
    const parentName = entry?.parentClass ?? entry?.className ?? entry?.class ?? ''
    const parentId = slugify(parentName)
    if (!parentId) return acc
    if (!acc[parentId]) {
      acc[parentId] = []
    }
    acc[parentId].push(entry)
    return acc
  }, {})

  if (baseClasses.length === 0) {
    return fallbackClasses as CatalogueClass[]
  }

  return baseClasses.map((entry) => {
    const id = slugify(entry?.name)
    const relatedSubclasses = id ? subclassesByParent[id] ?? [] : []
    return normalizeClassEntry(entry, relatedSubclasses)
  })
}

interface UseClassCatalogueResult {
  classes: CatalogueClass[]
  isLoading: boolean
  error?: Error
}

export function useClassCatalogue(): UseClassCatalogueResult {
  const [classes, setClasses] = useState<CatalogueClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const data = await getContentByCategory('classes')
        if (!active) return
        const normalized = buildCatalogue(data)
        setClasses(normalized)
        setError(undefined)
      } catch (err) {
        if (!active) return
        setError(err as Error)
        setClasses(fallbackClasses as CatalogueClass[])
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const sorted = useMemo(() => {
    if (!classes || classes.length === 0) {
      return fallbackClasses as CatalogueClass[]
    }
    return [...classes].sort((a, b) => a.name.localeCompare(b.name))
  }, [classes])

  return { classes: sorted, isLoading, error }
}

export function normalizeClassForDisplay(raw: any): CatalogueClass {
  return normalizeClassEntry(raw, [])
}

