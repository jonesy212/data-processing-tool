// YourDocumentGeneratorComponent.tsx
import React, { useState } from 'react';
import { createPdfDocument } from './DocumentCreationUtils';

import ResizablePanels from '../hooks/userInterface/ResizablePanels';
import DocumentFormattingOptionsComponent, { DocumentFormattingOptions } from './ DocumentFormattingOptionsComponent';

const YourDocumentGeneratorComponent: React.FC = () => { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentOptions, setDocumentOptions] = useState<DocumentFormattingOptions | null>(null);

  const handleGenerateDocument = async () => {
    try {
      setLoading(true);

      // Call createPdfDocument with user inputs and options
      await createPdfDocument("documentContent", documentOptions as DocumentFormattingOptions);

      setLoading(false);
      setError(null);

      alert('Document generated successfully!');
    } catch (error) {
      setLoading(false);
      setError('Error generating document. Please try again.');
      console.error('Error generating document:', error);
    }
  };

  const handleDocumentFormattingOptionsChange = (options: DocumentFormattingOptions) => {
    setDocumentOptions(options);
  };

  return (
    <div>
      {/* Display Document Formatting Options component */}
      <div>
        <h3>Document Formatting Options</h3>
        <DocumentFormattingOptionsComponent onChange={handleDocumentFormattingOptionsChange} />
      </div>

          {/* Display Responsive Design */}

  
      {/* Display Resizable Panels */}
      <ResizablePanels
        sizes={() => [/* Set initial sizes for panels based on your design */]}
        onResize={(newSizes) => console.log('Panel sizes updated:', newSizes)}
      >
        {/* Include dynamic content or components within resizable panels */}
        <div>
          {/* Your content for the first panel */}
        </div>
        <div>
          {/* Your content for the second panel */}
        </div>
        {/* Add more panels as needed */}
      </ResizablePanels>

      {/* Display loading indicator if document generation is in progress */}
      {loading && <p>Loading...</p>}

      {/* Display error message if document generation fails */}
      {error && <p>Error: {error}</p>}

      {/* Display Generate Document button */}
      <button onClick={handleGenerateDocument} disabled={loading}>
        Generate Document
      </button>
    </div>
  );
};

export default YourDocumentGeneratorComponent;
