import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mergeClassMetadata } from '../../src/lib/classMetadata.js'
import { buildCharacter } from '../../src/lib/rules/engine.js'
import { FEAT_METADATA } from '../../src/lib/featMetadata.js'
import type { Skill } from '../../src/types/character.js'

const baseAbilities = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10
}

test('buildCharacter applies feat ability increases from resolved decisions', () => {
  const fighter = mergeClassMetadata('fighter', {
    id: 'fighter',
    name: 'Fighter',
    primaryAbility: 'STR',
    hitDie: 10,
    savingThrows: ['STR', 'CON'],
    skillChoices: { count: 0, options: [] },
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    otherProficiencies: [],
    featuresByLevel: {},
    asiLevels: [4]
  })

  const athleteFeat = {
    id: 'athlete',
    name: 'Athlete',
    description: FEAT_METADATA.athlete.description,
    abilityIncreases: FEAT_METADATA.athlete.abilityIncreases,
    features: FEAT_METADATA.athlete.features,
    raw: {}
  }

  const state = {
    id: 'test-character',
    basics: {
      name: 'Test',
      descriptor: '',
      campaignNotes: '',
      alignment: '',
      occupation: '',
      origin: '',
      affiliations: [] as string[]
    },
    abilityMethod: 'manual' as const,
    baseAbilities: { ...baseAbilities },
    ancestryId: undefined,
    ancestryData: undefined,
    backgroundId: undefined,
    backgroundData: undefined,
    classId: fighter.id,
    classData: fighter,
    level: 4,
    resolvedDecisions: {
      [`${fighter.id}-level-1-skills`]: {
        type: 'choose-skill' as const,
        choices: ['Athletics', 'History'] as Skill[]
      },
      [`${fighter.id}-subclass-choice`]: {
        type: 'choose-subclass' as const,
        choice: 'fighter-champion'
      },
      [`${fighter.id}-level-4-asi`]: {
        type: 'asi' as const,
        mode: 'feat' as const,
        featId: 'athlete',
        feat: athleteFeat,
        abilitySelection: 'STR' as const
      }
    }
  }

  const result = buildCharacter(state)

  assert.equal(result.character.abilities.asi.STR, 1)
  assert.ok(result.character.features.some((feature) => feature.id === 'athlete'))
  assert.equal(result.warnings.length, 0)
})
