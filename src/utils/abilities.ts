import { Ability, AbilityBoostInstruction } from '../data/types';

export const abilities: Ability[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

export const abilityLabels: Record<Ability, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
};

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function applyAbilityBoosts(
  base: Record<Ability, number>,
  boosts: AbilityBoostInstruction[],
  assignment: Ability[] = [],
): Record<Ability, number> {
  const next: Record<Ability, number> = { ...base };
  let assignmentIndex = 0;

  boosts.forEach((boost) => {
    if (boost.type === 'fixed') {
      next[boost.ability] = (next[boost.ability] ?? 0) + boost.amount;
    } else {
      const choices: Ability[] = [];
      const availableAbilities = boost.abilities === 'any' ? abilities : boost.abilities;
      for (let i = 0; i < boost.count; i += 1) {
        const chosen = assignment[assignmentIndex];
        assignmentIndex += 1;
        if (!chosen || !availableAbilities.includes(chosen)) {
          // default to first available ability if missing.
          choices.push(availableAbilities[0]);
        } else {
          choices.push(chosen);
        }
      }
      choices.forEach((ability) => {
        next[ability] = (next[ability] ?? 0) + boost.amount;
      });
    }
  });

  return next;
}
