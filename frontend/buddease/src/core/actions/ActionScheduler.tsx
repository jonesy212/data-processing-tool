// ActionScheduler.tsx
import useAsyncHookLinker, { LibraryAsyncHook } from '@/core/hooks/useAsyncHookLinker';
import { useEffect } from 'react';

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
    enable: () => {}, 
    disable: () => {}, 
    condition: async () => true, 
    idleTimeoutId: null, 
    startIdleTimeout: (timeoutDuration: any, onTimeout: any) => {}, 
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
