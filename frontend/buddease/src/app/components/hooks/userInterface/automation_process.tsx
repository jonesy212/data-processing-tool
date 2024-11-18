// AutomatioProcess.ts
import {ErrorHandlingActions}  from '../../../api/ErrorHandlingActions';
import ReactDOM, { useEffect } from 'react';
import { BaseData, Data } from '../../models/data/Data';
 import errorHandlingStore from '../../state/stores/ErrorHandlingStore';
import { NotificationType, NotificationTypeEnum, useNotification } from '../../support/NotificationContext';
import RandomWalkSuggestions from './RandomWalkSuggestions';
import React from "react";
import { notify } from '../../utils/snapshotUtils';
import { Snapshot } from '../../snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '../../snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '../../snapshots/SnapshotWithCriteria';
import { K, T } from '../../models/data/dataStoreMethods';


// Define a custom hook to handle errors and notifications
const useErrorHandling = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // Subscribe to error changes in the ErrorHandlingStore
    const unsubscribe = errorHandlingStore.subscribe(() => {
      const { errorMessage, showError } = errorHandlingStore.getState();
      if (showError) {
        // Display error notification
        addNotification({
          message: errorMessage,
          type: NotificationTypeEnum.Error,
          id: '',
          content: undefined,
          completionMessageLog: undefined,
          topics: [],
          highlights: [],
          files: [],
          meta: undefined,
          rsvpStatus: 'yes',
          participants: [],
          teamMemberId: '',
          getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<T, K>, SnapshotWithCriteria<BaseData, BaseData>>[]> {
            // Implement logic to access the snapshot store data
            const snapshotStoreData = this.snapshotStore;
            return Promise.resolve(snapshotStoreData);
          },
        
          getData: function (): Promise<Snapshot<SnapshotWithCriteria<T, K>, SnapshotWithCriteria<BaseData, BaseData>>[]> {
            // Access the data from the snapshot object and return the data
            const data = this.snapshots;
            return Promise.resolve(data);
          }
        });
      }
    });

    // Unsubscribe from error changes when component unmounts
    return () => {
      unsubscribe();
    };
  }, [addNotification]);

  return {
    
      // Method to handle errors and trigger actions
    
    handleErrors(message: string, actions?: typeof ErrorHandlingActions) {
      errorHandlingStore.setError(message);
      this.logError(message, "unknown");
      if (actions && actions.triggerAction) {
        actions.triggerAction();
      }
    },
      // Method to clear errors
      clearError: () => {
        errorHandlingStore.clearError();
      },
      // Method to log errors
      logError: (message: string, details: string) => {
        errorHandlingStore.logError(message, details);
      },
    };
};


// Automated system setup process
const config: SnapshotStoreConfigType<Snapshot<Data, K<T>>, K<T>> = new SnapshotStoreConfig({} as SnapshotStoreConfig<Snapshot<Data, K<T>>, K<T>>, notify).configure();

const setupAutomationSystem = (config: SnapshotStoreConfigType<Snapshot<Data, K<T>>, K<T>>, notify: (message: string, content: any, date: Date, type: NotificationType) => void) => {
  // Configure SnapshotStore
  typeof SnapshotStoreConfig === "function" && new SnapshotStoreConfig(config, notify);

  // Create and render RandomWalkSuggestions component
  // (Assuming you have a root element with id 'root' in your HTML)
  const rootElement = document.getElementById("root");
  rootElement && ReactDOM.render(<RandomWalkSuggestions />, rootElement);
};

// Run the setup process
setupAutomationSystem(config as SnapshotStoreConfigType<Snapshot<Data>>,
  notify()

  
);

// Export the custom hook for use in components
export default useErrorHandling;


