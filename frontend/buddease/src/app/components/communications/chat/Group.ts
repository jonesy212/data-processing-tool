import { BlogPost } from "@/app/pages/blog/BlogPost";
import { Data } from "@/app/models/data/Data";
import { Member } from "@/app/models/teams/TeamMembers";

// Group.ts
interface Group<T> extends Data{
  id: string;
  groupName: string;
  items: BlogPost[];
  isPublic: boolean;
  members: number[] |  string[] | Member[]; 


  // Add more properties as needed
}

export default Group;
  