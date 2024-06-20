import axios from 'axios';
import { useState } from 'react';

import UserSettings from '@/app/configs/UserSettings';
import useRealtimeData from '../components/hooks/commHooks/useRealtimeData';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { DataVersions } from '../configs/DataVersionsConfig';
import FrontendStructure from '../configs/appStructure/FrontendStructure';
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
export const synchronizeCacheFromFrontend = async (
  initialData: any,
  updateCallback: any
) => {
  try {
    
    // Get the latest data from the useRealtimeData hook
    const updatedData = useRealtimeData(initialData, updateCallback);

    // Ensure updatedData matches CacheData interface
    const updatedCacheData: CacheData = {
      lastUpdated: {
        versions: {
          data: updatedData.fetchData.data,
          backend: updatedData.dataVersions.backend,
          frontend: updatedData.dataVersions.frontend,
        }
      },
      userSettings: {} as typeof UserSettings,
      dataVersions: {} as DataVersions,
      frontendStructure: {} as FrontendStructure,
      realtimeData: updatedData.realtimeData,
      fetchData: updatedData.fetchData,
      // Add other properties as needed to match the CacheData interface
      backendStructure: {} as any,
      backendConfig: {} as any,
      frontendConfig: {} as any,
      notificationBarPhaseHook: {} as any,
      // Add other missing properties here
    };

    // Call writeCache with updatedCacheData
    await writeCache(updatedCacheData);
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

    const updateCallback = (updatedData: any) => { 
      // Update the cache with the latest data from the useRealtimeData hook
      writeCache(updatedData as CacheData);
    }
      // Synchronize cache from the frontend after processing the batch
      useRealtimeData(initialData, updateCallback);
      
  };

  return { batchResults, processBatch };
};





export default useBatchProcessingAndCache;
