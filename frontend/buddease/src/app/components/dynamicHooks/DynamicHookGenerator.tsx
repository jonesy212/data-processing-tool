// DynamicHookGenerator.tsx
import { useEffect, useState } from 'react';

export type DynamicHookParams = {
  condition: () => boolean;
  asyncEffect: () => Promise<void>;
  cleanup?: () => void;
};

const createDynamicHook = ({ condition, asyncEffect, cleanup }: DynamicHookParams) => {
  return () => {
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
      if (isActive && condition()) {
        asyncEffect();
      }

      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    }, [condition, asyncEffect, cleanup, isActive]);

    return {
      toggleActivation: () => setIsActive((prev) => !prev),
    };
  };
};

export default createDynamicHook;
