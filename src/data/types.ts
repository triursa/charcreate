export type Ability =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type StatTarget =
  | `abilities.${Ability}`
  | 'speed.walk'
  | 'speed.fly'
  | 'senses.darkvision'
  | 'hp.max'
  | 'ac.base'
  | 'skills'
  | 'saves'
  | 'features'
  | 'attacks'
  | 'notes'
  | 'languages'
  | 'proficiency.bonus';

export type EffectOperator = 'set' | 'add' | 'max' | 'min' | 'replace-tag' | 'merge';

export interface Condition {
  type: 'level-at-least' | 'wearing-armor' | 'ability-min';
  value: number | { ability: Ability; score: number };
}

export interface Effect {
  id: string;
  target: StatTarget | string;
  op: EffectOperator;
  value: unknown;
  description?: string;
  condition?: Condition;
}

export type FeatureSource = 'race' | 'background' | 'class' | 'subclass';

export interface Feature {
  id: string;
  name: string;
  source: FeatureSource;
  level?: number;
  summary: string;
  effects: Effect[];
}

export interface ChoiceOption<T extends string = string> {
  id: T;
  name: string;
  description: string;
  features: Feature[];
  grants?: Record<string, unknown>;
}

export type AbilityBoostInstruction =
  | { type: 'fixed'; ability: Ability; amount: number }
  | { type: 'choice'; amount: number; count: number; abilities: Ability[] | 'any' };

export interface Race extends ChoiceOption {
  id: 'human' | 'aarakocra';
  speed: {
    walk: number;
    fly?: number;
  };
  abilityOptions: Array<{ id: string; description: string; boosts: AbilityBoostInstruction[] }>;
  languages: string[];
}

export interface Background extends ChoiceOption {
  id: 'acolyte' | 'soldier';
  skillProficiencies: string[];
  toolProficiencies?: string[];
  equipment: string[];
  featureId: string;
}

export interface Class extends ChoiceOption {
  id: 'fighter';
  hitDie: number;
  primaryAbilities: Ability[];
  savingThrows: Ability[];
  armorTraining: string[];
  weaponTraining: string[];
  skills: {
    choose: number;
    options: string[];
  };
  levelFeatures: Record<number, Feature[]>;
  subclasses: Subclass[];
  fightingStyles: FightingStyle[];
}

export interface Subclass extends ChoiceOption {
  id: 'champion';
  levelFeatures: Record<number, Feature[]>;
}

export interface FightingStyle {
  id: string;
  name: string;
  summary: string;
  effects: Effect[];
}

export interface AuditEntry {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: FeatureSource;
  target: string;
  operation: EffectOperator;
  value: unknown;
  result: unknown;
  detail: string;
  precedence: number;
}

export interface CharacterState {
  name: string;
  level: number;
  raceId: Race['id'] | null;
  backgroundId: Background['id'] | null;
  classId: Class['id'];
  subclassId: Subclass['id'] | null;
  abilityScores: Record<Ability, number>;
  selectedSkills: string[];
  raceAbilityOptionId: string | null;
  raceAbilityAssignments: Record<string, Ability[]>;
  effectChoices: Record<string, string | string[]>;
  notes: string;
}

export interface ComputedStatBlock {
  abilityScores: Record<Ability, number>;
  abilityModifiers: Record<Ability, number>;
  proficiencyBonus: number;
  speed: { walk: number; fly?: number };
  senses: { darkvision?: number };
  armorClass: number;
  hitPoints: number;
  saves: Record<Ability, number>;
  skills: Record<string, number>;
  audit: Record<string, AuditEntry[]>;
  features: Feature[];
  languages: string[];
  notes: string[];
}
