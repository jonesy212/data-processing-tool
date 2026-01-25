// FileData.ts

import { ScheduledData } from '@/core/calendar/ScheduledData';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { User } from '@/core/users/User';

// Define the interface for FileData
interface FileData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  fileSize: number; // Size of the file in bytes
  fileType: string; // File type (PDF, DOCX, etc.)
  filePath: string; // Path to the file
  uploader: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['username'] | undefined;
  attachments?: AttachmentType[];
  fileName: string;
  uploadDate: Date | undefined;
  imageData?: string;
}


export default FileData;

