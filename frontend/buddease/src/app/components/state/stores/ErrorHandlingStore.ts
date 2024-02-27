import { makeAutoObservable } from "mobx";

class ErrorHandlingStore {
  errorMessage = "";
  showError = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Method to set error message and show error flag
  setError(message) {
    this.errorMessage = message;
    this.showError = true;
  }

  // Method to clear error message and hide error flag
  clearError() {
    this.errorMessage = "";
    this.showError = false;
  }

  // Method to log error to console
  logError(error) {
    console.error(error);
    // You can also send the error to a logging service or backend for further analysis
  }

  // Method to handle errors based on provided error message and actions
  handleErrors(message, actions = {}) {
    this.setError(message);
    this.logError(message);
    // Perform additional actions based on provided actions object
    if (actions && typeof actions === "object") {
      // Example: Trigger actions based on error
      if (actions.triggerAction && typeof actions.triggerAction === "function") {
        actions.triggerAction();
      }
      // Add more actions as needed
    }
  }
}

const errorHandlingStore = new ErrorHandlingStore();
export default errorHandlingStore;
