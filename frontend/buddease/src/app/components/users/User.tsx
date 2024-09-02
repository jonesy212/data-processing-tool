// User.tsx
import { UserSettings } from "@/app/configs/UserSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { Persona } from "@/app/pages/personas/Persona";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import React from "react";
import { NotificationPreferences } from "../communications/chat/ChatSettingsModal";
import ChatSettings from "../communications/chat/ChatSettingsPanel";
import { RealtimeUpdates } from "../community/ActivityFeedComponent";
import { CustomTransaction, SmartContractInteraction } from "../crypto/SmartContractInteraction";
import { CryptoDocumentManager } from "../documents/cryptoDocumentManager";
import CommonDetails from "../models/CommonData";
import { BaseData, Data } from "../models/data/Data";
import generateTimeBasedCode from "../models/realtime/TimeBasedCodeGenerator";
import { Task } from "../models/tasks/Task";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import { Tag } from "../models/tracker/Tag";
import { NFT } from "../nft/NFT";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project } from "../projects/Project";
import { PrivacySettings } from "../settings/PrivacySettings";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { TwitterData } from "../socialMedia/TwitterIntegration";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
import { BlockchainAsset } from "./BlockchainAsset";
import { BlockchainPermissions } from "./BlockchainPermissions";
import { SocialLinks } from "./SocialLinks";
import { UserRole } from "./UserRole";
import UserRoles from "./UserRoles";
import { ActivityLogEntry } from "./UserSlice";
import { UserPreferences } from "@/app/configs/UserPreferences";
import { SnapshotStoreConfig } from "../snapshots";
import { NotificationSettings } from "../support/NotificationSettings";

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
  isVerified?: boolean;
  isActive?: boolean;
  isAdmin?: boolean;
  isSubscribed?: boolean,

  bio: string | null;
  userType: string;
  hasQuota: boolean;
  profilePicture: string | null;
  processingTasks: DataProcessingTask[];
  data?: UserData;
  role: UserRole | undefined;
  persona: Persona | null;
  friends: User[];
  analysisResults?: DataAnalysisResult[];
  isLoggedIn?: boolean;
  isDeleted?: boolean;
  localeCompare?: (other: Message) => number;
  blockedUsers: User[];
  settings: UserSettings | null;
  interests: string[];
  followers: User[];
  privacySettings: PrivacySettings | undefined;
  notificationSettings: NotificationSettings | undefined;
  activityLog: ActivityLogEntry[]
  projects?: Project[]; // Define the type explicitly as an array of Project objects
  socialLinks: SocialLinks | undefined;
  relationshipStatus: string | null;
  hobbies: string[];
  address?: Address;
  language?: string;
  education?: Education[];
  employment?: Employment[];
  dependencies?: Task[];
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
  preferences: UserPreferences;
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
  tasks?: Task[];
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
  snapshots?: SnapshotStore<Data, BaseData>[] | undefined
  snapshotConfiguration?: SnapshotStoreConfig<any, any>[];
  analysisResults?: DataAnalysisResult[];
  role: UserRole | undefined;
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
  updatedAt?: Date;
  createdAt?: Date;
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
  snapshots: {} as SnapshotStore<Data, BaseData>[],
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


export const usersDataSource: Record<string, User> = {
  1: {
    // User Data
    id: 1,
    username: "User 1",
    email: "<EMAIL>",
    role: UserRoles.Guest,
    avatarUrl: "", 
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
    preferences: {} as UserPreferences,
    data: {
      role: UserRoles.Guest,
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
    notificationSettings: undefined,
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
