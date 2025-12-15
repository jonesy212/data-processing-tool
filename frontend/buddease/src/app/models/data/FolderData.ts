// FolderData.ts
import { ScheduledData } from '@/app/calendar/ScheduledData';
import { Attachment } from '@/app/documents/attachment/Attachment';
  
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { User } from '@/app/users/User';

interface FolderData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  folderSize: number;
  folderPath: string;
  uploader: User;
  attachments?: AttachmentType[];
  folderName: string;
  uploadDate: Date;
}

export default FolderData;
