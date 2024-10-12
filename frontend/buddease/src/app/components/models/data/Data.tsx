import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { ColorPalettes } from "antd/es/theme/interface";
import React from "react";
import { LanguageEnum } from "../../communications/LanguageEnum";
import { CustomTransaction } from "../../crypto/SmartContractInteraction";
import { Attachment } from "../../documents/Attachment/attachment";
import { createCustomTransaction } from "../../hooks/dynamicHooks/createCustomTransaction";
import { FakeData } from "../../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { Phase } from "../../phases/Phase";
import { Label } from "../../projects/branding/BrandingSettings";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { InitializedState } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot, Snapshots } from "../../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import {
  SnapshotWithCriteria,
  TagsRecord,
} from "../../snapshots/SnapshotWithCriteria";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { Settings } from "../../state/stores/SettingsStore";
import { NotificationSettings } from "../../support/NotificationSettings";
import TodoImpl, { Todo, UserAssignee } from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { CommonData } from "../CommonData";
import { Content } from "../content/AddContent";
import { Task } from "../tasks/Task";
import { Member } from "../teams/TeamMembers";
import {
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriptionTypeEnum,
} from "./StatusType";
import FileData from "./FileData";
import { T } from "./dataStoreMethods";


// Define the interface for DataDetails
interface DataDetails extends CommonData<T> {
  _id?: string;
  title?: string;
  description?: string | null;

  details?: DetailsItem<T>;
  completed?: boolean | undefined;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  type?: AllTypes;
  tags?: TagsRecord | string[] | undefined; 
  isActive?: boolean;
  status?: AllStatus;
  uploadedAt?: Date | undefined; //
  phase?: Phase<T> | null;
  fakeData?: FakeData;
  comments?: (Comment | CustomComment)[] | undefined;
  todos?: Todo[];
  analysisData?: {
    snapshots?: SnapshotStore<BaseData, BaseData>[];
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

type TodoSubtasks = Todo[] & Task[];

export interface Comment {
  id?: string;
  text?: string | Content<Data>;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: number;
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
   tags?: TagsRecord | string[] | undefined; 
  highlights?: string[];
  // Consolidating commentBy and author into one field
  author?: string | number | readonly string[] | undefined;
  upvotes?: number;
  content?: string | Content<Data>;
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
  id?: string | number | undefined;
  title?: string;
  data?: any;
  size?: number;
  description?: string | null;
  startDate?: Date;
  label?: string | Label | null;
  endDate?: Date;
  scheduled?: boolean;
  status?: AllStatus | null;
  timestamp?: string | number | Date | undefined;
  isActive?: boolean;
  tags?: TagsRecord | string[] | undefined; // Update as needed based on your schema

  // | Tag[];
  phase?: Phase<BaseData> | null;
  phaseType?: ProjectPhaseTypeEnum;
  key?: string;

  value?: number | string | Snapshot<BaseData, BaseData> | null;
  initialState?: InitializedState<BaseData, BaseData>;
  dueDate?: Date | null;
  priority?: string | AllStatus | null;
  assignee?: UserAssignee | null;
  collaborators?: string[];
  comments?: (Comment | CustomComment)[] | undefined;
  attachments?: Attachment[];
  subtasks?: TodoImpl<any, any>[];
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  createdBy?: string | Date | undefined;
  updatedBy?: string;
  updatedDetails?: DetailsItem<T>;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  analysisType?: AnalysisTypeEnum | null;
  analysisResults?: DataAnalysisResult[] | string;

  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[]; // Or whatever type is appropriate
  videoData?: VideoData;
  additionalData?: any;
  ideas?: Idea[];
  members?: number[] | string[] | Member[];
  leader?: User | null;
  snapshotStores?: SnapshotStore<BaseData, BaseData>[];
  snapshots?: Snapshots<BaseData>;
  text?: string;
  category?: Category;

  notificationTypes?: NotificationSettings;
  categoryProperties?: CategoryProperties;
  [key: string]: any;
  // getData?: (id: number) => Promise<Snapshot<
  //   SnapshotWithCriteria<BaseData>,
  //   SnapshotWithCriteria<BaseData>>>;

  // // Implement the `then` function using the reusable function
  // then?: <T extends Data, K extends Data>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<Data, K> | undefined;
}

interface Data extends BaseData {
  category?: string | Category;
  categoryProperties?: CategoryProperties;
  subtasks?: TodoImpl<Todo, any>[];
  actions?: SnapshotStoreConfig<Data, Data>[]; // Use Data instead of BaseData
  snapshotWithCriteria?: SnapshotWithCriteria<Data, any>;
  value?: any;
  label?: any;
  [key: string]: any;
}

// Define the UserDetails component

const DataDetailsComponent: React.FC<DataDetailsProps<Data>> = ({ data }) => {
  
  const getTagNames = (tags: TagsRecord | string[]): string[] => {
    if (Array.isArray(tags)) {
      return tags; // If it's an array, return it directly
    }

    return Object.values(tags).map((tag) => tag.name); // If it's a TagsRecord
  };

  return (
    <CommonDetails
      data={{
        id: data.id ? data.id.toString() : "",
        title: "Data Details",
        description: "Data descriptions",
        details: data.details,
        completed: !!data.completed,
      }}
      details={{
        _id: data._id,
        id: data.id ? data.id.toString() : "",
        title: data.title,
        description: data.description,
        phase: data.phase,
        isActive: data.isActive,
        tags: data.tags ? getTagNames(data.tags) : [], // Now tags is a string array
        status: data.status,
        type: data.type,
        analysisType: data.analysisType,
        analysisResults: data.analysisResults,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      }}
    />
  );
};

const coreData: Data = {
  _id: "1",
  id: "data1",
  title: "Sample Data",
  description: "Sample description",
  timestamp: new Date(),
  category: "Sample category",
  startDate: new Date(),
  endDate: new Date(),
  scheduled: true,
  status: StatusType.Pending,
  isActive: true,
  tags: {
    tag1: {
      id: "tag1",
      name: "Tag 1",
      color: "#000000",
      description: "Tag 1 description",
      enabled: true,
      type: "Category",
      relatedTags: [], // This should match the type defined in Tag
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "creator1",
      timestamp: new Date().getTime(),
    },
  },
  phase: {
    id: "phase1",
    name: "Phase 1",
    description: "Phase 1 description",
    startDate: new Date(),
    endDate: new Date(),
    status: "Active",
    isActive: true,
    tags: {
      tag1: {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        relatedTags: [], // This should match the type defined in Tag
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
      },
    }, // This should match the type defined in Tag
    subPhases: [],
  },
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
    tags: {
      tag1: {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
      },
    },
    createdBy: "uploader1",
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
    roles: [],
    storeId: 0,
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
    followers: [],
    preferences: {
      id:"",
      name:"",
      phases: [],
      trackFileChanges: (file: FileData): FileData => {
        return {
          id: file.id,
          title: file.title,
          fileName: file.fileName,
          description: file.description,
          fileSize: file.fileSize,
          fileType: file.fileType,
          filePath: file.filePath,
          uploader: file.uploader,
          uploadDate: file.uploadDate,
          scheduledDate: file.scheduledDate,
          createdBy: file.createdBy,
        }
      },
      stroke: {
        width: 0,
        color: "black",
      },
      strokeWidth: 0,
      fillColor: "",
      flippedX: false,
      flippedY: false,
      x: 0,
      y: 0,
         // Update the method signature to match the expected type
      updateAppearance: (
        updates: { stroke: { width: number; color: string; } },
        newStroke: { width: number; color: string; },
        newFillColor: string
      ) => {
      // Implement your logic here
      // Example implementation (adjust as necessary):
      (this as typeof coreData.preferences).stroke = newStroke; 
      (this as typeof coreData.preferences).fillColor = newFillColor; 
      },
    },

    settings: {
      id: "0",
      userId: 123,
      userSettings: setTimeout(() => {}, 1000),
      communicationMode: "email",
      enableRealTimeUpdates: true,
      filter: (key: keyof Settings) => "defaultFilter",
      appName: "MyApp",

      defaultFileType: "pdf",
      allowedFileTypes: ["pdf", "docx", "xlsx"],
      enableGroupManagement: true,
      enableTeamManagement: false,
      idleTimeout: undefined,

      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {},
      idleTimeoutDuration: 300,
      activePhase: "development",
      realTimeChatEnabled: true,
      todoManagementEnabled: false,
      notificationEmailEnabled: true,
      analyticsEnabled: true,
      twoFactorAuthenticationEnabled: true,
      projectManagementEnabled: true,
      documentationSystemEnabled: false,
      versionControlEnabled: true,
      userProfilesEnabled: true,
      accessControlEnabled: true,
      taskManagementEnabled: true,
      loggingAndNotificationsEnabled: true,
      securityFeaturesEnabled: true,
      theme: "dark",
      language: LanguageEnum.English,
      fontSize: 14,
      darkMode: true,
      enableEmojis: true,
      enableGIFs: true,
      emailNotifications: true,
      pushNotifications: true,
      notificationSound: "ding",
      timeZone: "UTC",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24-hour",
      defaultProjectView: "list",
      taskSortOrder: "priority",
      showCompletedTasks: true,
      projectColorScheme: "blue",
      showTeamCalendar: false,
      teamViewSettings: [],
      defaultTeamDashboard: "overview",
      passwordExpirationDays: 90,
      privacySettings: [],
      thirdPartyApiKeys: { key1: "value1", key2: "value2" },
      externalCalendarSync: true,
      dataExportPreferences: [],
      dashboardWidgets: [],
      customTaskLabels: [],
      customProjectCategories: [],
      customTags: [],
      formHandlingEnabled: true,
      paginationEnabled: true,
      modalManagementEnabled: true,
      sortingEnabled: true,
      notificationSoundEnabled: true,
      localStorageEnabled: true,
      clipboardInteractionEnabled: true,
      deviceDetectionEnabled: true,
      loadingSpinnerEnabled: true,
      errorHandlingEnabled: true,
      toastNotificationsEnabled: true,
      datePickerEnabled: true,
      themeSwitchingEnabled: true,
      imageUploadingEnabled: true,
      passwordStrengthEnabled: true,
      browserHistoryEnabled: true,
      geolocationEnabled: true,
      webSocketsEnabled: true,
      dragAndDropEnabled: true,
      idleTimeoutEnabled: true,
      enableAudioChat: true,
      enableVideoChat: true,
      enableFileSharing: true,
      enableBlockchainCommunication: true,
      enableDecentralizedStorage: true,
      selectDatabaseVersion: "v1.0",
      selectAppVersion: "v1.0",
      enableDatabaseEncryption: true,
    },
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
    },

    notifications: {
      channels: {
        email: true,
        push: true,
        sms: true, 
        
        chat: true,
        calendar: true,  
        audioCall: false, 
        videoCall: false,
        screenShare: false,
      
      },
      types: [],
      enabled: true,
      notificationType: "push",
    },
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
      cryptoPreferences: {},
      emailNotifications: true,
      pushNotifications: true,
      enableNotifications: true,
      notificationSound: "birds",
      notificationVolume: 50,
      smsNotifications: true,
      desktopNotifications: true,
      notificationTypes: {
        mention: true,
        reaction: true,
        follow: true,
        poke: true,
        activity: true,
        thread: true,
        inviteAccepted: true,
        meeting: true,
        directMessage: true,
        audioCall: true,
        videoCall: true,
        screenShare: true,
        chat: true,
        calendar: true,
        task: true,
        file: true,

        announcement: true,
        reminder: true,
        project: true,
        inApp: true,
      },
      customNotificationSettings: "",
      mobile: {
        email: true,
        sms: false,
        pushNotifications: true,
        desktopNotifications: true,
        emailFrequency: "daily",
        smsFrequency: "daily",
      },
      desktop: {
        email: true,
        sms: false,
        pushNotifications: true,
        desktopNotifications: true,
        emailFrequency: "daily",
        smsFrequency: "daily",
      },
      tablet: {
        email: true,
        sms: false,
        pushNotifications: true,
        desktopNotifications: true,
        emailFrequency: "daily",
        smsFrequency: "daily",
      },
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
        return 0;
      },
      inferTypes(): number[] {
        const types: number[] = [];
        if (this.type !== null && this.type !== undefined) {
          types.push(this.type);
        }
        if (this.maxFeePerGas !== null && this.maxPriorityFeePerGas !== null) {
          types.push(2);
        }
        if (types.length === 0) {
          types.push(0);
        }
        return types;
      },

      isLegacy() {
        return this.type === 0 && this.gasPrice !== null;
      },
      isBerlin() {
        return (
          this.type === 1 && this.gasPrice !== null && this.accessList !== null
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
        const clonedData: CustomTransaction = {
          _id: this._id,
          id: this.id || "",
          amount: this.amount,
          date: this.date ? new Date(this.date.getTime()) : undefined,
          description: this.description || "",
          startDate: this.startDate ? new Date(this.startDate) : undefined,
          endDate: this.endDate ? new Date(this.endDate) : undefined,
          isSigned:
            typeof this.isSigned === "function"
              ? this.isSigned.bind(this)
              : this.isSigned,
          serialized: this.serialized || "",
          unsignedSerialized: this.unsignedSerialized || "",
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
            return (
              this.id === transaction.id &&
              this.amount === transaction.amount &&
              this.date?.getTime() === transaction.date?.getTime() &&
              this.title === transaction.title
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
          title: this.title ?? null,
          startDate: this.startDate,
          endDate: this.endDate,
          serialized: this.serialized,
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
          amount: 0,
          unsignedSerialized: this.unsignedSerialized,
          recentActivity: this.recentActivity ?? [
            { action: "", timestamp: new Date() },
            { action: "", timestamp: new Date() },
          ],
        };
        return customTransaction;
      },
    }),
  ],
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

  export { coreData };

