export interface DiceRollOptions {
  advantage?: boolean;
  disadvantage?: boolean;
  rerollOnes?: boolean;
  dropLowest?: number;
}

export interface DiceRollResult {
  total: number;
  rolls: number[];
  kept: number[];
  modifiers: number[];
  detail: string;
}

const dicePattern = /^(\d*)d(\d+)([+-]\d+)?$/i;

export function rollDice(expression: string, options: DiceRollOptions = {}): DiceRollResult {
  const match = dicePattern.exec(expression.replace(/\s+/g, ''));
  if (!match) {
    throw new Error(`Unsupported dice expression: ${expression}`);
  }

  const count = Number(match[1] || '1');
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  const advantage = options.advantage && !options.disadvantage;
  const disadvantage = options.disadvantage && !options.advantage;
  const rolls: number[] = [];
  const kept: number[] = [];

  const rollOnce = (): number => Math.floor(Math.random() * sides) + 1;

  if ((advantage || disadvantage) && sides === 20 && count === 1) {
    const first = rollOnce();
    const second = rollOnce();
    rolls.push(first, second);
    const selected = advantage ? Math.max(first, second) : Math.min(first, second);
    kept.push(selected);
  } else {
    for (let i = 0; i < count; i += 1) {
      let value = rollOnce();
      if (options.rerollOnes && value === 1) {
        value = rollOnce();
      }
      rolls.push(value);
      kept.push(value);
    }
  }

  if (options.dropLowest && options.dropLowest > 0 && kept.length > options.dropLowest) {
    kept.sort((a, b) => a - b);
    const drop = options.dropLowest;
    kept.splice(0, drop);
  }

  const total = kept.reduce((sum, roll) => sum + roll, 0) + modifier;
  const detailParts = [
    `${count}d${sides}`,
    options.rerollOnes ? 'reroll 1s' : null,
    advantage ? 'advantage' : null,
    disadvantage ? 'disadvantage' : null,
    options.dropLowest ? `drop lowest ${options.dropLowest}` : null,
  ].filter(Boolean);

  const detail = `${detailParts.join(', ')}${modifier ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : ''}`;

  return {
    total,
    rolls,
    kept,
    modifiers: modifier ? [modifier] : [],
    detail,
  };
}

export function rollAbilityScore(): DiceRollResult {
  return rollDice('4d6', { dropLowest: 1, rerollOnes: false });
}

export function rollAbilityArray(): number[] {
  return Array.from({ length: 6 }, () => rollAbilityScore().kept.reduce((sum, value) => sum + value, 0));
}
