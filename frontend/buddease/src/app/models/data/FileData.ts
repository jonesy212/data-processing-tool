// FileData.ts

import { ScheduledData } from '@/app/calendar/ScheduledData';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { User } from '@/app/users/User';

// Define the interface for FileData
interface FileData<
  T extends BaseDataEntity = BaseDataRoot,
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

