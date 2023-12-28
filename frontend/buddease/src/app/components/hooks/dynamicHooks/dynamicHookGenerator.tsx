// DynamicHookGenerator.tsx
import { useEffect, useState } from 'react';

export type DynamicHookParams = {
  condition: () => boolean;
  asyncEffect: () => Promise<void>;
  cleanup?: () => void;
};

export type DynamicHookResult = {
  isActive: boolean;
  toggleActivation: () => void;
  startAnimation: () => void; // Add startAnimation method
  stopAnimation: () => void; // Add stopAnimation method
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
      isActive,
      toggleActivation: (options?: { accessToken?: string }) => {
        setIsActive((prev) => !prev);
        if (options?.accessToken) {
          // Handle accessToken as needed
          console.log('Received accessToken:', options.accessToken);
        }
      },
      startAnimation: () => {},
      stopAnimation: () => {},
    };
  };
};


export default createDynamicHook;
