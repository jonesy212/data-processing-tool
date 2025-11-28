// idleTimeoutHooks.ts
import EXTENDED_NOTIFICATION_MESSAGES from "@/app/features/support/ExtendedNotificationMessages";
import { IdleTimeoutType } from "@/app/config/UserSettings";
import { DynamicHookParams } from "./DynamicHookParams";
import { IDLE_TIMEOUT_DURATION, clearUserData, showModalOrNotification } from "./commHooks/idleTimeoutUtils";
import createDynamicHook from "./dynamicHooks/dynamicHookGenerator";

// Platform-agnostic timeout type
type TimeoutHandle = ReturnType<typeof setTimeout>;

const useIdleTimeout = (name: string | undefined, props: any): IdleTimeoutType => {
  let timeoutId: TimeoutHandle | null = null;

  const onTimeout = () => {
    clearUserData();
  };

  const startIdleTimeout = (timeoutDuration: number, onTimeout: () => void) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(onTimeout, timeoutDuration);
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
    idleTimeoutId: TimeoutHandle | null;
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