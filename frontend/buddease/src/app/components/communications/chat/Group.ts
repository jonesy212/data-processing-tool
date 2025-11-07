// Group.ts

import { Data } from '@/app/models/data/Data';
import { Member } from "@/app/models/memebers/Member";
import { BlogPost } from "@/app/pages/blog/BlogPost";

interface Group<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends Data {
  id: string;
  groupName: string;
  items: BlogPost[];
  isPublic: boolean;
  members: number[] | string[] | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 
  // Add more properties as needed
}

export default Group;
  