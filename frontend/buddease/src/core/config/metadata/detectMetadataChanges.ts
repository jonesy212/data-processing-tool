// detectMetadataChanges.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import FileData from "@/core/models/data/FileData";

function detectMetadataChanges<  
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    // Handle metadata comparison logic here
    let changesDetected = false;
    let metadataChanges = "";

    // Check if previous metadata is available
    if (file.previousMetadata) {
      // Compare current metadata with previous metadata
      if (file.metadata && 'title' in file.metadata && 'title' in file.previousMetadata &&
          file.metadata.title !== file.previousMetadata.title) {
        changesDetected = true;
        metadataChanges += "Title has changed. ";
      }
      if (file.metadata && 'author' in file.metadata && 'author' in file.previousMetadata &&
          file.metadata.author !== file.previousMetadata.author) {
        changesDetected = true;
        metadataChanges += "Author has changed. ";
      }
      // Add more comparisons for other metadata properties as needed
    } else {
      // Handle case where previous metadata is not available
      metadataChanges = "No previous metadata available for comparison.";
    }

    // Return the result
    if (changesDetected) {
      return "Detected metadata changes: " + metadataChanges.trim();
    } else {
      return "No metadata changes detected.";
    }
  }
  

  export { detectMetadataChanges };
