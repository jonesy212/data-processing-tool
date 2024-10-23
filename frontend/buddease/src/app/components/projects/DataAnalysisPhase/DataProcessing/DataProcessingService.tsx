// DataProcessingService.ts
import { endpoints } from '@/app/api/ApiEndpoints';

import axiosInstance from '@/app/api/axiosInstance';
import axios, { AxiosResponse } from 'axios';
import { response } from 'express';
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
        `${API_BASE_URL}`,
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

  processDataForAnalysis: async (data: DataProcessing): Promise<DataProcessingResult> => {
    try {
      const response: AxiosResponse<DataProcessingResult> = await axiosInstance.post(
        API_BASE_URL + '/process',
        data
      );
      runInAction(() => {
        DataActions.processDataForAnalysisSuccess({
          result: response.data
        })
        // Call success action with reponse data
        DataActions.processDataForAnalysisSuccess({ result: response.data });
      })
    } catch (error) {
      const errorMessage = String(error);
      console.error(`Error processing data for analysis: ${errorMessage}`);

      runInAction(() => {
        DataActions.processDataForAnalysisFailure({
          error: errorMessage
        })
      })
      throw error
    }
    return response
  }
});

export default dataProcessingService;
export type { DataProcessing, DataProcessingResult };
