// DynamicPromptHookGenerator.tsx
DynamicPromptHook.ts
import createDynamicHook, { DynamicHookParams } from '@/core/hooks/dynamicHooks/dynamicHookGenerator';
import { processAutoGPTOutputWithSpaCy } from '@/core/intelligence/AutoGPTSpaCyIntegration';
import { useEffect } from 'react';

interface DynamicPromptConfig {
  condition: () => boolean;
  asyncEffect: () => Promise<() => void>;
}

const createDynamicPromptHook = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  config: DynamicPromptConfig & DynamicHookParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  return createDynamicHook({
    ...config,
    resetIdleTimeout: () => {
      // reset any idle timeouts
    },
    cleanup: () => {
      console.log('DynamicPromptHook - Cleanup');
    },
    isActive: true,
  });
};

const useDynamicPromptHook = createDynamicPromptHook({
  condition: () => {
    // Add condition logic based on your requirements
    const isDynamicPromptActive = true; // Replace with your condition
    return isDynamicPromptActive;
  },
  asyncEffect: async () => {
    try {
      // Example: Fetch user idea from an API or use a predefined idea
      const userIdea = "web development"; // Replace with your logic to fetch or determine the user's idea

      // Process AutoGPT output with spaCy
      const enhancedPrompt = await processAutoGPTOutputWithSpaCy(userIdea);

      if (enhancedPrompt) {
        console.log("Enhanced Prompt:", enhancedPrompt);
      } else {
        console.log("Prompt enhancement failed. Please provide a valid user idea.");
      }

      return () => {};
    } catch (error) {
      console.error('Error during Dynamic Prompt:', error);
      // Handle errors or log them as needed

      return () => {};
    }
  },
} as DynamicPromptConfig & DynamicHookParams);


// New code with useEffect integration
const useDynamicPromptHookWithEffect = () => {
  useEffect(() => {
    // Invoke the dynamic prompt hook when the component mounts
    const cleanup = useDynamicPromptHook.asyncEffect({
      idleTimeoutId: 0 as useIdleTimeout,
      startIdleTimeout: 0 as useIdleTimeout,
    });

    // Optionally, you can perform additional logic or set up other hooks

    // Cleanup function to be called on component unmount
    return () => {
      // Perform cleanup or clear any resources if needed
      cleanup();
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return useDynamicPromptHook;
};
export default useDynamicPromptHook;
