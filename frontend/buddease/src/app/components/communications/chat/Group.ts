// Group.ts
interface Group {
    id: string;
    name: string;
    isPublic: boolean;
    members: string[]; // Array of member user IDs
    createdAt: Date;
    // Add more properties as needed
  }
  
  export default Group;
  