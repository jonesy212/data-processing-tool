// DataProcessingService.ts
import { endpoints } from '@/app/api/ApiEndpoints';

import axios, { AxiosResponse } from 'axios';
import { observable, runInAction } from 'mobx';
import { DataActions } from '../DataActions';

const API_BASE_URL = endpoints.dataProcessing; // Use the data-processing endpoint from apiEndpoints.ts

interface DataProcessing {
  datasetPath: string;
  // Add more properties if needed
}

interface DataProcessingResult {
  // Define the structure of the result if needed
}

export const dataProcessingService = observable({
  loadDataAndProcess: async (data: DataProcessing): Promise<DataProcessingResult> => {
    try {
      const response: AxiosResponse<DataProcessingResult> = await axios.post(
        API_BASE_URL,
        data
      );

      runInAction(() => {
        DataActions.loadDataAndProcessSuccess({ result: response.data });
      });

      return response.data;
    } catch (error) {
      const errorMessage = String(error);
      console.error(`Error processing data: ${errorMessage}`);

      runInAction(() => {
        DataActions.loadDataAndProcessFailure({ error: errorMessage });
      });

      throw error;
    }
  },
});

export default dataProcessingService;
export type { DataProcessing, DataProcessingResult };
