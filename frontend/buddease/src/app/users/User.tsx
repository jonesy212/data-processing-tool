// User.tsx
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/documents/RelatedProps';
import { AppUnifiedMetadata } from "@/app/typings/entities/AppMetadataEntity";
import { ActivityLogEntry } from "@/app/state/redux/slices/UserSlice";
import { Subscription } from '@/app/subscriptions/Subscription';
import { Data } from '@/app/models/data/Data';
import { SecuritySettings } from "@/app/settings/SecuritySettings";
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/app/typings/entities/UserEntity';
import { UserProfileDetails } from '@/app/typings/userTypes';
import {
  fetchUserAreaDimensions,
  UnifiedMetadata
} from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { UserPreferences } from "@/app/config/UserPreferences";
import { UserSettings } from "@/app/config/UserSettings";

import { NotificationPreferences } from "@/app/cards/modal/ChatSettingsModal";
import { RealtimeUpdates } from "@/app/components/community/ActivityFeedComponent";
import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import { CryptoDocumentManager } from "@/app/documents/cryptoDocumentManager";
import { NotificationSettings } from "@/app/features/support/NotificationSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import ChatSettings from "@/app/hooks/userInterface/ChatSettingsPanel";
import CommonDetails from "@/app/models/CommonData";
import { NFT } from "@/app/models/cypto/NFT";
import { BaseData, SharedRelationshipData } from '@/app/models/data/Data';
import { ActivityActionEnum, ActivityTypeEnum, BookmarkStatus, BorderStyle, CalendarStatus, CalendarViewType, ChatType, CollaborationOptionType, ComponentStatus, DataStatus, DocumentPhaseEnum, DocumentSize, IncludeType, Layout, MeetingStatus, NotificationPosition, NotificationStatus, Orientation, OutcomeType, PriorityTypeEnum, PrivacySettingEnum, ProductStatus, ProjectStateEnum, SortingType, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "@/app/models/data/StatusType";
import { Project } from "@/app/models/projects/Project";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import { Task } from "@/app/models/tasks/Task";
import { Team } from "@/app/models/teams/Team";
import { TeamMember } from "@/app/models/teams/TeamMembers";
import { Persona } from "@/app/pages/personas/Persona";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import { Permission } from "@/app/permissions/Permission";
import { Product } from "@/app/products/Product";
import { DataAnalysisResult } from "@/app/projects/DataAnalysisPhase/DataAnalysisResult";
import { PrivacySettings } from "@/app/settings/PrivacySettings";
import { SnapshotStoreConfig } from "@/app/snapshots/";
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { TwitterData } from "@/app/socialMedia/TwitterIntegration";
import { DataProcessingTask } from "@/app/todos/tasks/DataProcessingTask";
import { BlockchainAsset } from '@/app/typings/cryptoTypes/BlockchainAsset';
import {
  CustomTransaction,
  SmartContractInteraction,
} from "@/app/typings/cryptoTypes/SmartContractInteraction";
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import { AllTypes } from "@/app/typings/PropTypes";
import { SharedVersionData } from "@/app/versions/VersionData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import React from "react";

import { UserRole } from "@/app/models/UserRole";
import UserRoles from "@/app/models/UserRoles";
import { BlockchainPermissions } from "@/app/permissions/BlockchainPermissions";
import { SocialLinks } from "@/app/users/SocialLinks";

export type UserDataEntity = BaseDataEntity;
export type UserDataK = UserDataEntity;
export type UserDataMeta = DefaultMeta<UserDataEntity, UserDataK>;
export type UserDataExcludedFields = DefaultExcludedFields<UserDataEntity>;

export type AppUser = User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;

export interface BaseUser<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // Use T and K, not BaseDataEntity
    SharedTimestamps,
    SharedStatusFlags {
  // Base properties that all users share
  email: string;
}

export const DataTypeEnums = {
  ...NotificationTypeEnum,
  ...DocumentTypeEnum,
  ...PriorityTypeEnum,
  ...ActivityActionEnum,
  ...ActivityTypeEnum, 
  ...BookmarkStatus,
  ...BorderStyle,
  ...CalendarStatus, 
  ...CalendarViewType, 
  ...ChatType,
  ...CollaborationOptionType,
  ...ComponentStatus,
  ...DataStatus, 
  ...DocumentPhaseEnum, 
  ...DocumentSize,
  ...IncludeType,
  ...Layout, 
  ...NotificationPosition, 
  ...NotificationStatus,
  ...Orientation,
  ...OutcomeType,
  ...PrivacySettingEnum, 
  ...ProductStatus, 
  ...ProjectStateEnum, 
  ...SortingType,
  ...StatusType, 
  ...SubscriberTypeEnum, 
  ...SubscriptionTypeEnum, 
  ...TaskStatus, 
  ...TeamStatus,
  ...TodoStatus, 
  ...MeetingStatus,
  // Add all your other 330+ enums here
  DEFAULT: "Default" as const,
} as const;

export interface User<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = UserAttachment,
  ExcludedFields extends keyof T = UserExcludedFields,
  IncludedFields extends keyof T = UserIncludedFields
> extends Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Core Identity Fields
  username: string;
  email: string;
  tier: string;
  role?: UserRole;
  
  // Account Status
  isAuthorized: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  
  // Profile Information
  firstName?: string;
  lastName?: string;
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  profilePicture?: string | null;
  
  // System Fields
  uploadQuota: number;
  hasQuota: boolean;
  processingTasks: DataProcessingTask[];
  activityStatus: string;
  activityLog: ActivityLogEntry[];
  
  // Relationships
  persona: Persona | null;
  friends: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  blockedUsers: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  followers?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastLogin?: Date;
  
  // Extended Data
  data?: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  settings?: UserSettings | null;
  preferences?: UserPreferences;
  
  // Optional Fields (organized by category)
  roles?: UserRole[];
  type?: string | AllTypes | null;
  token?: string | null;
  school?: string;
  grade?: string;
  createdBy?: string;
  analysisResults?: string | DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  isLoggedIn?: boolean;
  localeCompare?: (other: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number;
  interests?: string[];
  privacySettings?: PrivacySettings;
  notifications?: NotificationSettings;
  projects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  socialLinks?: SocialLinks;
  relationshipStatus?: string | null;
  hobbies?: string[];
  address?: Address;
  language?: string;
  education?: Education[];
  employment?: Employment[];
  dependencies?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  dateOfBirth?: Date;
  skills?: string[];
  achievements?: string[];
  profileVisibility?: string;
  phoneNumber?: string;
  profileAccessControl?: ProfileAccessControl;
  notificationPreferences?: NotificationPreferences;
  securitySettings?: SecuritySettings;
  emailVerificationStatus?: boolean;
  phoneVerificationStatus?: boolean;
  
  // Blockchain/Web3 Fields
  walletAddress?: string;
  transactionHistory?: CustomTransaction[];
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
  
  // Social Media Integration
  twitterData?: TwitterData;
}





interface ExtendedUser<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseUser<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Workspace & Product Management
  workspaceUrl?: string;
  workspaces?: any[];
  products?: Product<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  activeProduct?: string;
  activeWorkspace?: string;
  activeRole?: string;
  
  // Roles & Permissions
  roles?: UserRole[];
  permissions?: Permission[] | string[];
  activePermissions?: any[];
  activeWorkspacePermissions?: any[];
  activeProductPermissions?: any[];
  activeRolePermissions?: any[];
  
  // Status
  status?: string;
  statusText?: string;
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

export interface UserData<
  T extends BaseDataEntity = UserEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = UserAttachment,
  ExcludedFields extends keyof T = UserExcludedFields,
  IncludedFields extends keyof T = UserIncludedFields
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedRelationshipData<K>,
    SharedVersionData {
  
  // Core Profile
  profile?: UserProfileDetails;
  username: string;
  
  // Account & Security
  role: UserRole | undefined;
  lastLogin?: Date;
  lastLogout?: Date;
  lastPasswordChange?: Date;
  loginAttempts?: number;
  twoFactorEnabled?: boolean;
  phoneNumberConfirmed?: boolean;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  
  // Relationships & Content
  socialAccounts?: SocialAccount[];
  teams?: string[] | Team[];
  teamMembers?: TeamMember[];
  projects?: string[] | Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks?: any[] | Task<T, K, Meta>[];
  yourDocuments?: DocumentTree;
  visualizations?: VisualizationData[];
  
  // Activity & Analytics
  activityLog?: ActivityLogEntry[];
  notifications?: UserNotification[];
  analytics?: UserAnalytics;
  analysisResults?: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  unreadNotificationCount?: number;
  
  // Settings & Preferences
  permissions?: Permission[];
  chatSettings?: ChatSettings;
  subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // System & Technical
  datasets?: string;
  storeId: number;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotConfiguration?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  realtimeUpdates?: RealtimeUpdates[];
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date | undefined;
  deletedAt?: Date | null;
  
  // Status Flags (consolidated)
  isActive?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
  deleted?: boolean;
  completed?: boolean;
  isValid?: boolean;
  
  // Payment & Subscription
  subscriptionType?: string | null;
  subscriptionEndDate?: Date | null;
  paymentMethod?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}


// Type aliases for cleaner code
type TypedUser = User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;
type TypedUserData = UserData<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;
type TypedProject = Project<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;
type TypedTask = Task<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;
type TypedDataAnalysisResult = DataAnalysisResult<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;

// Status flag type for better organization
interface UserStatusFlags {
  isActive?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  isLoggedIn?: boolean;
  deleted?: boolean;
  completed?: boolean;
  isValid?: boolean;
  // Add other commonly used flags
}

// Payment info type
interface UserPaymentInfo {
  subscriptionType?: string | null;
  subscriptionEndDate?: Date | null;
  paymentMethod?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  // Add other payment fields
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
  storeId: 0,
  username: "username",
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
  snapshots: {} as Snapshots<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
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
  paymentMethodSubscriptionCanceledRetryAfter: null,
  major: 1,
  minor: 0,
  patch: 0,
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
  const { id, analysisResults, snapshots, label, ...rest } = user;
  // Assuming you have an array that might contain undefined
  const potentialTags: (string | undefined)[] = ['tag1', undefined, 'tag2', 'tag3', undefined];

  // Fix: Filter out undefined values
  const validTags: string[] = potentialTags.filter((tag): tag is string => tag !== undefined);

  if (user && user.data && user.yourDocuments!) {
    // Call handleDocumentEncryption with user's documents
    handleDocumentEncryption(user.yourDocuments);


    const getDefaultType = (): AllTypes => {
      // Return appropriate default based on your logic
      return DataTypeEnums.DEFAULT; // or MessageType.Default, etc.
    };
    
    return (
      <CommonDetails
        details={{
          ...rest,
          id: id ? id.toString() : "",
          value: user.value ? user.value.toString() : undefined,
          date: user.date,
          type: user.type ?? getDefaultType(),
          phase: user.phase ?? {},
          analysisResults: user.analysisResults,
          label: label ? label.toString() : label,
          data: user.data as UserData<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
          createdBy: user.createdBy,
          tags: validTags,
          currentMetadata: user.currentMetadata,
          currentMeta:
            user.currentMeta ||
            ({} as StructuredMetadata<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>),
          latestVersion: user.latestVersion
        }}
      />
    );
  } else {
    return <div>User not available</div>;
  }
};
const area = fetchUserAreaDimensions().toString();
const currentMeta: AppStructuredMetadata = useMeta(area)
const currentMetadata: AppUnifiedMetadata = useMetadata('user-area');

export const usersDataSource: Record<string, UserData> = {
  1: {
    currentMetadata: currentMetadata,
    currentMeta: meta,
    // User Data
    id: 1,
    username: "User 1",
    email: "<EMAIL>",
    role: UserRoles.Guest,
    avatarUrl: "",
    bannerUrl: "",
    hasQuota: false,
    processingTasks: [],
    persona: null,
    friends: [],
    deletedAt: null,
    lastNameChange: new Date(),
    lockoutEnd: null,
    twoFactorEnabled: false,
    phoneNumberConfirmed: false,
    securityStamp: "",
    concurrencyStamp: "",
    accessFailedCount: 0,
    settings: null,
    followers: [],
    storeId: 0,
    roles: [],
    preferences: {} as UserPreferences,
    major: 1,
    minor: 0,
    patch: 0,
    data: {
      username: "username",
      role: UserRoles.Guest,
      storeId: 0,
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
      childIds: [],
      relatedData: [],
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
      major: 1,
      minor: 0,
      patch: 0,
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
export type { Address, Education, Employment, ExtendedUser, SocialLinks };

