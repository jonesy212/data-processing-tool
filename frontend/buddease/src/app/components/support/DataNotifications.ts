// DataNotifications.ts
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
const DATA_NOTIFICATIONS = {
  ...NOTIFICATION_MESSAGES  ,
  // Welcome and Account
  
  DataLoading: {
      DEFAULT: "Loading data...",
      PAGE_LOADING: "Loading page...",
      // Add more messages for the DataLoading type
    },
  
    // Error and Data
    DataError: {
      DEFAULT: (errorType: string) => `An ${errorType} occurred.`,
      FETCH_ERROR: "Error fetching data. Please try again later.",
      UPLOAD_ERROR: "Error uploading data. Please try again.",
      UPDATE_ERROR: "Error updating data. Please try again.",
      REMOVE_ERROR: "Error removing data. Please try again.",
      // Add more messages for the DataError type
    },
  
    // Success and Operation
    DataOperationSuccess: {
      DEFAULT: "Data operation successful.",
      FETCH_SUCCESS: "Data fetched successfully.",
      UPLOAD_SUCCESS: "Data uploaded successfully.",
      UPDATE_SUCCESS: "Data updated successfully.",
      REMOVE_SUCCESS: "Data removed successfully.",
      // Add more messages for the DataOperationSuccess type
    },
  
    // Add more categories as needed...
  
  } as const;
  
  export default DATA_NOTIFICATIONS;
  