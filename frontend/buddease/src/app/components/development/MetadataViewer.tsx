import React from 'react';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { ExcludedFields } from '@/app/components/routing/Fields';

// Define the StructuredMetadataViewer component
const MetadataViewer = ({ metadata }: { metadata: UnifiedMetadata<T, K, Meta, ExcludedFields> }) => {
  // Render the metadata here
  return (
    <div>
      <h2>Structured Metadata</h2>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};

export default MetadataViewer;
