import React, { useEffect, useState } from "react";
import { createPhaseHook, idleTimeoutDuration } from "../hooks/phaseHooks/PhaseHooks";
import { navigateToCalendarPage } from "../navigation/navigateToCalendar";
import { CustomPhaseHooks, Phase } from "../phases/Phase";
import axiosInstance from "../security/csrfToken";

/**
 * Function to update state with additional data
 * @param initialState - Initial state for the component
 * @param additionalData - Additional data to be merged with the state
 * @returns An array containing state and a function to update the state with additional data
 */
const updateStateWithAdditionalData = <T, U>(
  initialState: T,
  additionalData: U
): [T & U, (data: Partial<T & U>) => void] => {
  // Initialize state with initial state and additional data
  const [state, setState] = useState<T & U>({ ...initialState, ...additionalData });

  // Function to update state with additional data
  const updateState = (data: Partial<T & U>) => {
    setState((prevState) => ({
      ...prevState,
      ...data,
    }));
  };

  // Update state when additional data changes
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      ...additionalData,
    }));
  }, [additionalData]);

  return [state, updateState];
};

export default updateStateWithAdditionalData;




// Define the handleTransitionTo function
export const handleTransitionToCalendarPhase = async () => {
  try {
    // Add any logic or side effects you want to perform when transitioning to the Calendar Phase
    console.log("Transitioning to Calendar Phase");

    // Example: Fetch additional data needed for the Calendar Phase using Axios
    const additionalData = await fetchDataUsingAxios();


    const initialState: Phase = {
      id: "",
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      subPhases: [],
      component: {} as React.FC,
      hooks: {} as CustomPhaseHooks,
      lessons: [],
      duration: 0
    };
    // Example: Update state 

    updateStateWithAdditionalData(initialState, additionalData);

    // Example: Navigate to a different page or perform other navigation actions
    navigateToCalendarPage();
  } catch (error) {
    console.error('Error during transition to Calendar Phase:', error);
  }
};

// Define the fetchData function using Axios
const fetchDataUsingAxios = async () => {
  try {
    // todo
    // Replace 'http://your-backend-api-base-url' with your actual backend API base URL
    const API_BASE_URL = 'http://your-backend-api-base-url';

    // Implement this method based on your actual backend API endpoint
    const response = await axiosInstance.get(`${API_BASE_URL}/api/data`, {
      headers: { Accept: 'application/vnd.yourapp.v1+json' },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching additional data:', error);
    throw error;
  }
};



// Define the calendar phase configuration
export const calendarPhase: Phase = {
  id: "calendar",
  name: "Calendar Phase",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  component: () => <div>Calendar Phase Component</div>,
  lessons: [],
  duration: 0,
  hooks: createPhaseHook(idleTimeoutDuration, {
    canTransitionTo: () => true,
    handleTransitionTo: handleTransitionToCalendarPhase,
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void | undefined) => {
      // logic to start the idle timeout
      const timeoutId = setTimeout(() => {
        console.log("Idle timeout triggered");
        onTimeout && onTimeout();
      }, timeoutDuration);
      console.log("Starting idle timeout");
    },
    name: "Calendar Phase",
    duration: "0",
    condition: async function (): Promise<boolean> {
      // Implement your condition logic here
      // Example: Check if a certain date is in the future
      const currentDate = new Date();
      const targetDate = new Date("2023-01-01");

      // Return true if the current date is before the target date
      return currentDate < targetDate;
    },
    phaseType: "default",
    asyncEffect: async function (): Promise<() => void> {
      // Implement your asynchronous effect logic here
      console.log("Executing async effect for Calendar Phase");

      // Example: Simulate an asynchronous task
      const asyncTask = new Promise<() => void>((resolve) => {
        // Simulate an API call or any asynchronous operation
        setTimeout(() => {
          console.log("Async task completed");

          // Resolve with a cleanup function
          resolve(() => {
            console.log("Calendar Cleanup logic");
            // Add cleanup logic here if needed
          });
        }, 2000); // Simulate a 2-second delay
      });

      
      
      // Return the promise for the cleanup function
      return asyncTask;
    },
  }) as unknown as CustomPhaseHooks,
};


