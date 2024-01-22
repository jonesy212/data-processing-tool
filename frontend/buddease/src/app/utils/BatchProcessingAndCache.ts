import axios from 'axios';
import { useState } from 'react';

import useRealtimeData from '../components/hooks/commHooks/useRealtimeData';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { CacheData } from '../generators/GenerateCache';
import { writeCache } from './ReadAndWriteCache';

interface BatchProcessingResult {
  success: boolean;
  message?: string;
  data?: any;
}

// Function to process a batch on the server
export const processBatchOnServer = async (batchData: any[]): Promise<BatchProcessingResult> => {
  try {
    // Replace '/api/process-batch' with your actual API endpoint
    const response = await axios.post('/api/process-batch', { batchData });

    if (response.status === 200) {
      const { success, message, data } = response.data as BatchProcessingResult;
      if (success) {
        console.log('Batch processed successfully:', message);
        // Perform any additional actions on success
      } else {
        console.error('Error processing batch:', message);
        // Handle processing error
      }
      return { success, message, data };
    } else {
      console.error('Error processing batch:', response.data);
      // Handle error response
      return { success: false, message: 'Error processing batch' };
    }
  } catch (error: unknown) {
    console.error('Error processing batch:', NOTIFICATION_MESSAGES.Error.NETWORK_ERROR);
    // Handle network errors or other issues
    return { success: false, message: 'Error processing batch' };
  }
};

// Function to synchronize cache from the frontend
export const synchronizeCacheFromFrontend = async (initialData: any, updateCallback: any) => {
  try {
    // Get the latest data from the useRealtimeData hook
    const updatedData = useRealtimeData(initialData, updateCallback);
    await writeCache(updatedData as CacheData);
    console.log("Cache synchronized from frontend successfully");
  } catch (error) {
    console.error("Error synchronizing cache from frontend:", error);
  }
};

const useBatchProcessingAndCache = () => {
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const processBatch = async (selectedData: any[], initialData: any) => {
    // Your logic for batch processing (e.g., send to server for processing)
    const processedResult = await processBatchOnServer(selectedData);
    if (processedResult.success) {
      setBatchResults(processedResult.data);
    }

    // Synchronize cache from the frontend after processing the batch
    synchronizeCacheFromFrontend(initialData);
  };

  return { batchResults, processBatch };
};

export default useBatchProcessingAndCache;
