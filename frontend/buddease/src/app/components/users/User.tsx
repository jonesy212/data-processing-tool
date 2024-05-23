// User.tsx
import { UserSettings } from "@/app/configs/UserSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { Persona } from "@/app/pages/personas/Persona";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import React from "react";
import generateTimeBasedCode from "../../../../models/realtime/TimeBasedCodeGenerator";
import { NotificationPreferences } from "../communications/chat/ChatSettingsModal";
import ChatSettings from "../communications/chat/ChatSettingsPanel";
import { RealtimeUpdates } from "../community/ActivityFeedComponent";
import { CustomTransaction, SmartContractInteraction } from "../crypto/SmartContractInteraction";
import { CryptoDocumentManager } from "../documents/cryptoDocumentManager";
import CommonDetails from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import { NFT } from "../nft/NFT";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project } from "../projects/Project";
import { PrivacySettings } from "../settings/PrivacySettings";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
import { BlockchainAsset } from "./BlockchainAsset";
import { BlockchainPermissions } from "./BlockchainPermissions";
import { SocialLinks } from "./SocialLinks";
import { UserRole } from "./UserRole";
import { ActivityLogEntry } from "./UserSlice";

export interface User extends UserData {
  _id?: string; // Add this line
  id?: string | number | undefined;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  tier: string;
  token: string | null;
  uploadQuota: number;
  usedQuota?: number;
  avatarUrl: string | null;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  fullName: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  isActive: boolean;
  bio: string | null;
  userType: string;
  hasQuota: boolean;
  profilePicture: string | null;
  processingTasks: DataProcessingTask[];
  data?: UserData;
  role: UserRole;
  persona: Persona | undefined;
  friends: User[];
  analysisResults?: DataAnalysisResult[];
  isLoggedIn?: boolean;
  localeCompare?: (other: Message) => number;
  blockedUsers: User[];
  settings: UserSettings | undefined;
  interests: string[]
  privacySettings: PrivacySettings | undefined
  notifications: NotificationSettings | undefined
  activityLog: ActivityLogEntry[]
  projects?: Project[]; // Define the type explicitly as an array of Project objects
  socialLinks: SocialLinks | undefined;
  relationshipStatus: string | null;
  hobbies: string[];
  address?: Address;
  language?: string;
  education?: Education[];
  employment?: Employment[];
  dateOfBirth?: Date;
  skills: string[];
  achievements: string[];
  profileVisibility: string;
  phoneNumber?: string;
  profileAccessControl: ProfileAccessControl | undefined;
  activityStatus: string;
  isAuthorized: boolean;
  notificationPreferences?: NotificationPreferences;
  securitySettings?: SecuritySettings;
  emailVerificationStatus?: boolean;
  phoneVerificationStatus?: boolean;
  walletAddress?: string;
  transactionHistory?: CustomTransaction[]
  tokenBalance?: number;
  smartContractInteractions?: SmartContractInteraction[];
  blockchainPermissions?: BlockchainPermissions;
  blockchainIdentity?: string;
  blockchainAssets?: BlockchainAsset[];
  nftCollection?: NFT[];
  daoMemberships?: any[];
  decentralizedStorageUsage?: any;
  decentralizedIdentity?: any;
  decentralizedMessagingKeys?: any;
  decentralizedAuthentication?: any;

}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
}

interface Employment {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
}


const timeBasedCode: string = generateTimeBasedCode();

// Placeholder for user data
export interface UserData {
  _id?: string;
  id?: string | number | undefined;
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
  timeBasedCode?: typeof timeBasedCode; // Generate the time-based code for the user
  realtimeUpdates?: RealtimeUpdates[];
  // New properties for the persona
  age?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  incomeLevel?: string;
  unreadNotificationCount?: number;
  snapshots?: SnapshotStore<Snapshot<Data>>[] | undefined
  analysisResults?: DataAnalysisResult[];
  role: UserRole

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
  [key: string]: string | string[] | DocumentNode;
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

  timeBasedCode: timeBasedCode,
  age: 0,
  gender: "male",
  location: "Texas",
  occupation: "Software Engineer",
  incomeLevel: "string",
  snapshots: {} as SnapshotStore<Snapshot<Data>>[],
  role: {} as UserRole,
};

// Instantiate a CryptoDocumentManager
const documentManager = new CryptoDocumentManager();

// Function to encrypt a document
const encryptDocument = async (document: DocumentTree) => {
  // Encrypt the document using CryptoDocumentManager
  const encryptedDocument = documentManager.encryptDocument(document);
  return encryptedDocument;
};

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

  if (user && user.data && user.yourDocuments!) {
      // Call handleDocumentEncryption with user's documents
      handleDocumentEncryption(user.yourDocuments);
    
    return (
      <CommonDetails
        details={{
          id: id ? id.toString() : "",
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
export type { Address, Education, Employment, SocialLinks };
