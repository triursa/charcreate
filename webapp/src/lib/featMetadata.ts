import type { FeatDefinition } from '../types/catalogue'

type FeatMetadataMap = Record<string, Pick<FeatDefinition, 'abilityIncreases' | 'features' | 'description'>>

export const FEAT_METADATA: FeatMetadataMap = {
  alert: {
    description:
      'Always on the lookout for danger, you gain a +5 bonus to initiative and cannot be surprised while conscious.',
    features: [
      {
        id: 'alert',
        name: 'Alert',
        source: ['Feat: Alert'],
        description: 'You gain a +5 bonus to initiative and cannot be surprised while conscious.',
        mergeStrategy: 'set'
      }
    ]
  },
  athlete: {
    description:
      'Your physical training enhances your strength and agility. Increase your Strength or Dexterity by 1, up to a maximum of 20.',
    abilityIncreases: {
      STR: 1,
      DEX: 1
    },
    features: [
      {
        id: 'athlete',
        name: 'Athlete',
        source: ['Feat: Athlete'],
        description: 'You gain climbing benefits and improved standing up from prone.',
        mergeStrategy: 'set'
      }
    ]
  },
  resilient: {
    description:
      'Choose one ability score. You gain proficiency in saving throws using the chosen ability, and increase the ability score by 1.',
    abilityIncreases: {
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1
    },
    features: [
      {
        id: 'resilient',
        name: 'Resilient',
        source: ['Feat: Resilient'],
        description: 'Gain proficiency in one saving throw of your choice and increase the corresponding ability score by 1.',
        mergeStrategy: 'set'
      }
    ]
  }
}
