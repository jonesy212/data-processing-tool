// useDummyGenerator.ts
import { useState } from 'react';

export const generateDummyHook = (hookName: string) => {
  return {
    hook: () => {
      const [isActive, setIsActive] = useState(false);

      return {
        isActive,
        toggleActivation: () => setIsActive(!isActive),
      };
    },
  };
};
