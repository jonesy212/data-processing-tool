import { UserSettings } from "@/app/configs/UserSettings";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { ColorPalettes } from "antd/es/theme/interface";
import React from "react";
import { CustomTransaction } from "../../crypto/SmartContractInteraction";
import { Attachment } from "../../documents/Attachment/attachment";
import { createCustomTransaction } from "../../hooks/dynamicHooks/createCustomTransaction";
import { FakeData } from "../../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot, Snapshots } from "../../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotConfig";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import Todo, { UserAssignee } from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { Content } from "../content/AddContent";
import { Task } from "../tasks/Task";
import { Member } from "../teams/TeamMembers";
import { Tag, TagOptions, createTag } from "../tracker/Tag";
import { ProjectPhaseTypeEnum, SubscriptionTypeEnum } from "./StatusType";

// Define the interface for DataDetails
interface DataDetails {
  _id?: string;
  id: string | number;
  title?: string;
  description?: string | null;
  details?: DetailsItem<SupportedData>;
  completed?: boolean | undefined;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date | undefined;
  updatedAt: Date | undefined;
  uploadedAt?: Date;
  type?: AllTypes;
  tags?: string[] | Tag[];
  isActive?: boolean;
  status?: AllStatus;

  // Use enums for status property
  phase?: Phase | null;
  fakeData?: FakeData;
  comments?: (Comment | CustomComment)[] | undefined;
  todos?: Todo[];
  analysisData?: {
    snapshots?: Snapshots<BaseData>;
    analysisResults?: DataAnalysisResult[];
  };
  data?: Data;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: string | DataAnalysisResult[] | undefined;
  todo?: Todo;
  // Add other properties as needed
}

// Define the props for the DataDetails component
interface DataDetailsProps<T> {
  data: T;
}

export interface Comment {
  id?: string;
  text?: string | Content;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: number;
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
  tags?: string[] | Tag[];
  highlights?: string[];
  // Consolidating commentBy and author into one field
  author?: string | number | readonly string[] | undefined;
  upvotes?: number;
  content?: string | Content;
  resolved?: boolean;
  pinned?: boolean;
  // Consolidating upvotes into likes if they serve the same purpose
  postId?: string | number;
  data?: string | Data | undefined;
  customProperty?: string;
  // Add other properties as needed
}

interface BaseData {
  _id?: string;
  id: string | number;
  title?: string;
  data?: any;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  scheduled?: boolean;
  status?: AllStatus;
  timestamp?: string | Date | undefined;
  isActive?: boolean;
  tags?: string[] | Tag[];
  phase?: Phase | null;
  phaseType?: ProjectPhaseTypeEnum;
  value?: number | string | undefined;
  initialState?: 
  | SnapshotStore<BaseData, BaseData> 
  | Snapshot<BaseData, BaseData> 
  | null 
  | undefined;
  dueDate?: Date | null;
  priority?: string | AllStatus;
  assignee?: UserAssignee | null;
  collaborators?: string[];
  comments?: (Comment | CustomComment)[] | undefined;
  attachments?: Attachment[];
  subtasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  updatedDetails?: DetailsItem<SupportedData>;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: DataAnalysisResult[] | string;

  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[]; // Or whatever type is appropriate
  videoData?: VideoData;
  additionalData?: any;
  ideas?: Idea[];
  members?: number | Member[];
  leader?: User | null;
  snapshots?: SnapshotStore<BaseData, BaseData>[];
  text?: string;
  category?: string | CategoryProperties | undefined;
  [key: string]: any;
  getData?: (id: number) => Promise<SnapshotStore<BaseData, BaseData>[]>; 

  // Implement the `then` function using the reusable function
  then?: <T extends Data>(
    callback: (newData: Snapshot<BaseData>) => void
  ) =>  Snapshot<Data> | undefined;
}

interface Data extends BaseData {
  category?: string | CategoryProperties | undefined;
  subtasks?: Task[];
  actions?: SnapshotStoreConfig<BaseData, BaseData>[];
  [key: string]: any;
}

// Define the UserDetails component

const DataDetailsComponent: React.FC<DataDetailsProps<Data>> = ({ data }) => {
  const getTagNames = (tags: TagOptions[] | string[]): string[] => {
    return tags
      .filter((tag): tag is TagOptions => typeof tag !== 'string') // Type guard for TagOptions
      .map(tag => tag.name);
  };

  return (
    <CommonDetails
      data={{
        id: data.id,
        title: "Data Details",
        description: "Data descriptions",
        details: data.details,
        completed: !!data.completed,
      }}
      details={{
        _id: data._id,
        id: data.id,
        title: data.title,
        description: data.description,
        phase: data.phase,
        isActive: data.isActive,
        tags: data.tags ? getTagNames(data.tags) : [], // Use the type guard
        status: data.status,
        type: data.type,
        analysisType: data.analysisType,
        analysisResults: data.analysisResults,
        updatedAt: data.uploadedAt ? new Date(data.uploadedAt) : new Date(),
        // Add other properties as needed
      }}
    />
  );
};

const data: Data = {
  _id: "1",
  id: "data1",
  title: "Sample Data",
  description: "Sample description",
  timestamp: new Date(),
  category: "Sample category",
  startDate: new Date(),
  endDate: new Date(),
  scheduled: true,
  status: "Pending",
  isActive: true,
  tags: [createTag("1", "Important", "red")],
  phase: {} as Phase,
  phaseType: ProjectPhaseTypeEnum.Ideation,
  dueDate: new Date(),
  priority: "High",
  assignee: {
    id: "assignee1",
    username: "Assignee Name",
  } as User,
  collaborators: ["collab1", "collab2"],
  comments: [],
  attachments: [],
  subtasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "creator1",
  updatedBy: "updater1",
  analysisResults: [],
  audioUrl: "sample-audio-url",
  videoUrl: "https://example.com/sample-video-url",
  videoThumbnail: "https://example.com/sample-thumbnail-url",
  videoDuration: 60,
  collaborationOptions: [],
  videoData: {
    id: "video1",
    campaignId: 123,
    resolution: "1080p",
    size: "100MB",
    aspectRatio: "16:9",
    language: "en",
    subtitles: [],
    duration: 60,
    codec: "H.264",
    frameRate: 30,
    url: "https://example.com/sample-video-url",
    thumbnailUrl: "https://example.com/sample-thumbnail-url",
    uploadedBy: "uploader1",
    viewsCount: 1000,
    likesCount: 100,
    dislikesCount: 10,
    commentsCount: 20,
    title: "Sample Video Title",
    description: "Sample video description",
    tags: ["sample", "video"],
    createdAt: new Date(),
    uploadedAt: new Date(),
    updatedAt: new Date(),
    videoDislikes: 10,
    videoAuthor: "Author Name",
    videoDurationInSeconds: 60,
    uploadDate: new Date(),
    videoLikes: 100,
    videoViews: 1000,
    videoComments: 20,
    videoThumbnail: "https://example.com/sample-thumbnail-url",
    videoUrl: "https://example.com/sample-video-url",
    videoTitle: "Sample Video Title",
    videoDescription: "Sample video description",
    videoTags: ["sample", "video"],
    videoSubtitles: [],
    category: "Sample Category",
    closedCaptions: [],
    license: "Sample License",
    isLive: false,
    isPrivate: false,
    isUnlisted: false,
    isProcessingCompleted: true,
    isProcessingFailed: false,
    isProcessingStarted: false,
    channel: "Sample Channel",
    channelId: "channel123",
    isLicensedContent: true,
    isFamilyFriendly: true,
    isEmbeddable: true,
    isDownloadable: true,
    playlists: ["playlist1", "playlist2"],
    thumbnail: "https://example.com/sample-thumbnail-url",
    isProcessing: false,
    isCompleted: true,
    isUploading: false,
    isDownloading: false,
    isDeleting: false,
  },
  additionalData: {},
  ideas: [],
  members: [],
  leader: {
    id: "leader1",
    username: "Leader Name",
    email: "leader@example.com",
    fullName: "Leader Full Name",
    bio: "Leader Bio",
    userType: "Admin",
    hasQuota: true,
    tier: "0",
    token: "leader-token",
    uploadQuota: 100,
    usedQuota: 50,
    avatarUrl: "avatar-url",
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: false,
    isAdmin: false,
    isActive: true,
    profilePicture: null,
    processingTasks: [],
    role: UserRoles.TeamLeader,
    firstName: "",
    lastName: "",
    friends: [],
    blockedUsers: [],
    persona: new Persona(PersonaTypeEnum.Default),
    settings: {
      // notificationPreferences: {
      //   email: true,
      //   mobile: false,
      //   desktop: true
      // }
    } as UserSettings,
    interests: [],
    privacySettings: {
      hidePersonalInfo: true,
      enablePrivacyMode: false,
      enableTwoFactorAuth: true,
      restrictVisibilityToContacts: false,
      restrictFriendRequests: false,
      hideOnlineStatus: false,
      showLastSeenTimestamp: true,
      allowTaggingInPosts: true,
      enableLocationPrivacy: true,
      hideVisitedProfiles: true,
      restrictContentSharing: true,
      enableIncognitoMode: false,
      restrictContentSharingToContacts: false,
      restrictContentSharingToGroups: false,
    }, // Added missing properties
    notifications: {
      email: true,
      push: true,
      sms: false,
      chat: false,
      calendar: false,
      task: false,
      file: false,
      meeting: false,
      announcement: false,
      reminder: false,
      project: false,
      enabled: true,
      notificationType: "push",
      audioCall: false,
      videoCall: false,
      screenShare: false,
      mention: false,
      reaction: false,
      follow: false,
      poke: false,
      activity: false,
      thread: false,
      inviteAccepted: false,
      directMessage: false,
    }, // Added missing property

    activityLog: [
      {
        action: "Logged in",
        timestamp: new Date(),
        id: "",
        activity: "",
      },
      {
        action: "Updated profile",
        timestamp: new Date(),
        id: "",
        activity: "",
      },
    ],
    socialLinks: {
      facebook: "https://facebook.com/leader",
      twitter: "https://twitter.com/leader",
      website: "",
      linkedin: "",
      instagram: "",
    },
    relationshipStatus: "Single",
    hobbies: ["Reading", "Traveling"],
    skills: ["Project Management", "Software Development"],
    achievements: ["Completed 100 projects", "Employee of the Month"],
    profileVisibility: "Public",
    profileAccessControl: {
      friendsOnly: true,
      allowTagging: true,
      blockList: [],
      allowMessagesFromNonContacts: true,
      shareProfileWithSearchEngines: false,
      isPrivate: true,
      isPrivateOnly: false,
      isPrivateOnlyForContacts: false,
      isPrivateOnlyForGroups: false,
    },
    activityStatus: "Online",
    isAuthorized: true,
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: true,
      enableNotifications: true,
      notificationSound: "birds",
      notificationVolume: 50,
      sms: false,
      mobile: false,
      desktop: true,
    },
    securitySettings: {
      securityQuestions: ["What is your pet's name?"],
      twoFactorAuthentication: false,
      passwordPolicy: "StandardPolicy",
      passwordExpirationDays: 90,
      passwordStrength: "Strong",
      passwordComplexityRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSpecialCharacters: false,
      },
      accountLockoutPolicy: {
        enabled: true,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
      },
      accountLockoutThreshold: 5,
    },
    emailVerificationStatus: true,
    phoneVerificationStatus: true,
    walletAddress: "0x123456789abcdef",
    transactionHistory: [
      createCustomTransaction({
        id: "tx1",
        amount: 100,
        date: new Date(),
        description: "Sample transaction",
        type: null,
        typeName: null,
        to: null,
        nonce: 0,
        gasLimit: BigInt(0),
        gasPrice: null,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        data: "",
        value: BigInt(0),
        chainId: BigInt(0),
        signature: null,
        accessList: [],
        maxFeePerBlobGas: null,
        blobVersionedHashes: null,
        hash: null,
        unsignedHash: "",
        from: null,
        fromPublicKey: null,

        isSigned(): boolean {
          return !!(this.type && this.typeName && this.from && this.signature);
        },
        serialized: "",
        unsignedSerialized: "",
        inferType(): number {
          if (this.type !== null && this.type !== undefined) {
            return this.type;
          }
          // Add other type inference logic here
          // For now, we assume a default type if no specific logic matches
          return 0; // default type
        },
        inferTypes(): number[] {
          const types: number[] = [];
          if (this.type !== null && this.type !== undefined) {
            types.push(this.type);
          }
          // Add other logic to infer additional types
          // Example:
          if (
            this.maxFeePerGas !== null &&
            this.maxPriorityFeePerGas !== null
          ) {
            types.push(2); // Example for London type transaction
          }
          if (types.length === 0) {
            types.push(0); // Default to legacy type if no other type inferred
          }
          return types;
        },

        isLegacy() {
          // Check if the transaction type is legacy (type 0) and gas price is not null
          return this.type === 0 && this.gasPrice !== null;
        },
        isBerlin() {
          // Check if the transaction type is Berlin (type 1) and gas price and access list are not null
          return (
            this.type === 1 &&
            this.gasPrice !== null &&
            this.accessList !== null
          );
        },

        isLondon() {
          return (
            this.type === 2 &&
            this.accessList !== null &&
            this.maxFeePerGas !== null &&
            this.maxPriorityFeePerGas !== null
          );
        },
        isCancun() {
          return (
            this.type === 3 &&
            this.to !== null &&
            this.accessList !== null &&
            this.maxFeePerGas !== null &&
            this.maxPriorityFeePerGas !== null &&
            this.maxFeePerBlobGas !== null &&
            this.blobVersionedHashes !== null
          );
        },

        clone(): CustomTransaction {
          // Implement logic to clone the data object

          const clonedData: CustomTransaction = {
            _id: this._id,
            id: this.id || "", // Provide a default value of empty string
            amount: this.amount,
            date: this.date ? new Date(this.date.getTime()) : undefined,
            description: this.description || "", // Provide a default value of empty string
            startDate: this.startDate ? new Date(this.startDate) : undefined,
            endDate: this.endDate ? new Date(this.endDate) : undefined,
            isSigned:
              typeof this.isSigned === "function"
                ? this.isSigned.bind(this)
                : this.isSigned, // Handle both boolean and function cases
            serialized: this.serialized || "", // Provide a default value or handle undefined
            unsignedSerialized: this.unsignedSerialized || "", // Provide a default value or handle undefined
            inferType: this.inferType?.bind(this),
            inferTypes: this.inferTypes?.bind(this),
            isLegacy: this.isLegacy?.bind(this),
            isBerlin: this.isBerlin?.bind(this),
            isLondon: this.isLondon?.bind(this),
            isCancun: this.isCancun?.bind(this),
            clone: this.clone?.bind(this),
            toJSON: this.toJSON?.bind(this),
            title: "",
            accessList: [],
            type: null,
            typeName: null,
            from: null,
            signature: null,
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            gasPrice: null,
            to: null,
            nonce: 0,
            gasLimit: BigInt(0),
            data: "",
            value: BigInt(0),
            chainId: BigInt(0),
            maxFeePerBlobGas: null,
            blobVersionedHashes: null,
            hash: null,
            unsignedHash: "",
            fromPublicKey: null,

            equals(transaction: CustomTransaction): boolean {
              // Compare each property of the transactions
              return (
                this.id === transaction.id &&
                this.amount === transaction.amount &&
                this.date?.getTime() === transaction.date?.getTime() &&
                this.title === transaction.title
                // Add more comparisons for other properties as needed
              );
            },

            getSubscriptionLevel(): string {
              if (this.subscriptionType) {
                switch (this.subscriptionType) {
                  case SubscriptionTypeEnum.FREE:
                    return "Free";
                  case SubscriptionTypeEnum.STANDARD:
                    return "Standard";
                  case SubscriptionTypeEnum.PREMIUM:
                    return "Enterprise";
                  case SubscriptionTypeEnum.ENTERPRISE:
                    return "Premium";
                  case SubscriptionTypeEnum.TRIAL:
                    return "Premium";
                  default:
                    return "Unknown";
                }
              } else {
                return "Unknown";
              }
            },
            getRecentActivity: () => {
              if (this.recentActivity && this.recentActivity.length === 2) {
                return this.recentActivity;
              } else {
                // If recentActivity is undefined or has incorrect length, return default values
                return [
                  { action: "", timestamp: new Date() },
                  { action: "", timestamp: new Date() },
                ];
              }
            },
            notificationsEnabled: this.notificationsEnabled ?? false,
            recentActivity: [
              { action: "Action 1", timestamp: new Date() },
              { action: "Action 2", timestamp: new Date() },
            ],
          };
          return clonedData;
        },
        toJSON(): CustomTransaction {
          const customTransaction: CustomTransaction = {
            id: this.id ?? null,
            type: this.type ?? null,
            typeName: this.typeName ?? null,
            from: this.from ?? null,
            signature: this.signature ?? null,
            maxFeePerGas: this.maxFeePerGas ?? null,
            maxFeePerBlobGas: this.maxFeePerBlobGas ?? null,
            blobVersionedHashes: this.blobVersionedHashes ?? null,
            maxPriorityFeePerGas: this.maxPriorityFeePerGas ?? null,
            gasPrice: this.gasPrice ?? null,
            date: this.date,
            data: this.data || "",
            description: this.description ?? null,
            value: this.value ?? null,
            unsignedHash: this.unsignedHash ?? null,
            notificationsEnabled: this.notificationsEnabled ?? false,
            amount: this.amount,
            title: this.title ?? null,
            startDate: this.startDate,
            endDate: this.endDate,
            serialized: this.serialized,
            unsignedSerialized: this.unsignedSerialized,
            recentActivity: this.recentActivity ?? [
              {
                action: "Action 1",
                timestamp: new Date(),
              },
              {
                action: "Action 2",
                timestamp: new Date(),
              },
            ],
          };
          return customTransaction;
        },
      }),
    ],
    tokenBalance: 1000,
    smartContractInteractions: [
      {
        id: "sc1",
        amount: 200,
        date: new Date(),
        description: "Smart contract interaction",
      },
    ],
    blockchainPermissions: {
      canMintNFT: true,
      canTransferTokens: true,
      canViewBlockchainTransactions: true,
      canDeploySmartContracts: true,
      canInteractWithSmartContracts: true,
      canAccessDecentralizedApplications: true,
      canManageBlockchainAssets: true,
    },
    blockchainIdentity: "leader_blockchain_id",
    blockchainAssets: [
      {
        id: "asset1",
        name: "Asset 1",
        value: 1000,
        symbol: "",
        balance: 0,
        contractAddress: "",
        decimals: 0,
      },
    ],
    nftCollection: [
      {
        id: "nft1",
        name: "NFT 1",
        imageUrl: "https://example.com/nft1.png",
        description: "",
        role: "Owner",
      },
    ],
    daoMemberships: [{ id: "dao1", name: "DAO 1", role: "Member" }],
    decentralizedStorageUsage: {
      usedSpace: 500,
      totalSpace: 1000,
    },
    decentralizedIdentity: {
      id: "did:example:123",
      publicKey: "public-key",
    },
    decentralizedMessagingKeys: {
      publicKey: "public-key",
      privateKey: "private-key",
    },
    decentralizedAuthentication: {
      methods: ["password", "fingerprint"],
    },
  },
  snapshots: [],
  getData: function (): Promise<SnapshotStore<BaseData, BaseData>[]> {
    // Implement logic to get the data
    return Promise.resolve([]);
  },
};

export type {
  BaseData,
  Data,
  DataDetails,
  DataDetailsComponent,
  DataDetailsProps
};

