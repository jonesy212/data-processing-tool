// Subtask.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';

import { Attachment } from '@/core/documents/attachment/Attachment';

interface Subtask<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  title: string;
  description?: string;
  assignedTo?: T | null; // or another specific user type
  status?: string;
  dueDate?: string | Date;
  completed?: boolean;
  tags?: Record<string, Tag<T>>; // Use your Tag type
  [key: string]: any; // Flexible for additional subtask properties
}

export default Subtask