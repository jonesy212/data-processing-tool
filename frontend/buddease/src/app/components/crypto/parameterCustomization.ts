// parameterCustomization.ts

import { endpoints } from "@/app/api/ApiEndpoints";
import ApiService from "@/app/api/ApiService";
import { AxiosResponse } from "axios";

// Define the type or interface for the request data
interface RequestData {
  // Define properties for the request data
  param1: string;
  param2: number;
  // Add more properties as needed
}


const API_BASE_URL = endpoints.parameterCustomization;
// Interface for parameter customization data
export interface ParameterCustomizationData {
  // Define properties for parameter customization data
}

// Create an instance of the request data
const requestData: RequestData = {
  param1: "value1",
  param2: 123,
  // Assign values to other properties as needed
};

/**
 * Function to fetch parameter customization data from the server.
 * @returns Promise<ParameterCustomizationData>
 */
export const fetchParameterCustomizationData =
  async (): Promise<ParameterCustomizationData> => {
    // Create an instance of the ApiService class with the API base URL
    const apiService = new ApiService(`${API_BASE_URL}`);



    
    try {
      // Now you can pass this requestData object to your API call
      const response: AxiosResponse<ParameterCustomizationData> =
        await apiService.callApi(
          "",
          requestData // Pass the requestData object here
          );
        
      return response.data;
    } catch (error) {
      // Handle errors
      console.error("Error fetching parameter customization data:", error);
      throw new Error(
        "Failed to fetch parameter customization data. Please try again later."
      );
    }
  };

  export { requestData };
