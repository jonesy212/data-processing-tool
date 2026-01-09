ErrorStore.ts
import { clearError, setError } from '@/core/state/redux/slices/ErrorSlice';
import { makeAutoObservable } from "mobx";

// Create an ErrorStore to manage error state
const errorStore = () => {
  // Initialize the error state with default values
  let error: ErrorState = {
    errorMessage: "",
    errorCode: undefined,
    errorType: undefined,
  };

  // Define actions to modify error state
  const setErrorState = (message: string, code?: number, type?: string) => {
    setError({ errorMessage: message, errorCode: code, errorType: type });
  };

  const clearErrorState = () => {
    clearError(); // Clear error without passing any arguments
  };

  // Make the store observable to automatically track changes
  makeAutoObservable({ error });

  // Return the error store object
  return {
    error,
    setErrorState,
    clearErrorState,
  };
};

// Export the error store
export { errorStore };
