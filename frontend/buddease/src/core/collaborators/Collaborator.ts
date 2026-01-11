// Collaborator.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Member } from "@/core/models/members/Member";


interface Collaborator<
  T extends BaseDataEntity,
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  collaborations: number; // Number of collaborations
  // Add any other properties specific to Collaborator
}



export type { Collaborator };
