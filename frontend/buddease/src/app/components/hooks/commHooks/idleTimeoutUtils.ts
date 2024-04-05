// idleTimeoutUtils.ts
import axios from "axios";

// Define the type for the idleTimeoutCondition function
type IdleTimeoutConditionFunction = (lastUserInteractionTime: number | null) => boolean;

// Define the type for the fetchLastUserInteractionTime function
type FetchLastUserInteractionTimeFunction = () => Promise<number | null>;

// Define the type for the showModalOrNotification function
type ShowModalOrNotificationFunction = (message: string) => void;

// Define the type for the clearUserData function
type ClearUserDataFunction = () => void;

// Define the type for the resetIdleTimeout function
type ResetIdleTimeoutFunction = () => void;

// Define the IDLE_TIMEOUT_DURATION constant
const IDLE_TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

// Define the idleTimeoutCondition function
const idleTimeoutCondition: IdleTimeoutConditionFunction = (lastUserInteractionTime) => {
  // Check if the last user interaction time is null or if the difference between the current time and the last user interaction time
  // is greater than the idle timeout duration
  return lastUserInteractionTime === null || (Date.now() - lastUserInteractionTime) >= IDLE_TIMEOUT_DURATION;
};

// Placeholder function for displaying a modal or notification
const showModalOrNotification: ShowModalOrNotificationFunction = (message) => {
  // Replace this with your actual logic for showing a modal or notification
  console.log(`Show Modal or Notification: ${message}`);
};




// Placeholder function for clearing user data
const clearUserData: ClearUserDataFunction = () => {
  // Replace this with your actual logic for clearing user data
  console.log('Clearing User Data');
};

// Function to fetch the last user interaction time from the backend
const fetchLastUserInteractionTime: FetchLastUserInteractionTimeFunction = async () => {
  try {
    const response = await axios.get('/api/getLastUserInteractionTime');
    return response.data.lastInteractionTime;
  } catch (error) {
    console.error('Error fetching last user interaction time:', error);
    // Handle error appropriately
    return 0; // Default value if the API call fails
  }
};

// Define the resetIdleTimeout function
const resetIdleTimeout: ResetIdleTimeoutFunction = () => {
  // Implement the resetIdleTimeout logic here
};

export {
  idleTimeoutCondition,
  showModalOrNotification,
  clearUserData,
  fetchLastUserInteractionTime,
  resetIdleTimeout,
  IDLE_TIMEOUT_DURATION,
};
