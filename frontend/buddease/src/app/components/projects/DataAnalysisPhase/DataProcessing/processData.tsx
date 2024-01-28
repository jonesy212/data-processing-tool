import dataProcessingService, { DataProcessing, DataProcessingResult } from './DataProcessingService';

// Usage
async function processData() {
  try {
    const data: DataProcessing = { datasetPath: '/path/to/dataset' };
    const result: DataProcessingResult = await dataProcessingService.loadDataAndProcess(data);
    // Handle the result as needed
  } catch (error) {
    // Handle errors
  }
}

// Call the function
processData();
