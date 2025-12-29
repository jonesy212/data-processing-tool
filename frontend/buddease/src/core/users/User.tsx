// User.tsx
import { NotificationPreferences } from "@/core/cards/modal/ChatSettingsModal";
import { RealtimeUpdates } from "@/core/components/community/ActivityFeedComponent";
import { CommonDetails } from '@/core/components/models/details/CommonDetails';
import { Team } from "@/core/components/teams/Team";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { fetchUserAreaDimensions } from "@/core/config/MetaDataOptions";
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { useMeta } from "@/core/config/useMeta";
import { useMetadata } from "@/core/config/useMetadata";
import { UserPreferences } from "@/core/config/UserPreferences";
import { UserSettings } from "@/core/config/UserSettings";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { CryptoDocumentManager } from "@/core/documents/cryptoDocumentManager";
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/core/documents/RelatedProps';
import { NotificationSettings } from "@/core/features/support/NotificationSettings";
import { Message } from "@/core/generators/GenerateChatInterfaces";
import ChatSettings from "@/core/hooks/userInterface/ChatSettings";
import { NFT } from "@/core/models/cypto/NFT";
import { BaseData, Data, SharedRelationshipData } from '@/core/models/data/Data';
import { Project } from "@/core/models/projects/Project";
import generateTimeBasedCode from "@/core/models/realtime/TimeBasedCodeGenerator";
import { Task } from "@/core/models/tasks/Task";
import { TeamMember } from "@/core/models/teams/TeamMembers";
import { Persona } from "@/core/pages/personas/Persona";
import { ProfileAccessControl } from "@/core/pages/profile/Profile";
import { Permission } from "@/core/permissions/Permission";
import { Product } from "@/core/products/Product";
import { DataAnalysisResult } from "@/core/projects/DataAnalysisPhase/DataAnalysisResult";
import { PrivacySettings } from "@/core/settings/PrivacySettings";
import { SecuritySettings } from "@/core/settings/SecuritySettings";
import { Snapshots } from "@/core/snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { TwitterData } from "@/core/socialMedia/TwitterIntegration";
import { ActivityLogEntry } from "@/core/state/redux/slices/UserSlice";
import { Subscription } from '@/core/subscriptions/Subscription';
import { DataProcessingTask } from "@/core/todos/tasks/DataProcessingTask";
import { BlockchainAsset } from '@/core/typings/cryptoTypes/BlockchainAsset';
import {
    CustomTransaction,
    SmartContractInteraction,
} from "@/core/typings/cryptoTypes/SmartContractInteraction";
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/core/typings/entities/AppMetadataEntity";
import { MetaAttachment, MetaEntity, MetaExcludedFields, MetaIncludedFields, MetaK, MetaMeta } from "@/core/typings/entities/MetaEntity";
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import { AllTypes } from "@/core/typings/PropTypes";
import { UserProfileDetails } from '@/core/typings/userTypes';
import { createLatestVersion } from '@/core/versions/createLatestVersion';
import { SharedVersionData } from "@/core/versions/VersionData";
import React from "react";

import { UserRole } from "@/core/models/UserRole";
import UserRoles from "@/core/models/UserRoles";
import { BlockchainPermissions } from "@/core/permissions/BlockchainPermissions";
import { SocialLinks } from "@/core/users/SocialLinks";

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
    SharedIdentifiers<T, K>,  // Use T and K, not BaseDataEntity
    SharedTimestamps,
    SharedStatusFlags {
  // Base properties that all users share
  email: string;
}


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
  role?: string | UserRole;
  
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
  type?: string | AllTypes | Promise<FileType> | null; 
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

// Social Account Interface
export interface SocialAccount {
  id: string;
  provider: 'google' | 'facebook' | 'twitter' | 'github' | 'linkedin' | 'apple' | 'microsoft';
  providerId: string;
  email?: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scopes?: string[];
  isConnected: boolean;
  lastSynced?: Date;
  metadata?: Record<string, any>;
  
  // Timestamps
  connectedAt: Date;
  updatedAt?: Date;
}

// User Notification Interface
export interface UserNotification {
  id: string;
  type: 'system' | 'team' | 'project' | 'task' | 'security' | 'billing' | 'achievement' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Content & Actions
  data?: Record<string, any>;
  actions?: NotificationAction[];
  deepLink?: string;
  category?: string;
  
  // Status
  isRead: boolean;
  isArchived: boolean;
  isActionable: boolean;
  
  // Metadata
  source?: {
    type: 'user' | 'system' | 'team' | 'project';
    id?: string;
    name?: string;
  };
  
  // Expiration & Scheduling
  expiresAt?: Date;
  scheduledFor?: Date;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
}

// Notification Actions
export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dismiss' | 'custom';
  action: string; // URL or action identifier
  style?: 'primary' | 'secondary' | 'danger' | 'success';
  data?: Record<string, any>;
}

// User Analytics Interface
export interface UserAnalytics {
  // Engagement Metrics
  engagement: {
    totalSessions: number;
    averageSessionDuration: number; // in minutes
    lastActive: Date;
    daysActive: number;
    streak: number; // consecutive days active
    favoriteFeatures: string[];
    timeOfDayPreference?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  
  // Productivity Metrics
  productivity: {
    tasksCreated: number;
    tasksCompleted: number;
    completionRate: number; // percentage
    averageTaskCompletionTime: number; // in hours
    projectsCreated: number;
    projectsCompleted: number;
    documentsCreated: number;
    collaborations: number;
  };
  
  // Team & Collaboration Metrics
  collaboration: {
    teamsJoined: number;
    teamsCreated: number;
    messagesSent: number;
    commentsMade: number;
    sharesMade: number;
    mentionsReceived: number;
    collaborationScore: number; // 0-100
  };
  
  // Learning & Skill Metrics
  learning: {
    featuresUsed: string[];
    skillsDeveloped: string[];
    tutorialsCompleted: number;
    helpArticlesViewed: number;
    learningPathProgress: number; // percentage
    certificationsEarned: string[];
  };
  
  // Platform Usage Patterns
  usage: {
    preferredPlatform: 'web' | 'mobile' | 'desktop';
    deviceTypes: string[];
    browser?: string;
    os?: string;
    screenResolution?: string;
    bandwidthUsage?: number; // in MB
    storageUsage?: number; // in MB
  };
  
  // Achievement & Gamification
  achievements: {
    badgesEarned: string[];
    points: number;
    level: number;
    rank?: string;
    milestones: Milestone[];
    recentAchievements: Achievement[];
  };
  
  // Quality & Performance
  quality: {
    errorRate: number; // percentage
    satisfactionScore?: number; // 1-5
    feedbackProvided: number;
    bugReports: number;
    featureRequests: number;
  };
  
  // Financial & Subscription Analytics
  financial: {
    subscriptionValue: number;
    lifetimeValue: number;
    paymentSuccessRate: number;
    churnRisk: number; // 0-100
    upgradeLikelihood: number; // 0-100
  };
  
  // Security & Compliance
  security: {
    loginFrequency: number;
    failedLoginAttempts: number;
    passwordStrength: number; // 0-100
    twoFactorUsage: number; // percentage of logins
    suspiciousActivityCount: number;
    lastSecurityReview?: Date;
  };
  
  // Timestamps & Metadata
  metadata: {
    firstSeen: Date;
    lastUpdated: Date;
    dataCollectionConsent: boolean;
    analyticsOptIn: boolean;
    dataRetentionPeriod: number; // in days
  };
}

// Supporting Interfaces for Analytics
export interface Milestone {
  id: string;
  name: string;
  description: string;
  type: 'usage' | 'productivity' | 'collaboration' | 'learning' | 'financial';
  achievedAt: Date;
  value: number;
  badgeUrl?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'engagement' | 'productivity' | 'social' | 'learning' | 'exploration';
  points: number;
  icon: string;
  achievedAt: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Optional: Enhanced Analytics with Time-series Data
export interface TimeSeriesAnalytics {
  date: Date;
  metrics: {
    sessions: number;
    tasksCompleted: number;
    timeSpent: number; // in minutes
    featuresUsed: string[];
    errors: number;
  };
}

// Optional: User Behavior Patterns
export interface UserBehaviorPatterns {
  weeklyPattern: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  dailyPeakHours: number[]; // hours of day (0-23) when user is most active
  preferredFeatures: string[];
  avoidancePatterns: string[]; // features the user avoids
  learningVelocity: number; // how quickly user adopts new features
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
  role?: string | UserRole;
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
  teams?: string[] | Team<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
  [key: string]: string | string[] | DocumentNode | Date | number | boolean | null | undefined;
}
// Example usage:
const userData: UserData<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> = {
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
const UserDetails: React.FC<{ user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> }> = ({ user }) => {
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
const currentMetadata: AppUnifiedMetadata = useMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>('user-area');

export const usersDataSource: Record<string, UserData> = {
  1: {
    currentMetadata: currentMetadata,
    currentMeta: currentMeta,
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
      latestVersion: createLatestVersion,
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

