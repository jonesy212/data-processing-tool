// DynamicHookParams.tsx


export type DynamicHookParams = {
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: number | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }) => Promise<() => void>; 
  cleanup?: () => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId?: number | null;
  isActive?: boolean;
  intervalId?: number | undefined;
  initialStartIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
  startIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
};
