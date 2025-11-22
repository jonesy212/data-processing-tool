// Collaborator.ts
import { Member } from "@/app/models/members/Member";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';


export interface Collaborator<
  T extends BaseDataEntity,
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> extends Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  collaborations: number; // Number of collaborations
  // Add any other properties specific to Collaborator
}


export interface Contribution {
  projectId: string;       // or number if projects have IDs
  projectName: string;
  role?: string;           // e.g., "developer", "designer"
  commits?: number;        // optional number of commits/contributions
  details: { note: string; date?: string }[]
  date?: string;
}

interface Contributor<
  T extends BaseDataEntity,
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>  extends Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  contributions: Contribution[]; // detailed breakdown per project
  joinedAt?: Date;
  active?: boolean;
  
}

export type { Contributor }