import { useEffect, useState } from 'react';

export interface AsyncHook {
  condition: () => boolean;
  asyncEffect: ({ idleTimeoutId, startIdleTimeout }: {
    idleTimeoutId: any,
    startIdleTimeout: any
  }) => Promise<void | (() => void)>;
  isActive: 
}

// Library's AsyncHook type
export interface LibraryAsyncHook {
  enable: () => void;
  disable: () => void;
  condition: () => boolean;
  asyncEffect: ({ idleTimeoutId, startIdleTimeout, }: { idleTimeoutId: any; startIdleTimeout: any; }) => Promise<() => void>
}

// Update your AsyncHook interface to match the library's expectations
type AdaptedAsyncHook = LibraryAsyncHook;

// Now use the AdaptedAsyncHook in your useAsyncHookLinker hook
export interface AsyncHookLinkerConfig {
  hooks: AdaptedAsyncHook[];
}
const useAsyncHookLinker = ({ hooks }: AsyncHookLinkerConfig) => {
  const [currentHookIndex, setCurrentHookIndex] = useState<number>(0);

  useEffect(() => {
    const executeAsyncEffect = async () => {
      if (currentHookIndex < hooks.length) {
        const currentHook = hooks[currentHookIndex];
        if (currentHook.condition()) {
          // Execute the async effect of the current hook
          let cleanup: (() => void) | undefined;
          try {
            const result = await currentHook.asyncEffect({
              idleTimeoutId: 'idleTimeoutId',
              startIdleTimeout: 'startIdleTimeout',
            });
            if (typeof result === "function") {
              cleanup = result;
            }
          } catch {
            cleanup = undefined;
          }
          // Clean up the previous hook if it returned a cleanup function
          if (typeof cleanup === "function") {
            cleanup();
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
      if (
        previousHookIndex >= 0 &&
        typeof hooks[previousHookIndex].asyncEffect === "function"
      ) {
        hooks[previousHookIndex].asyncEffect(
          {
            idleTimeoutId: 'idleTimeoutId',
            startIdleTimeout: 'startIdleTimeout',
          }); // Cleanup the previous hook
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
