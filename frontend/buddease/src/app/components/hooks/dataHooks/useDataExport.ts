// useDataExport.ts
import axios from 'axios';
import { useState } from 'react';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';

const { ERROR } = NOTIFICATION_TYPES; // Destructure the ERROR type

// Function to export data to the server
export const exportDataToServer = async (
  data: any
): Promise<{ status: number; data: any[] }> => {
  try {
    // Replace '/api/export' with your actual API endpoint
    const response = await axios.post('/api/export', data);

    if (response.status === 200) {
      console.log('Data exported successfully:', response.data);
      // Perform any additional actions on success
      return { status: response.status, data: response.data };
    } else {
      console.error('Error exporting data:', response.data);
      // Handle error response using ERROR type
      throw new Error(ERROR);
    }
  } catch (error: any) {
    console.error('Error exporting data:', error.message);
    // Handle network errors or other issues using ERROR type
    throw new Error(ERROR);
  }
};

const useDataExport = () => {
  const [exportedData, setExportedData] = useState<any[]>([]);

  const exportData = async (
    data: any
  ): Promise<{ status: number; data: any[] }> => {
    try {
      const exportedResult = await exportDataToServer(data);

      if (exportedResult.status === 200) {
        setExportedData(exportedResult.data);
        return exportedResult;
      } else {
        // Handle error using ERROR type
        throw new Error(ERROR);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      // Return a rejected promise with the ERROR type
      return Promise.reject({
        status: 500,
        data: [],
        errorType: ERROR,
      });
    }
  };

  return { exportedData, exportData };
};

export default useDataExport;
