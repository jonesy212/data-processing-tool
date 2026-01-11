// dataAnalysisOrchestrator.ts
// // Function to initiate data analysis process
import axiosInstance from '@/core/api/csrfToken';
import dataProcessingService, { DataProcessing, DataProcessingResult } from "@/core/api/service/DataProcessingService";
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

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
export const initiateDataAnalysis = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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
export const fetchDataForAnalysis = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<any> => { 
  try {
    const response = await axiosInstance.get("/api/data/" + event.id);
    return response.data;
  } catch (error) { 
    console.error("Error fetching data for analysis:", error);
    throw error;
  }
}