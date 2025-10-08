import type {
  CatalogueClass,
  ClassDefinition,
  OptionalFeatureProgressionEntry,
  SubclassDefinition
} from '../types/catalogue'

type FeatureByLevel = ClassDefinition['featuresByLevel']

interface ClassMetadataEntry {
  hitDie: number
  primaryAbility: ClassDefinition['primaryAbility']
  savingThrows: ClassDefinition['savingThrows']
  skillChoices: ClassDefinition['skillChoices']
  armorProficiencies: ClassDefinition['armorProficiencies']
  weaponProficiencies: ClassDefinition['weaponProficiencies']
  toolProficiencies: ClassDefinition['toolProficiencies']
  otherProficiencies?: ClassDefinition['otherProficiencies']
  spellcastingAbility?: ClassDefinition['spellcastingAbility']
  subclasses: SubclassDefinition[]
  subclassLevel: number
  featuresByLevel: FeatureByLevel
  asiLevels: number[]
  optionalFeatureProgression?: OptionalFeatureProgressionEntry[]
}

type ClassMetadataMap = Record<string, ClassMetadataEntry>

export const CLASS_METADATA: ClassMetadataMap = {
  fighter: {
    hitDie: 10,
    primaryAbility: 'STR',
    savingThrows: ['STR', 'CON'],
    skillChoices: {
      count: 2,
      options: [
        'Acrobatics',
        'Animal Handling',
        'Athletics',
        'History',
        'Insight',
        'Intimidation',
        'Perception',
        'Survival'
      ]
    },
    armorProficiencies: ['All armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    toolProficiencies: [],
    otherProficiencies: ['Vehicle (land)'],
    subclasses: [
      {
        id: 'fighter-champion',
        name: 'Champion',
        description: 'Focus on raw physical power and improved critical strikes.'
      },
      {
        id: 'fighter-battle-master',
        name: 'Battle Master',
        description: 'Employ superior combat maneuvers to control the battlefield.'
      },
      {
        id: 'fighter-eldritch-knight',
        name: 'Eldritch Knight',
        description: 'Blend martial prowess with arcane spellcasting.'
      }
    ],
    subclassLevel: 3,
    featuresByLevel: {
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
    },
    asiLevels: [4, 6, 8, 12, 14, 16, 19]
  },
  rogue: {
    hitDie: 8,
    primaryAbility: 'DEX',
    savingThrows: ['DEX', 'INT'],
    skillChoices: {
      count: 4,
      options: [
        'Acrobatics',
        'Athletics',
        'Deception',
        'Insight',
        'Intimidation',
        'Investigation',
        'Perception',
        'Performance',
        'Persuasion',
        'Sleight of Hand',
        'Stealth'
      ]
    },
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ["Thieves' tools"],
    otherProficiencies: [],
    subclasses: [
      {
        id: 'rogue-thief',
        name: 'Thief',
        description: 'Master quick hands, agility, and fast reflexes for daring exploits.'
      },
      {
        id: 'rogue-assassin',
        name: 'Assassin',
        description: 'Strike swiftly from the shadows with deadly precision.'
      },
      {
        id: 'rogue-arcane-trickster',
        name: 'Arcane Trickster',
        description: 'Blend roguish talent with arcane tricks and illusions.',
        spellcastingAbility: 'INT'
      }
    ],
    subclassLevel: 3,
    featuresByLevel: {
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
    },
    asiLevels: [4, 8, 10, 12, 16, 19]
  }
}

export function mergeClassMetadata(classId: string, base: Partial<CatalogueClass>): CatalogueClass {
  const metadata = CLASS_METADATA[classId]
  if (!metadata) {
    return {
      id: classId,
      name: base.name ?? classId,
      primaryAbility: base.primaryAbility ?? 'STR',
      hitDie: base.hitDie ?? 8,
      savingThrows: base.savingThrows ?? [],
      skillChoices: base.skillChoices ?? { count: 0, options: [] },
      armorProficiencies: base.armorProficiencies ?? [],
      weaponProficiencies: base.weaponProficiencies ?? [],
      toolProficiencies: base.toolProficiencies ?? [],
      otherProficiencies: base.otherProficiencies,
      spellcastingAbility: base.spellcastingAbility,
      subclasses: base.subclasses ?? [],
      subclassLevel: base.subclassLevel,
      featuresByLevel: base.featuresByLevel ?? {},
      asiLevels: base.asiLevels ?? [],
      optionalFeatureProgression: base.optionalFeatureProgression ?? [],
      description: base.description,
      source: base.source,
      raw: base.raw
    }
  }

  const normalizedSkillChoices = base.skillChoices
    ? base.skillChoices.options && base.skillChoices.options.length > 0
      ? base.skillChoices
      : metadata.skillChoices
    : metadata.skillChoices

  const normalizedArmorProficiencies = Array.isArray(base.armorProficiencies) && base.armorProficiencies.length > 0
    ? base.armorProficiencies
    : metadata.armorProficiencies

  const normalizedWeaponProficiencies = Array.isArray(base.weaponProficiencies) && base.weaponProficiencies.length > 0
    ? base.weaponProficiencies
    : metadata.weaponProficiencies

  const normalizedToolProficiencies = Array.isArray(base.toolProficiencies) && base.toolProficiencies.length > 0
    ? base.toolProficiencies
    : metadata.toolProficiencies

  const normalizedOtherProficiencies = Array.isArray(base.otherProficiencies) && base.otherProficiencies.length > 0
    ? base.otherProficiencies
    : metadata.otherProficiencies

  const normalizedSavingThrows = Array.isArray(base.savingThrows) && base.savingThrows.length > 0
    ? base.savingThrows
    : metadata.savingThrows

  const normalizedSubclasses = Array.isArray(base.subclasses) && base.subclasses.length > 0
    ? base.subclasses
    : metadata.subclasses

  const normalizedSubclassLevel = typeof base.subclassLevel === 'number' ? base.subclassLevel : metadata.subclassLevel

  const normalizedFeatures = base.featuresByLevel && Object.keys(base.featuresByLevel).length > 0
    ? base.featuresByLevel
    : metadata.featuresByLevel

  const normalizedAsiLevels = Array.isArray(base.asiLevels) && base.asiLevels.length > 0 ? base.asiLevels : metadata.asiLevels
  const normalizedOptionalFeatureProgression =
    Array.isArray(base.optionalFeatureProgression) && base.optionalFeatureProgression.length > 0
      ? base.optionalFeatureProgression
      : metadata.optionalFeatureProgression ?? []

  return {
    id: classId,
    name: base.name ?? classId,
    primaryAbility: base.primaryAbility ?? metadata.primaryAbility,
    hitDie: base.hitDie ?? metadata.hitDie,
    savingThrows: normalizedSavingThrows ?? [],
    skillChoices: normalizedSkillChoices ?? { count: 0, options: [] },
    armorProficiencies: normalizedArmorProficiencies ?? [],
    weaponProficiencies: normalizedWeaponProficiencies ?? [],
    toolProficiencies: normalizedToolProficiencies ?? [],
    otherProficiencies: normalizedOtherProficiencies,
    spellcastingAbility: base.spellcastingAbility ?? metadata.spellcastingAbility,
    subclasses: normalizedSubclasses ?? [],
    subclassLevel: normalizedSubclassLevel,
    featuresByLevel: normalizedFeatures ?? {},
    asiLevels: normalizedAsiLevels ?? [],
    optionalFeatureProgression: normalizedOptionalFeatureProgression,
    description: base.description,
    source: base.source,
    raw: base.raw
  }
}
