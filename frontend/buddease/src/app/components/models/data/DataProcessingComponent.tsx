// DataProcessingComponent.tsx

import React, { useEffect, useState } from 'react';

interface DataProcessingProps {
  datasetPath: string;
  onDataProcessed: (result: DataProcessingResult) => void;
}

interface DataProcessingResult {
  // Define the structure of the result if needed
}

const DataProcessingComponent: React.FC<DataProcessingProps> = ({ datasetPath, onDataProcessed }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/data-processing?datasetPath=${encodeURIComponent(datasetPath)}`);
        const result: DataProcessingResult = await response.json();
        onDataProcessed(result);
      } catch (error) {
        console.error('Error processing data:', error);
        // Handle error if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [datasetPath, onDataProcessed]);

  return (
    <div>
      {isLoading ? <p>Loading data...</p> : <div>{/* Your DataProcessing component content goes here */}</div>}
    </div>
  );
};

export default DataProcessingComponent;
