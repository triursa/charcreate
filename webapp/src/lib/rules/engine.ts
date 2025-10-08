import { abilityList, abilityMod, proficiencyBonus } from '../abilities'
import type { CharacterBuilderState, ResolvedDecisionValue } from '../../state/character-builder'
import type { CatalogueClass, FeatDefinition } from '../../types/catalogue'
import type { AbilityScoreEntry, AncestryRecord, BackgroundRecord, EntryLike, StructuredEntry } from '../../types/character-builder'
import type { Character, Decision, FeatureInstance, LevelSnapshot } from '../../types/character'
import type { Ability, Skill } from '../../types/character'
import { skillNames } from '../../types/character'
import type { OptionalFeatureRecord } from '../../types/optional-features'

interface BuildResult {
  character: Character
  pendingDecisions: Decision[]
  warnings: string[]
}

interface SkillDecisionValue {
  type: 'choose-skill'
  choices: Skill[]
}

interface AsiDecisionAbilityValue {
  type: 'asi'
  mode: 'ability'
  abilities: Ability[]
}

interface AsiDecisionFeatValue {
  type: 'asi'
  mode: 'feat'
  featId: string
  feat?: FeatDefinition
  abilitySelection?: Ability
}

type DecisionValue = SkillDecisionValue | AsiDecisionAbilityValue | AsiDecisionFeatValue | ResolvedDecisionValue

interface BuildOptions {
  optionalFeaturesByType?: Record<string, OptionalFeatureRecord[]>
  optionalFeaturesById?: Record<string, OptionalFeatureRecord>
}

interface OptionalFeatureUnlock {
  decisionKey: string
  featureType: string
  level: number
  count: number
  label?: string
  progressionId?: string
}

const averageHitDie: Record<number, number> = {
  6: 4,
  8: 5,
  10: 6,
  12: 7
}

const skillNameSet = new Set<string>(skillNames)

function isSkillName(value: string): value is Skill {
  return skillNameSet.has(value)
}

function isStructuredEntry(value: unknown): value is StructuredEntry {
  return typeof value === 'object' && value !== null
}

function isAbilityScoreEntry(value: unknown): value is AbilityScoreEntry {
  return isStructuredEntry(value)
}

function extractAbilityBonuses(record: AncestryRecord): Record<string, number> {
  const bonuses: Record<string, number> = {}

  const applyEntry = (entry: AbilityScoreEntry) => {
    Object.entries(entry).forEach(([ability, value]) => {
      if (ability === 'choose' || ability === 'entries' || ability === 'from') {
        return
      }
      if (typeof value === 'number') {
        bonuses[ability] = (bonuses[ability] ?? 0) + value
      }
    })
  }

  const ability = record.ability
  if (Array.isArray(ability)) {
    ability.forEach((entry) => {
      if (isAbilityScoreEntry(entry)) {
        applyEntry(entry)
      }
    })
  } else if (isAbilityScoreEntry(ability)) {
    applyEntry(ability)
  }

  if (record.abilityBonuses) {
    Object.entries(record.abilityBonuses).forEach(([ability, value]) => {
      if (typeof value === 'number') {
        bonuses[ability] = (bonuses[ability] ?? 0) + value
      }
    })
  }

  return bonuses
}

function collectGrantedStrings(value: EntryLike | undefined): string[] {
  if (!value) return []
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectGrantedStrings(entry)).filter(Boolean)
  }
  if (isStructuredEntry(value)) {
    const results: string[] = []
    if (value.entries) {
      results.push(...collectGrantedStrings(value.entries))
    }
    Object.entries(value).forEach(([key, nested]) => {
      if (key === 'choose' || key === 'from' || key === 'entries') {
        return
      }
      if (typeof nested === 'string') {
        results.push(nested)
      } else if (Array.isArray(nested)) {
        nested.forEach((item) => {
          if (typeof item === 'string') {
            results.push(item)
          }
        })
      } else if (isStructuredEntry(nested)) {
        results.push(...collectGrantedStrings(nested as EntryLike))
      }
    })
    return results
  }
  return []
}

interface ChoicePrompt {
  options: string[]
  count: number
}

function collectChoicePrompts(value: EntryLike | undefined): ChoicePrompt[] {
  if (!value) return []
  if (typeof value === 'string') return []
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectChoicePrompts(entry))
  }
  if (isStructuredEntry(value)) {
    const results: ChoicePrompt[] = []
    const choose = value.choose
    const options = Array.isArray(choose?.from)
      ? choose.from.filter((item): item is string => typeof item === 'string')
      : []
    if (choose && options.length > 0) {
      results.push({ options, count: choose.count ?? 1 })
    }
    if (value.entries) {
      results.push(...collectChoicePrompts(value.entries))
    }
    Object.entries(value).forEach(([key, nested]) => {
      if (key === 'choose' || key === 'from' || key === 'entries') {
        return
      }
      if (Array.isArray(nested) || isStructuredEntry(nested)) {
        results.push(...collectChoicePrompts(nested as EntryLike))
      }
    })
    return results
  }
  return []
}

function collectOptionalFeatureUnlocks(cls: CatalogueClass | undefined): OptionalFeatureUnlock[] {
  if (!cls || !Array.isArray(cls.optionalFeatureProgression)) {
    return []
  }

  const unlocks: OptionalFeatureUnlock[] = []

  cls.optionalFeatureProgression.forEach((entry) => {
    const featureTypes = Array.isArray(entry.featureTypes)
      ? entry.featureTypes
          .map((type) => (typeof type === 'string' ? type.trim() : ''))
          .filter((type) => type.length > 0)
      : []
    if (featureTypes.length === 0 || !Array.isArray(entry.progression)) {
      return
    }

    entry.progression.forEach((step, index) => {
      if (!step || typeof step !== 'object') {
        return
      }
      const levelValue = (step as { level?: unknown }).level
      const level = typeof levelValue === 'number' ? levelValue : Number.parseInt(String(levelValue ?? ''), 10)
      if (!Number.isFinite(level) || level <= 0) {
        return
      }
      const countValue = (step as { count?: unknown }).count
      const knownValue = (step as { known?: unknown }).known
      const rawCount =
        typeof countValue === 'number' && countValue > 0
          ? countValue
          : typeof knownValue === 'number' && knownValue > 0
            ? knownValue
            : 0
      const count = Math.max(0, Math.floor(rawCount))
      if (count <= 0) {
        return
      }

      featureTypes.forEach((featureType) => {
        unlocks.push({
          decisionKey: `${entry.id}-${index}`,
          featureType,
          level,
          count,
          label: entry.name,
          progressionId: entry.id
        })
      })
    })
  })

  return unlocks
}

function buildOptionalFeatureInstance(
  record: OptionalFeatureRecord,
  cls: CatalogueClass,
  level: number,
  label?: string
): FeatureInstance {
  const className = cls.name ?? cls.id
  const baseSource = `${className} Level ${level} Optional Feature${label ? `: ${label}` : ''}`
  const sources = record.source ? [baseSource, `Source: ${record.source}`] : [baseSource]
  return {
    id: record.id,
    name: record.name,
    source: sources,
    description: record.description,
    mergeStrategy: 'set'
  }
}

function validateOptionalFeatureSelection(
  selection: string[] | undefined,
  options: OptionalFeatureRecord[],
  count: number
): string[] | null {
  if (!selection) {
    return null
  }
  const filtered = selection.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const unique = Array.from(new Set(filtered))
  if (unique.length !== count) {
    return null
  }
  const optionIds = new Set(options.map((option) => option.id))
  if (unique.some((choice) => !optionIds.has(choice))) {
    return null
  }
  return unique
}

function normalizeFeature(feature: unknown): FeatureInstance | null {
  if (!feature || typeof feature !== 'object') {
    return null
  }

  const { id, name } = feature as { id?: unknown; name?: unknown }
  if (typeof id !== 'string' || typeof name !== 'string') {
    return null
  }

  const sourceValue = (feature as { source?: unknown }).source
  const source = Array.isArray(sourceValue)
    ? sourceValue.filter((entry): entry is string => typeof entry === 'string')
    : []

  const description = typeof (feature as { description?: unknown }).description === 'string'
    ? ((feature as { description?: string }).description)
    : undefined

  const payloadValue = (feature as { payload?: unknown }).payload
  const payload =
    payloadValue && typeof payloadValue === 'object'
      ? (payloadValue as Record<string, unknown>)
      : undefined

  const mergeStrategyValue = (feature as { mergeStrategy?: unknown }).mergeStrategy
  const mergeStrategy =
    mergeStrategyValue === 'max' ||
    mergeStrategyValue === 'sum' ||
    mergeStrategyValue === 'set' ||
    mergeStrategyValue === 'custom'
      ? mergeStrategyValue
      : undefined

  return {
    id,
    name,
    source,
    description,
    payload,
    mergeStrategy
  }
}

function extractSpeedValue(speed: AncestryRecord['speed']): number | undefined {
  if (!speed) {
    return undefined
  }
  if (typeof speed === 'number') {
    return speed
  }
  if (typeof speed.walk === 'number') {
    return speed.walk
  }
  return undefined
}

function emptyAbilityRecord(): Record<Ability, number> {
  return abilityList.reduce((acc, ability) => {
    acc[ability] = 0
    return acc
  }, {} as Record<Ability, number>)
}

function mergeFeatures(features: FeatureInstance[]): FeatureInstance[] {
  const map = new Map<string, FeatureInstance>()
  for (const feature of features) {
    const existing = map.get(feature.id)
    if (!existing) {
      map.set(feature.id, {
        ...feature,
        source: [...feature.source]
      })
      continue
    }

    const mergedSources = Array.from(new Set([...existing.source, ...feature.source]))

    let payload = existing.payload
    if (feature.payload) {
      payload = { ...(existing.payload ?? {}), ...feature.payload }
      if (feature.mergeStrategy === 'max' && existing.payload && feature.payload) {
        const existingRange = typeof existing.payload.range === 'number' ? (existing.payload.range as number) : undefined
        const newRange = typeof feature.payload.range === 'number' ? (feature.payload.range as number) : undefined
        if (existingRange !== undefined || newRange !== undefined) {
          payload = {
            ...payload,
            range: Math.max(existingRange ?? 0, newRange ?? 0)
          }
        }
      }
      if (feature.mergeStrategy === 'sum' && existing.payload && feature.payload) {
        const existingValue = typeof existing.payload.value === 'number' ? (existing.payload.value as number) : 0
        const newValue = typeof feature.payload.value === 'number' ? (feature.payload.value as number) : 0
        payload = {
          ...payload,
          value: existingValue + newValue
        }
      }
    }

    map.set(feature.id, {
      ...existing,
      description: existing.description ?? feature.description,
      payload,
      source: mergedSources
    })
  }
  return Array.from(map.values())
}

function validateSkillSelection(selection: Skill[], options: Skill[], count: number): Skill[] | null {
  const unique = Array.from(new Set(selection))
  if (unique.length !== count) return null
  for (const skill of unique) {
    if (!options.includes(skill)) {
      return null
    }
  }
  return unique
}

function validateAsiAbilitySelection(selection: Ability[]): Ability[] | null {
  if (selection.length !== 2) return null
  const filtered = selection.filter((ability) => abilityList.includes(ability))
  if (filtered.length !== selection.length) return null
  return filtered
}

function applyFeatEffects(
  featValue: AsiDecisionFeatValue,
  abilityBonuses: Record<Ability, number>,
  totalAbilities: Record<Ability, number>,
  features: FeatureInstance[]
) {
  const feat = featValue.feat
  if (!feat) return

  if (feat.abilityIncreases) {
    const availableAbilities = Object.entries(feat.abilityIncreases)
      .filter(([, amount]) => typeof amount === 'number' && amount > 0)
      .map(([ability]) => ability as Ability)

    if (availableAbilities.length === 1) {
      const ability = availableAbilities[0]
      const bonus = feat.abilityIncreases[ability] ?? 0
      abilityBonuses[ability] += bonus
      totalAbilities[ability] += bonus
    } else if (availableAbilities.length > 1) {
      const selected = featValue.abilitySelection
      if (selected && availableAbilities.includes(selected)) {
        const bonus = feat.abilityIncreases[selected] ?? 0
        abilityBonuses[selected] += bonus
        totalAbilities[selected] += bonus
      }
    }
  }

  if (feat.features) {
    for (const feature of feat.features) {
      features.push({ ...feature, source: [...feature.source] })
    }
  } else if (feat.description) {
    features.push({
      id: `feat-${featValue.featId}`,
      name: feat.name,
      source: [`Feat: ${feat.name}`],
      description: feat.description,
      mergeStrategy: 'set'
    })
  }
}

export function buildCharacter(state: CharacterBuilderState, options: BuildOptions = {}): BuildResult {
  const ancestry: AncestryRecord | undefined = state.ancestryData
  const background: BackgroundRecord | undefined = state.backgroundData
  const cls: CatalogueClass | undefined = state.classData

  const optionalFeaturesByType = options.optionalFeaturesByType ?? {}
  const optionalFeaturesById = options.optionalFeaturesById ?? {}

  const racialBonuses = emptyAbilityRecord()
  if (ancestry) {
    const abilityBonuses = extractAbilityBonuses(ancestry)
    for (const [ability, bonus] of Object.entries(abilityBonuses)) {
      if (typeof bonus !== 'number') {
        continue
      }
      const key = ability.toUpperCase() as Ability
      if (abilityList.includes(key)) {
        racialBonuses[key] = (racialBonuses[key] ?? 0) + bonus
      }
    }
  }

  const asiBonuses = emptyAbilityRecord()
  const totalAbilities: Record<Ability, number> = { ...state.baseAbilities }
  for (const ability of abilityList) {
    totalAbilities[ability] = (totalAbilities[ability] ?? 0) + racialBonuses[ability]
  }

  const features: FeatureInstance[] = []
  const languages = new Set<string>()
  const skillProficiencies = new Set<Skill>()
  const armorProficiencies = new Set<string>()
  const weaponProficiencies = new Set<string>()
  const toolProficiencies = new Set<string>()
  const otherProficiencies = new Set<string>()
  const pendingDecisions: Decision[] = []
  const warnings: string[] = []
  const history: LevelSnapshot[] = []
  const optionalFeatureWarnings = new Set<string>()

  const optionalFeatureUnlocks = collectOptionalFeatureUnlocks(cls)
  const optionalUnlocksByLevel = new Map<number, OptionalFeatureUnlock[]>()
  optionalFeatureUnlocks.forEach((unlock) => {
    if (!optionalUnlocksByLevel.has(unlock.level)) {
      optionalUnlocksByLevel.set(unlock.level, [])
    }
    optionalUnlocksByLevel.get(unlock.level)!.push(unlock)
  })

  if (ancestry) {
    collectGrantedStrings(ancestry.languages).forEach((language) => {
      languages.add(language)
    })
    collectGrantedStrings(ancestry.languageProficiencies).forEach((language) => {
      languages.add(language)
    })

    if (Array.isArray(ancestry.features)) {
      ancestry.features.forEach((feature) => {
        const normalized = normalizeFeature(feature)
        if (normalized) {
          features.push({ ...normalized, source: [...normalized.source] })
        }
      })
    }

    if (Array.isArray(ancestry.skillProficiencies)) {
      ancestry.skillProficiencies.forEach((entry) => {
        if (typeof entry === 'string') {
          if (isSkillName(entry)) {
            skillProficiencies.add(entry)
          }
          return
        }

        collectGrantedStrings(entry).forEach((skillName) => {
          if (isSkillName(skillName)) {
            skillProficiencies.add(skillName)
          }
        })
      })
    }
  }

  // Apply background bonuses and features
  if (background) {
    collectGrantedStrings(background.skillProficiencies).forEach((skillName) => {
      if (isSkillName(skillName)) {
        skillProficiencies.add(skillName)
      }
    })

    collectGrantedStrings(background.toolProficiencies).forEach((tool) => {
      toolProficiencies.add(tool)
    })

    collectGrantedStrings(background.languages).forEach((lang) => {
      languages.add(lang)
    })

    if (background.feature) {
      if (Array.isArray(background.feature)) {
        background.feature.forEach((feature) => {
          const normalized = normalizeFeature(feature)
          if (normalized) {
            features.push({ ...normalized, source: [...normalized.source] })
          }
        })
      } else {
        const normalized = normalizeFeature(background.feature)
        if (normalized) {
          features.push({ ...normalized, source: [...normalized.source] })
        }
      }
    }

    collectChoicePrompts(background.skillProficiencies).forEach((prompt, index) => {
      const options = prompt.options.filter(isSkillName)
      if (options.length > 0) {
        pendingDecisions.push({
          id: `background-skill-${background.id}-${index}`,
          type: 'choose-skill',
          options,
          min: prompt.count,
          max: prompt.count,
          label: `Choose ${prompt.count} background skill(s)`
        })
      }
    })

    collectChoicePrompts(background.languages).forEach((prompt, index) => {
      if (prompt.options.length > 0) {
        pendingDecisions.push({
          id: `background-language-${background.id}-${index}`,
          type: 'choose-language',
          options: prompt.options,
          min: prompt.count,
          max: prompt.count,
          label: `Choose ${prompt.count} background language(s)`
        })
      }
    })

    collectChoicePrompts(background.toolProficiencies).forEach((prompt, index) => {
      if (prompt.options.length > 0) {
        pendingDecisions.push({
          id: `background-tool-${background.id}-${index}`,
          type: 'choose-tool',
          options: prompt.options,
          min: prompt.count,
          max: prompt.count,
          label: `Choose ${prompt.count} background tool(s)`
        })
      }
    })
  }

  let hp = 0
  let totalLevelsProcessed = 0

  if (cls && state.level > 0) {
    if (Array.isArray(cls.armorProficiencies)) {
      cls.armorProficiencies.forEach((prof: any) => armorProficiencies.add(prof))
    }
    if (Array.isArray(cls.weaponProficiencies)) {
      cls.weaponProficiencies.forEach((prof: any) => weaponProficiencies.add(prof))
    }
    if (Array.isArray(cls.toolProficiencies)) {
      cls.toolProficiencies.forEach((prof: any) => toolProficiencies.add(prof))
    }
    if (Array.isArray(cls.otherProficiencies)) {
      cls.otherProficiencies.forEach((prof: any) => otherProficiencies.add(prof))
    }
  }

  const subclassOptions = cls?.subclasses ?? []
  const subclassLevel = cls?.subclassLevel ?? 0
  const subclassDecisionId = cls ? `${cls.id}-subclass-choice` : undefined
  let chosenSubclassId: string | undefined

  for (let level = 1; level <= state.level; level += 1) {
    if (!cls) {
      warnings.push('Select a class to complete level progression.')
      break
    }

    totalLevelsProcessed = level
    const snapshot: LevelSnapshot = {
      level,
      classId: cls.id,
      hpGained: 0,
      featuresGained: [],
      decisionsRaised: []
    }

    const conMod = abilityMod(totalAbilities.CON ?? 10)
    const hitDie = cls.hitDie
    const levelHp = level === 1 ? Math.max(hitDie, hitDie + conMod) : Math.max(1, (averageHitDie[hitDie] ?? Math.ceil(hitDie / 2)) + conMod)
    hp += levelHp
    snapshot.hpGained = levelHp

    const levelFeatures = cls.featuresByLevel[level] ?? []
    levelFeatures.forEach((feature) => {
      const sourced = { ...feature, source: [...feature.source] }
      features.push(sourced)
      snapshot.featuresGained.push(sourced)
    })

    const optionalUnlocks = optionalUnlocksByLevel.get(level) ?? []
    optionalUnlocks.forEach((unlock) => {
      const decisionId = `${cls.id}-optional-${unlock.decisionKey}-level-${level}`
      const optionsForType = optionalFeaturesByType[unlock.featureType] ?? []
      const pickCount = Math.max(1, unlock.count)
      const labelSuffix = unlock.label ? ` (${unlock.label})` : ''
      const decision: Decision = {
        id: decisionId,
        type: 'choose-optional-feature',
        options: optionsForType,
        min: pickCount,
        max: pickCount,
        label: `Choose ${pickCount} optional feature${pickCount === 1 ? '' : 's'}${labelSuffix}`,
        featureType: unlock.featureType,
        progressionId: unlock.progressionId,
        level
      }
      snapshot.decisionsRaised.push(decision)

      if (optionsForType.length === 0) {
        optionalFeatureWarnings.add(
          `No optional features available for ${cls.name} (${unlock.featureType}) at level ${level}.`
        )
      } else if (optionsForType.length < pickCount) {
        optionalFeatureWarnings.add(
          `Only ${optionsForType.length} optional feature${optionsForType.length === 1 ? '' : 's'} available for ${cls.name} (${unlock.featureType}) at level ${level}; ${pickCount} required.`
        )
      }

      const resolved = state.resolvedDecisions[decisionId] as DecisionValue | undefined
      if (resolved && resolved.type === 'choose-optional-feature' && resolved.featureType === unlock.featureType) {
        const valid = validateOptionalFeatureSelection(resolved.choices, optionsForType, pickCount)
        if (valid) {
          valid.forEach((choiceId) => {
            const record = optionalFeaturesById[choiceId] ?? optionsForType.find((option) => option.id === choiceId)
            if (!record) {
              optionalFeatureWarnings.add(
                `Missing data for optional feature "${choiceId}" (${cls.name} level ${level}).`
              )
              return
            }
            const featureInstance = buildOptionalFeatureInstance(record, cls, level, unlock.label)
            const cloned = { ...featureInstance, source: [...featureInstance.source] }
            features.push(cloned)
            snapshot.featuresGained.push({ ...cloned, source: [...cloned.source] })
          })
          return
        }
      }

      pendingDecisions.push(decision)
    })

    if (level === 1 && cls.skillChoices) {
      const decisionId = `${cls.id}-level-${level}-skills`
      const decision: Decision = {
        id: decisionId,
        type: 'choose-skill',
        options: cls.skillChoices.options,
        min: cls.skillChoices.count,
        max: cls.skillChoices.count,
        label: `Choose ${cls.skillChoices.count} class skills`
      }
      snapshot.decisionsRaised.push(decision)

      const resolved = state.resolvedDecisions[decisionId] as DecisionValue | undefined
      if (resolved && resolved.type === 'choose-skill') {
        const valid = validateSkillSelection(resolved.choices, cls.skillChoices.options, cls.skillChoices.count)
        if (valid) {
          valid.forEach((skill) => skillProficiencies.add(skill))
        } else {
          pendingDecisions.push(decision)
        }
      } else {
        pendingDecisions.push(decision)
      }
    }

    if (cls.asiLevels.includes(level)) {
      const decisionId = `${cls.id}-level-${level}-asi`
      const decision: Decision = {
        id: decisionId,
        type: 'asi',
        options: abilityList,
        min: 2,
        max: 2,
        label: 'Ability Score Improvement or Feat'
      }
      snapshot.decisionsRaised.push(decision)

      const resolved = state.resolvedDecisions[decisionId] as DecisionValue | undefined
      if (resolved && resolved.type === 'asi') {
        if (resolved.mode === 'ability') {
          const valid = validateAsiAbilitySelection(resolved.abilities)
          if (valid) {
            valid.forEach((ability) => {
              asiBonuses[ability] += 1
              totalAbilities[ability] += 1
            })
          } else {
            pendingDecisions.push(decision)
          }
        } else if (resolved.mode === 'feat') {
          applyFeatEffects(resolved, asiBonuses, totalAbilities, features)
        }
      } else {
        pendingDecisions.push(decision)
      }
    }

    if (subclassOptions.length > 0 && subclassDecisionId && subclassLevel > 0 && level === subclassLevel) {
      const decision: Decision = {
        id: subclassDecisionId,
        type: 'choose-subclass',
        options: subclassOptions,
        min: 1,
        max: 1,
        label: 'Choose a subclass'
      }
      snapshot.decisionsRaised.push(decision)

      const resolved = state.resolvedDecisions[subclassDecisionId] as DecisionValue | undefined
      if (resolved && resolved.type === 'choose-subclass') {
        chosenSubclassId = resolved.choice
      } else if (subclassOptions.length === 1) {
        chosenSubclassId = subclassOptions[0]?.id
      } else {
        pendingDecisions.push(decision)
      }
    }

    history.push(snapshot)
  }

  const proficiency = proficiencyBonus(state.level)

  const abilityTotals: Record<Ability, number> = emptyAbilityRecord()
  abilityList.forEach((ability) => {
    abilityTotals[ability] = (state.baseAbilities[ability] ?? 10) + racialBonuses[ability] + asiBonuses[ability]
  })

  const perceptionProficient = skillProficiencies.has('Perception')
  const passivePerception = 10 + abilityMod(abilityTotals.WIS ?? 10) + (perceptionProficient ? proficiency : 0)
  const ac = 10 + abilityMod(abilityTotals.DEX ?? 10)

  const character: Character = {
    id: state.id,
    name: state.basics.name,
    descriptor: state.basics.descriptor,
    overview: {
      fullName: state.basics.name,
      race: ancestry?.name,
      alignment: state.basics.alignment,
      occupation: state.basics.occupation,
      origin: state.basics.origin,
      affiliations: state.basics.affiliations,
      campaignNotes: state.basics.campaignNotes
    },
    abilities: {
      base: { ...state.baseAbilities },
      racial: racialBonuses,
      asi: asiBonuses,
      total: abilityTotals
    },
    level: totalLevelsProcessed,
    classes: cls
      ? [
          {
            classId: cls.id,
            levels: totalLevelsProcessed,
            subclassId: chosenSubclassId
          }
        ]
      : [],
    profBonus: proficiency,
    hp,
    ac,
    speed: extractSpeedValue(ancestry?.speed) ?? 30,
    passivePerception,
    saves: {
      proficient: cls ? [...cls.savingThrows] : []
    },
    skills: {
      proficient: Array.from(skillProficiencies)
    },
    languages: Array.from(languages),
    proficiencies: {
      armor: Array.from(armorProficiencies),
      weapons: Array.from(weaponProficiencies),
      tools: Array.from(toolProficiencies),
      other: Array.from(otherProficiencies)
    },
    features: mergeFeatures(features),
    decisions: pendingDecisions,
    history
  }

  if (optionalFeatureWarnings.size > 0) {
    optionalFeatureWarnings.forEach((message) => warnings.push(message))
  }

  if (pendingDecisions.length > 0) {
    const examples = pendingDecisions
      .slice(0, 3)
      .map((decision) => decision.label ?? decision.id.replace(/[-_]/g, ' '))
    const exampleText = examples.length > 0 ? ` (e.g., ${examples.join(', ')})` : ''
    const summary = pendingDecisions.length === 1 ? 'pending decision' : `${pendingDecisions.length} pending decisions`
    warnings.push(`Resolve ${summary} before exporting${exampleText}.`)
  }

  return {
    character,
    pendingDecisions,
    warnings
  }
}
