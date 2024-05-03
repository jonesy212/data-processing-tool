// ErrorSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the ErrorState interface
interface ErrorState {
  errorMessage: string; // Error message to display
  errorCode?: number; // Optional error code
  errorType?: string; // Optional error type
  // Additional properties related to error state can be added here
}

// Define the initial state for the error slice
const initialState: ErrorState = {
  errorMessage: "",
  errorCode: undefined,
  errorType: undefined,
  // Initialize additional properties if needed
};

// Create a slice for managing error state
const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setError: (
      state,
      action: PayloadAction<{ errorMessage: string; errorCode?: number; errorType?: string }>
    ) => {
      const { errorMessage, errorCode, errorType } = action.payload;
      // Update the error state with the provided error details
      state.errorMessage = errorMessage;
      state.errorCode = errorCode;
      state.errorType = errorType;
    },
    clearError: (state) => {
      // Clear the error state
      state.errorMessage = "";
      state.errorCode = undefined;
      state.errorType = undefined;
    },
    // Additional reducers for error management can be added here
  },
});

// Export actions and reducer from the error slice
export const { setError, clearError } = errorSlice.actions;
export default errorSlice.reducer;
export type { ErrorState };
