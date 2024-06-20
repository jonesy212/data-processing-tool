// Phases.ts
// Import the calendar phase
import { AsyncHook } from "async_hooks";
import { calendarPhase } from "../calendar/CalendarPhase";
import { Lesson } from "../documents/CourseBuilder";
import { createPhaseHook } from "../hooks/phaseHooks/PhaseHooks";
import useAsyncHookLinker, { AsyncHookLinkerConfig, LibraryAsyncHook } from "../hooks/useAsyncHookLinker";
import { CustomPhaseHooks, Phase } from "../phases/Phase";
import React from "react";
import { IDLE_TIMEOUT_DURATION } from "../hooks/commHooks/idleTimeoutUtils";


const idleTimeoutDuration = 5000 
export const additionalPhase1: Phase = {
  id: "additionalPhase1",
  name: "Additional Phase 1",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  duration: 0,
  component: () => <div>Additional Phase 1 Component</div>,
  lessons: {} as Lesson[],
  hooks: createPhaseHook(idleTimeoutDuration, {
    duration: "0",
    canTransitionTo: () => true,
    handleTransitionTo: async () => {
      console.log("Transitioning to Additional Phase 1");
    },
    name: "",
    condition: async (idleTimeoutDuration: number): Promise<boolean> => {
      // Adjust the condition based on your requirements
      // Example: Allow transition only if the calendar phase is completed
      return (
        calendarPhase.endDate !== undefined &&
        calendarPhase.endDate < new Date()
      );
    },

    startIdleTimeout: (
      timeoutDuration: number,
      onTimeout: () => void | undefined
    ): void => {
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
  id: "additionalPhase2",
  name: "Additional Phase 2",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  duration: 0,
  component: () => <div>Additional Phase 2 Component</div>,
  lessons: {} as Lesson[],
  hooks: createPhaseHook(idleTimeoutDuration, {
    name: "",
    duration: "0",
    startIdleTimeout: (
      timeoutDuration: number,
      onTimeout: () => void | undefined
    ): void => {
      // Adjust the asynchronous effect based on your requirements
      console.log("Executing async effect for Additional Phase 2");
    },
    canTransitionTo: () => true,
    handleTransitionTo: async () => {
      console.log("Transitioning to Additional Phase 2");
    },
    condition: async function (idleTimeoutDuration: number): Promise<boolean> {
      // Adjust the condition based on your requirements

      // Example: Allow transition only if the calendar phase is completed
      return (
        calendarPhase.endDate !== undefined &&
        calendarPhase.endDate < new Date()
      );
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
    condition: async function (idleTimeoutDuration: number): Promise<boolean> {
  if (index < allPhases.length - 1) {
    const nextPhase = allPhases[index + 1];
    const hooks = phase.hooks;
    if (hooks && hooks.condition) {
      return await hooks.condition(idleTimeoutDuration);
    }
  }
  return false;
},
    asyncEffect: async () => {
      if (index < allPhases.length - 1) {
        const nextPhase = allPhases[index + 1];
        const hooks = phase.hooks;
        if (hooks && hooks.handleTransitionTo) {
          return hooks.handleTransitionTo(nextPhase);
        }
      }
    },
  })
);

const { moveToNextHook } = useAsyncHookLinker({
  hooks: asyncHooks as unknown as LibraryAsyncHook[],
} as AsyncHookLinkerConfig);


