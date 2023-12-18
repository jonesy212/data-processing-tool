// hookGenerator.tsx
import { useEffect, useState } from 'react';

const useDynamicHook = (condition: any, asyncEffect: any, cleanup: any) => {
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

export default useDynamicHook;
