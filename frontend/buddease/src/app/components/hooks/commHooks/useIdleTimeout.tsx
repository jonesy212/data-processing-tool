// useIdleTimeout.tsx

import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import axios from "axios";
import { Router } from "react-router-dom";
import EXTENDED_NOTIFICATION_MESSAGES from "../../support/ExtendedNotificationMessages";
import createDynamicHook, { DynamicHookParams, DynamicHookResult } from "../dynamicHooks/dynamicHookGenerator";

const IDLE_TIMEOUT_DURATION = 60000; // 1 minute in milliseconds



interface IdleTimeoutProps {
  accessToken: string;
  router: typeof Router;
  extendedRouter: ExtendedRouter;
  setLastUserInteractionTime: (lastUserInteractionTime: number) => void;
  clearUserData: () => void;
  showModalOrNotification: (message: string) => void;
}


// Placeholder function for displaying a modal or notification
const showModalOrNotification = (message: string): void => {
    // Replace this with your actual logic for showing a modal or notification
    console.log(`Show Modal or Notification: ${message}`);
  };
  
  // Placeholder function for clearing user data
  const clearUserData = (): void => {
    // Replace this with your actual logic for clearing user data
    console.log('Clearing User Data');
  };
  

    
    
    

// Function to fetch the last user interaction time from the backend
const fetchLastUserInteractionTime = async (): Promise<number> => {
    try {
        const response = await axios.get('/api/getLastUserInteractionTime');
        return response.data.lastInteractionTime;
    } catch (error) {
        console.error('Error fetching last user interaction time:', error);
        // Handle error appropriately
        return 0; // Default value if the API call fails
    }
};


const useIdleTimeout = (): DynamicHookResult => {
  // Create a dynamic hook with the condition and effect functions
  
  const idleTimeoutCondition = async () => {
    // Your idle timeout condition logic goes here
    // For example, check if the user has been inactive for a certain duration

    const lastActivityTimestamp = await fetchLastUserInteractionTime();
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - lastActivityTimestamp;

    // Check if the elapsed time since the last activity exceeds the idle timeout duration
    const isIdle = elapsedTime >= IDLE_TIMEOUT_DURATION;

    return isIdle;
  };

  
  const idleTimeoutEffect = async () => {
    // Log out the user or perform any other action
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.SESSION_EXPIRING
    );
    try {
      await axios.post("/api/logout");
      showModalOrNotification(
        EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.LOGOUT_SUCCESS
      );
    } catch (error) {
      showModalOrNotification(
        EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.LOGOUT_ERROR
      );
    }

    // Clear sensitive user data or perform cleanup
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.CLEAR_DATA
    );
    clearUserData();

    // Redirect the user to a landing page
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.REDIRECT
    );

    window.location.href = "/landing";

    // Reset the idle timeout after the action
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.RESET_TIMEOUT
    );

    resetIdleTimeout();
      // Return a function that takes no arguments and returns void
    return () => {};
  };

  const resetIdleTimeout = () => {
    // Clear the existing timeout to avoid multiple timers
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Set a new timeout for the specified duration
    timeoutId = setTimeout(idleTimeoutEffect, IDLE_TIMEOUT_DURATION);
    showModalOrNotification(
      EXTENDED_NOTIFICATION_MESSAGES.IdleTimeout.RESET_TIMEOUT
    );
  };


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



  

  const idleTimeoutConditionSync = () => {
    return idleTimeoutCondition();
  };

  let timeoutId: NodeJS.Timeout = setTimeout(() => { }, 0);
  
  const idleTimeoutParams: DynamicHookParams = {
    isActive: false,
    condition: idleTimeoutConditionSync,
    asyncEffect: idleTimeoutEffect,
    cleanup: idleTimeoutCleanup,
    resetIdleTimeout: resetIdleTimeout,
    idleTimeoutId: timeoutId, // Convert timeoutId to string before assigning
    startIdleTimeout: startIdleTimeout,
  };
  


  const useIdleTimeoutHook = createDynamicHook(idleTimeoutParams, );

  // Add any additional methods or modifications specific to the useIdleTimeoutHook here

  return useIdleTimeoutHook();
}

export default useIdleTimeout;

export { clearUserData, showModalOrNotification };
