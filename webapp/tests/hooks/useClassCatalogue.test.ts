import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mergeClassMetadata } from '../../src/lib/classMetadata.js'
import { __testUtils as classTestUtils } from '../../src/hooks/useClassCatalogue.js'

test('buildCatalogue merges duplicate class entries and retains metadata', () => {
  const rawClasses = [
    {
      name: 'Fighter',
      classFeatures: ['Fighting Style|Fighter||1', 'Ability Score Improvement|Fighter||4']
    },
    {
      name: 'Fighter',
      primaryAbility: [{ str: true }, { dex: true }]
    }
  ]

  const catalogue = classTestUtils.buildCatalogue(rawClasses)
  assert.equal(catalogue.length, 1)

  const fighter = catalogue[0]
  assert.equal(fighter.id, 'fighter')
  assert.equal(fighter.name, 'Fighter')
  if (Array.isArray(fighter.primaryAbility)) {
    assert.ok(fighter.primaryAbility.includes('STR'))
  } else {
    assert.equal(fighter.primaryAbility, 'STR')
  }
  assert.ok(fighter.featuresByLevel[1], 'features from metadata should be present')
  assert.ok(fighter.asiLevels.includes(4), 'ASI levels should include level 4 from parsed data')
  assert.equal(fighter.subclassLevel, 3)
})

test('mergeClassMetadata provides complete catalogue class information', () => {
  const merged = mergeClassMetadata('rogue', {
    id: 'rogue',
    name: 'Rogue',
    featuresByLevel: {},
    asiLevels: [],
    primaryAbility: 'DEX',
    hitDie: 8,
    savingThrows: ['DEX', 'INT'],
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: []
  })

  assert.equal(merged.hitDie, 8)
  assert.ok(merged.skillChoices.options.length > 0)
  assert.ok(merged.featuresByLevel[1], 'metadata should supply level 1 features')
  assert.ok(Array.isArray(merged.subclasses) && merged.subclasses.length > 0)
})
