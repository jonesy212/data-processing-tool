// DynamicHookGenerator.tsx
import { useEffect, useState } from "react";

export type DynamicHookParams = {
  condition: () => Promise<boolean>;
  asyncEffect: () => Promise<() => void>;
  cleanup?: () => void;
  resetIdleTimeout: () => void;
  idleTimeoutId: string
  startIdleTimeout: () => void;
  isActive: boolean;
};

export type DynamicHookResult = {
  isActive: boolean;
  animateIn: (selector: string) => void;
  toggleActivation: (accessToken: string) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout?: () => void;
  intervalId?: number;
};

const createDynamicHook = ({
  condition,
  asyncEffect,
  resetIdleTimeout,
  cleanup,
  isActive: initialIsActive
}: DynamicHookParams) => {
  return () => {
    const [isActive, setIsActive] = useState(initialIsActive);

    useEffect(() => {
      const runAsyncEffect = async () => {
        if (isActive && (await condition())) {
          await asyncEffect();
        }
      };

      runAsyncEffect();

      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    }, [condition, asyncEffect, cleanup, isActive]);

    return {
      isActive,
      toggleActivation: (accessToken: string) => {
        
        setIsActive((prev) => !prev);
      },
      startAnimation: () => {},
      stopAnimation: () => {},
      animateIn: () => {},
      asyncEffect,
      cleanup,
      resetIdleTimeout,
    };
  };
};

export default createDynamicHook;
