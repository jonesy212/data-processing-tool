// AutomatioProcess.ts
import ReactDOM, { useEffect } from 'react';
import SnapshotStoreConfig, { Snapshot, SnapshotStoreConfig as SnapshotStoreConfigType, } from '../../state/stores/SnapshotStore';
import RandomWalkSuggestions from './RandomWalkSuggestions';
import { Data } from '../../models/data/Data';
import { NotificationType, useNotification } from '../../support/NotificationContext';




// Define a custom hook to handle errors and notifications
const useErrorHandling = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // Subscribe to error changes in the ErrorHandlingStore
    const unsubscribe = errorHandlingStore.subscribe(() => {
      const { errorMessage, showError } = errorHandlingStore;
      if (showError) {
        // Display error notification
        addNotification(errorMessage);
      }
    });

    // Unsubscribe from error changes when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    // Method to handle errors and trigger actions
    handleErrors: errorHandlingStore.handleErrors,
    // Method to clear errors
    clearError: errorHandlingStore.clearError,
    // Method to log errors
    logError: errorHandlingStore.logError,
    // Additional methods or properties as needed
  };
};


// Automated system setup process
const config: SnapshotStoreConfigType<Snapshot<Data>> = new SnapshotStoreConfig({} as SnapshotStoreConfig<Snapshot<Data>>, notify).configure();

const setupAutomationSystem = (config: SnapshotStoreConfigType<Snapshot<Data>>, notify: (message: string, content: any, date: Date, type: NotificationType) => void) => {
  // Configure SnapshotStore
  typeof SnapshotStoreConfig === "function" && new SnapshotStoreConfig(config, notify);

  // Create and render RandomWalkSuggestions component
  // (Assuming you have a root element with id 'root' in your HTML)
  const rootElement = document.getElementById("root");
  rootElement && ReactDOM.render(<RandomWalkSuggestions />, rootElement);
};

// Run the setup process
setupAutomationSystem(config as  SnapshotStoreConfigType<Snapshot<Data>>);

// Export the custom hook for use in components
export default useErrorHandling;


