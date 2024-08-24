import { HookActions } from './../actions/HookActions';
// AsyncHookLinkerConfig.tsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UIActions } from '../actions/UIActions';
import { Progress } from '../models/tracker/ProgressBar';
import { RootState } from '../state/redux/slices/RootSlice';
import { PhaseHookConfig } from './phaseHooks/PhaseHooks';

export interface AsyncHook<T> extends PhaseHookConfig {
  enable?: () => void; // Change enable method to not be optional
  disable?: () => void; // Change disable method to not be optional
 isActive: boolean;
  initialStartIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId: NodeJS.Timeout | null;
  startAnimation: () => void;
  stopAnimation: () => void;
  animateIn: () => void;
  toggleActivation: (accessToken?: string | null | undefined) => void; // Make accessToken optional and nullable
  cleanup: (() => void) | undefined;
  progress: Progress | null;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }) => Promise<() => void>
}



// Library's AsyncHook type
export interface LibraryAsyncHook {
  isActive?: boolean;
  enable: () => void;
  disable: () => void;
  condition: (idleTimeoutDuration: number) => Promise<boolean>
  idleTimeoutId: NodeJS.Timeout | null; // Add idleTimeoutId property
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void; // Add startIdleTimeout property
  asyncEffect?: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: any;
    startIdleTimeout: any;
    }) => Promise<() => void>;
  
}


// Update your AsyncHook interface to match the library's expectations
type AdaptedAsyncHook = LibraryAsyncHook;

// Now use the AdaptedAsyncHook in your useAsyncHookLinker hook
export interface AsyncHookLinkerConfig {
  hooks: AdaptedAsyncHook[];
}
const useAsyncHookLinker = ({ hooks }: AsyncHookLinkerConfig) => {
  const [currentHookIndex, setCurrentHookIndex] = useState<number>(0);



const idleTimeoutDuration = 10000;
  useEffect(() => {
    const executeAsyncEffect = async () => {
      if (currentHookIndex < hooks.length) {
        const currentHook = hooks[currentHookIndex];
        if (await currentHook.condition(idleTimeoutDuration)) {
          // Execute the async effect of the current hook
          let cleanup: (() => void) | undefined;
          try {
            const result = await currentHook.asyncEffect!({
              idleTimeoutId: currentHook.idleTimeoutId,
              startIdleTimeout: currentHook.startIdleTimeout,
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
        hooks[previousHookIndex].asyncEffect!({
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


  const moveToPreviousHook = () => {
    setCurrentHookIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return {
    moveToNextHook,
    moveToPreviousHook
  };
};


const asyncHook: AsyncHook<RootState> = {
  isActive: false,
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void | undefined) => { },
  initialStartIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    // Start the idle timeout with the specified duration
    const timeoutId = setTimeout(onTimeout, timeoutDuration);
    // Store the timeoutId for reference
    if (timeoutId !== null) {
      (asyncHook as any).idleTimeoutId = timeoutId;
    }
  },
  resetIdleTimeout: async (): Promise<void> => {
    // Implementation logic for resetIdleTimeout
    // Here you would reset the idle timeout
    // For example:
    if (asyncHook.idleTimeoutId !== null &&
      asyncHook.idleTimeoutId !== undefined) {
      clearTimeout(asyncHook.idleTimeoutId);
      asyncHook.idleTimeoutId = null;
    }
  },
  idleTimeoutId: null,
  stopAnimation: function (): void {
    // Implementation logic for stopping animation
    // For example:
    // If there's any ongoing animation, stop it
    // You can use animation libraries or native browser APIs to control animations
    // Here's a placeholder example:
    const animationElement = document.getElementById("animation-element");
    if (animationElement) {
      animationElement.style.animationPlayState = "paused";
    } else {
      throw new Error("Animation element not found.");
    }
  },
  animateIn: function (): void {
    // Implementation logic for animating in
    // Here you would define the animation behavior
    // For example, you can use CSS animations or JavaScript animations
    // This is a placeholder example using CSS animations:
    // Assuming you have an element with the class "animate-in-element"
    const element = document.querySelector(".animate-in-element");
    if (element) {
      // Add a CSS class to trigger the animation
      element.classList.add("animate-in");
    } else {
      throw new Error("Animate-in element not found.");
    }
  },
  startAnimation: function (): void {
    // Implementation logic for starting animation
    // Here you would define the animation behavior
    // For example, you can use CSS animations or JavaScript animations
    // This is a placeholder example using JavaScript animations:
    // Assuming you have an element with the id "animation-element"
    const element = document.getElementById("animation-element");
    if (element) {
      // Start the animation
      element.animate(
        [
          // Define keyframes for the animation
          { transform: "translateX(0)" }, // Initial state
          { transform: "translateX(100px)" }, // Final state
        ],
        {
          // Animation options
          duration: 1000, // 1 second duration
          easing: "ease-in-out", // Easing function
          iterations: 1, // Run the animation once
        }
      );
    } else {
      throw new Error("Animation element not found");
    }
  },
  toggleActivation: function (
    payload: any,
    accessToken?: string | null | undefined
  ): void {
    if (accessToken) {
      // If accessToken is provided, perform activation actions
      console.log("Activated with access token:", accessToken);
      // Perform activation actions here
      UIActions.showActivationMessage(payload); // Example: Show activation message on UI
      UIActions.enableFeatures(payload); // Example: Enable features on UI
    } else {
      // If accessToken is not provided, perform deactivation actions
      console.log("Deactivated due to missing access token");
      // Perform deactivation actions here
      UIActions.showDeactivationMessage(payload); // Example: Show deactivation message on UI
      UIActions.disableFeatures(payload); // Example: Disable features on UI
    }
  },
  cleanup: undefined,
  progress: null,
  name: "",
  condition: function (): Promise<boolean> {
    // Return a promise that resolves to true if the hook should run
    return Promise.resolve(true);
  },


  asyncEffect: async ({
    idleTimeoutId, startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }): Promise<() => void> => {
    // Implementation logic for async effect
    // This should return a cleanup function wrapped in a promise
    return async () => {
      // Perform async effect logic here
      console.log("Async effect ran!");

      // Return a cleanup function
      return () => {
        console.log("Async effect cleaned up!");
      };
    };
  },
  duration: "",
  enable: function (): void {
    // Dispatch the enable action
    useDispatch()(HookActions.enable());
    console.log('Async hook enabled');
    // If necessary, update the state to reflect that the hook is enabled
    HookActions.setActive(true);
  },
  disable: function (): void {
    // Dispatch the disable action
    useDispatch()(HookActions.disable());
    console.log('Async hook disabled');
    // If necessary, update the state to reflect that the hook is disabled
    HookActions.setActive(false);
  },
};


export default useAsyncHookLinker