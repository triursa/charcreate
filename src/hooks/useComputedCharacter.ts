import { useMemo } from 'react';
import { useCharacterState } from '../state/store';
import { computeCharacter } from '../utils/compute';

export const useComputedCharacter = () => {
  const state = useCharacterState((store) => store);
  return useMemo(() => computeCharacter(state), [state]);
};
