Contributor.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Member } from '@/core/models/members/Member';
import { Project } from '@/core/models/projects/Project';

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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  contributions: Contribution[]; // detailed breakdown per project
  projects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  memberName: string
  joinedAt?: Date;
  active?: boolean;
}

export type { Contributor };

