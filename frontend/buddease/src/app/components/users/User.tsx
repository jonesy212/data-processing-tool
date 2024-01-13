  // User.tsx
  import CommonDetails from "../models/CommonDetailsProps";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import Project from "../projects/Project";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";

  export interface User {
    id?: number;
    username: string;
    email: string;
    tier: string;
    uploadQuota: number;
    fullName: string | null;
    bio: string | null;
    userType: string,
    hasQuota: boolean,
    profilePicture: string | null;
    processingTasks: DataProcessingTask[];
    data?: UserData
  }


  // Placeholder for user data
  export interface UserData {
    id: User['id'];
    datasets?: string;
    tasks?: string;
    questionnaireResponses?: any;
    chatSettings?: string
    projects?: Project[];
    teams?: Team[];
    teamMembers?: TeamMember[];
    yourDocuments?: DocumentTree;
  }


  // Define the DocumentTree type
  export type DocumentTree = {
    [key: string]: DocumentNode;
  };

  // Define the DocumentNode type
  export interface DocumentNode {
    public?: string[];
    private?: string[];
    user?: {
      [userId: string]: string[];
    };
    team?: {
      [teamId: string]: string[];
    };
    project?: {
      [projectId: string]: string[];
    };
    group?: {
      [groupId: string]: string[];
    };
    // Add more categories as needed
  }

  // Example usage:
const userData: UserData = {
  id: 1,
  yourDocuments: {
    public: ['public_doc_1', 'public_doc_2'] as DocumentNode,
    private: ['private_doc_1', 'private_doc_2'] as DocumentNode,
    user: {
      'user_id_1': ['user_doc_1', 'user_doc_2'],
    } as DocumentNode['user'] || {},
    team: {
      'team_id_1': ['team_doc_1', 'team_doc_2'],
      'team_id_2': ['team_doc_3', 'team_doc_4'],
    } as DocumentNode['team'] || {},
    // Add more categories as needed
  },
  // Other user data properties
};

// using common details we generate details for components by mapping through the objects.
const UserDetails: React.FC<{ user: User }> = ({ user }) => (
  user ? <CommonDetails<User> data={user} /> : <div>User not available</div>
);

export { UserDetails };
