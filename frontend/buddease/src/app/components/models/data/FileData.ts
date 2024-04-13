// FileData.ts

import { ScheduledData } from '../../calendar/ScheduledData';
import { Attachment } from '../../documents/Attachment/attachment';
import { User } from '../../users/User';

// Define the interface for FileData
interface FileData extends ScheduledData {
  // Define specific properties for FileData
  fileSize: number; // Size of the file in bytes
  fileType: string; // Type of the file (e.g., PDF, Word document, etc.)
  filePath: string; // Path to the file location
  uploader: User; // User who uploaded the file
  attachments?: Attachment[]; // Any attachments associated with the file
  // Add other properties as needed

  // Additional properties for expanded usage
  fileName: string; // Name of the file
  uploadDate: Date; // Date when the file was uploaded
}

export default FileData;
