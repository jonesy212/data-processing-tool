// useLayoutGenerator.tsx
import { DocxGenerator } from '@/app/generators/docxGenerator';
import { useEffect, useState } from 'react';

type LayoutGeneratorProps = {
  condition: () => boolean
  layoutEffect: () => void
  cleanup?: () => void
  documentGenerator: DocxGenerator
}


export const useLayoutGenerator = ({condition, layoutEffect, cleanup, documentGenerator}: LayoutGeneratorProps) => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isActive && condition()) {
      layoutEffect();
      documentGenerator.generateDocument()
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [condition, layoutEffect, cleanup, isActive, documentGenerator]);

  return {
    toggleActivation: () => setIsActive((prev) => !prev),
  };
};

export default useLayoutGenerator;
