import { Background } from './types';

export const backgrounds: Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description:
      'You have spent your life in service to a temple. You know the rites and can draw on the aid of the faithful.',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: [],
    equipment: [
      'Holy symbol',
      'Prayer book or prayer wheel',
      '5 sticks of incense',
      'Vestments',
      'Common clothes',
      '15 gp'
    ],
    featureId: 'shelter-of-the-faithful',
    features: [
      {
        id: 'acolyte-skills',
        name: 'Temple Training',
        source: 'background',
        summary: 'Proficiency in Insight and Religion.',
        effects: [
          {
            id: 'acolyte-skill-insight',
            target: 'skills',
            op: 'merge',
            value: { type: 'grant', skills: ['Insight', 'Religion'] },
          },
        ],
      },
      {
        id: 'acolyte-languages',
        name: 'Linguist of the Cloth',
        source: 'background',
        summary: 'Learn two additional languages of your choice.',
        effects: [
          {
            id: 'acolyte-language-choice',
            target: 'languages',
            op: 'merge',
            value: { type: 'choice', count: 2, options: ['Celestial', 'Draconic', 'Dwarvish', 'Elvish', 'Gnomish', 'Halfling', 'Infernal', 'Orc'] },
          },
        ],
      },
      {
        id: 'acolyte-feature',
        name: 'Shelter of the Faithful',
        source: 'background',
        summary: 'You and your companions can expect free healing and care at friendly temples of your faith.',
        effects: [
          {
            id: 'acolyte-feature-note',
            target: 'notes',
            op: 'merge',
            value: 'Shelter of the Faithful: Seek hospitality at temples of your faith.',
          },
        ],
      },
    ],
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description:
      'You are trained to fight and to survive the rigors of war, carrying the discipline of the barracks into every battle.',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: ['Vehicles (land)'],
    equipment: [
      'Insignia of rank',
      'Trophy from a fallen enemy',
      'Set of bone dice or deck of cards',
      'Common clothes',
      '10 gp'
    ],
    featureId: 'military-rank',
    features: [
      {
        id: 'soldier-skills',
        name: 'Battlefield Training',
        source: 'background',
        summary: 'Proficiency in Athletics and Intimidation.',
        effects: [
          {
            id: 'soldier-skill-grant',
            target: 'skills',
            op: 'merge',
            value: { type: 'grant', skills: ['Athletics', 'Intimidation'] },
          },
        ],
      },
      {
        id: 'soldier-tool',
        name: 'Vehicles (Land)',
        source: 'background',
        summary: 'Proficiency with land vehicles.',
        effects: [
          {
            id: 'soldier-tool-note',
            target: 'notes',
            op: 'merge',
            value: 'Proficiency: Vehicles (land).',
          },
        ],
      },
      {
        id: 'soldier-feature',
        name: 'Military Rank',
        source: 'background',
        summary: 'Leverage your prior rank for respect and assistance in friendly military encampments.',
        effects: [
          {
            id: 'soldier-feature-note',
            target: 'notes',
            op: 'merge',
            value: 'Military Rank: Ex-soldiers recognize your authority.',
          },
        ],
      },
    ],
  },
];
