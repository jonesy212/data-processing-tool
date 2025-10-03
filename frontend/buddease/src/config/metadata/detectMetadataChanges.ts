// detectMetadataChanges.ts
import { BaseData } from "@/app/components/models/data/Data";
import FileData from "@/app/components/models/data/FileData";

function detectMetadataChanges<T extends BaseData<T>>(file: FileData<T>): string {
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
  

  export {detectMetadataChanges}