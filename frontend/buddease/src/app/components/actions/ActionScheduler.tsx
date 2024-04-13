// ActionScheduler.ts
import { useEffect } from 'react';
import useAsyncHookLinker, { LibraryAsyncHook } from '../hooks/useAsyncHookLinker';

interface SchedulerProps {
  actionsToSchedule: LibraryAsyncHook[];
}

const ActionScheduler = ({ actionsToSchedule }: SchedulerProps) => {
  const { moveToNextHook } = useAsyncHookLinker({ hooks: actionsToSchedule });

  useEffect(() => {
    moveToNextHook();
  }, []);

  return null; // You can replace this with your JSX if needed
};

const actionsToSchedule: LibraryAsyncHook[] = [
  {
    enable: () => {}, // Define enable function if needed
    disable: () => {}, // Define disable function if needed
    condition: () => true, // Define condition function to always execute
    idleTimeoutId: null, // Initialize idleTimeoutId as null
    startIdleTimeout: (timeoutDuration: any, onTimeout: any) => {}, // Define startIdleTimeout function if needed
    asyncEffect:
      async ({
        idleTimeoutId,
        startIdleTimeout,
      }: {
        idleTimeoutId: any;
        startIdleTimeout: any;
      }) =>
      () => {}, // Define asyncEffect function to return a function
  },
  // Add more actions as needed
];

<ActionScheduler actionsToSchedule={actionsToSchedule} />;

export default ActionScheduler;
