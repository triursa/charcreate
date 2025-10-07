import type { Ability, FeatureInstance, Skill } from '@/types/character'

export interface ClassFeature {
  level: number
  feature: FeatureInstance
}

export interface ClassDefinition {
  id: string
  name: string
  primaryAbility: Ability
  hitDie: number
  savingThrows: Ability[]
  skillChoices: {
    count: number
    options: Skill[]
  }
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  featuresByLevel: Record<number, FeatureInstance[]>
  asiLevels: number[]
}

const fighterFeatures: Record<number, FeatureInstance[]> = {
  1: [
    {
      id: 'fighting-style',
      name: 'Fighting Style',
      source: ['Fighter 1'],
      description: 'Adopt a fighting style to specialize your combat approach.',
      mergeStrategy: 'set'
    },
    {
      id: 'second-wind',
      name: 'Second Wind',
      source: ['Fighter 1'],
      description: 'Use a bonus action to regain hit points equal to 1d10 + fighter level once per rest.',
      mergeStrategy: 'set'
    }
  ],
  2: [
    {
      id: 'action-surge',
      name: 'Action Surge',
      source: ['Fighter 2'],
      description: 'Take one additional action on your turn once per short or long rest.',
      mergeStrategy: 'set'
    }
  ],
  3: [
    {
      id: 'martial-archetype',
      name: 'Martial Archetype',
      source: ['Fighter 3'],
      description: 'Choose a martial archetype that shapes your advanced combat training.',
      mergeStrategy: 'set'
    }
  ],
  5: [
    {
      id: 'extra-attack',
      name: 'Extra Attack',
      source: ['Fighter 5'],
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      mergeStrategy: 'set'
    }
  ],
  9: [
    {
      id: 'indomitable',
      name: 'Indomitable',
      source: ['Fighter 9'],
      description: 'Reroll a failed saving throw once per long rest.',
      mergeStrategy: 'set'
    }
  ],
  13: [
    {
      id: 'superior-critical',
      name: 'Improved Critical',
      source: ['Fighter 13'],
      description: 'Your weapon attacks score a critical hit on a roll of 18-20.',
      mergeStrategy: 'set'
    }
  ],
  17: [
    {
      id: 'action-surge-2',
      name: 'Action Surge (Second Use)',
      source: ['Fighter 17'],
      description: 'Use Action Surge twice between rests.',
      mergeStrategy: 'set'
    }
  ]
}

const rogueFeatures: Record<number, FeatureInstance[]> = {
  1: [
    {
      id: 'expertise',
      name: 'Expertise',
      source: ['Rogue 1'],
      description: 'Double proficiency bonus for two skills you are proficient in.',
      mergeStrategy: 'set'
    },
    {
      id: 'sneak-attack',
      name: 'Sneak Attack',
      source: ['Rogue 1'],
      description: 'Deal an extra 1d6 damage once per turn when conditions are met.',
      mergeStrategy: 'set'
    },
    {
      id: 'thieves-cant',
      name: "Thieves' Cant",
      source: ['Rogue 1'],
      description: 'Secret rogues’ code of speech, jargon, and symbols.',
      mergeStrategy: 'set'
    }
  ],
  2: [
    {
      id: 'cunning-action',
      name: 'Cunning Action',
      source: ['Rogue 2'],
      description: 'Dash, Disengage, or Hide as a bonus action each turn.',
      mergeStrategy: 'set'
    }
  ],
  3: [
    {
      id: 'rogue-archetype',
      name: 'Roguish Archetype',
      source: ['Rogue 3'],
      description: 'Choose an archetype that shapes your advanced techniques.',
      mergeStrategy: 'set'
    }
  ],
  5: [
    {
      id: 'uncanny-dodge',
      name: 'Uncanny Dodge',
      source: ['Rogue 5'],
      description: 'Use reaction to halve damage from an attacker you can see.',
      mergeStrategy: 'set'
    }
  ],
  7: [
    {
      id: 'evasion',
      name: 'Evasion',
      source: ['Rogue 7'],
      description: 'Take no damage on successful Dex saves vs. effects that allow half damage.',
      mergeStrategy: 'set'
    }
  ],
  11: [
    {
      id: 'reliable-talent',
      name: 'Reliable Talent',
      source: ['Rogue 11'],
      description: 'Treat any ability check roll less than 10 as a 10 if proficient.',
      mergeStrategy: 'set'
    }
  ],
  14: [
    {
      id: 'blindsense',
      name: 'Blindsense',
      source: ['Rogue 14'],
      description: 'You can sense hidden or invisible creatures within 10 feet.',
      mergeStrategy: 'set'
    }
  ],
  17: [
    {
      id: 'stroke-of-luck',
      name: 'Stroke of Luck',
      source: ['Rogue 17'],
      description: 'Turn a miss into a hit or failed ability check into a success once per rest.',
      mergeStrategy: 'set'
    }
  ]
}

export const classes: ClassDefinition[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    primaryAbility: 'STR',
    hitDie: 10,
    savingThrows: ['STR', 'CON'],
    skillChoices: {
      count: 2,
      options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival']
    },
    armorProficiencies: ['All armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    toolProficiencies: [],
    featuresByLevel: fighterFeatures,
    asiLevels: [4, 6, 8, 12, 14, 16, 19]
  },
  {
    id: 'rogue',
    name: 'Rogue',
    primaryAbility: 'DEX',
    hitDie: 8,
    savingThrows: ['DEX', 'INT'],
    skillChoices: {
      count: 4,
      options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth']
    },
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ["Thieves' tools"],
    featuresByLevel: rogueFeatures,
    asiLevels: [4, 8, 10, 12, 16, 19]
  }
]

export const classMap = Object.fromEntries(classes.map((cls) => [cls.id, cls]))
