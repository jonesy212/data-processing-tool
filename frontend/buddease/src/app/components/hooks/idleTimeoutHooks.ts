import EXTENDED_NOTIFICATION_MESSAGES from "../support/ExtendedNotificationMessages";
import { DynamicHookParams } from "./DynamicHookParams";
import { clearUserData, resetIdleTimeout, showModalOrNotification } from "./commHooks/idleTimeoutUtils";
import createDynamicHook from "./dynamicHooks/dynamicHookGenerator";


// Define your custom hook function
const useIdleTimeout = (props: any) => {
  const startIdleTimeout = () => {
    // Start the idle timeout
    resetIdleTimeout();
  };

  // Call the startIdleTimeout function to ensure its usage
  startIdleTimeout();

  const idleTimeoutCleanup = () => {
    // Clear the timeout when the component unmounts or the hook is no longer used
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_CLEANUP
    );
  };

  let timeoutId: NodeJS.Timeout | null = null; // Initialize with null instead of undefined

  const idleTimeoutConditionAsync = async () => {
    // Perform asynchronous operations to determine if the idle timeout condition is met
    return true;
  };

  const idleTimeoutEffect = async () => {
    // Perform effect when idle timeout condition is met
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.TIMEOUT_TRIGGERED
    );
  };

  const idleTimeoutParams: DynamicHookParams = {
    intervalId: undefined,
    isActive: false,
    condition: idleTimeoutConditionAsync,
    asyncEffect: idleTimeoutEffect,
    cleanup: idleTimeoutCleanup,
    resetIdleTimeout: resetIdleTimeout,
    idleTimeoutId: timeoutId,
    startIdleTimeout: () => {},
    initialStartIdleTimeout: () => {},
  };

  const useIdleTimeoutHook = createDynamicHook(idleTimeoutParams);

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
};

export default useIdleTimeout;

export { clearUserData, showModalOrNotification };
