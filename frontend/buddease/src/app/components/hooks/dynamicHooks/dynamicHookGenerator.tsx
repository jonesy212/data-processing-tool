// DynamicHookGenerator.tsx
import { useEffect, useState } from "react";

export type DynamicHookParams = {
  condition: () => Promise<boolean>;
  asyncEffect: () => Promise<void>;
  cleanup?: () => void;
  resetIdleTimeout: () => void;
  isActive: boolean;
};

export type DynamicHookResult = {
  isActive: boolean;
  animateIn: (selector: string) => void;
  toggleActivation: () => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout?: () => void;
  intervalId?: number
};

const createDynamicHook = ({
  condition,
  asyncEffect,
  cleanup,
}: DynamicHookParams) => {
  return () => {
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
      const runAsyncEffect = async () => {
        if (isActive && await condition()) {
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
      toggleActivation: (options?: { accessToken?: string }) => {
        setIsActive((prev) => !prev);
        if (options?.accessToken) {
          console.log("Received accessToken:", options.accessToken);
        }
      },
      startAnimation: () => {},
      stopAnimation: () => {},
      animateIn: () => {},
    };
  };
};

export default createDynamicHook;
