import { BlogPost } from "../../community/DiscussionForumComponent";

// Group.ts
interface Group<T> {
  id: string;
  groupName: string;
  items: BlogPost[];
  isPublic: boolean;
  members: string[]; 
  createdAt: Date;
  
  // Add more properties as needed
}

export default Group;
  