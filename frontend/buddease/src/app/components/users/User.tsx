// User.tsx
import { ReactNode } from "react";
import CommonDetails, { SupportedData } from "../models/CommonData";
// import { Data } from "../models/data/Data";
import generateTimeBasedCode from '../../../../models/realtime/TimeBasedCodeGenerator';
import ChatSettings from "../communications/chat/ChatSettingsPanel";
import { TeamMember } from "../models/teams/TeamMembers";
import Project from "../projects/Project";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
import { UserRole } from "./UserRole";
import Team from "../models/teams/Team";
import DetailsProps from "../models/data/Details";
import { DataDetails } from "../models/data/Data";
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
  role: UserRole
}

const timeBasedCode: string = generateTimeBasedCode();

// Placeholder for user data
export interface UserData {
  id: User["id"];
  datasets?: string;
  tasks?: string;
  questionnaireResponses?: any;
  chatSettings?: ChatSettings;
  projects?: Project[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  yourDocuments?: DocumentTree;
  visualizations?: VisualizationData[];
  traits?: typeof CommonDetails;
  timeBasedCode?:typeof timeBasedCode, // Generate the time-based code for the user

    // New properties for the persona
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
    incomeLevel?: string;
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
  [key: string]: string[] | DocumentNode;
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
  traits: (props: DetailsProps<SupportedData>, context?: any): ReactNode => {
    return <CommonDetails {...props} />;
  },
  timeBasedCode: timeBasedCode, // Generate the time-based code for the user
    // New properties for the persona
    age: 0,
    gender: 'male',
    location: 'Texas',
    occupation: 'Software Engineer',
    incomeLevel: 'string',
};


// using common details we generate details for components by mapping through the objects.
const UserDetails: React.FC<{ user: User }> = ({ user }) => (
  user ? <CommonDetails<DataDetails>
    data={{ title: 'User Details', description: 'User data', data: undefined }} /> : <div>User not available</div>
);

export default UserDetails 
