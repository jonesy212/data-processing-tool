// Phases.ts
// Import the calendar phase
import { AsyncHook } from "async_hooks";
import { calendarPhase } from "../calendar/CalendarPhase";
import { createPhaseHook } from "../hooks/phaseHooks/PhaseHooks";
import useAsyncHookLinker, { AsyncHookLinkerConfig, LibraryAsyncHook } from "../hooks/useAsyncHookLinker";
import { CustomPhaseHooks, Phase } from "../phases/Phase";

export const additionalPhase1: Phase = {
  name: 'Additional Phase 1',
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  duration: 0,
  component: () => <div>Additional Phase 1 Component</div>,
  hooks: createPhaseHook({
    duration: 0,
    canTransitionTo: () => true,
    handleTransitionTo: async () => {
      console.log('Transitioning to Additional Phase 1');
    },
    name: "",
    condition: function (): boolean {
      // Adjust the condition based on your requirements
      // Example: Allow transition only if the calendar phase is completed
      return calendarPhase.endDate < new Date();
    },
    asyncEffect: async function (): Promise<() => void> {
      // Adjust the asynchronous effect based on your requirements
      console.log("Executing async effect for Additional Phase 1");

      // Simulate an asynchronous task
      const asyncTask = new Promise<() => void>((resolve) => {
        setTimeout(() => {
          console.log("Async task completed for Additional Phase 1");
          resolve(() => {
            console.log("Cleanup logic for Additional Phase 1");
            // Add cleanup logic here if needed
          });
        }, 2000); // Simulate a 2-second delay
      });

      // Return the promise for the cleanup function
      return asyncTask;
    },
  }) as unknown as CustomPhaseHooks,
};

export const additionalPhase2: Phase = {
  name: 'Additional Phase 2',
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  duration: 0,
  component: () => <div>Additional Phase 2 Component</div>,
  hooks: createPhaseHook({
      duration: 0,
      canTransitionTo: () => true,
      handleTransitionTo: async () => {
          console.log('Transitioning to Additional Phase 2');
      },
      name: "",
      condition: function (): boolean {
          // Adjust the condition based on your requirements
          // Example: Allow transition only if the calendar phase is completed
          return calendarPhase.endDate < new Date();
      },
      asyncEffect: async function (): Promise<() => void> {
          // Adjust the asynchronous effect based on your requirements
          console.log("Executing async effect for Additional Phase 2");

          // Simulate an asynchronous task
          const asyncTask = new Promise<() => void>((resolve) => {
              setTimeout(() => {
                  console.log("Async task completed for Additional Phase 2");
                  resolve(() => {
                      console.log("Cleanup logic for Additional Phase 2");
                      // Add cleanup logic here if needed
                  });
              }, 2000); // Simulate a 2-second delay
          });

          // Return the promise for the cleanup function
          return asyncTask;
      },
  }) as unknown as CustomPhaseHooks,
};


// Create an array of phases
const allPhases: Phase[] = [calendarPhase, additionalPhase1, additionalPhase2];


// Create async hooks for all phases
const asyncHooks: AsyncHook[] = allPhases.map(
  (phase: Phase, index: number) => ({
    name: `${phase.name} Async Hook`,
    enable: () => {
      // add enable logic
      return {} as AsyncHook;
    },
    disable: () => {
      // add disable logic
      return {} as AsyncHook;
    },
    condition: () => {
      if (index < allPhases.length - 1) {
        const nextPhase = allPhases[index + 1];
        return phase.hooks.canTransitionTo(nextPhase);
      }
      return false;
    },
    asyncEffect: async () => {
      if (index < allPhases.length - 1) {
        const nextPhase = allPhases[index + 1];
        return phase.hooks.handleTransitionTo(nextPhase);
      }
    },
  })
);

const { moveToNextHook } = useAsyncHookLinker({
  hooks: asyncHooks as unknown as LibraryAsyncHook[],
} as AsyncHookLinkerConfig);


