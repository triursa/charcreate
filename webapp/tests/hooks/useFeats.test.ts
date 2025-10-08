import assert from 'node:assert/strict'
import { test } from 'node:test'

import { FEAT_METADATA } from '../../src/lib/featMetadata.js'
import { __testUtils as featTestUtils } from '../../src/hooks/useFeats.js'

test('normalizeFeat enriches feat data with metadata', () => {
  const rawFeat = {
    name: 'Athlete',
    entries: ['Training improves your agility.']
  }

  const [normalized] = featTestUtils.buildFeatList([rawFeat])
  assert.equal(normalized.id, 'athlete')
  assert.equal(normalized.name, 'Athlete')
  assert.ok(normalized.features && normalized.features.length > 0)
  assert.deepEqual(normalized.abilityIncreases, FEAT_METADATA.athlete.abilityIncreases)
})

test('normalizeFeat falls back to text description when metadata is absent', () => {
  const rawFeat = {
    name: 'Custom Feat',
    entries: ['Gain a special benefit.']
  }

  const [normalized] = featTestUtils.buildFeatList([rawFeat])
  assert.equal(normalized.id, 'custom-feat')
  assert.equal(normalized.description, 'Gain a special benefit.')
  assert.ok(normalized.features && normalized.features.length === 1)
})
