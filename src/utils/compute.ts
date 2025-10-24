import { backgrounds } from '../data/backgrounds';
import { classes } from '../data/classes';
import { races } from '../data/races';
import {
  Ability,
  AbilityBoostInstruction,
  AuditEntry,
  CharacterState,
  ComputedStatBlock,
  Effect,
  Feature,
  FeatureSource,
  FightingStyle,
} from '../data/types';
import { abilityModifier, applyAbilityBoosts } from './abilities';
import { allSkills, skillAbilities } from './skills';

const precedenceMap: Record<FeatureSource, number> = {
  race: 1,
  background: 2,
  class: 3,
  subclass: 4,
};

function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

function collectFeatures(
  featureList: Feature[],
  level: number,
  source: FeatureSource,
  subclassFeatures?: Record<number, Feature[]>,
): Feature[] {
  const entries: Feature[] = [];
  featureList.forEach((feature) => {
    if (!feature.level || feature.level <= level) {
      entries.push(feature);
    }
  });
  if (subclassFeatures) {
    Object.entries(subclassFeatures).forEach(([lvl, feats]) => {
      if (Number(lvl) <= level) {
        entries.push(...feats);
      }
    });
  }
  return entries;
}

interface ChoiceResolutionContext {
  effectChoices: CharacterState['effectChoices'];
}

const toArray = (value: string | string[] | undefined, fallbackCount = 1): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return [value];
  }
  return Array.from({ length: fallbackCount }, () => '');
};

function resolveChoice<T>(
  effect: Effect,
  value: { type: 'choice'; count?: number; options: T[] },
  context: ChoiceResolutionContext,
): T[] {
  const count = value.count ?? 1;
  const selected = toArray(context.effectChoices[effect.id], count).filter(Boolean);
  const sanitized: T[] = [];
  const available = value.options;
  for (let i = 0; i < count; i += 1) {
    const choice = selected[i];
    if (choice && available.includes(choice as T)) {
      sanitized.push(choice as T);
    } else if (available[i]) {
      sanitized.push(available[i]);
    }
  }
  return sanitized;
}

function resolveFightingStyles(
  effect: Effect,
  value: { type: 'fighting-style-choice'; options: FightingStyle[]; allowDuplicates?: boolean },
  context: ChoiceResolutionContext,
): FightingStyle[] {
  const rawChoices = toArray(context.effectChoices[effect.id]);
  let chosenIds = rawChoices.filter(Boolean);
  if (!chosenIds.length && value.options.length > 0) {
    chosenIds = [value.options[0].id];
  }
  if (!value.allowDuplicates) {
    chosenIds = Array.from(new Set(chosenIds));
  }
  return chosenIds
    .map((id) => value.options.find((style) => style.id === id))
    .filter((style): style is FightingStyle => Boolean(style));
}

function applyAbilityOption(
  base: Record<Ability, number>,
  instructions: AbilityBoostInstruction[],
  assignments: Ability[] = [],
): Record<Ability, number> {
  return applyAbilityBoosts(base, instructions, assignments);
}

export interface ComputedCharacterContext {
  race?: ReturnType<typeof getRace>;
  background?: ReturnType<typeof getBackground>;
  klass: ReturnType<typeof getClass>;
  subclass?: ReturnType<typeof getSubclass>;
}

function getRace(id: CharacterState['raceId']) {
  return id ? races.find((race) => race.id === id) : undefined;
}

function getBackground(id: CharacterState['backgroundId']) {
  return id ? backgrounds.find((bg) => bg.id === id) : undefined;
}

function getClass(id: CharacterState['classId']) {
  const fallback = classes[0];
  return classes.find((klass) => klass.id === id) ?? fallback;
}

function getSubclass(id: CharacterState['subclassId'], klass: ReturnType<typeof getClass>) {
  return id ? klass.subclasses.find((sub) => sub.id === id) : undefined;
}

interface FeatureResolution {
  features: Feature[];
  extraFeatures: Feature[];
  audit: AuditEntry[];
  skillChoices: string[];
  fightingStyles: FightingStyle[];
  notes: string[];
}

function resolveFeatures(
  allFeatures: Feature[],
  context: ChoiceResolutionContext,
): FeatureResolution {
  const skillChoices: string[] = [];
  const fightingStyles: FightingStyle[] = [];
  const extraFeatures: Feature[] = [];
  const audit: AuditEntry[] = [];
  const notes: string[] = [];

  allFeatures.forEach((feature) => {
    feature.effects.forEach((effect) => {
      if (typeof effect.value === 'string') {
        return;
      }
      if (!effect.value || typeof effect.value !== 'object') {
        return;
      }
      if ('type' in effect.value) {
        switch (effect.value.type) {
          case 'choice': {
            const result = resolveChoice(effect, effect.value, context);
            if (effect.target === 'skills') {
              skillChoices.push(...(result as string[]));
            }
            break;
          }
          case 'grant': {
            if (effect.target === 'skills') {
              skillChoices.push(...effect.value.skills);
            }
            break;
          }
          case 'half-proficiency': {
            notes.push('Half proficiency: ' + (effect.value.abilities as string[]).join(', '));
            break;
          }
          case 'fighting-style-choice': {
            const chosenStyles = resolveFightingStyles(effect, effect.value, context);
            fightingStyles.push(...chosenStyles);
            chosenStyles.forEach((style) => {
              extraFeatures.push({
                id: `${effect.id}-${style.id}`,
                name: style.name,
                source: feature.source,
                summary: style.summary,
                effects: style.effects,
              });
            });
            break;
          }
          default:
            break;
        }
      }
    });
  });

  return { features: allFeatures, extraFeatures, audit, skillChoices, fightingStyles, notes };
}

export function computeCharacter(state: CharacterState): {
  stats: ComputedStatBlock;
  context: ComputedCharacterContext;
  aggregatedFeatures: Feature[];
  fightingStyles: FightingStyle[];
} {
  const klass = getClass(state.classId);
  const race = getRace(state.raceId);
  const background = getBackground(state.backgroundId);
  const subclass = getSubclass(state.subclassId, klass);

  const level = Math.max(1, Math.min(20, state.level));

  let abilityScores = { ...state.abilityScores };
  if (race && state.raceAbilityOptionId) {
    const option = race.abilityOptions.find((opt) => opt.id === state.raceAbilityOptionId);
    if (option) {
      abilityScores = applyAbilityOption(
        abilityScores,
        option.boosts,
        state.raceAbilityAssignments[option.id] ?? [],
      );
    }
  }

  const abilityModifiers: Record<Ability, number> = {
    strength: abilityModifier(abilityScores.strength),
    dexterity: abilityModifier(abilityScores.dexterity),
    constitution: abilityModifier(abilityScores.constitution),
    intelligence: abilityModifier(abilityScores.intelligence),
    wisdom: abilityModifier(abilityScores.wisdom),
    charisma: abilityModifier(abilityScores.charisma),
  };

  const profBonus = proficiencyBonus(level);

  const baseSpeed = {
    walk: race?.speed.walk ?? 30,
    fly: race?.speed.fly,
  };

  const classFeatures: Feature[] = [];
  Object.entries(klass.levelFeatures).forEach(([lvl, features]) => {
    if (Number(lvl) <= level) {
      classFeatures.push(...features);
    }
  });

  const subclassFeatures: Feature[] = subclass
    ? collectFeatures([], level, 'subclass', subclass.levelFeatures)
    : [];

  const allFeatures: Feature[] = [
    ...(race?.features ?? []),
    ...(background?.features ?? []),
    ...classFeatures,
    ...subclassFeatures,
  ];

  const resolved = resolveFeatures(allFeatures, { effectChoices: state.effectChoices });

  const aggregatedFeatures = [...allFeatures, ...resolved.extraFeatures];

  const languages = new Set<string>();
  if (race?.languages) {
    race.languages.forEach((lang) => languages.add(lang));
  }

  const notes = new Set<string>(resolved.notes);

  const audit: Record<string, AuditEntry[]> = {};

  const pushAudit = (target: string, entry: AuditEntry) => {
    if (!audit[target]) {
      audit[target] = [];
    }
    audit[target].push(entry);
  };

  const addAudit = (
    target: string,
    feature: Feature,
    effect: Effect,
    result: unknown,
  ) => {
    pushAudit(target, {
      id: `${feature.id}-${effect.id}`,
      sourceId: feature.id,
      sourceName: feature.name,
      sourceType: feature.source,
      target,
      operation: effect.op,
      value: effect.value,
      result,
      detail: effect.description ?? feature.summary,
      precedence: precedenceMap[feature.source],
    });
  };

  let hitPointsBase = klass.hitDie + abilityModifiers.constitution;
  if (level > 1) {
    const perLevel = Math.floor(klass.hitDie / 2) + 1 + abilityModifiers.constitution;
    hitPointsBase += perLevel * (level - 1);
  }
  pushAudit('hp.max', {
    id: 'base-hp',
    sourceId: 'class-base',
    sourceName: `${klass.name} Base`,
    sourceType: 'class',
    target: 'hp.max',
    operation: 'set',
    value: hitPointsBase,
    result: hitPointsBase,
    detail: `Base HP from class (d${klass.hitDie}) and Constitution modifier`,
    precedence: precedenceMap.class,
  });

  let armorClass = 10 + abilityModifiers.dexterity;
  pushAudit('ac.base', {
    id: 'base-ac',
    sourceId: 'base-ac',
    sourceName: 'Base Armor Class',
    sourceType: 'class',
    target: 'ac.base',
    operation: 'set',
    value: armorClass,
    result: armorClass,
    detail: '10 + Dexterity modifier',
    precedence: precedenceMap.class,
  });

  let speedWalk = baseSpeed.walk;
  pushAudit('speed.walk', {
    id: 'base-speed',
    sourceId: 'race-speed',
    sourceName: race ? `${race.name} Speed` : 'Base Speed',
    sourceType: race ? 'race' : 'class',
    target: 'speed.walk',
    operation: 'set',
    value: speedWalk,
    result: speedWalk,
    detail: 'Base walking speed',
    precedence: race ? precedenceMap.race : precedenceMap.class,
  });

  let speedFly = baseSpeed.fly;
  if (typeof speedFly === 'number') {
    pushAudit('speed.fly', {
      id: 'base-fly-speed',
      sourceId: 'race-fly-speed',
      sourceName: race ? `${race.name} Flight` : 'Flight',
      sourceType: 'race',
      target: 'speed.fly',
      operation: 'set',
      value: speedFly,
      result: speedFly,
      detail: 'Base flying speed',
      precedence: precedenceMap.race,
    });
  }

  let darkvision: number | undefined;

  let hitPointsBonus = 0;

  const skillProficiencies = new Set<string>(background?.skillProficiencies ?? []);
  state.selectedSkills.forEach((skill) => skillProficiencies.add(skill));
  resolved.skillChoices.forEach((skill) => skillProficiencies.add(skill));

  const halfProficiencyAbilities = new Set<Ability>();

  const applyEffect = (feature: Feature, effect: Effect) => {
    const { value } = effect;
    switch (effect.target) {
      case 'hp.max': {
        if (effect.op === 'add') {
          if (value && typeof value === 'object' && 'perLevel' in (value as Record<string, unknown>)) {
            const bonus = (value as { perLevel: number }).perLevel * level;
            hitPointsBonus += bonus;
            addAudit('hp.max', feature, effect, hitPointsBase + hitPointsBonus);
          } else if (typeof value === 'number') {
            hitPointsBonus += value;
            addAudit('hp.max', feature, effect, hitPointsBase + hitPointsBonus);
          }
        }
        break;
      }
      case 'ac.base': {
        if (effect.op === 'add' && typeof value === 'number') {
          armorClass += value;
          addAudit('ac.base', feature, effect, armorClass);
        }
        break;
      }
      case 'speed.walk': {
        if (effect.op === 'set' && typeof value === 'number') {
          speedWalk = value;
          addAudit('speed.walk', feature, effect, speedWalk);
        }
        break;
      }
      case 'speed.fly': {
        if (effect.op === 'set') {
          if (value && typeof value === 'object' && 'scaling' in value) {
            const scaled = speedWalk;
            speedFly = scaled;
            addAudit('speed.fly', feature, effect, speedFly);
          } else if (typeof value === 'number') {
            speedFly = value;
            addAudit('speed.fly', feature, effect, speedFly);
          }
        }
        break;
      }
      case 'senses.darkvision': {
        if (effect.op === 'set' && typeof value === 'number') {
          darkvision = value;
          addAudit('senses.darkvision', feature, effect, darkvision);
        }
        break;
      }
      case 'languages': {
        if (effect.op === 'merge') {
          if (Array.isArray(value)) {
            value.forEach((lang) => languages.add(lang));
            addAudit('languages', feature, effect, Array.from(languages));
          } else if (value && typeof value === 'object' && 'type' in value) {
            if (value.type === 'choice') {
              resolveChoice(effect, value, { effectChoices: state.effectChoices }).forEach((lang) =>
                languages.add(lang),
              );
              addAudit('languages', feature, effect, Array.from(languages));
            }
          }
        }
        break;
      }
      case 'skills': {
        if (effect.op === 'merge') {
          if (Array.isArray(value)) {
            value.forEach((skill) => skillProficiencies.add(skill));
          } else if (value && typeof value === 'object' && 'type' in value) {
            if (value.type === 'grant') {
              value.skills.forEach((skill: string) => skillProficiencies.add(skill));
            }
            if (value.type === 'half-proficiency') {
              (value.abilities as Ability[]).forEach((ability) => halfProficiencyAbilities.add(ability));
            }
          }
          addAudit('skills', feature, effect, Array.from(skillProficiencies));
        }
        break;
      }
      case 'notes': {
        if (effect.op === 'merge') {
          if (typeof value === 'string') {
            notes.add(value);
            addAudit('notes', feature, effect, Array.from(notes));
          }
        }
        break;
      }
      default:
        break;
    }
  };

  aggregatedFeatures.forEach((feature) => {
    feature.effects.forEach((effect) => applyEffect(feature, effect));
  });

  const noteList = Array.from(notes);

  const finalHitPoints = hitPointsBase + hitPointsBonus;
  const finalArmorClass = armorClass;

  const saves: Record<Ability, number> = {
    strength: abilityModifiers.strength,
    dexterity: abilityModifiers.dexterity,
    constitution: abilityModifiers.constitution,
    intelligence: abilityModifiers.intelligence,
    wisdom: abilityModifiers.wisdom,
    charisma: abilityModifiers.charisma,
  };
  klass.savingThrows.forEach((ability) => {
    saves[ability] += profBonus;
  });

  const skills: Record<string, number> = {};
  allSkills.forEach((skill) => {
    const ability = skillAbilities[skill];
    let bonus = abilityModifiers[ability];
    if (skillProficiencies.has(skill)) {
      bonus += profBonus;
    } else if (halfProficiencyAbilities.has(ability)) {
      bonus += Math.floor(profBonus / 2);
    }
    skills[skill] = bonus;
  });

  const stats: ComputedStatBlock = {
    abilityScores,
    abilityModifiers,
    proficiencyBonus: profBonus,
    speed: { walk: speedWalk, ...(speedFly ? { fly: speedFly } : {}) },
    senses: darkvision ? { darkvision } : {},
    armorClass: finalArmorClass,
    hitPoints: finalHitPoints,
    saves,
    skills,
    audit,
    features: aggregatedFeatures,
    languages: Array.from(languages),
    notes: noteList,
  };

  return {
    stats,
    context: {
      race,
      background,
      klass,
      subclass,
    },
    aggregatedFeatures,
    fightingStyles: resolved.fightingStyles,
  };
}
