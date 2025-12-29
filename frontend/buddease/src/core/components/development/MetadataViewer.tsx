// MetadataViewer.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { Attachment } from '@/core/documents/attachment/Attachment';

interface MetadataViewerProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  title?: string;
  showRawJson?: boolean;
  onMetadataUpdate?: (updatedMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}

const MetadataViewer = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  metadata,
  title = "Structured Metadata",
  showRawJson = true,
  onMetadataUpdate
}: MetadataViewerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  
  const handleMetadataChange = (key: keyof UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, value: any) => {
    if (onMetadataUpdate) {
      const updatedMetadata = {
        ...metadata,
        [key]: value
      };
      onMetadataUpdate(updatedMetadata);
    }
  };

  return (
    <div className="metadata-viewer">
      <h2>{title}</h2>
      
      {/* Structured View */}
      <div className="metadata-structured">
        <div className="metadata-section">
          <h3>Basic Information</h3>
          <div className="metadata-field">
            <label>Area:</label>
            <span>{metadata.area || 'N/A'}</span>
          </div>
          <div className="metadata-field">
            <label>Project ID:</label>
            <span>{metadata.projectId || 'N/A'}</span>
          </div>
        </div>

        {metadata.currentMeta && (
          <div className="metadata-section">
            <h3>Current Metadata</h3>
            <div className="metadata-field">
              <label>ID:</label>
              <span>{metadata.currentMeta.id}</span>
            </div>
            <div className="metadata-field">
              <label>Version:</label>
              <span>{metadata.currentMeta.version}</span>
            </div>
            <div className="metadata-field">
              <label>Last Updated:</label>
              <span>{metadata.currentMeta.lastUpdated?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        )}

        {metadata.latestVersion && (
          <div className="metadata-section">
            <h3>Version Information</h3>
            <div className="metadata-field">
              <label>Latest Version:</label>
              <span>{metadata.latestVersion.version || 'N/A'}</span>
            </div>
          </div>
        )}

        {metadata.metadataEntries && Object.keys(metadata.metadataEntries).length > 0 && (
          <div className="metadata-section">
            <h3>Metadata Entries</h3>
            {Object.entries(metadata.metadataEntries).map(([key, entry]) => (
              <div key={key} className="metadata-entry">
                <h4>{key}</h4>
                <div className="metadata-field">
                  <label>Title:</label>
                  <span>{entry.title || 'N/A'}</span>
                </div>
                <div className="metadata-field">
                  <label>Author:</label>
                  <span>{entry.author || 'N/A'}</span>
                </div>
                <div className="metadata-field">
                  <label>Timestamp:</label>
                  <span>{entry.timestamp?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw JSON View */}
      {showRawJson && (
        <div className="metadata-raw">
          <h3>Raw JSON</h3>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MetadataViewer;