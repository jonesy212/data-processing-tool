import EXTENDED_NOTIFICATION_MESSAGES from "../support/ExtendedNotificationMessages";
import { DynamicHookParams } from "./DynamicHookParams";
import { IDLE_TIMEOUT_DURATION, clearUserData, showModalOrNotification } from "./commHooks/idleTimeoutUtils";
import createDynamicHook from "./dynamicHooks/dynamicHookGenerator";
import { IdleTimeoutType } from "@/app/configs/UserSettings";
const useIdleTimeout = (name: string | undefined, props: any): IdleTimeoutType => {
  let timeoutId: NodeJS.Timeout | null = null; // Initialize with null instead of undefined

  const onTimeout = () => {
    // Call clearUserData on timeout
    clearUserData();
  };

  const startIdleTimeout = (timeoutDuration: number, onTimeout: () => void) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(onTimeout, timeoutDuration);
  };

  const resetIdleTimeout = async (): Promise<void> => {
    // Clear the existing idle timeout (if any)
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Start a new idle timeout
    startIdleTimeout(IDLE_TIMEOUT_DURATION, onTimeout);
  };

  const idleTimeoutCleanup = () => {
    // Clear the timeout when the component unmounts or the hook is no longer used
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_CLEANUP
    );
  };

  const idleTimeoutConditionAsync = async () => {
    // Perform asynchronous operations to determine if the idle timeout condition is met
    return true;
  };

  const idleTimeoutEffect = async ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
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

  // Return the necessary properties/methods from the dynamic hook
  return {
    intervalId: undefined,
    isActive: useIdleTimeoutHook.isActive,
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
