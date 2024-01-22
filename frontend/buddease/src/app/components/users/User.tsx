// User.tsx
import CommonDetails from "../models/CommonData";
// import { Data } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import Project from "../projects/Project";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
export interface User extends UserData {
  _id: string; // Add this line
  id: string | number;
  username: string;
  email: string;
  tier: string;
  uploadQuota: number;
  fullName: string | null;
  bio: string | null;
  userType: string;
  hasQuota: boolean;
  profilePicture: string | null;
  processingTasks: DataProcessingTask[];
  data?: UserData;
}

// Placeholder for user data
export interface UserData {
  id: User["id"];
  datasets?: string;
  tasks?: string;
  questionnaireResponses?: any;
  chatSettings?: string;
  projects?: Project[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  yourDocuments?: DocumentTree;
  visualizations?: VisualizationData[];
}

// Add a new type for visualization data
export interface VisualizationData {
  type: string;
  data: any;
}

// Define the DocumentTree type
export type DocumentTree = {
  [key: string]: DocumentNode;
};

// Define the DocumentNode type
export interface DocumentNode {
  [key: string]: string[] | DocumentNode; // Add this index signature
}

// Example usage:
const userData: UserData = {
  id: 1,
  yourDocuments: {
    public: {} as DocumentNode,
    private: {} as DocumentNode,
    user: {} as DocumentNode,
    team: {} as DocumentNode,
    project: {} as DocumentNode,
    group: {} as DocumentNode,
    visualizations: {} as DocumentNode,
  },
  // Other user data properties
};


// using common details we generate details for components by mapping through the objects.
const UserDetails: React.FC<{ user: User }> = ({ user }) =>
  user ? <CommonDetails data={{ data: user }} /> : <div>User not available</div>;

export { UserDetails };
