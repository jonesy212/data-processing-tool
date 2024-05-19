import { AsyncHook } from "../useAsyncHookLinker";

export type DynamicHookParams = {
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }) => Promise<() => void>; 
  cleanup?: () => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId?: NodeJS.Timeout | null;
  isActive?: boolean;
  intervalId?: number | undefined;
  initialStartIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
  startIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
};

export type DynamicHookResult = {
  isActive: boolean;
  animateIn: (selector: string) => void;
  accessToken?: string | undefined;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout?: () => void;
  idleTimeoutId: NodeJS.Timeout | null;
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  intervalId?: number;
  toggleActivation: (accessToken?: string | null | undefined) => void;
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
  let isActive = initialIsActive !== undefined ? initialIsActive : false;

  return {
    name: 'Test Hook',
    progress: {
      id: "",
      value: 0,
      label: "Progress",
      current: 0,
      max: 100
    },
    phaseType: "",
    toggleActivation: async () => {},
    startAnimation: () => {},
    stopAnimation: () => {},
    animateIn: () => {},
    condition: condition,
    asyncEffect: async ({
      idleTimeoutId = null,
      startIdleTimeout,
    }: {
      idleTimeoutId: NodeJS.Timeout | null;
      startIdleTimeout: (
        timeoutDuration: number,
        onTimeout: () => void
      ) => void;
    }) => {
      await asyncEffect({ idleTimeoutId, startIdleTimeout });
      return () => {
        // Cleanup function if needed
        // Example 1: Resetting some state variables
        // resetSomeState();
        // Example 2: Clearing intervals or timeouts
        // clearInterval(intervalId);
        // clearTimeout(timeoutId);
        // Example 3: Cleaning up event listeners
        // window.removeEventListener('resize', handleResize);
        // Example 4: Disposing resources or subscriptions
        // disposeResource();
      };
    },
    resetIdleTimeout: resetIdleTimeout,
    idleTimeoutId: null,
    cleanup: cleanup,
    startIdleTimeout: startIdleTimeout ?? (() => {}), // Provide a default function if startIdleTimeout is undefined
    isActive: isActive,
    initialStartIdleTimeout: initialStartIdleTimeout ?? (() => { }), // Provide a default function if initialStartIdleTimeout is undefined
    duration: "1000", // Default duration
  };
};

export default createDynamicHook;
