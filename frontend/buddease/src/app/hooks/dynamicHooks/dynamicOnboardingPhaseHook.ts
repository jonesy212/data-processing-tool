// dynamicOnboardingPhaseHook.ts

import createDynamicHook from './dynamicHookGenerator';

interface DynamicOnboardingPhaseHookConfig {
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: () => Promise<() => void>;
}

export const createDynamicOnboardingPhaseHook = (config: DynamicOnboardingPhaseHookConfig) => {
  return createDynamicHook({
    condition: config.condition,
    resetIdleTimeout: async () => {},
    asyncEffect: async ({
      idleTimeoutId,
      startIdleTimeout,
    }: {
      idleTimeoutId: NodeJS.Timeout | null;
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
    }): Promise<() => void> => {
      const cleanup = await config.asyncEffect();
      if (typeof cleanup === "function") {
        return cleanup;
      }
      return () => {}; // Return an empty function if cleanup is not a function
    },
  });
};

// useDynamicOnboardingPhaseHook
const useDynamicOnboardingPhaseHook = createDynamicOnboardingPhaseHook({
  condition: async (idleTimeoutDuration: number) => {
    const isDynamicOnboardingPhase = true; // Replace with your condition
    console.log('useEffect condition triggered for Dynamic Onboarding Phase');
    return isDynamicOnboardingPhase;
  },
  asyncEffect: async () => {
    try {
      // Add dynamic onboarding phase logic here
      console.log('useEffect triggered for Dynamic Onboarding Phase');

      //todo
      // Example: Fetch user information from an API or use predefined data
      const userInformation = {/* Replace with your logic to fetch or determine user information */};

      // Perform actions based on user information
      // For example, customize onboarding based on user attributes

      return () => {
        // Cleanup logic for Dynamic Onboarding Phase
        console.log('Cleanup for Dynamic Onboarding Phase');
      };
    } catch (error) {
      console.error('Error during Dynamic Onboarding Phase:', error);
      // Handle errors or log them as needed
      return () => {
        // Cleanup logic in case of error
        console.log('Cleanup for Dynamic Onboarding Phase (Error)');
      };
    }
  },
});

export default useDynamicOnboardingPhaseHook;
