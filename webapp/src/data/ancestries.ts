import type { Ability, FeatureInstance, Skill } from '@/types/character'

export interface AncestryDefinition {
  id: string
  name: string
  description: string
  abilityBonuses: Partial<Record<Ability, number>>
  speed: number
  languages: string[]
  skillProficiencies?: Skill[]
  features: FeatureInstance[]
}

export const ancestries: AncestryDefinition[] = [
  {
    id: 'human',
    name: 'Human',
    description:
      'Versatile and ambitious, humans gain broad ability score increases and adapt quickly to any role.',
    abilityBonuses: {
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1
    },
    speed: 30,
    languages: ['Common', 'One extra language of your choice'],
    features: [
      {
        id: 'adaptable',
        name: 'Adaptable',
        source: ['Human'],
        description: 'Humans excel at picking up new talents and cultures wherever they travel.',
        mergeStrategy: 'set'
      }
    ]
  },
  {
    id: 'high-elf',
    name: 'High Elf',
    description:
      'Graceful and keen-eyed, high elves combine natural dexterity with keen intellect and ancestral magic.',
    abilityBonuses: {
      DEX: 2,
      INT: 1
    },
    speed: 30,
    languages: ['Common', 'Elvish'],
    skillProficiencies: ['Perception'],
    features: [
      {
        id: 'darkvision',
        name: 'Darkvision',
        source: ['High Elf'],
        description: 'You can see in dim light within 60 feet of you as if it were bright light.',
        payload: { range: 60 },
        mergeStrategy: 'max'
      },
      {
        id: 'keen-senses',
        name: 'Keen Senses',
        source: ['High Elf'],
        description: 'You have proficiency in the Perception skill.',
        mergeStrategy: 'set'
      },
      {
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        source: ['High Elf'],
        description: 'You have advantage on saving throws against being charmed, and magic can’t put you to sleep.',
        mergeStrategy: 'set'
      }
    ]
  }
]

export const ancestryMap = Object.fromEntries(ancestries.map((ancestry) => [ancestry.id, ancestry]))
