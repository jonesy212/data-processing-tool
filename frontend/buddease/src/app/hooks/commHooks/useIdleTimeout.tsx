// useIdleTimeout.tsx

import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import { useEffect } from "react";
import { Router } from "react-router-dom";
// Define the type for the idleTimeoutEffect function
type IdleTimeoutEffectFunction = () => Promise<void>;

// Define the type for the idleTimeoutCondition function
type IdleTimeoutConditionFunction = (
  lastUserInteractionTime: number | null
) => boolean;

// Define the type for the fetchLastUserInteractionTime function
type FetchLastUserInteractionTimeFunction = () => Promise<number | null>;

// Define the type for the showModalOrNotification function
type ShowModalOrNotificationFunction = (message: string) => void;

// Define the type for the clearUserData function
type ClearUserDataFunction = () => void;

// Define the type for the resetIdleTimeout function
type ResetIdleTimeoutFunction = () => void;

const IDLE_TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

// Interface defining props for the useIdleTimeout hook
interface IdleTimeoutProps {
  IDLE_TIMEOUT_DURATION: number;
  accessToken: string;
  router: typeof Router;
  extendedRouter: ExtendedRouter;
  setLastUserInteractionTime: (lastUserInteractionTime: number) => void;
  ideleTimeoutEffect: IdleTimeoutEffectFunction;
  idleTimeoutConditionFunction: IdleTimeoutConditionFunction;
  fetchLastUserInteractionTime: FetchLastUserInteractionTimeFunction;
  showModalOrNotification: ShowModalOrNotificationFunction;
  clearUserData: ClearUserDataFunction;
  resetIdleTimeout: ResetIdleTimeoutFunction;
}

// useIdleTimeout hook implementation
const useIdleTimeout = (props: IdleTimeoutProps): (() => void) => {
  const {
    fetchLastUserInteractionTime,
    showModalOrNotification,
    clearUserData,
    resetIdleTimeout,
  } = props;

  useEffect(() => {
    // Your useEffect logic here
  }, [
    fetchLastUserInteractionTime,
    showModalOrNotification,
    clearUserData,
    resetIdleTimeout,
  ]);

  // Return a function that takes no arguments and returns void
  return () => {};
};

export default IdleTimeoutProps; useIdleTimeout;
