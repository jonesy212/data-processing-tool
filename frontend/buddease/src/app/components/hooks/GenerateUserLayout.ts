// useLayoutGenerator.tsx
import { useEffect, useState } from 'react';

const useLayoutGenerator = (condition: any, layoutEffect: any, cleanup: any) => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isActive && condition()) {
      layoutEffect();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [condition, layoutEffect, cleanup, isActive]);

  return {
    toggleActivation: () => setIsActive((prev) => !prev),
  };
};

export default useLayoutGenerator;
