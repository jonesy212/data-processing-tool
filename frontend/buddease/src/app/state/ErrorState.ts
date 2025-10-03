interface ErrorState {
  errorMessage: string; // Error message to display
  errorCode?: number; // Optional error code
  errorType?: string; // Optional error type
  // Additional properties related to error state can be added here
}

// Example usage:
const errorState: ErrorState = {
  errorMessage: "An error occurred while processing your request.",
  errorCode: 500,
  errorType: "Internal Server Error"
};
