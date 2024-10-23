// idleTimeoutParams.ts

import { DynamicHookParams } from "../DynamicHookParams";

// Define the type for the idleTimeoutParams object
interface IdleTimeoutParams extends DynamicHookParams {
    intervalId: undefined;
    isActive: boolean;
    condition: (idleTimeoutDuration: number) => Promise<boolean>;
    asyncEffect: ({
      idleTimeoutId,
      startIdleTimeout,
    }: {
      idleTimeoutId: any;
      startIdleTimeout: any;
    }) => Promise<(() => void)>;
    cleanup?: () => void;
    resetIdleTimeout: () => Promise<void>;
    idleTimeoutId: NodeJS.Timeout;
    startIdleTimeout: () => void;
  }
  
  export default IdleTimeoutParams;
  