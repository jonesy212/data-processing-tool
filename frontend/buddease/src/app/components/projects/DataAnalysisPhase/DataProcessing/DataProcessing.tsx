import axios, { AxiosResponse } from 'axios';

// Define the structure of the data to be sent for processing
export interface DataProcessing {
  datasetPath: string;
  // Add more properties if needed
}

// Define the structure of the result from the data processing
interface DataProcessingResult {
  // Define the structure of the result if needed
}

// Service class for handling data processing operations
class DataProcessingService {
  private static instance: DataProcessingService;
  private baseURL: string;

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public static getInstance(baseURL: string): DataProcessingService {
    if (!this.instance) {
      this.instance = new DataProcessingService(baseURL);
    }
    return this.instance;
  }

  // Function to send a request for data processing to the backend
  public async loadDataAndProcess(data: DataProcessing): Promise<DataProcessingResult> {
    try {
      // Make a request to the backend endpoint for data processing
      const response: AxiosResponse<DataProcessingResult> = await axios.post(
        `${this.baseURL}/api/data-processing`,
        data
      );
      
      // Process the response if necessary
      const result: DataProcessingResult = response.data;

      return result;
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }
}

// Example usage:
const dataProcessingService = DataProcessingService.getInstance('/your-api-base-url');

export default dataProcessingService;
export type { DataProcessingResult };

