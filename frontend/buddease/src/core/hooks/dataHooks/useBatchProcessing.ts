// useBatchProcessing.ts
import axios from 'axios';
import { useState } from 'react';

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
  } catch (error: any) {
    console.error('Error processing batch:', error.NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
    // Handle network errors or other issues
    return { success: false, message: 'Error processing batch' };
  }
};


const useBatchProcessing = () => {
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const processBatch = (selectedData: any[]) => {
    // Your logic for batch processing (e.g., send to server for processing)
    const processedResult = processBatchOnServer(selectedData); // Replace with your actual batch processing function
    setBatchResults(prev => [...prev, processedResult]);
  };

  return { batchResults, processBatch };
};

export default useBatchProcessing;
