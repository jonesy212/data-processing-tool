import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import { ExcludedFields } from '@/app/routing/Fields';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

// Define the StructuredMetadataViewer component
const MetadataViewer = ({ metadata }: { metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => {
  // Render the metadata here
  return (
    <div>
      <h2>Structured Metadata</h2>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};

export default MetadataViewer;
