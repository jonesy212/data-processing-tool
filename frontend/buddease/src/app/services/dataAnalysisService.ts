// Function to initiate data analysis process
import axiosInstance from "../api/axiosInstance";
import dataProcessingService, { DataProcessing, DataProcessingResult } from "../components/projects/DataAnalysisPhase/DataProcessing/DataProcessingService";
import { CalendarEvent } from "../components/state/stores/CalendarEvent";

export const sendDataToBackend = async (data: any) => {
  try {
    // Example: Send processed data to the backend
    const response = await axiosInstance.post("/api/data-analysis", data);
    console.log("Data sent to backend:", response.data);
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }
};


// Function to initiate data analysis process
export const initiateDataAnalysis = async (event: CalendarEvent) => {
  try {
    // Step 1: Fetch Original Data
    const originalData = await fetchDataForAnalysis(event);

    // Step 2: Perform Data Processing
    const data: DataProcessing = { datasetPath: event.datasetPath }; // Assuming datasetPath is a property of the event
    const processedResult: DataProcessingResult = await dataProcessingService.loadDataAndProcess(data);

    // Step 3: Display Original Data
    console.log("Original Data:", originalData);
    // Display the original data in the user interface or log it for inspection.
    // For example, you can display a table, chart or other visualization of the original data
    

    // Step 4: Display Processed Result
    console.log("Processed Result:", processedResult);
    // Display the processed result, including insights and visualizations, in the user interface or log it for inspection.
    
    // Step 5: Store or Send Data to Backend (Optional)
    await sendDataToBackend(processedResult); // Optionally, you can send the processed result to the backend for storage or further analysis.
  } catch (error) {
    // Handle errors
    console.error("Error during data analysis:", error);
  }
};

// Function to fetch original data for analysis
export const fetchDataForAnalysis = async (event: CalendarEvent): Promise<any> => { 
  try {
    const response = await axiosInstance.get("/api/data/" + event.id);
    return response.data;
  } catch (error) { 
    console.error("Error fetching data for analysis:", error);
    throw error;
  }
}