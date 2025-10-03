// idleTimeoutCondition.ts
// Define the type for the idleTimeoutCondition function
type IdleTimeoutConditionFunction = (lastUserInteractionTime: number | null) => boolean;

// Define the IDLE_TIMEOUT_DURATION
const IDLE_TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

// Define the idleTimeoutCondition function
const idleTimeoutCondition: IdleTimeoutConditionFunction = (lastUserInteractionTime) => {
  // Check if the last user interaction time is null or if the difference between the current time and the last user interaction time
  // is greater than the idle timeout duration
  return lastUserInteractionTime === null || (Date.now() - lastUserInteractionTime) >= IDLE_TIMEOUT_DURATION;
};

export default idleTimeoutCondition;
