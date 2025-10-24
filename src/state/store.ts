import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterState, Ability } from '../data/types';
import { abilities } from '../utils/abilities';

export interface CharacterActions {
  setName: (name: string) => void;
  setLevel: (level: number) => void;
  setRace: (raceId: CharacterState['raceId']) => void;
  setBackground: (backgroundId: CharacterState['backgroundId']) => void;
  setSubclass: (subclassId: CharacterState['subclassId']) => void;
  setAbilityScore: (ability: Ability, score: number) => void;
  setAbilityScores: (scores: Record<Ability, number>) => void;
  toggleSkill: (skill: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  setRaceAbilityOption: (optionId: string | null) => void;
  setRaceAbilityAssignments: (optionId: string, assignments: Ability[]) => void;
  setEffectChoice: (effectId: string, value: string | string[]) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const defaultAbilityScores: Record<Ability, number> = abilities.reduce(
  (acc, ability) => ({ ...acc, [ability]: 10 }),
  {} as Record<Ability, number>,
);

const initialState: CharacterState = {
  name: 'New Hero',
  level: 1,
  raceId: null,
  backgroundId: null,
  classId: 'fighter',
  subclassId: 'champion',
  abilityScores: defaultAbilityScores,
  selectedSkills: [],
  raceAbilityOptionId: null,
  raceAbilityAssignments: {},
  effectChoices: {},
  notes: '',
};

export const useCharacterStore = create<CharacterState & CharacterActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setName: (name) => set({ name }),
      setLevel: (level) => set({ level }),
      setRace: (raceId) => set({ raceId }),
      setBackground: (backgroundId) => set({ backgroundId }),
      setSubclass: (subclassId) => set({ subclassId }),
      setAbilityScore: (ability, score) =>
        set(({ abilityScores }) => ({ abilityScores: { ...abilityScores, [ability]: score } })),
      setAbilityScores: (scores) => set({ abilityScores: scores }),
      toggleSkill: (skill) => {
        const { selectedSkills } = get();
        if (selectedSkills.includes(skill)) {
          set({ selectedSkills: selectedSkills.filter((s) => s !== skill) });
        } else {
          set({ selectedSkills: [...selectedSkills, skill] });
        }
      },
      setSelectedSkills: (skills) => set({ selectedSkills: skills }),
      setRaceAbilityOption: (raceAbilityOptionId) => set({ raceAbilityOptionId }),
      setRaceAbilityAssignments: (optionId, assignments) =>
        set(({ raceAbilityAssignments }) => ({
          raceAbilityAssignments: { ...raceAbilityAssignments, [optionId]: assignments },
        })),
      setEffectChoice: (effectId, value) =>
        set(({ effectChoices }) => ({ effectChoices: { ...effectChoices, [effectId]: value } })),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    {
      name: 'charcreate-state',
      skipHydration: typeof window === 'undefined',
    },
  ),
);

export const useCharacterState = <T,>(selector: (state: CharacterState & CharacterActions) => T): T =>
  useCharacterStore(selector);

export const resetCharacterState = () => useCharacterStore.getState().reset();
