// DynamicHookGenerator.tsx
import { AsyncHook } from "../useAsyncHookLinker";

export type DynamicHookParams = {
  condition:(idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: any;
    startIdleTimeout: any;
  }) => Promise<void | (() => void)>;
  cleanup?: () => void;
  resetIdleTimeout: () => void;
  idleTimeoutId: NodeJS.Timeout | null;
  isActive: boolean;
  intervalId: number | undefined;
  initialStartIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  startIdleTimeout: (
    timeoutDuration: number, onTimeout: () => void) => void;
};


export type DynamicHookResult = {
  isActive: boolean;
  animateIn: (selector: string) => void;
  accessToken?: (string | undefined);
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout?: () => void;
  
  idleTimeoutId: NodeJS.Timeout | null;
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  intervalId?: number;
  toggleActivation?: () => Promise<boolean>;
};


const createDynamicHook = ({
  condition,
  asyncEffect,
  resetIdleTimeout,
  cleanup,
  isActive: initialIsActive,
  startIdleTimeout,
  initialStartIdleTimeout,
}: DynamicHookParams): AsyncHook => {
  return {
    toggleActivation: async () => { },
    condition: condition,
    asyncEffect: async ({
      idleTimeoutId,
      startIdleTimeout,
    }: {
      idleTimeoutId: NodeJS.Timeout | null; // Update type here
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
    }): Promise<void | (() => void)> => {
      await asyncEffect({ idleTimeoutId, startIdleTimeout });
      return () => {
        // Cleanup function if needed
      };
    },
    resetIdleTimeout: resetIdleTimeout, // Add resetIdleTimeout property
    idleTimeoutId: null, // Initialize with null
    startIdleTimeout: startIdleTimeout, // Add startIdleTimeout property
    cleanup: cleanup, // Add cleanup property
    isActive: initialIsActive,
    initialStartIdleTimeout: initialStartIdleTimeout
  };
};

export default createDynamicHook;



