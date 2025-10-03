// User.tsx
import { Attachment } from "@/app/components/documents/Attachment/attachment";
import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { K, Meta, T } from "@/app/components/models/data/dataStoreMethods";
import { SecuritySettings } from "@/app/components/settings/SecuritySettings";
import { Data } from "@/app/models/data/Data";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { useMeta } from "@/config/useMeta";
import { useMetadata } from "@/config/useMetadata";
import { UserPreferences } from "@/config/UserPreferences";
import { UserSettings } from "@/config/UserSettings";
import {
    fetchUserAreaDimensions,
    UnifiedMetadata
} from "@/server/database/MetaDataOptions";

import { NotificationPreferences } from "@/app/communications/chat/ChatSettingsModal";
import ChatSettings from "@/app/communications/chat/ChatSettingsPanel";
import { RealtimeUpdates } from "@/app/community/ActivityFeedComponent";
import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import {
    CustomTransaction,
    SmartContractInteraction,
} from "@/app/crypto/SmartContractInteraction";
import { CryptoDocumentManager } from "@/app/documents/cryptoDocumentManager";
import { NotificationSettings } from "@/app/features/support/NotificationSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import CommonDetails from "@/app/models/CommonData";
import { BaseData, SharedRelationshipData } from "@/app/models/data/Data";
import { ActivityActionEnum, ActivityTypeEnum, BookmarkStatus, BorderStyle, CalendarStatus, CalendarViewType, ChatType, CollaborationOptionType, ComponentStatus, DataStatus, DocumentPhaseEnum, DocumentSize, IncludeType, Layout, MeetingStatus, NotificationPosition, NotificationStatus, Orientation, OutcomeType, PriorityTypeEnum, PrivacySettingEnum, ProductStatus, ProjectStateEnum, SortingType, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "@/app/models/data/StatusType";
import { Project } from "@/app/models/projects/Project";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import { Task } from "@/app/models/tasks/Task";
import { Team } from "@/app/models/teams/Team";
import { TeamMember } from "@/app/models/teams/TeamMembers";
import { NFT } from "@/app/nft/NFT";
import { Persona } from "@/app/pages/personas/Persona";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import { Product } from "@/app/products/Product";
import { DataAnalysisResult } from "@/app/projects/DataAnalysisPhase/DataAnalysisResult";
import { ExcludedFields } from "@/app/routing/Fields";
import { PrivacySettings } from "@/app/settings/PrivacySettings";
import { SnapshotStoreConfig } from "@/app/snapshots/";
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { TwitterData } from "@/app/socialMedia/TwitterIntegration";
import { DataProcessingTask } from "@/app/todos/tasks/DataProcessingTask";
import {
    DocumentTypeEnum
} from "@/app/typings/documents";
import { AllTypes } from "@/app/typings/PropTypes";
import { SharedVersionData } from "@/app/versions/VersionData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import React from "react";
import { BlockchainAsset } from "./BlockchainAsset";
import { BlockchainPermissions } from "./BlockchainPermissions";
import { Permission } from "./Permission";
import { SocialLinks } from "./SocialLinks";
import { UserRole } from "./UserRole";
import UserRoles from "./UserRoles";
import { ActivityLogEntry } from "./UserSlice";

export type UserDataEntity = BaseDataEntity;
export type UserDataK = UserDataEntity;
export type UserDataMeta = DefaultMeta<UserDataEntity, UserDataK>;
export type UserDataExcludedFields = DefaultExcludedFields<UserDataEntity>;

export type AppUser = User<
  UserData<UserDataEntity, UserDataK, UserDataMeta>,
  UserDataMeta,
  UserDataExcludedFields
>;

export interface BaseUser<
  T extends UserData<any> = UserData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends User<T, K, Meta>,
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
  T extends UserData<any> = UserData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends Data<T, K, Meta>
{
  // Required fields
  username: string;
  email: string;
  tier: string;
  uploadQuota: number;
  hasQuota: boolean;
  processingTasks: DataProcessingTask[];
  role: UserRole | undefined;
  persona: Persona | null;
  friends: User[];
  blockedUsers: User[];
  activityLog: ActivityLogEntry[];
  activityStatus: string;
  isAuthorized: boolean;
  
  // Recommended optional fields
  roles?: UserRole[];
  firstName?: string;
  lastName?: string;
  type?: string | AllTypes | null;
  token?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  fullName?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  lastLogin?: Date;
  bio?: string | null;
  school?: string;
  grade?: string;
  profilePicture?: string | null;
  data?: UserData;
  createdBy?: string;
  analysisResults?: DataAnalysisResult<T>[];
  isLoggedIn?: boolean;
  localeCompare?: (other: Message) => number;
  settings?: UserSettings | null;
  interests?: string[];
  followers?: User[];
  privacySettings?: PrivacySettings;
  notifications?: NotificationSettings;
  projects?: Project<T, K, StructuredMetadata<T, K>>[];
  socialLinks?: SocialLinks;
  relationshipStatus?: string | null;
  hobbies?: string[];
  address?: Address;
  language?: string;
  education?: Education[];
  employment?: Employment[];
  dependencies?: Task<T, K, StructuredMetadata<T, K>>[];
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
  twitterData?: TwitterData;
  preferences?: UserPreferences;
}

interface ExtendedUser<T extends BaseData = BaseData> extends BaseUser {
  workspaceUrl?: string;
  workspaces?: any[]; // Optional to allow partial creation
  products?: Product[];
  roles?: UserRole[];
  permissions?: Permission[];
  status?: string;
  statusText?: string;
  activeProduct?: string;
  activeWorkspace?: string;
  activeRole?: string;
  activePermissions?: any[];
  activeWorkspacePermissions?: any[];
  activeProductPermissions?: any[];
  activeRolePermissions?: any[];
  activeWorkspaceRoles?: any[];
  activeProductRoles?: any[];
  activeWorkspaceProducts?: any[];
  activeProductWorkspaces?: any[];
  activeRoleWorkspaces?: any[];
  activeRoleProducts?: any[];
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
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  > extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedRelationshipData<K>,
    SharedVersionData
  {
    datasets?: string;
    id?: string | number;
    username: string;
    tasks?: Task<T, K, Meta>[];
    questionnaireResponses?: any;
    chatSettings?: ChatSettings;
    projects?: Project<T, K, Meta, ExcludedFields>[];
    storeId: number;
    teams?: Team[];
    teamMembers?: TeamMember[];
    yourDocuments?: DocumentTree;
    visualizations?: VisualizationData[];
    traits?: typeof CommonDetails;
    timeBasedCode?: typeof timeBasedCode;
    realtimeUpdates?: RealtimeUpdates[];
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
    incomeLevel?: string;
    unreadNotificationCount?: number;
    snapshots?: Snapshots<T, K>;
    snapshotConfiguration?: SnapshotStoreConfig<any, any>[];
    analysisResults?: DataAnalysisResult<T>[];
    role: UserRole | undefined;
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
    accessFailedCount?: number | null;
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
    paypalEmail?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeSubscriptionStatus?: string | null;
    stripeCustomerPortalLink?: string | null;
    stripeSetupIntentClientSecret?: string | null;
    stripePaymentIntentClientSecret?: string | null;
    stripeWebhookSecret?: string | null;
    stripePublicKey?: string | null;
    stripePrivateKey?: string | null;
    stripeWebhookEndpointSecret?: string | null;
    stripeWebhookSigningSecret?: string | null;
    stripeWebhookSecretHeader?: string | null;
    stripeSuccessUrl?: string | null;
    stripeCancelUrl?: string | null;
    stripeProductId?: string | null;
    stripePriceId?: string | null;
    stripePlanId?: string | null;
    stripeTaxId?: string | null;
    stripeSetupIntentId?: string | null;
    stripePaymentIntentId?: string | null;
    stripePaymentMethodId?: string | null;
    stripeSubscriptionItemId?: string | null;
    stripeTaxRateId?: string | null;
    stripeProduct?: string | null;
    stripePrice?: string | null;
    stripePlan?: string | null;
    stripeTax?: string | null;
    subscriptionData?: any | null;
    emailVerification?: string | null;
    emailVerificationToken?: string | null;
    emailVerificationTokenExpiry?: Date | null;
    passwordReset?: string | null;
    passwordResetToken?: string | null;
    passwordResetTokenExpiry?: Date | null;
    emailConfirmationToken?: string | null;
    emailConfirmationTokenExpiry?: Date | null;
    lastLoginToken?: string | null;
    loginTokenExpiry?: Date | null;
    userAuthenticator?: string | null;
    userAuthenticationToken?: string | null;
    userAuthenticationTokenExpiry?: Date | null;
    refreshToken?: string | null;
    refreshTokenExpiry?: Date | null;
    registrationConfirmation?: string | null;
    registrationConfirmationToken?: string | null;
    registrationConfirmationTokenExpiry?: Date | null;
    welcomeEmail?: string | null;
    welcomeEmailSent?: boolean | null;
    unsubscribeEmail?: string | null;
    unsubscribeEmailSent?: boolean | null;
    welcomeMessage?: string | null;
    welcomeMessageSent?: boolean | null;
    emailSignature?: string | null;
    referralCode?: string | null;
    referralCodeExpiry?: Date | null;
    referralCodeLimit?: number | null;
    referredBy?: string | null;
    invitedBy?: string | null;
    inviteCode?: string | null;
    inviteCodeExpiry?: Date | null;
    inviteCodeLimit?: number | null;
    autoConfirmEmail?: boolean | null;
    emailConfirmed?: boolean | null;
    profileCompleted?: boolean | null;
    personaCompleted?: boolean | null;
    termsAccepted?: boolean | null;
    privacyAccepted?: boolean | null;
    dataDeleted?: boolean | null;
    deletedReason?: string | null;
    deletedBy?: string | null;
    updatedAt?: string | Date | undefined;
    createdAt?: string | Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    deleted?: boolean;
    active?: boolean;
    completed?: boolean;
    isValid?: boolean;
    isPrimary?: boolean;
    isPreferred?: boolean;
    isCurrent?: boolean;
    isDefault?: boolean;
    isLocked?: boolean;
    isVerified?: boolean;
    isActive?: boolean;
    isAdmin?: boolean;
    isModerator?: boolean;
    isStaff?: boolean;
    isSuper?: boolean;
    isOwner?: boolean;
    isManager?: boolean;
    isLead?: boolean;
    isMember?: boolean;
    isHost?: boolean;
    isParticipant?: boolean;
    isPublisher?: boolean;
    isSubscriber?: boolean;
    isFollowing?: boolean;
    isFriend?: boolean;
    isBlocked?: boolean;
    isMuted?: boolean;
    isIgnored?: boolean;
    isAccepted?: boolean;
    isApproved?: boolean;
    isRejected?: boolean;
    isInvited?: boolean;
    isConfirmed?: boolean;
    isCompleted?: boolean;
    isSuccessful?: boolean;
    isCancelled?: boolean;
    isExpired?: boolean;
    isClosed?: boolean;
    isDeleted?: boolean;
    isBanned?: boolean;
    isDisabled?: boolean;
    isSuspended?: boolean;
    isPending?: boolean;
    isRequested?: boolean;
    isRecommended?: boolean;
    isPopular?: boolean;
    isTrending?: boolean;
    isViral?: boolean;
    isControversial?: boolean;
    isFeatured?: boolean;
    isSponsored?: boolean;
    isPromoted?: boolean;
    isBoosted?: boolean;
    isBookmarked?: boolean;
    isSaved?: boolean;
    isLiked?: boolean;
    isDisliked?: boolean;
    isShared?: boolean;
    isViewed?: boolean;
    isRead?: boolean;
    isUnread?: boolean;
    isNotified?: boolean;
    isNoteworthy?: boolean;
    isResponsible?: boolean;
    isAccountable?: boolean;
    isConsulted?: boolean;
    isInformed?: boolean;
    isEngaged?: boolean;
    isAvailable?: boolean;
    isOnline?: boolean;
    isOffline?: boolean;
    isAway?: boolean;
    isBusy?: boolean;
    isDoNotDisturb?: boolean;
    isUnderMaintenance?: boolean;
    isBlockedByEmail?: boolean;
    isBlockedByPhone?: boolean;
    isBlockedBySMS?: boolean;
    isBlockedByMessenger?: boolean;
    isBlockedByChat?: boolean;
    isBlockedByVideo?: boolean;
    isBlockedByVoice?: boolean;
    //todo integrate external auth
    isBlockedByVOIP?: boolean;
    isBlockedByTelegram?: boolean;
    isBlockedByWhatsApp?: boolean;
    isBlockedByWeChat?: boolean;
    isBlockedBySignal?: boolean;
    isBlockedBySkype?: boolean;
    isBlockedBySlack?: boolean;
    isBlockedByDiscord?: boolean;
    isBlockedByZoom?: boolean;
    isBlockedByGoogleMeet?: boolean;
    isBlockedByTeams?: boolean;
    isBlockedBySnapchat?: boolean;
    isBlockedByTwitter?: boolean;
    isBlockedByLinkedIn?: boolean;
    isBlockedByFacebook?: boolean;
    isBlockedByInstagram?: boolean;
    isBlockedByTikTok?: boolean;
    isBlockedBySnapgram?: boolean;
    isBlockedBySoundcloud?: boolean;
    isBlockedBySpotify?: boolean;
    isBlockedByTwitch?: boolean;
    isBlockedByReddit?: boolean;
    isBlockedByPinterest?: boolean;
    isBlockedByTumblr?: boolean;
    isBlockedByFlickr?: boolean;
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
  snapshots: {} as Snapshots<BaseData<T, K, Meta<T, K>, Attachment>>,
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
          data: user.data as UserData<
            BaseData<any, any, StructuredMetadata<any, any>>,
            BaseData<any, any, StructuredMetadata<any, any>>,
            StructuredMetadata<T, K>
          >,
          createdBy: user.createdBy,
          tags: validTags,
          currentMetadata: user.currentMetadata,
          currentMeta:
            user.currentMeta ||
            ({} as StructuredMetadata<
              BaseData<any, any, StructuredMetadata<any, any>, Attachment>,
              BaseData<any, any, StructuredMetadata<any, any>, Attachment>
              >),
          latestVersion: user.latestVersion
        }}
      />
    );
  } else {
    return <div>User not available</div>;
  }
};
const area = fetchUserAreaDimensions().toString();
const meta: StructuredMetadata<T, K> = useMeta<T, K>(area);
const currentMetadata: UnifiedMetadata<T, K> = useMetadata<T, K>(
  area
);
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

