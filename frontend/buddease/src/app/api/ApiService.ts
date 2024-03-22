import dotProp from 'dot-prop';
import { AxiosError, AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import { handleApiError } from '@/app/api/ApiLogs';
import { CacheData } from '../generators/GenerateCache';
import { SupportedData } from '../components/models/CommonData';

// Define the structure of the response data
interface CacheResponse {
  // Define the structure of CacheResponse
}

export const readCache = async (): Promise<SupportedData> => {
  try {
    // Fetch cache data
    const cacheResponse: CacheResponse = await fetchCacheData();

    // Populate data from cacheResponse
    const supportedData: SupportedData = {
      // Populate supportedData based on cacheResponse
    };

    return supportedData;
  } catch (error) {
    console.error('Error reading cache:', error);
    throw error;
  }
};

// Function to fetch cache data (mock implementation)
const fetchCacheData = async (): Promise<CacheResponse> => {
  // Simulate fetching data from a server
  // Replace with actual implementation
  return {} as CacheResponse;
};

// Class to manage API calls and cache data
class ApiService {
  private API_BASE_URL: string;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  // Function to call API
  public async callApi(endpointPath: string, requestData: any): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as string | undefined;
      if (!endpoint) {
        throw new Error(`${endpointPath} endpoint not found`);
      }
      const response: AxiosResponse = await axiosInstance.post(endpoint, requestData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
      throw error;
    }
  }
}

export default ApiService;
