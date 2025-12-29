// useDataExport.ts
import axiosInstance from '@/core/api/csrfToken';
import NOTIFICATION_MESSAGES from '@/core/features/support/NotificationMessages';
import { NOTIFICATION_TYPES } from "@/core/features/support/NotificationTypes";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
import { useState } from 'react';

const { ERROR } = NOTIFICATION_TYPES;

interface DataExportResult {
  status: number;
  data: any[];
}

export const useDataExport = () => {
  const [exportedData, setExportedData] = useState<any[]>([]);
  const notificationContext = useNotification();

  const handleExportError = (errorMessage: string): never => {
    notificationContext.notify({
      id: `handleExportError${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Data.ERROR_EXPORTING_DATA,
      data: {
        originalError: errorMessage,
        extra: {
          errorMessage: "Error trying to export data, try again",
          operation: "Data export"
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.ERROR,
      level: 'error'
    });
    throw new Error(errorMessage);
  };

  const handleExportSuccess = (data: any[], message?: string) => {
    notificationContext.notify({
      id: `exportDataSuccess${Date.now()}`,
      message: message || NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_SUCCESS || "Data exported successfully",
      data: {
        extra: {
          dataCount: data.length,
          operation: "Data export"
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success'
    });
  };

  const exportDataToServer = async (data: any): Promise<DataExportResult> => {
    try {
      // Replace '/api/export' with your actual API endpoint
      const response = await axiosInstance.post('/api/export', data);

      if (response.status === 200) {
        console.log('Data exported successfully:', response.data);
        handleExportSuccess(response.data);
        return { status: response.status, data: response.data };
      } else {
        console.error('Error exporting data:', response.data);
        handleExportError(`Server returned status ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      console.error('Error exporting data:', error.message);
      handleExportError(`Network error: ${error.message}`);
    }
    // This line won't be reached due to handleExportError throwing
    return { status: 500, data: [] };
  };

  const exportData = async (data: any): Promise<DataExportResult> => {
    try {
      const exportedResult = await exportDataToServer(data);

      if (exportedResult.status === 200) {
        setExportedData(exportedResult.data);
        return exportedResult;
      }
    } catch (error: any) {
      console.error('Error exporting data:', error.message);
      return Promise.reject({
        status: 500,
        data: [],
        errorType: NotificationTypeEnum.ERROR,
        message: error.message
      });
    }
    
    // Fallback for unexpected cases
    return { status: 500, data: [] };
  };

  const exportLocalData = async (data: any[]): Promise<void> => {
    try {
      // Local export logic (e.g., download file, save to localStorage, etc.)
      setExportedData(data);
      handleExportSuccess(data, "Data exported locally");
    } catch (error: any) {
      handleExportError(`Local export error: ${error.message}`);
    }
  };

  return { 
    exportedData, 
    exportData,        // For server export
    exportLocalData,   // For local export
    exportDataToServer // Direct server export without state update
  };
};

export default useDataExport;