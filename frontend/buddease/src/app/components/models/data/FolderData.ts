// FolderData.ts

import { ScheduledData } from '../../calendar/ScheduledData';
import { Attachment } from '@/app/components/documents/Attachment/attachment'
import { User } from '../../users/User'

interface FolderData extends ScheduledData<<T, K, S>> {
  folderSize: number; // Size of the folder in bytes
  folderPath: string; // Path to the folder location
  uploader: User; // User who uploaded the folder
  attachments?: Attachment[]; // Any attachments associated with the folder
  // Add other properties as needed

  // Additional properties for expanded usage
  folderName: string; // Name of the folder
  uploadDate: Date; // Date when the folder was uploaded
}

export default FolderData;
