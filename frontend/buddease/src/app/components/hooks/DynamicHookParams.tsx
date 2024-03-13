// DynamicHookParams.tsx

export type DynamicHookParams = {
    condition: (idleTimeoutDuration: number) => Promise<boolean>;
    asyncEffect: ({
      idleTimeoutId,
      startIdleTimeout,
    }: {
      idleTimeoutId: NodeJS.Timeout | null;
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void; // Correct type definition
    }) => Promise<void | (() => void)>;
    cleanup?: () => void;
    resetIdleTimeout: () => void;
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void; // Correct type definition
    isActive: boolean;
  };
  