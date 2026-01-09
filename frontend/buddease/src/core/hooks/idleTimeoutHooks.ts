idleTimeoutHooks.ts
import { IdleTimeoutType } from "@/core/config/UserSettings";
import EXTENDED_NOTIFICATION_MESSAGES from "@/core/features/support/ExtendedNotificationMessages";
import { IDLE_TIMEOUT_DURATION, clearUserData, showModalOrNotification } from "@/core/hooks/commHooks/idleTimeoutUtils";
import { DynamicHookParams } from "./DynamicHookParams";
import createDynamicHook from "./dynamicHooks/dynamicHookGenerator";

// Use NodeJS.Timeout instead of custom TimeoutHandle
const useIdleTimeout = (name?: string | undefined, props?: any): IdleTimeoutType => {
  let timeoutId: NodeJS.Timeout | null = null; // Change to NodeJS.Timeout

  const onTimeout = () => {
    clearUserData();
  };

  const startIdleTimeout = (timeoutDuration: number, onTimeout: () => void) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(onTimeout, timeoutDuration); // No type casting needed
  };

  const resetIdleTimeout = async (): Promise<void> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    startIdleTimeout(IDLE_TIMEOUT_DURATION, onTimeout);
  };

  const idleTimeoutCleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_CLEANUP
    );
  };

  const idleTimeoutConditionAsync = async () => {
    return true;
  };

  const idleTimeoutEffect = async ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null; // Change to NodeJS.Timeout
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }): Promise<() => void> => {
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_TRIGGERED
    );
    return () => {
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }
    };
  };

  const idleTimeoutParams: DynamicHookParams = {
    intervalId: undefined,
    isActive: false,
    condition: idleTimeoutConditionAsync,
    asyncEffect: idleTimeoutEffect,
    cleanup: idleTimeoutCleanup,
    resetIdleTimeout: resetIdleTimeout,
    idleTimeoutId: timeoutId,
    startIdleTimeout: startIdleTimeout,
    initialStartIdleTimeout: startIdleTimeout,
  };

  const useIdleTimeoutHook = createDynamicHook(idleTimeoutParams);

  return {
    intervalId: undefined,
    isActive: useIdleTimeoutHook.isActive,
    idleTimeoutDuration: 0,
    animateIn: () => {}, 
    startAnimation: () => {}, 
    stopAnimation: () => {}, 
    resetIdleTimeout: resetIdleTimeout, 
    idleTimeoutId: useIdleTimeoutHook.idleTimeoutId,
    startIdleTimeout: useIdleTimeoutHook.startIdleTimeout,
    toggleActivation: () => Promise.resolve(true),
  };
};

export default useIdleTimeout;