// FileData.ts

import { ScheduledData } from '@/app/components/calendar/ScheduledData';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { User } from '@/app/users/User';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// Define the interface for FileData
interface FileData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  fileSize: number; // Size of the file in bytes
  fileType: string; // File type (PDF, DOCX, etc.)
  filePath: string; // Path to the file
  uploader: User['username'] | undefined;
  attachments?: AttachmentType[];
  fileName: string;
  uploadDate: Date | undefined;
  imageData?: string;
}


export default FileData;

