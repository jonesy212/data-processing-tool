// useDataExport.ts
import { useState } from 'react';
import axiosInstance from '../../security/csrfToken';
import { NotificationTypeEnum, useNotification } from '../../support/NotificationContext';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { NOTIFICATION_TYPES } from '../../support/NotificationTypes';

const { ERROR } = NOTIFICATION_TYPES;

interface DataExportResult {
  status: number;
  data: any[];
}

export const useDataExport = () => {
  const [exportedData, setExportedData] = useState<any[]>([]);
  const notificationContext = useNotification();

  const handleExportError = (errorMessage: string): never => {
    notificationContext.notify(
      "handleExportError",
      'Error trying to export data, try again',
      NOTIFICATION_MESSAGES.Data.ERROR_EXPORTING_DATA,
      new Date,
      NotificationTypeEnum.Error);
    throw new Error(ERROR);
  };

  const exportDataToServer = async (data: any): Promise<DataExportResult> => {
    try {
      // Replace '/api/export' with your actual API endpoint
      const response = await axiosInstance.post('/api/export', data);

      if (response.status === 200) {
        console.log('Data exported successfully:', response.data);
        return { status: response.status, data: response.data };
      } else {
        console.error('Error exporting data:', response.data);
        handleExportError('Error exporting data');
      }
    } catch (error: any) {
      console.error('Error exporting data:', error.message);
      handleExportError('Error exporting data');
    }
    // Add a default return statement to satisfy TypeScript
    return handleExportError('Unexpected error exporting data');
  };

  const exportData = async (data: any): Promise<DataExportResult> => {
    try {
      const exportedResult = await exportDataToServer(data);

      if (exportedResult.status === 200) {
        setExportedData(exportedResult.data);
        return exportedResult;
      } else {
        handleExportError('Error exporting data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      return Promise.reject({
        status: 500,
        data: [],
        errorType: ERROR,
      });
    }

    // Add a default return statement to satisfy TypeScript
    return handleExportError('Unexpected error exporting data');
  };

  return { exportedData, exportData };
};

export default useDataExport;
