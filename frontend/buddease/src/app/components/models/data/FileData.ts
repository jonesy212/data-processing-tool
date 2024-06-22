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
  uploader: User['username'] | undefined; // User who uploaded the file
  attachments?: Attachment[]; // Any attachments associated with the file
  // Additional properties for expanded usage
  fileName: string; // Name of the file
  uploadDate: Date | undefined; // Date when the file was uploaded
  imageData?: string; // Base64-encoded image data
}

export default FileData;