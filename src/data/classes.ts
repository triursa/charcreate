import { Class, Feature, Subclass } from './types';
import { fightingStyles } from './fightingStyles';

const choiceEffect = (id: string, options: unknown) => ({
  id,
  target: 'features',
  op: 'merge',
  value: { type: 'choice', options },
});

const fighterFeaturesByLevel: Record<number, Feature[]> = {
  1: [
    {
      id: 'fighter-fighting-style',
      name: 'Fighting Style',
      source: 'class',
      level: 1,
      summary: 'Adopt a fighting style specialty.',
      effects: [
        {
          id: 'fighter-fighting-style-choice',
          target: 'features',
          op: 'merge',
          value: { type: 'fighting-style-choice', options: fightingStyles },
          description: 'Select one fighting style to gain its benefits.',
        },
      ],
    },
    {
      id: 'fighter-second-wind',
      name: 'Second Wind',
      source: 'class',
      level: 1,
      summary: 'Use a bonus action to regain 1d10 + fighter level hit points once per rest.',
      effects: [
        {
          id: 'fighter-second-wind-note',
          target: 'notes',
          op: 'merge',
          value: 'Second Wind: Bonus action to regain 1d10 + fighter level HP (short/long rest).',
        },
      ],
    },
  ],
  2: [
    {
      id: 'fighter-action-surge',
      name: 'Action Surge',
      source: 'class',
      level: 2,
      summary: 'Take an additional action once per short or long rest; twice from 17th level.',
      effects: [
        {
          id: 'fighter-action-surge-note',
          target: 'notes',
          op: 'merge',
          value: 'Action Surge: Take an extra action (1/rest, 2/rest at 17th level).',
        },
      ],
    },
  ],
  3: [
    {
      id: 'fighter-subclass',
      name: 'Martial Archetype',
      source: 'class',
      level: 3,
      summary: 'Choose a martial archetype that grants features at various levels.',
      effects: [
        {
          id: 'fighter-subclass-note',
          target: 'features',
          op: 'merge',
          value: { type: 'subclass-feature', detail: 'Gain features from your chosen martial archetype.' },
        },
      ],
    },
  ],
  4: [
    {
      id: 'fighter-asi-4',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 4,
      summary: 'Increase one ability by 2 or two abilities by 1, or take a feat.',
      effects: [
        {
          id: 'fighter-asi-4-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  5: [
    {
      id: 'fighter-extra-attack',
      name: 'Extra Attack',
      source: 'class',
      level: 5,
      summary: 'Attack twice when you take the Attack action.',
      effects: [
        {
          id: 'fighter-extra-attack-note',
          target: 'notes',
          op: 'merge',
          value: 'Extra Attack: Attack twice when you take the Attack action.',
        },
      ],
    },
  ],
  6: [
    {
      id: 'fighter-asi-6',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 6,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-6-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  7: [
    {
      id: 'fighter-subclass-7',
      name: 'Subclass Feature',
      source: 'class',
      level: 7,
      summary: 'Gain the feature granted by your martial archetype.',
      effects: [
        {
          id: 'fighter-subclass-7-note',
          target: 'features',
          op: 'merge',
          value: { type: 'subclass-feature', detail: 'Gain your archetype feature.' },
        },
      ],
    },
  ],
  8: [
    {
      id: 'fighter-asi-8',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 8,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-8-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  9: [
    {
      id: 'fighter-indomitable',
      name: 'Indomitable',
      source: 'class',
      level: 9,
      summary: 'Reroll a failed saving throw once per long rest (more uses at 13th and 17th levels).',
      effects: [
        {
          id: 'fighter-indomitable-note',
          target: 'notes',
          op: 'merge',
          value: 'Indomitable: Reroll a failed save (1/day, 2/day at 13th, 3/day at 17th).',
        },
      ],
    },
  ],
  10: [
    {
      id: 'fighter-subclass-10',
      name: 'Subclass Feature',
      source: 'class',
      level: 10,
      summary: 'Gain the feature granted by your martial archetype.',
      effects: [
        {
          id: 'fighter-subclass-10-note',
          target: 'features',
          op: 'merge',
          value: { type: 'subclass-feature', detail: 'Gain your archetype feature.' },
        },
      ],
    },
  ],
  11: [
    {
      id: 'fighter-extra-attack-2',
      name: 'Extra Attack (2)',
      source: 'class',
      level: 11,
      summary: 'Attack three times when you take the Attack action.',
      effects: [
        {
          id: 'fighter-extra-attack-2-note',
          target: 'notes',
          op: 'merge',
          value: 'Extra Attack (2): Attack three times when you take the Attack action.',
        },
      ],
    },
  ],
  12: [
    {
      id: 'fighter-asi-12',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 12,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-12-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  13: [
    {
      id: 'fighter-indomitable-2',
      name: 'Indomitable (two uses)',
      source: 'class',
      level: 13,
      summary: 'Use Indomitable twice between long rests.',
      effects: [
        {
          id: 'fighter-indomitable-2-note',
          target: 'notes',
          op: 'merge',
          value: 'Indomitable: Two uses between long rests.',
        },
      ],
    },
  ],
  14: [
    {
      id: 'fighter-asi-14',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 14,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-14-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  15: [
    {
      id: 'fighter-subclass-15',
      name: 'Subclass Feature',
      source: 'class',
      level: 15,
      summary: 'Gain the feature granted by your martial archetype.',
      effects: [
        {
          id: 'fighter-subclass-15-note',
          target: 'features',
          op: 'merge',
          value: { type: 'subclass-feature', detail: 'Gain your archetype feature.' },
        },
      ],
    },
  ],
  16: [
    {
      id: 'fighter-asi-16',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 16,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-16-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  17: [
    {
      id: 'fighter-action-surge-2',
      name: 'Action Surge (two uses)',
      source: 'class',
      level: 17,
      summary: 'Use Action Surge twice between rests.',
      effects: [
        {
          id: 'fighter-action-surge-2-note',
          target: 'notes',
          op: 'merge',
          value: 'Action Surge: Two uses between rests (one per turn).',
        },
      ],
    },
    {
      id: 'fighter-indomitable-3',
      name: 'Indomitable (three uses)',
      source: 'class',
      level: 17,
      summary: 'Use Indomitable three times between long rests.',
      effects: [
        {
          id: 'fighter-indomitable-3-note',
          target: 'notes',
          op: 'merge',
          value: 'Indomitable: Three uses between long rests.',
        },
      ],
    },
  ],
  18: [
    {
      id: 'fighter-subclass-18',
      name: 'Subclass Feature',
      source: 'class',
      level: 18,
      summary: 'Gain the feature granted by your martial archetype.',
      effects: [
        {
          id: 'fighter-subclass-18-note',
          target: 'features',
          op: 'merge',
          value: { type: 'subclass-feature', detail: 'Gain your archetype feature.' },
        },
      ],
    },
  ],
  19: [
    {
      id: 'fighter-asi-19',
      name: 'Ability Score Improvement',
      source: 'class',
      level: 19,
      summary: 'Increase abilities or take a feat.',
      effects: [
        {
          id: 'fighter-asi-19-note',
          target: 'features',
          op: 'merge',
          value: { type: 'ability-increase', amount: 2, slots: 1 },
        },
      ],
    },
  ],
  20: [
    {
      id: 'fighter-extra-attack-3',
      name: 'Extra Attack (3)',
      source: 'class',
      level: 20,
      summary: 'Attack four times when you take the Attack action.',
      effects: [
        {
          id: 'fighter-extra-attack-3-note',
          target: 'notes',
          op: 'merge',
          value: 'Extra Attack (3): Attack four times when you take the Attack action.',
        },
      ],
    },
  ],
};

const champion: Subclass = {
  id: 'champion',
  name: 'Champion',
  description: 'Champions focus on raw physical power, pushing critical hits and athletic ability to new heights.',
  features: [],
  levelFeatures: {
    3: [
      {
        id: 'champion-improved-critical',
        name: 'Improved Critical',
        source: 'subclass',
        level: 3,
        summary: 'Weapon attacks score a critical hit on a roll of 19 or 20.',
        effects: [
          {
            id: 'champion-improved-critical-note',
            target: 'notes',
            op: 'merge',
            value: 'Improved Critical: Weapon attacks crit on 19-20.',
          },
        ],
      },
    ],
    7: [
      {
        id: 'champion-remarkable-athlete',
        name: 'Remarkable Athlete',
        source: 'subclass',
        level: 7,
        summary: 'Add half proficiency to Str/Dex/Con checks without proficiency and extend running jumps.',
        effects: [
          {
            id: 'champion-remarkable-athlete-skill',
            target: 'skills',
            op: 'merge',
            value: { type: 'half-proficiency', abilities: ['strength', 'dexterity', 'constitution'] },
          },
          {
            id: 'champion-remarkable-athlete-note',
            target: 'notes',
            op: 'merge',
            value: 'Remarkable Athlete: Half proficiency to Str/Dex/Con checks without proficiency; longer long jumps.',
          },
        ],
      },
    ],
    10: [
      {
        id: 'champion-additional-style',
        name: 'Additional Fighting Style',
        source: 'subclass',
        level: 10,
        summary: 'Choose a second fighting style.',
        effects: [
          {
            id: 'champion-additional-style-choice',
            target: 'features',
            op: 'merge',
            value: { type: 'fighting-style-choice', options: fightingStyles, allowDuplicates: false },
          },
        ],
      },
    ],
    15: [
      {
        id: 'champion-superior-critical',
        name: 'Superior Critical',
        source: 'subclass',
        level: 15,
        summary: 'Weapon attacks score a critical hit on a roll of 18-20.',
        effects: [
          {
            id: 'champion-superior-critical-note',
            target: 'notes',
            op: 'merge',
            value: 'Superior Critical: Weapon attacks crit on 18-20.',
          },
        ],
      },
    ],
    18: [
      {
        id: 'champion-survivor',
        name: 'Survivor',
        source: 'subclass',
        level: 18,
        summary: 'Regain 5 + Con modifier HP at the start of turns when at half health or less.',
        effects: [
          {
            id: 'champion-survivor-note',
            target: 'notes',
            op: 'merge',
            value: 'Survivor: Regain 5 + Con mod HP each turn while at or below half HP.',
          },
        ],
      },
    ],
  },
};

export const fighter: Class = {
  id: 'fighter',
  name: 'Fighter',
  description: 'A master of arms who combines rigorous training with tactical flexibility.',
  hitDie: 10,
  primaryAbilities: ['strength', 'dexterity', 'constitution'],
  savingThrows: ['strength', 'constitution'],
  armorTraining: ['Light', 'Medium', 'Heavy', 'Shields'],
  weaponTraining: ['Simple', 'Martial'],
  skills: {
    choose: 2,
    options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
  },
  features: [],
  levelFeatures: fighterFeaturesByLevel,
  subclasses: [champion],
  fightingStyles,
};

export const classes: Class[] = [fighter];
