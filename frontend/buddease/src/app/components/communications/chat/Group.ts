import { Data } from '@/app/models/data/Data';
import { Member } from "@/app/models/teams/TeamMembers";
import { BlogPost } from "@/app/pages/blog/BlogPost";

// Group.ts
interface Group<T> extends Data{
  id: string;
  groupName: string;
  items: BlogPost[];
  isPublic: boolean;
  members: number[] |  string[] | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; 


  // Add more properties as needed
}

export default Group;
  