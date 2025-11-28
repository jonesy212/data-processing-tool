// DataProcessingTask.tsx
// dataProcessingTaskInterfaces.tsx
import { Attachment } from '@/app/documents/attachment/Attachment';
import { UserExcludedFields, UserIncludedFields } from '@/app/typings//entities/UserEntity';
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';

export interface DataProcessingTask<
  T extends BaseDataEntity = UserEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = UserAttachment,
  ExcludedFields extends keyof T = UserExcludedFields,
  IncludedFields extends keyof T = UserIncludedFields 
>{
    id: number;
    name: string;
    description: string | null;
    status: string;
    inputDatasetId: number | null;
    outputDatasetId: number | null;
    createdAt: Date;
    startTime: Date | null;
    completionTime: Date | null;
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
  