import { useEffect, useState } from 'react';

interface AsyncHook {
  condition: () => boolean;
  asyncEffect: () => Promise<(() => void) | void>;
}

interface AsyncHookLinkerConfig {
  hooks: AsyncHook[];
}

const useAsyncHookLinker = ({ hooks }: AsyncHookLinkerConfig) => {
  const [currentHookIndex, setCurrentHookIndex] = useState<number>(0);

  useEffect(() => {
    const executeAsyncEffect = async () => {
      if (currentHookIndex < hooks.length) {
        const currentHook = hooks[currentHookIndex];
        if (currentHook.condition()) {
          // Execute the async effect of the current hook
          const cleanup = await currentHook.asyncEffect();
          // Clean up the previous hook if it returned a cleanup function
          if (typeof cleanup === 'function') {
            return cleanup();
          }
        }
      }

      // Move to the next hook after executing the current one
      moveToNextHook();
    };

    // Execute the async effect when the component mounts or the current hook index changes
    executeAsyncEffect();

    // Cleanup the previous hook when the component unmounts
    return () => {
      const previousHookIndex = currentHookIndex - 1;
      if (previousHookIndex >= 0 && typeof hooks[previousHookIndex].asyncEffect === 'function') {
        hooks[previousHookIndex].asyncEffect(); // Cleanup the previous hook
      }
    };
  }, [currentHookIndex, hooks]);

  // Method to manually move to the next hook
  const moveToNextHook = () => {
    setCurrentHookIndex((prevIndex) =>
      Math.min(prevIndex + 1, hooks.length - 1)
    );
  };

  return {
    moveToNextHook,
  };
};

export default useAsyncHookLinker;
