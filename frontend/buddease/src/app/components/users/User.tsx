// User.tsx
import React from "react";
import CommonDetails from "../models/CommonData";
// import { Data } from "../models/data/Data";
import { Persona } from "@/app/pages/personas/Persona";
import generateTimeBasedCode from '../../../../models/realtime/TimeBasedCodeGenerator';
import ChatSettings from "../communications/chat/ChatSettingsPanel";
import { RealtimeUpdates } from "../community/ActivityFeedComponent";
import { CryptoDocumentManager } from "../documents/cryptoDocumentManager";
import { Data } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project } from "../projects/Project";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
import { UserRole } from "./UserRole";

export interface User extends UserData {
  _id?: string; // Add this line
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
  role: UserRole;
  persona: Persona;
  analysisResults?: DataAnalysisResult[]
  isLoggedIn?: boolean;
}

const timeBasedCode: string = generateTimeBasedCode();

// Placeholder for user data
export interface UserData {
  _id?: string;
  id: User["id"] | number;
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
  realtimeUpdates?: RealtimeUpdates[]
    // New properties for the persona
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
  incomeLevel?: string;
  unreadNotificationCount?: number;
  snapshots: SnapshotStore<Snapshot<Data>>[];
  analysisResults?: DataAnalysisResult[]
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
  [key: string]: string|   string[] | DocumentNode;
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
  traits: CommonDetails,

  timeBasedCode: timeBasedCode, // Generate the time-based code for the user

  // New properties for the persona
  age: 0,
  gender: 'male',
  location: 'Texas',
  occupation: 'Software Engineer',
  incomeLevel: 'string',
  snapshots: {} as SnapshotStore<Snapshot<Data>>[]
};


// Instantiate a CryptoDocumentManager
const documentManager = new CryptoDocumentManager();

const encryptDocument = async (document: DocumentTree) => { 

}

// Inside a function or component where document management is required, you can use documentManager
const handleDocumentEncryption = (document: DocumentTree) => {
  // Encrypt the document using CryptoDocumentManager
  const encryptedDocument = documentManager.encryptDocument(document);
  // Now you can use the encrypted document as needed
  console.log("Encrypted document:", encryptedDocument);
};


// using common details we generate details for components by mapping through the objects.
const UserDetails: React.FC<{ user: User }> = ({ user }) => {
  const { id, analysisResults, snapshots, ...rest } = user;

  if (user && user.data) {
    return (
      <CommonDetails
        details={{
          id: id.toString(),
          isActive: true,
          analysisResults: [] as DataAnalysisResult[],
          data: user.data,
          ...rest,
        }}
      />
    );
  } else {
    return <div>User not available</div>;
  }
};

export default UserDetails;
