import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import React from 'react';

// Define the StructuredMetadataViewer component
const MetadataViewer = ({ metadata }: { metadata: StructuredMetadata }) => {
  // Render the metadata here
  return (
    <div>
      <h2>Structured Metadata</h2>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};

export default MetadataViewer;
