// DataComponent.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';
import DocumentFormattingOptions from '../../documents/DocumentFormattingOptions';
import { RootState } from '../../state/redux/slices/RootSlice';

const DataComponent: React.FC = () => {
  const { state: authState } = useAuth();
  const { dataAnalysis } = useSelector((state: RootState) => state.dataAnalysisManager);

  // State to manage document formatting options - set initial options
  const [documentOptions, setDocumentOptions] = useState<any>({
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5
  });

  // Function to handle changes in document formatting options
  const handleDocumentOptionsChange = (newOptions: any) => {
    setDocumentOptions(newOptions);
  };

  // Render your component using dataAnalysis state
  return (
    <div>
      <h2>Data Analysis Component</h2>
      {/* Display dataAnalysis information */}
      <div>
        <h3>Data Analysis Information</h3>
        {/* Render dataAnalysis information */}
        <p>{/* Display relevant dataAnalysis information: {dataAnalysis} */}</p>
      </div>

      {/* Display authentication state information */}
      <div>
        <h3>Authentication State</h3>
        <p>{/* Display relevant authentication state information, e.g., authState: {authState} */}</p>
      </div>

      {/* Add Document Formatting Options component */}
      <div>
        <h3>Document Formatting Options</h3>
        <DocumentFormattingOptions
          onChange={handleDocumentOptionsChange}
          options={documentOptions}
        />
        {/* Display other UI components or actions related to document formatting */}
      </div>

      {/* Example: Use the selected document options in your UI */}
      <div>
        <h3>Formatted Data</h3>
        <p style={documentOptions}>{/* Apply formatting based on documentOptions */}</p>
      </div>
    </div>
  );
};

export default DataComponent;
