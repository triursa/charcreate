import { FightingStyle } from './types';

export const fightingStyles: FightingStyle[] = [
  {
    id: 'defense',
    name: 'Defense',
    summary: '+1 to AC while wearing armor.',
    effects: [
      {
        id: 'style-defense-ac',
        target: 'ac.base',
        op: 'add',
        value: 1,
        condition: { type: 'wearing-armor', value: 1 },
        description: '+1 AC when armored.',
      },
    ],
  },
  {
    id: 'dueling',
    name: 'Dueling',
    summary: '+2 damage when wielding a single one-handed melee weapon.',
    effects: [
      {
        id: 'style-dueling-note',
        target: 'notes',
        op: 'merge',
        value: 'Dueling: +2 damage when using a single one-handed melee weapon.',
      },
    ],
  },
  {
    id: 'interception',
    name: 'Interception',
    summary: 'Use your reaction to reduce damage dealt to nearby allies.',
    effects: [
      {
        id: 'style-interception-note',
        target: 'notes',
        op: 'merge',
        value: 'Interception: Reaction to reduce damage by 1d10 + proficiency bonus while wielding a shield or weapon.',
      },
    ],
  },
  {
    id: 'thrown-weapon',
    name: 'Thrown Weapon Fighting',
    summary: 'Draw thrown weapons and add +2 damage on hits.',
    effects: [
      {
        id: 'style-thrown-note',
        target: 'notes',
        op: 'merge',
        value: 'Thrown Weapon Fighting: Draw thrown weapons freely and gain +2 damage on hits.',
      },
    ],
  },
  {
    id: 'two-weapon',
    name: 'Two-Weapon Fighting',
    summary: 'Add ability modifier to off-hand attacks.',
    effects: [
      {
        id: 'style-two-weapon-note',
        target: 'notes',
        op: 'merge',
        value: 'Two-Weapon Fighting: Add ability modifier to damage of the bonus action attack.',
      },
    ],
  },
  {
    id: 'unarmed',
    name: 'Unarmed Fighting',
    summary: 'Deal 1d6/1d8 with unarmed strikes and extra grapple damage.',
    effects: [
      {
        id: 'style-unarmed-note',
        target: 'features',
        op: 'merge',
        value: {
          type: 'fighting-style',
          name: 'Unarmed Fighting',
          detail: 'Unarmed strikes deal 1d6+STR (1d8 if no weapons or shield); deal 1d4 to a grappled target each turn.',
        },
      },
    ],
  },
];
