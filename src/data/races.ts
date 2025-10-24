import { Feature, Race } from './types';

const makeFeature = (feature: Feature): Feature => feature;

export const raceFeatures: Record<string, Feature[]> = {};

export const races: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description:
      'Humans are adaptable and ambitious folk whose diversity and drive let them thrive in almost any environment.',
    speed: { walk: 30 },
    abilityOptions: [
      {
        id: 'universal-upbringing',
        description: '+1 to all six ability scores.',
        boosts: [
          { type: 'fixed', ability: 'strength', amount: 1 },
          { type: 'fixed', ability: 'dexterity', amount: 1 },
          { type: 'fixed', ability: 'constitution', amount: 1 },
          { type: 'fixed', ability: 'intelligence', amount: 1 },
          { type: 'fixed', ability: 'wisdom', amount: 1 },
          { type: 'fixed', ability: 'charisma', amount: 1 },
        ],
      },
      {
        id: 'versatile-talent',
        description: 'Gain a +2 to one ability score of your choice and +1 to a different one.',
        boosts: [
          { type: 'choice', amount: 2, count: 1, abilities: 'any' },
          { type: 'choice', amount: 1, count: 1, abilities: 'any' },
        ],
      },
    ],
    languages: ['Common'],
    features: [
      makeFeature({
        id: 'human-adaptable',
        name: 'Adaptive Talent',
        source: 'race',
        summary:
          'Gain proficiency in one skill of your choice, representing humanity\'s broad range of experiences.',
        effects: [
          {
            id: 'human-adaptable-skill',
            target: 'skills',
            op: 'merge',
            value: { type: 'choice', count: 1, options: ['Acrobatics', 'Animal Handling', 'Arcana', 'Deception', 'History', 'Insight', 'Investigation', 'Medicine', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Stealth', 'Survival'] },
            description: 'Choose one additional skill proficiency.',
          },
        ],
      }),
      makeFeature({
        id: 'human-determined',
        name: 'Determined Spirit',
        source: 'race',
        summary: 'Humans draw on stubborn resolve, granting a small boost to maximum hit points.',
        effects: [
          {
            id: 'human-determined-hp',
            target: 'hp.max',
            op: 'add',
            value: { perLevel: 1 },
            description: '+1 hit point per level from human resilience.',
          },
        ],
      }),
      makeFeature({
        id: 'human-languages',
        name: 'Polyglot',
        source: 'race',
        summary: 'You speak Common and one extra language of your choice.',
        effects: [
          {
            id: 'human-languages-base',
            target: 'languages',
            op: 'merge',
            value: ['Common'],
          },
          {
            id: 'human-languages-choice',
            target: 'languages',
            op: 'merge',
            value: { type: 'choice', count: 1, options: ['Draconic', 'Dwarvish', 'Elvish', 'Giant', 'Halfling', 'Orc', 'Auran'] },
          },
        ],
      }),
    ],
  },
  {
    id: 'aarakocra',
    name: 'Aarakocra',
    description:
      'Birdfolk of the high peaks, aarakocra soar on powerful wings and command the winds with ancient rites.',
    speed: { walk: 30, fly: 30 },
    abilityOptions: [
      {
        id: 'wind-swift',
        description: '+2 Dexterity, +1 Wisdom.',
        boosts: [
          { type: 'fixed', ability: 'dexterity', amount: 2 },
          { type: 'fixed', ability: 'wisdom', amount: 1 },
        ],
      },
      {
        id: 'sky-hunter',
        description: '+1 Dexterity, +1 Wisdom, +1 Charisma.',
        boosts: [
          { type: 'fixed', ability: 'dexterity', amount: 1 },
          { type: 'fixed', ability: 'wisdom', amount: 1 },
          { type: 'fixed', ability: 'charisma', amount: 1 },
        ],
      },
      {
        id: 'storm-called',
        description: '+2 to one ability score of your choice and +1 to a different ability score.',
        boosts: [
          { type: 'choice', amount: 2, count: 1, abilities: 'any' },
          { type: 'choice', amount: 1, count: 1, abilities: 'any' },
        ],
      },
    ],
    languages: ['Common', 'Auran'],
    features: [
      makeFeature({
        id: 'aarakocra-flight',
        name: 'Flight',
        source: 'race',
        summary: 'You have a flying speed equal to your walking speed while not wearing medium or heavy armor.',
        effects: [
          {
            id: 'aarakocra-flight-speed',
            target: 'speed.fly',
            op: 'set',
            value: { base: 30, scaling: 'match-walk' },
            description: 'Set fly speed to match walking speed unless armor restricts it.',
          },
        ],
      }),
      makeFeature({
        id: 'aarakocra-talons',
        name: 'Talons',
        source: 'race',
        summary: 'Your talons deal 1d6 + Strength modifier slashing damage.',
        effects: [
          {
            id: 'aarakocra-talons-attack',
            target: 'features',
            op: 'merge',
            value: { type: 'natural-weapon', name: 'Talons', damage: '1d6 + STR (slashing)' },
          },
        ],
      }),
      makeFeature({
        id: 'aarakocra-wind-caller',
        name: 'Wind Caller',
        source: 'race',
        summary: 'Cast gust of wind once per long rest at 3rd level, using a mental ability of your choice.',
        effects: [
          {
            id: 'aarakocra-wind-caller-note',
            target: 'notes',
            op: 'merge',
            value: 'Gust of Wind (long rest, 3rd level)',
          },
        ],
      }),
      makeFeature({
        id: 'aarakocra-languages',
        name: 'Sky Tongues',
        source: 'race',
        summary: 'You speak Common and Auran.',
        effects: [
          {
            id: 'aarakocra-languages-base',
            target: 'languages',
            op: 'merge',
            value: ['Common', 'Auran'],
          },
        ],
      }),
    ],
  },
];
