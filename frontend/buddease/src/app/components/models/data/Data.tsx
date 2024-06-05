import { UserSettings } from "@/app/configs/UserSettings";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { ColorPalettes } from "antd/es/theme/interface";
import { CustomTransaction } from "../../crypto/SmartContractInteraction";
import { Attachment } from "../../documents/Attachment/attachment";
import { createCustomTransaction } from "../../hooks/dynamicHooks/createCustomTransaction";
import { FakeData } from "../../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import SnapshotStoreConfig from "../../snapshots/SnapshotConfig";
import SnapshotStore, { Snapshot, Snapshots } from "../../snapshots/SnapshotStore";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import Todo from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { Member } from "../teams/TeamMembers";
import { ProjectPhaseTypeEnum } from "./StatusType";
import { Content } from "../content/AddContent";
import { Tag } from "../tracker/Tag";
// Define the interface for DataDetails
interface DataDetails {
  _id?: string;
  id: string;
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
  tags?: string[] | Tag[]
  isActive?: boolean;
  status?: AllStatus;

  // Use enums for status property
  phase?: Phase | null;
  fakeData?: FakeData;
  comments?: (Comment | CustomComment)[] | undefined;
  todos?: Todo[];
  analysisData?: {
    snapshots?: Snapshots<Data>
    analysisResults?: DataAnalysisResult[];
  };
  data?: Data;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: string | DataAnalysisResult[] | undefined;
  todo?: Todo;
  // Add other properties as needed
}

// Define the props for the DataDetails component
interface DataDetailsProps {
  data: DataDetails;
}

export interface Comment {
  id: string;
  text?: string;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: number;
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
  tags?: string[];
  highlights?: string[];
  // Consolidating commentBy and author into one field
  author?: string | number | readonly string[] | undefined;
  upvotes?: number;
  content?: string | Content;
  resolved?: boolean;
  pinned?: boolean;
  // Consolidating upvotes into likes if they serve the same purpose
  postId?: string | number;
  data?: Data | undefined;
  customProperty: string;

  // Add other properties as needed
}

interface Data {
  _id?: string;
  id?: string | number;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  scheduled?: boolean;
  status?: AllStatus;
  timestamp?: Date | string ;
  isActive?: boolean;
  tags?:  string[] | Tag[];
  phase?: Phase | null;
  phaseType?: ProjectPhaseTypeEnum;

  // Properties specific to Todo
  dueDate?: Date | null;
  priority?: AllStatus;
  assignee?: User | null;
  collaborators?: string[];
  comments?: (Comment | CustomComment)[];
  attachments?: Attachment[];
  subtasks?: Todo[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

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
  [key: string]: any;
  ideas?: Idea[];
  members?: Member[];
  // tasks?: Todo[];
  leader?: User | null;
  snapshots?: SnapshotStore<Snapshot<Data>>[];
  // Incorporating the data structure from YourResponseType
  text?: string;
  category?: string;
  getData?: () => Promise<SnapshotStore<Snapshot<Data>>[]>; // Define the getData method
  then?: (callback: (newData: Snapshot<Data>) => void) => void;
  actions?: typeof SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>[]; // Update actions type

}

// Define the UserDetails component
const DataDetailsComponent: React.FC<DataDetailsProps> = ({ data }) => (
  <CommonDetails
    data={{
      title: "Data Details",
      description: "Data descriptions",
      details: data.details,
      completed: !!data.completed,
    }}
    details={{
      _id: data._id,
      id: data.id as string,
      title: data.title,
      description: data.description,
      phase: data.details?.phase,
      isActive: data.isActive,
      tags: data.tags?.map((tag) => (tag as Tag).getOptions().name) || [],
      status: data.status,
      type: data.type,
      analysisType: data.analysisType,
      analysisResults: data.analysisResults,
      updatedAt: data.uploadedAt ? new Date(data.uploadedAt) : new Date(),
      // fakeData: data.fakeData,
      // Add other properties as needed
    }}
  />
);

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
  tags: [new Tag({ id: "1", name: "Important", color: "red" })],
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
  videoUrl: "sample-video-url",
  videoThumbnail: "sample-thumbnail-url",
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
    url: "",
    thumbnailUrl: "",
    uploadedBy: "",
    viewsCount: 0,
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
    title: "",
    description: "",
    tags: [],
    createdAt: new Date(),
    uploadedAt: new Date(),
    updatedAt: new Date(),
    videoDislikes: 0,
    videoAuthor: "",
    videoDurationInSeconds: 60,
    uploadDate: new Date(),
    videoLikes: 0,
    videoViews: 0,
    videoComments: 0,
    videoThumbnail: "",
    videoUrl: "",
    videoTitle: "",
    videoDescription: "",
    videoTags: [],
    videoSubtitles: [],
    category: "",
    closedCaptions: [],
    license: "",
    isLive: false,
    isPrivate: false,
    isUnlisted: false,
    isProcessingCompleted: false,
    isProcessingFailed: false,
    isProcessingStarted: false,
    channel: "",
    channelId: "",
    isLicensedContent: false,
    isFamilyFriendly: false,
    isEmbeddable: false,
    // isSubscribed: false,
    isDownloadable: false,

    playlists: [],
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
    role: UserRoles.Leader,
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
    interests: [], // Added missing property
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
            id: this.id,
            amount: this.amount,
            date: this.date,
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
          };
          return clonedData;
        },
        toJSON() {
          // Implement logic to convert the data object to JSON format
          const dataJSON: string = JSON.stringify({
            // Convert properties to JSON format
          });
          return dataJSON;
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
  getData: function (): Promise<SnapshotStore<Snapshot<Data>, Data>[]> {
    throw new Error("Function not implemented.");
  },
};

export type { Data, DataDetails, DataDetailsComponent, DataDetailsProps };
