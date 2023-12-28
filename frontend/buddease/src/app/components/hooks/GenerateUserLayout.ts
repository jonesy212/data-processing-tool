// useLayoutGenerator.tsx
import { useEffect, useState } from 'react';

type LayoutGeneratorProps = {
  condition: () => boolean
  layoutEffect: () => void
  cleanup?: () => void
}


export const useLayoutGenerator = ({condition, layoutEffect, cleanup}: LayoutGeneratorProps) => {
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
