import { abilityList, abilityMod, proficiencyBonus } from '@/lib/abilities'
import { ancestryMap } from '@/data/ancestries'
import { classMap } from '@/data/classes'
import { featMap } from '@/data/feats'
import type { Character, Decision, FeatureInstance, LevelSnapshot } from '@/types/character'
import type { Ability, Skill } from '@/types/character'
import type { CharacterBuilderState, ResolvedDecisionValue } from '@/state/character-builder'

interface BuildResult {
  character: Character
  pendingDecisions: Decision[]
  warnings: string[]
}

interface SkillDecisionValue extends ResolvedDecisionValue {
  type: 'choose-skill'
  choices: Skill[]
}

interface AsiDecisionAbilityValue extends ResolvedDecisionValue {
  type: 'asi'
  mode: 'ability'
  abilities: Ability[]
}

interface AsiDecisionFeatValue extends ResolvedDecisionValue {
  type: 'asi'
  mode: 'feat'
  featId: string
  abilitySelection?: Ability
}

type DecisionValue = SkillDecisionValue | AsiDecisionAbilityValue | AsiDecisionFeatValue | ResolvedDecisionValue

const averageHitDie: Record<number, number> = {
  6: 4,
  8: 5,
  10: 6,
  12: 7
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
  const feat = featMap[featValue.featId]
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
  }
}

export function buildCharacter(state: CharacterBuilderState): BuildResult {
  const ancestry = state.ancestryId ? ancestryMap[state.ancestryId] : undefined
  const cls = state.classId ? classMap[state.classId] : undefined

  const racialBonuses = emptyAbilityRecord()
  if (ancestry) {
    for (const [ability, bonus] of Object.entries(ancestry.abilityBonuses)) {
      const key = ability as Ability
      racialBonuses[key] = (racialBonuses[key] ?? 0) + (bonus ?? 0)
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
  const pendingDecisions: Decision[] = []
  const warnings: string[] = []
  const history: LevelSnapshot[] = []

  if (ancestry) {
    ancestry.languages.forEach((language) => languages.add(language))
    ancestry.features.forEach((feature) => {
      features.push({ ...feature, source: [...feature.source] })
    })
    ancestry.skillProficiencies?.forEach((skill) => skillProficiencies.add(skill))
  }

  let hp = 0
  let totalLevelsProcessed = 0

  if (cls && state.level > 0) {
    armorProficiencies.add(...cls.armorProficiencies)
    weaponProficiencies.add(...cls.weaponProficiencies)
    toolProficiencies.add(...cls.toolProficiencies)
  }

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
    classes: cls ? [{ classId: cls.id, levels: totalLevelsProcessed }] : [],
    profBonus: proficiency,
    hp,
    ac,
    speed: ancestry?.speed ?? 30,
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
      tools: Array.from(toolProficiencies)
    },
    features: mergeFeatures(features),
    decisions: pendingDecisions,
    history
  }

  return {
    character,
    pendingDecisions,
    warnings
  }
}
