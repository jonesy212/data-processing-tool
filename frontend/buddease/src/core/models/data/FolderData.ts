// FolderData.ts
import type { ScheduledData } from '@/core/calendar/ScheduledData';
import type { Attachment } from '@/core/documents/attachment/Attachment';
  
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { User } from '@/core/users/User';

export interface FolderData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  folderSize: number;
  folderPath: string;
  uploader: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  attachments?: AttachmentType[];
  folderName: string;
  uploadDate: Date;
}

 