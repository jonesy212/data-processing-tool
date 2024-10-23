// DataProcessingComponent.tsx

import React, { useEffect, useState } from "react";
import LoadingIndicator from "../tracker/LoadingIndicator";

interface DataProcessingProps {
  datasetPath: string;
  onDataProcessed: (datasetPath: string, result: DataProcessingResult) => void; // Add datasetPath
}

interface DataProcessingResult {
  // Define the structure of the result if needed
}

// Inside the component, invoke onDataProcessed with both datasetPath and result
const DataProcessingComponent: React.FC<DataProcessingProps> = ({
  datasetPath,
  onDataProcessed,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Inside useEffect, pass datasetPath along with result to onDataProcessed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/data-processing?datasetPath=${encodeURIComponent(datasetPath)}`
        );

        // Simulating asynchronous data processing
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2 seconds (simulating data processing)

        // Once data processing is completed, update the loading state
        setIsLoading(false);

        const result: DataProcessingResult = await response.json();
        onDataProcessed(datasetPath, result);
      } catch (error) {
        console.error("Error processing data:", error);
        // Handle error if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [datasetPath, onDataProcessed]);

  return (
    <div>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <div>{/* Your DataProcessing component content goes here */}</div>
      )}
      {/* Render the LoadingIndicator component based on the loading state */}
      <LoadingIndicator loading={isLoading} />

      <div style={{ display: isLoading ? "none" : "block" }}>
        {/* Your DataProcessing component content goes here */}
        <p>Data processing completed!</p>
      </div>
    </div>
  );
};

export default DataProcessingComponent;
