'use client'

import { useEffect, useMemo, useState } from 'react'

import { mergeClassMetadata } from '../lib/classMetadata'
import { getContentByCategory } from '../lib/clientDataLoader'
import type { CatalogueClass, ClassDefinition, SubclassDefinition } from '../types/catalogue'
import type { Ability, Skill } from '../types/character'

interface UseClassCatalogueResult {
  classes: CatalogueClass[]
  isLoading: boolean
  error?: Error
}

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
  if (typeof value === 'string') {
    return abilityLookup[value.trim().toLowerCase()]
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
    const match = entries.find(([, flag]) => flag === true)
    if (match) {
      return abilityLookup[match[0].trim().toLowerCase()]
    }
  }
  return undefined
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

function coerceArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }
  if (value === undefined || value === null) {
    return []
  }
  return [value as T]
}

function parseSkillChoices(raw: any): ClassDefinition['skillChoices'] | undefined {
  if (!raw) return undefined
  const fromObject = (value: any) => {
    const count = typeof value?.choose?.count === 'number' ? value.choose.count : undefined
    const options: Skill[] = []
    if (Array.isArray(value?.choose?.from)) {
      value.choose.from.forEach((entry: unknown) => {
        if (typeof entry === 'string') {
          const skill = skillLookup[entry.trim().toLowerCase()]
          if (skill) {
            options.push(skill)
          }
          return
        }
        if (typeof entry === 'object' && entry !== null) {
          const item = (entry as { item?: string }).item
          if (typeof item === 'string') {
            const skill = skillLookup[item.trim().toLowerCase()]
            if (skill) {
              options.push(skill)
            }
          }
        }
      })
    }

    if (count && options.length > 0) {
      return { count, options }
    }
    return undefined
  }

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const parsed = parseSkillChoices(entry)
      if (parsed) return parsed
    }
    return undefined
  }

  if (typeof raw === 'object') {
    const parsed = fromObject(raw)
    if (parsed) return parsed
  }

  if (typeof raw === 'string') {
    const match = raw.match(/choose\s+(one|two|three|four|five|six|seven|eight|\d+)/i)
    if (match) {
      const keyword = match[1].toLowerCase()
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
      const count = wordToNumber[keyword] ?? Number.parseInt(keyword, 10)
      if (!Number.isNaN(count)) {
        const optionsText = raw.replace(/.*choose[^:]*from\s*/i, '')
        const options = optionsText
          .split(/,| or | and /i)
    .map((entry): Skill | undefined => skillLookup[entry.trim().toLowerCase()])
    .filter((entry): entry is Skill => Boolean(entry))
        if (options.length >= count) {
          return { count, options }
        }
      }
    }
  }

  return undefined
}

function parseProficiencyList(raw: any, key: string): string[] {
  if (!raw) return []
  const sections = coerceArray<any>(raw)
  const values: string[] = []
  for (const section of sections) {
    if (typeof section !== 'object' || !section) continue
    if (Array.isArray(section[key])) {
      section[key].forEach((entry: unknown) => {
        if (typeof entry === 'string') {
          values.push(entry)
        } else if (typeof entry === 'object' && entry !== null) {
          const name = (entry as { name?: string }).name
          if (typeof name === 'string') {
            values.push(name)
          }
        }
      })
    }
  }
  return dedupe(values)
}

function parseSavingThrows(raw: any): Ability[] | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const parsed = parseSavingThrows(entry)
      if (parsed && parsed.length > 0) {
        return parsed
      }
    }
    return undefined
  }
  if (typeof raw === 'object') {
    const list = parseProficiencyList(raw, 'savingThrows')
    if (list.length > 0) {
      return list
        .map((entry) => abilityLookup[entry.trim().toLowerCase()])
        .filter((entry): entry is Ability => Boolean(entry))
    }
  }
  return undefined
}

function parseHitDie(raw: any, fallbackId: string): number | undefined {
  if (typeof raw === 'string') {
    const match = raw.match(/(\d+)/)
    if (match) {
      return Number.parseInt(match[1], 10)
    }
  }
  if (typeof raw === 'number') {
    return raw
  }
  const match = fallbackId.match(/(d\d+)/)
  if (match) {
    const number = Number.parseInt(match[1].slice(1), 10)
    return Number.isNaN(number) ? undefined : number
  }
  return undefined
}

interface ParsedFeatureData {
  featuresByLevel: Record<number, ClassDefinition['featuresByLevel'][number]>
  asiLevels: number[]
  subclassLevel?: number
}

function parseClassFeatures(
  classId: string,
  rawFeatures: unknown,
  metadata: ClassDefinition['featuresByLevel'] | undefined
): ParsedFeatureData {
  const featuresByLevel: Record<number, ClassDefinition['featuresByLevel'][number]> = {}
  const asiLevels = new Set<number>()
  let subclassLevel: number | undefined

  const metadataFeatures = new Map<string, { feature: ClassDefinition['featuresByLevel'][number][number]; level: number }>()
  if (metadata) {
    Object.entries(metadata).forEach(([levelString, features]) => {
      const level = Number.parseInt(levelString, 10)
      features.forEach((feature) => {
        metadataFeatures.set(feature.id, { feature, level })
      })
    })
  }

  const assignFeature = (level: number, feature: ClassDefinition['featuresByLevel'][number][number]) => {
    if (!featuresByLevel[level]) {
      featuresByLevel[level] = []
    }
    const exists = featuresByLevel[level].some((entry) => entry.id === feature.id)
    if (!exists) {
      featuresByLevel[level].push({ ...feature, source: [...feature.source] })
    }
  }

  const processFeature = (name: string, source: string | undefined, level: number | undefined) => {
    if (!name) return
    const normalizedName = name.trim()
    const slug = slugify(normalizedName) || `${classId}-feature-${level ?? 0}`

    if (/ability score improvement/i.test(normalizedName)) {
      if (typeof level === 'number') {
        asiLevels.add(level)
      }
    }

    const metadataMatch = metadataFeatures.get(slug)
    if (metadataMatch) {
      assignFeature(level ?? metadataMatch.level, metadataMatch.feature)
      return
    }

    if (typeof level === 'number') {
      assignFeature(level, {
        id: slug,
        name: normalizedName,
        source: source ? [source] : [`${classId} ${level}`]
      })
    }
  }

  const entries = coerceArray(rawFeatures)
  for (const entry of entries) {
    if (typeof entry === 'string') {
      const parts = entry.split('|')
      const name = parts[0]
      const source = parts[1]
      const level = parts[3] ? Number.parseInt(parts[3], 10) : undefined
      processFeature(name, source, level)
    } else if (typeof entry === 'object' && entry) {
      const record = entry as { classFeature?: string; gainSubclassFeature?: boolean }
      if (record.classFeature) {
        const parts = record.classFeature.split('|')
        const name = parts[0]
        const source = parts[1]
        const level = parts[3] ? Number.parseInt(parts[3], 10) : undefined
        if (record.gainSubclassFeature && typeof level === 'number') {
          subclassLevel = typeof subclassLevel === 'number' ? Math.min(subclassLevel, level) : level
        }
        processFeature(name, source, level)
      }
    }
  }

  return {
    featuresByLevel,
    asiLevels: Array.from(asiLevels).sort((a, b) => a - b),
    subclassLevel
  }
}

function aggregateClassEntries(id: string, entries: any[]): any {
  if (entries.length === 0) {
    return { __catalogueId: id }
  }

  const base = { ...entries[0] }
  base.__catalogueId = id
  base.classFeatures = entries.flatMap((entry) => coerceArray(entry?.classFeatures))

  const primaryAbilityEntry = entries.find((entry) => entry?.primaryAbility) ?? entries[0]
  base.primaryAbility = primaryAbilityEntry?.primaryAbility

  const profEntry = entries.find((entry) => entry?.proficiencies)
  if (profEntry?.proficiencies) {
    base.proficiencies = profEntry.proficiencies
  }

  const spellEntry = entries.find((entry) => entry?.spellcasting)
  if (spellEntry?.spellcasting) {
    base.spellcasting = spellEntry.spellcasting
  }

  base.rawEntries = entries
  return base
}

function normalizeClassEntry(raw: any): CatalogueClass {
  const id = typeof raw?.__catalogueId === 'string' && raw.__catalogueId ? raw.__catalogueId : slugify(raw?.name) || 'class'
  const name = typeof raw?.name === 'string' ? raw.name : 'Unknown Class'

  const abilityList = normalizeAbilityList(raw?.primaryAbility)
  let primaryAbility: ClassDefinition['primaryAbility'] | undefined
  if (abilityList.length === 1) {
    primaryAbility = abilityList[0]
  } else if (abilityList.length > 1) {
    primaryAbility = abilityList
  }

  const metadata = mergeClassMetadata(id, {
    id,
    name,
    primaryAbility: primaryAbility ?? (Array.isArray(abilityList) && abilityList.length > 0 ? abilityList[0] : undefined),
    hitDie: parseHitDie(raw?.hitDice, id),
    savingThrows: parseSavingThrows(raw?.proficiencies),
    skillChoices: parseSkillChoices(raw?.proficiencies),
    armorProficiencies: parseProficiencyList(raw?.proficiencies, 'armor') ?? [],
    weaponProficiencies: parseProficiencyList(raw?.proficiencies, 'weapons') ?? [],
    toolProficiencies: parseProficiencyList(raw?.proficiencies, 'tools') ?? [],
    otherProficiencies: parseProficiencyList(raw?.proficiencies, 'other') ?? [],
    spellcastingAbility: normalizeAbility(raw?.spellcasting?.ability),
    subclasses: undefined,
    subclassLevel: undefined,
    featuresByLevel: {},
    asiLevels: [],
    description: extractText(raw?.description ?? raw?.entries),
    source: raw?.source,
    raw
  })

  const parsedFeatures = parseClassFeatures(id, raw?.classFeatures, metadata.featuresByLevel)

  return {
    ...metadata,
    primaryAbility: primaryAbility ?? metadata.primaryAbility,
    hitDie: metadata.hitDie ?? 8,
    savingThrows: metadata.savingThrows ?? [],
    skillChoices: metadata.skillChoices ?? { count: 0, options: [] },
    armorProficiencies: metadata.armorProficiencies ?? [],
    weaponProficiencies: metadata.weaponProficiencies ?? [],
    toolProficiencies: metadata.toolProficiencies ?? [],
    otherProficiencies: metadata.otherProficiencies,
    spellcastingAbility: metadata.spellcastingAbility,
    subclasses: metadata.subclasses,
    subclassLevel: metadata.subclassLevel ?? parsedFeatures.subclassLevel,
    featuresByLevel: Object.keys(parsedFeatures.featuresByLevel).length > 0 ? parsedFeatures.featuresByLevel : metadata.featuresByLevel,
    asiLevels: parsedFeatures.asiLevels.length > 0 ? parsedFeatures.asiLevels : metadata.asiLevels,
    description: metadata.description,
    source: metadata.source,
    raw
  }
}

function buildCatalogue(rawClasses: any[]): CatalogueClass[] {
  if (!Array.isArray(rawClasses) || rawClasses.length === 0) {
    return []
  }

  const groups = new Map<string, any[]>()
  rawClasses.forEach((entry) => {
    const slug = slugify(entry?.name) || (typeof entry?.id === 'string' ? slugify(entry.id) : '')
    const id = slug || `class-${groups.size + 1}`
    if (!groups.has(id)) {
      groups.set(id, [])
    }
    groups.get(id)!.push(entry)
  })

  const normalized: CatalogueClass[] = []
  for (const [id, entries] of groups.entries()) {
    const aggregated = aggregateClassEntries(id, entries)
    normalized.push(normalizeClassEntry(aggregated))
  }

  return normalized
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
        setClasses([])
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const sorted = useMemo(() => {
    if (!classes || classes.length === 0) {
      return []
    }
    return [...classes].sort((a, b) => a.name.localeCompare(b.name))
  }, [classes])

  return { classes: sorted, isLoading, error }
}

export function normalizeClassForDisplay(raw: any): CatalogueClass {
  const slug = slugify(raw?.name) || 'class'
  const aggregated = aggregateClassEntries(slug, [raw])
  return normalizeClassEntry(aggregated)
}

export const __testUtils = {
  buildCatalogue,
  normalizeClassEntry,
  aggregateClassEntries
}
