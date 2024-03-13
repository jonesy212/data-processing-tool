// idleTimeoutHooks.ts
import EXTENDED_NOTIFICATION_MESSAGES from "../support/ExtendedNotificationMessages";
import { DynamicHookParams } from "./DynamicHookParams";
import { resetIdleTimeout, showModalOrNotification } from "./commHooks/idleTimeoutUtils";


const startIdleTimeout = () => {
  // Start the idle timeout
  resetIdleTimeout();
};

    // Call the startIdleTimeout function to ensure its usage
    startIdleTimeout();

  const idleTimeoutCleanup = () => {
    // Clear the timeout when the component unmounts or the hook is no longer used
    clearTimeout(timeoutId);
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_CLEANUP
    );
  };

  let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);

const idleTimeoutParams: DynamicHookParams = {
  intervalId: undefined, // Placeholder value
  isActive: false,
  condition: idleTimeoutConditionSync,
  asyncEffect: idleTimeoutEffect,
  cleanup: idleTimeoutCleanup,
  resetIdleTimeout: resetIdleTimeout,
  idleTimeoutId: timeoutId, // Convert timeoutId to string before assigning
  startIdleTimeout: () => { }, // Placeholder function
  initialStartIdleTimeout: () => { },
}

  const useIdleTimeoutHook = createDynamicHook(idleTimeoutParams);

  // Add any additional methods or modifications specific to the useIdleTimeoutHook here

  // Return the necessary properties/methods from the dynamic hook
  return {
    intervalId: undefined, // Placeholder value
    isActive: useIdleTimeoutHook.isActive,
    animateIn: () => {}, // Placeholder function
    startAnimation: () => {}, // Placeholder function
    stopAnimation: () => {}, // Placeholder function
    resetIdleTimeout: useIdleTimeoutHook.resetIdleTimeout, // Provide resetIdleTimeout method from the dynamic hook
    idleTimeoutId: useIdleTimeoutHook.idleTimeoutId,
    startIdleTimeout: useIdleTimeoutHook.startIdleTimeout,
    toggleActivation: () => Promise.resolve(true), // Placeholder function
  };
}

export default useIdleTimeout;

export { clearUserData, showModalOrNotification };
