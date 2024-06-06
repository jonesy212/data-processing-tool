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
import { TwitterData } from "../socialMedia/TwitterIntegration";
import UserRoles from "./UserRoles";
import { Tag } from "../models/tracker/Tag";

export interface User extends UserData {
  _id?: string; 
  username: string;
  firstName: string;
  lastName: string;
  type?: string
  email: string;
  tags?: Tag[] | string[];
  isUserMessage?: boolean;
  tier: string;
  token: string | null;
  uploadQuota: number;
  usedQuota?: number;
  avatarUrl: string | null;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  fullName: string | null;
  isVerified: boolean;
  isActive: boolean;
  isAdmin: boolean;
  isSubscribed?: boolean,

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
  isDeleted?: boolean;
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
  twitterData?: TwitterData
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
  timestamp?: Date | string;
  category?: string
  deletedAt?: Date | null;
  lastLogin?: Date;
  lastLogout?: Date;
  lastPasswordChange?: Date;
  lastEmailChange?: Date;
  lastNameChange?: Date;
  lastProfileChange?: Date;
  lastAvatarChange?: Date;
  lastBannerChange?: Date;
  lastStatusChange?: Date;
  lastRoleChange?: Date;
  lastTierChange?: Date;
  lastPaymentChange?: Date;
  lastSubscriptionChange?: Date;
  lastEmailVerification?: Date;
  lastPasswordReset?: Date;
  lastLoginAttempt?: Date;
  loginAttempts?: number;
  lockoutEnd?: Date | null;
  twoFactorEnabled?: boolean;
  phoneNumberConfirmed?: boolean;
  phoneNumber?: string;
  securityStamp?: string | null;
  concurrencyStamp?: string | null;
  accessFailedCount?: number | null,
  subscriptionType?: string | null;
  subscriptionEndDate?: Date | null;
  paymentMethod?: string | null;
  paymentMethodId?: string | null;
  paymentMethodExpiry?: string | null;
  paymentMethodLast4?: string | null;
  paymentMethodBrand?: string | null;
  paymentMethodCountry?: string | null;
  paymentMethodPostalCode?: string | null;
  paymentMethodEmail?: string | null;
  paymentMethodCustomerId?: string | null;
  paymentMethodSubscriptionId?: string | null;
  paymentMethodSubscriptionStatus?: string | null;
  paymentMethodSubscriptionStartDate?: Date | null;
  paymentMethodSubscriptionEndDate?: Date | null;
  paymentMethodSubscriptionCancelAtPeriodEnd?: boolean | null;
  paymentMethodSubscriptionCancelAtDate?: Date | null;
  paymentMethodSubscriptionCancelReason?: string | null;
  paymentMethodSubscriptionCancelRedirectUrl?: string | null;
  paymentMethodSubscriptionCancelRetryAfter?: number | null;
  paymentMethodSubscriptionCanceledAt?: Date | null;
  paymentMethodSubscriptionCanceledReason?: string | null;
  paymentMethodSubscriptionCanceledRedirectUrl?: string | null;
  paymentMethodSubscriptionCanceledRetryAfter?: number | null;
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
  deletedAt: null,
  lastLogin: new Date(),
  lastLogout: new Date(),
  lastPasswordChange: new Date(),
  lastEmailChange: new Date(),
  lastNameChange: new Date(),
  lastProfileChange: new Date(),
  lastAvatarChange: new Date(),
  lastBannerChange: new Date(),
  lastStatusChange: new Date(),
  lastRoleChange: new Date(),
  lastTierChange: new Date(),
  lastPaymentChange: new Date(),
  lastSubscriptionChange: new Date(),
  lastEmailVerification: new Date(),
  lastPasswordReset: new Date(),
  lastLoginAttempt: new Date(),
  loginAttempts: 0,
  lockoutEnd: null,
  twoFactorEnabled: false,
  phoneNumberConfirmed: false,
  phoneNumber: "",
  securityStamp: "",
  concurrencyStamp: "",
  accessFailedCount: 0,
  subscriptionEndDate: null,
  paymentMethodSubscriptionCancelAtPeriodEnd: null,
  paymentMethodSubscriptionCancelRetryAfter: null,
  paymentMethodSubscriptionCanceledRetryAfter: null
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
          tags: user.tags ? user.tags.map((tag) => typeof tag === 'string' ? tag : tag.getOptions().name) : [],
          ...rest,
        }}
      />
    );
  } else {
    return <div>User not available</div>;
  }
};


const usersDataSource: Record<string, User> = {
  1: {
    // User Data
    id: 1,
    username: "User 1",
    email: "<EMAIL>",
    role: UserRoles.USER,
    avatarUrl: "", // Provide the appropriate value
    hasQuota: false, // Provide the appropriate value
    processingTasks: [], // Assuming it's an array
    persona: undefined, // Provide the appropriate value
    friends: [], // Assuming it's an array
    deletedAt: null, // Provide the appropriate value
    lastNameChange: new Date(), // Provide the appropriate value
    lockoutEnd: null, // Provide the appropriate value
    twoFactorEnabled: false, // Provide the appropriate value
    phoneNumberConfirmed: false, // Provide the appropriate value
    securityStamp: "", // Provide the appropriate value
    concurrencyStamp: "", // Provide the appropriate value
    accessFailedCount: 0, // Provide the appropriate value
    settings: undefined, // Provide the appropriate value
    data: {
      role: UserRoles.USER,
      deletedAt: null,
      lastLogin: new Date(),
      lastLogout: new Date(),
      lastPasswordChange: new Date(),
      lastEmailChange: new Date(),
      lastNameChange: new Date(),
      lastProfileChange: new Date(),
      lastAvatarChange: new Date(),
      lastBannerChange: new Date(),
      lastStatusChange: new Date(),
      lastRoleChange: new Date(),
      lastTierChange: new Date(),
      lastPaymentChange: new Date(),
      lastSubscriptionChange: new Date(),
      lastEmailVerification: new Date(),
      lastPasswordReset: new Date(),
      lastLoginAttempt: new Date(),
      loginAttempts: 0,
      lockoutEnd: null,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      phoneNumber: "",
      securityStamp: "",
      concurrencyStamp: "",
      accessFailedCount: 0,
      subscriptionType: "",
      subscriptionEndDate: null,
      paymentMethod: "",
      paymentMethodId: "",
      paymentMethodExpiry: "",
      paymentMethodLast4: "",
      paymentMethodBrand: "",
      paymentMethodCountry: "",
      paymentMethodPostalCode: "",
      paymentMethodEmail: "",
      paymentMethodCustomerId: "",
      paymentMethodSubscriptionId: "",
      paymentMethodSubscriptionStatus: "",
      paymentMethodSubscriptionStartDate: null,
      paymentMethodSubscriptionEndDate: null,
      paymentMethodSubscriptionCancelAtPeriodEnd: false,
      paymentMethodSubscriptionCancelAtDate: null,
      paymentMethodSubscriptionCancelReason: "",
      paymentMethodSubscriptionCancelRedirectUrl: "",
      paymentMethodSubscriptionCancelRetryAfter: null,
      paymentMethodSubscriptionCanceledAt: null,
      paymentMethodSubscriptionCanceledReason: "",
      paymentMethodSubscriptionCanceledRedirectUrl: "",
      paymentMethodSubscriptionCanceledRetryAfter: null,
    },
    
    // Document Details
    yourDocuments: {
      public: {} as DocumentNode,
      private: {} as DocumentNode,
      user: {} as DocumentNode,
      team: {} as DocumentNode,
      project: {} as DocumentNode,
      group: {} as DocumentNode,
      visualizations: {} as DocumentNode,
    },
    
    // Personal Details
    firstName: "",
    lastName: "",
    age: 0,
    gender: "male",
    profilePicture: null,
    bio: null,
    userType: "",
    relationshipStatus: null,
    hobbies: [],
    address: undefined,
    language: undefined,
    education: [],
    employment: [],
    dateOfBirth: undefined,
    skills: [],
    achievements: [],
    
    // Subscription Details
    tier: "0",
    isSubscribed: false,
    subscriptionType: "",
    subscriptionEndDate: null,
    paymentMethod: "",
    
    // Activity Details
    isActive: true,
    lastLogin: new Date(),
    lastLogout: new Date(),
    lastPasswordChange: new Date(),
    lastEmailChange: new Date(),
    lastProfileChange: new Date(),
    lastAvatarChange: new Date(),
    lastBannerChange: new Date(),
    lastStatusChange: new Date(),
    lastRoleChange: new Date(),
    lastTierChange: new Date(),
    lastPaymentChange: new Date(),
    lastSubscriptionChange: new Date(),
    lastEmailVerification: new Date(),
    lastPasswordReset: new Date(),
    lastLoginAttempt: new Date(),
    loginAttempts: 0,
    activityStatus: "",
    
    // Other Details
    token: "",
    uploadQuota: 0,
    fullName: "",
    isAdmin: false,
    isVerified: false,
    // isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    blockedUsers: [],
    interests: [],
    privacySettings: undefined,
    notifications: undefined,
    activityLog: [],
    projects: undefined,
    socialLinks: undefined,
    profileVisibility: "",
    profileAccessControl: undefined,
    isAuthorized: false,
    notificationPreferences: undefined,
    securitySettings: undefined,
    emailVerificationStatus: undefined,
    phoneVerificationStatus: undefined,
    walletAddress: undefined,
    transactionHistory: [],
    tokenBalance: undefined,
    smartContractInteractions: [],
    blockchainPermissions: undefined,
    blockchainIdentity: undefined,
    blockchainAssets: [],
    nftCollection: [],
    daoMemberships: [],
    decentralizedStorageUsage: undefined,
    decentralizedIdentity: undefined,
    decentralizedMessagingKeys: undefined,
    decentralizedAuthentication: undefined,
    twitterData: undefined,
  },
};

export default UserDetails;
export type { Address, Education, Employment, SocialLinks };
