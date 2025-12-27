// Data.tsx
import { Label } from '@/app/branding/BrandingSettings';
import { ScheduledData } from "@/app/calendar/ScheduledData";
import { Collaborator } from "@/app/collaborators/Collaborator";
import { CommonDetails } from "@/app/components/models/details/CommonDetails";
import { HighlightColor } from "@/app/components/styling/Palette";
import { Team } from "@/app/components/teams/Team";
import {
  BaseDataEntity,
  BaseDataRoot,
  DefaultExcludedFields,
  DefaultMeta
} from '@/app/config/BaseConfig';
import {
  fetchUserAreaDimensions,
  UnifiedMetadata,
} from "@/app/config/MetaDataOptions";
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { ModuleType } from '@/app/config/UserPreferences';
import userSettings from "@/app/config/UserSettings";
import { Attachment } from '@/app/documents/attachment/Attachment';
import {
  SharedIdentifiers,
  SharedStatusFlags,
  SharedTimestamps,
} from "@/app/documents/RelatedProps";
import { NotificationSettings } from "@/app/features/support/NotificationSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { createCustomTransaction } from "@/app/hooks/dynamicHooks/createCustomTransaction";
import { FakeData } from "@/app/intelligence/FakeDataGenerator";
import { CollaborationOptions } from "@/app/interfaces/options/CollaborationOptions";
import { Category, CategoryPropertyBundle } from '@/app/libraries/categories/generateCategoryProperties';
import { Comment } from "@/app/models/comments/Comments";
import { CommonData } from "@/app/models/CommonData";
import { Content } from "@/app/models/content/AddContent";
import { Member } from "@/app/models/members/Member";
import { Phase } from "@/app/models/phases/Phase";
import { Task } from "@/app/models/tasks/Task";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { TrackerProps } from "@/app/models/tracker/Tracker";
import UserRoles from "@/app/models/UserRoles";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { DataAnalysisResult } from "@/app/projects/DataAnalysisPhase/DataAnalysisResult";
import { taskService } from "@/app/services/TaskService";
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import {
  Snapshots,
  SnapshotsArray,
} from "@/app/snapshots/LocalStorageSnapshotStore";
import type { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore, {
  SnapshotStoreReference,
} from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { CustomComment } from "@/app/state/redux/slices/BlogSlice";
import { Stroke } from "@/app/state/redux/slices/DrawingSlice";
import { ExtendedTodo } from "@/app/state/stores/AssignBaseStore";
import { ReassignEventResponse } from "@/app/state/stores/AssignEventStore";
import { AuthStore } from "@/app/state/stores/AuthStore";
import BrowserCheckStore from "@/app/state/stores/BrowserCheckStore";
import { InitializedState } from '@/app/state/stores/DataStore';
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import TodoImpl, { Todo, UserAssignee } from "@/app/todos/Todo";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { CustomTransaction } from "@/app/typings/cryptoTypes/SmartContractInteraction";
import { AppStructuredMetadata, AppUnifiedMetadata } from '@/app/typings/entities/AppMetadataEntity';
import { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta } from '@/app/typings/entities/DataEntity';
import { PhaseDefault } from '@/app/typings/phaseTypes';
import { AllTypes } from "@/app/typings/PropTypes";
import { VideoData } from "@/app/typings/videoTypes/Video";
import { Idea } from "@/app/users/Ideas";
import { User } from "@/app/users/User";
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { Version } from '@/app/versions/Version';
import { VersionData } from "@/app/versions/VersionData";
import { cleanEmptyStrings } from "@/utils/web3/cleanEmptyStrings";
import { AxiosResponse } from "axios";
import FileData from "./FileData";
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriptionTypeEnum,
} from "./StatusType";

interface SharedRelationshipData<K> {
  childIds?: K[] | undefined;
  relatedData?: K[] | undefined;
}

type CommonRelationship<
  T extends BaseDataEntity,
  K extends T = T,> = {
  sharedRelationships: SharedRelationshipData<K>;
};

interface SharedPhaseData {
  phase: Phase<any, any> | null;
  priority: PriorityTypeEnum;
}

type SharedConfigType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
  | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
  | null;

type DataWithOmittedFields<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> = Omit<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>;

// Define the interface for DataDetails
interface DataDetails<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  _id?: string;
  title?: string;
  description?: string;
  details?: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  completed?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  type?: AllTypes;
  tags?: string[] | TagsRecord<T>;
  isActive?: boolean;
  status?: AllStatus | null;
  uploadedAt?: Date;
  phase?: PhaseDefault | null;
  fakeData?: FakeData;
  comments?: number | (Comment<T, K, Meta> | CustomComment)[];
  todos?: Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  analysisData?: {
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    analysisResults?: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  };
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotArray?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  analysisType?: AnalysisTypeEnum | null;
  analysisResults?: string | DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  todo?: Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Define the props for the DataDetails component
interface DataDetailsProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

type TodoSubtasks<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Array<
  | Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
>;

type ChildRelationship<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> =
  | {
      type: "metadata";
      ids: Meta extends { childIds: (infer C)[] } ? C[] : never;
    }
  | { type: "direct"; ids: K[] };

interface BaseData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedTimestamps,
    SharedStatusFlags,
   SharedIdentifiers<T, K> {
  sharedData?: SharedRelationshipData<K>;
  children?:
    | ChildRelationship<T, K, Meta>
    | CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  size?: string | number;
  description?: string;
  startDate?: string | Date;
  endDate?: Date;
  isScheduled?: boolean;
  status?: AllStatus | null;
  timestamp?: string | number | Date | undefined;
  tags?: string[] | TagsRecord<T>;
  phase?: PhaseDefault | null;
  phaseType?: ProjectPhaseTypeEnum;
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dueDate?: Date | null;
  priority?: string | AllStatus | null;
  assignee?: UserAssignee | null;
  collaborators?: Collaborator<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  comments?: number | (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CustomComment)[] | undefined;
  attachments?: AttachmentType[];
  subtasks?: TodoImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  updatedDetails?: DetailsItem<T>;
  analysisType?: AnalysisTypeEnum | null;
  analysisResults?: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | string;
  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[];
  videoData?: VideoData<T, K>;
  additionalData?: any;
  ideas?: Idea[];
  members?: number[] | string[] | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  leader?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotStores?: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  text?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: symbol | string | Category | undefined;
  notificationTypes?: NotificationSettings;
  userConfig?: any; // Use UserConfigData<T, K, Meta>
  scheduled?: ScheduledData<T>;
  [key: string]: any;
}

interface Data<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  major?: number;
  minor?: number;
  patch?: number;
  category?: Category
  categoryProperties?: CategoryPropertyBundle<T, K>;
  subtasks?: TodoImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  actions?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshotWithCriteria?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  value?: string | number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  label?: Label | string | Record<string, string> | null;
  latestVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  toInitializedData?(): InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  [key: string]: any;
}

// Define the DataDetails component
const DataDetailsComponent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({ data }: DataDetailsProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {

  // Safe property access utilities
  const safeGetString = (obj: any, prop: string): string => {
    return obj && typeof obj[prop] === 'string' ? obj[prop] : "";
  };

  const safeGetBoolean = (obj: any, prop: string): boolean => {
    return obj && typeof obj[prop] === 'boolean' ? obj[prop] : false;
  };

  const safeGetDate = (obj: any, prop: string): Date | undefined => {
    return obj && obj[prop] ? new Date(obj[prop]) : undefined;
  };

  // Enhanced safe get functions with proper typing
  const safeGet = <ValueType,>(
    obj: any, 
    prop: string, 
    defaultValue?: ValueType
  ): ValueType | undefined => {
    return obj && obj[prop] !== undefined ? obj[prop] : defaultValue;
  };

  // Type-specific safe get functions
  const safeGetAnalysisResults = (
    obj: any
  ): DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined => {
    return safeGet(obj, 'analysisResults');
  };

  const safeGetCurrentMetadata = (
    obj: any
  ): UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
    return safeGet(obj, 'currentMetadata');
  };

  const safeGetLatestVersion = (
    obj: any
  ): Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "createdAt" | "createdBy"> | undefined => {
    return safeGet(obj, 'latestVersion');
  };

  // Enhanced type guard that checks for CommonData structure
  const isCommonData = (obj: any): obj is CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    return obj && 
           typeof obj === 'object' && 
           !(obj instanceof Map) &&
           !(obj instanceof SnapshotStore) &&
           ('id' in obj || 'title' in obj || 'description' in obj); // Basic structure check
  };

  // Get tag names with safe access
  const getTagNames = (
    tags?: string[] | TagsRecord<T>
  ): string[] => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags.filter((tag): tag is string => typeof tag === "string");
    }

    // Safe access for TagsRecord
    if (typeof tags === 'object' && tags !== null) {
      return Object.values(tags).reduce<string[]>((acc, tag) => {
        if (tag && typeof tag === 'object' && 'name' in tag && typeof tag.name === "string") {
          acc.push(tag.name);
        }
        return acc;
      }, []);
    }

    return [];
  };

  // Add null check and type guard
  if (!data || !isCommonData(data)) {
    return (
      <div className="data-details-empty">
        <p>No compatible data available or data is in unexpected format</p>
      </div>
    );
  }

  // Now TypeScript knows data has CommonData properties
  return (
    <CommonDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      data={{
        id: safeGetString(data, 'id'),
        title: safeGetString(data, 'title') || "Data Details",
        description: safeGetString(data, 'description') || "Data descriptions",
        analysisResults: safeGetAnalysisResults(data),
        completed: safeGetBoolean(data, 'completed'),
        label: safeGet(data, 'label', { text: "", color: "" }),
        currentMetadata: safeGetCurrentMetadata(data),
        date: safeGet(data, 'date'),
        createdBy: safeGetString(data, 'createdBy'),
        currentMeta: safeGet(data, 'currentMeta'),
        latestVersion: safeGetLatestVersion(data),
        status: safeGet(data, 'status') as StatusType | undefined,
      }}
      details={{
        _id: safeGetString(data, '_id'),
        id: safeGetString(data, 'id'),
        title: safeGetString(data, 'title'),
        createdBy: safeGetString(data, 'createdBy'),
        description: safeGetString(data, 'description'),
        phase: safeGet(data, 'phase'),
        date: safeGet(data, 'date'),
        isActive: safeGetBoolean(data, 'isActive'),
        tags: safeGet(data, 'tags') ? getTagNames(safeGet(data, 'tags')) : [],
        status: safeGet(data, 'status'),
        type: safeGet(data, 'type', "DefaultType"),
        analysisType: safeGet(data, 'analysisType'),
        analysisResults: safeGetAnalysisResults(data),
        updatedAt: safeGetDate(data, 'updatedAt') || new Date(),
        currentMetadata: safeGetCurrentMetadata(data),
        currentMeta: safeGet(data, 'currentMeta'),
        latestVersion: safeGetLatestVersion(data),
      }}
    />
  );
};

const area = fetchUserAreaDimensions().toString();
const currentMetadata: AppUnifiedMetadata = useMetadata('data-area');
const currentMeta: AppStructuredMetadata = useMeta(area)

type TaskType = Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>;
const coreData: Data<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> = {
  _id: "1",
  id: "data1",
  title: "Sample Data",
  description: "Sample description",
  timestamp: new Date(),
  category: "Sample category",
  startDate: new Date(),
  endDate: new Date(),
  isScheduled: true,
  scheduled: {
    scheduledDate: new Date(),
    createdBy: "user1",
    latestVersion: createLatestVersion<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>(),
  },
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
      nulltype: "",
    },
  },
  phase: {
    label: {
      text: "",
      color: "",
    },
    currentMetadata: currentMetadata,
    currenctMeta: currentMeta,
    date: "",
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
        nulltype: "",
      },
    }, // This should match the type defined in Tag
    subPhases: [],
    createdBy: "creator1",
    latestVersion: createLatestVersion<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>(),
  },
  phaseType: ProjectPhaseTypeEnum.Ideation,
  dueDate: new Date(),
  priority: "High",
  assignee: {
    id: "assignee1",
    username: "Assignee Name",
    firstName: "",
    lastName: "",
    email: "",
    tier: "",
  } as unknown as UserAssignee,

  collaborators: [],
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
    label: {
      text: "",
      color: "",
    },
    content: "",
    watchLater: false,
    isActive: true,
    date: new Date(),
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
    tags: [],
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
    video: {
      id: "video1",
      title: "Sample Video Title",
      description: "Sample video description",
      url: "https://example.com/sample-video-url",
      thumbnailUrl: "https://example.com/sample-thumbnail-url",
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: "Sample Category",
    },
    currentMetadata: currentMetadata,
    currentMeta: currentMeta,
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
    activityStatus: "Active",
    isAuthorized: false,

    preferences: {
      id: "",
      name: "",
      phases: [],
      trackFileChanges: <
          T extends BaseDataEntity,
          K extends T = T,
          Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
          AttachmentType extends Attachment = Attachment,
          ExcludedFields extends keyof T = never,
          IncludedFields extends keyof T = keyof T
      >(
          file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ): FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
        return {
          id: file.id,
          title: file.title,
          description: file.description,
          type: file.type,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          filePath: file.filePath,
          uploader: file.uploader,
          uploadDate: file.uploadDate,
          scheduledDate: file.scheduledDate,
          subtasks: file.subtasks,
          tags: file.tags,
          status: file.status,
          createdBy: file.createdBy,
          childIds: file.childIds,
          relatedData: file.relatedData,
          major: file.major,
          minor: file.minor,
          patch: file.patch,
          latestVersion: file.latestVersion,
          category: file.category,
          categoryProperties: file.categoryProperties,
        };
      },
      stroke: {
        width: 0,
        color: "black",
      },
      strokeWidth: 0,
      fillColor: "",
      isFlippedX: false,
      isFlippedY: false,
      x: 0,
      y: 0,
      // Update the method signature to match the expected type
      updateAppearance: (
        newStroke: { width: number; color: string },
        newFillColor: string,
        updates: {
          stroke?: Stroke;
          fillColor?: string;
          borderColor?: string;
          textColor?: string;
          highlightColor?: HighlightColor;
          backgroundColor?: string;
          fontSize?: string;
          fontFamily?: string;
        },
        newBorderColor?: string, // Optional new border color
        newHighlightColor?: string
      ) => {
        // Implement your logic here
        // Example implementation (adjust as necessary):
        (this as typeof coreData.preferences).stroke = newStroke;
        (this as typeof coreData.preferences).fillColor = newFillColor;
      },
      modules: {} as ModuleType,
      refreshUI: () => {},
    },

    settings: {
      ...userSettings,
      calendarEvents: [],
      todos: [],
      tasks: [],
      snapshotStores: [],

      currentPhase: {
        id: "",
        name: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        subPhases: [],
      },
      comment: "",
      browserCheckStore: {} as BrowserCheckStore,
      trackerStore: {
        trackers: {},
        addTracker: (newTracker: TrackerProps) => {},
        getTracker: (id: string): TrackerProps => {
          // Ensure you return a valid TrackerProps object
          const tracker = coreData.settings.trackerStore.trackers[id];
          if (!tracker) {
            throw new Error(`Tracker with id ${id} not found.`);
          }
          return tracker; // Return the tracker found
        },
        getTrackers: (
          filter?:
            | { id?: string | undefined; name?: string | undefined }
            | undefined
        ) => [],

        removeTracker: (trackerToRemove: TrackerProps) => {},
        dispatch: (action: any) => {},
      },

      todoStore: {
        dispatch: (action: any) => {},
        todos: {},
        todoList: [],
        toggleTodo: (id: string) => {},

        assignedTaskStore: "",
        updateTaskTitle: "",
        updateTaskDescription: "",
        updateTaskStatus: "",
      },
      taskManagerStore: {
        tasks: {},
        taskTitle: "",
        taskDescription: "",
        taskStatus: {},

        fetchTasksSuccess: (payload: { tasks: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[] }) => {},
        fetchTasksFailure: (payload: { error: string }) => {},
        fetchTasksRequest: () => {},
        completeAllTasksSuccess: (success: string) => {},

        completeAllTasks: (payload: { task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[] }) => {},
        completeAllTasksFailure: (payload: { error: string }) => {},
        NOTIFICATION_MESSAGE: "",
        NOTIFICATION_MESSAGES: {},

        setDynamicNotificationMessage: (message: string) => {},
        takeTaskSnapshot: (taskId: string) => {},
        markTaskAsComplete: (taskId: string) => {},
        updateTaskPositionSuccess: (payload: { task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> }) => {},

        batchFetchTaskSnapshotsRequest: (
          snapshotData: Record<string, Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]>
        ) => {},
        batchFetchTaskSnapshotsSuccess: (
          taskId: Record<string, Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]>
        ) => {},
        batchFetchUserSnapshotsRequest: (
          snapshotData: Record<string, User<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]>
        ) => {},

        assignedTaskStore: {
          snapshotStore: undefined,
          assignedUsers: {},
          assignedItems: {},
          assignedTodos: {},
          assignedTasks: {},
          assignedTeams: {},
          events: {},
          assignItem: {},
          assignUser: {},
          assignTeam: {},
          unassignUser: {},
          reassignUser: {},
          assignUsersToItems: {},
          unassignUsersFromItems: {},
          assignNote: {},
          reassignUsersToItems: {},
          assignTeamsToTodos: {},
          unassignTeamsFromTodos: {},
          assignNoteToTeam: {},
          assignFileToTeam: {},
          assignContactToTeam: {},
          assignEventToTeam: {},
          assignGoalToTeam: {},
          assignBookmarkToTeam: {},
          assignCalendarEventToTeam: {},
          assignBoardItemToTeam: {},
          assignBoardColumnToTeam: {},
          assignBoardListToTeam: {},
          assignBoardCardToTeam: {},
          assignBoardViewToTeam: {},
          assignBoardCommentToTeam: {},
          assignBoardActivityToTeam: {},
          assignBoardLabelToTeam: {},
          assignBoardMemberToTeam: {},
          assignBoardSettingToTeam: {},
          assignBoardPermissionToTeam: {},
          assignBoardNotificationToTeam: {},
          assignBoardIntegrationToTeam: {},
          assignBoardAutomationToTeam: {},
          assignBoardCustomFieldToTeam: {},

          assignTask: (task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => {
            // Logic to assign a task
          },
          assignUsersToTasks: (taskId: string, userIds: string[]) => {
            // Logic to assign users
          },
          unassignUsersFromTasks: (taskId: string, userIds: string[]) => {
            // Logic to unassign users
          },
          setDynamicNotificationMessage: (message: Message<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => {
            // Logic to set notification message
          },

          reassignUsersToTasks: function (
            taskIds: string[],
            oldUserId: string,
            newUserId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          assignUserToTodo: function (todoId: string, userId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignUserFromTodo: function (
            todoId: string,
            userId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          reassignUserInTodo: function (
            todoId: string,
            oldUserId: string,
            newUserId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          assignUsersToTodos: function (
            todoIds: string[],
            userId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          unassignUsersFromTodos: function (
            todoIds: string[],
            userId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          reassignUsersInTodos: function (
            todoIds: string[],
            oldUserId: string,
            newUserId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          assignUserSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          assignUserFailure: function (error: string): void {
            throw new Error("Function not implemented.");
          },

          assignMeetingToTeam: function (
            meetingId: string,
            teamId: string
          ): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },
          assignProjectToTeam: function (
            projectId: string,
            teamId: string
          ): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },
          connectResponsesToTodos: function (
            todoIds: string[],
            assignees: string[],
            todos: ExtendedTodo[],
            eventId: string,
            responses: ReassignEventResponse[]
          ): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamsInTodos: function (
            todoIds: string[],
            oldTeamId: string,
            newTeamId: string
          ): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },

          assignTaskToTeam: function (
            taskId: string,
            userId: string
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTodoToTeam: function (
            todoId: string,
            teamId: string
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTodosToUsersOrTeams: function (
            todoIds: string[],
            assignees: string[]
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTeamMemberToTeam: function (
            teamId: string,
            userId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamMemberFromItem: function (
            itemId: string,
            userId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          getAuthStore: function (): AuthStore {
            throw new Error("Function not implemented.");
          },
          assignTeamToTodo: function (todoId: string, teamId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamToTodo: function (todoId: string, teamId: string): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamToTodo: function (
            todoId: string,
            oldTeamId: string,
            newTeamId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          assignTeamToTodos: function (todoIds: Team[], teamId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamFromTodos: function (
            todoIds: string[],
            teamId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamToTodos: function (
            teamIds: string[],
            teamId: string,
            newTeamId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          unassignNoteFromTeam: function (
            noteId: string,
            teamId: string
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          setAssignedTaskStore: function (
            store: SnapshotStore<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>
          ): void {
            throw new Error("Function not implemented.");
          },
        },
        updateTaskTitle: (title: string, taskId: string) => {},
        updateTaskDescription: (description: string, taskId: string) => {},
        updateTaskStatus: (description: string, taskId: string) => {},

        updateTaskDueDate: (taskId: string, dueDate: Date) => {},
        updateTaskPriority: (taskId: string, priority: PriorityTypeEnum) => {},
        filterTasksByStatus: (status: AllStatus): Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[] => {
          // Implement logic to filter tasks by their status
          return coreData.tasks.filter(
            (task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => task.status === status
          );
        },

        getTaskCountByStatus: (status: AllStatus): number => {
          // Implement logic to count tasks by status
          return coreData.tasks.filter(
            (task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => task.status === status
          ).length;
        },

        clearAllTasks: () => {},
        archiveCompletedTasks: () => {},
        updateTaskAssignee:
          (taskId: string, 
            assignee: User<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) =>
          async (dispatch: any): Promise<void> => {
            // Implement logic to update the assignee of a task
            const taskIndex = coreData.tasks.findIndex(
              (task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => task._id === taskId
            );
            if (taskIndex !== -1) {
              coreData.tasks[taskIndex].assignee = assignee;
              // Dispatch an action to update the state (assuming Redux or similar)
              dispatch({
                type: "UPDATE_TASK_ASSIGNEE",
                payload: { taskId, assignee },
              });
            }
          },

        getTasksByAssignee: async (
          tasks: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[],
          assignee: User<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>
        ): Promise<Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]> => {
          // Implement logic to get tasks assigned to a specific user
          return tasks.filter((task) => task.assigneeId === assignee._id);
        },

        getTaskById: (taskId: string): Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> | null => {
          // Implement logic to find a task by its ID
          return (
            coreData.tasks.find((task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => task._id === taskId) ||
            null
          );
        },

        sortByDueDate: () => {},
        exportTasksToCSV: () => {},
        dispatch: (action: any) => {},
        addTaskSuccess: (payload: { task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> }) => {},
        addTask: (task: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>) => {},
        addTasks: (tasks: Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]) => {},
        assignTaskToUser: (taskId: string, userId: string) => {},

        removeTask: (taskId: string) => {},
        removeTasks: (taskIds: string[]) => {},
        fetchTasksByTaskId: async (
          taskId: string
        ): Promise<Task<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields> | null> => {
          try {
            const response = await taskService.getTaskById(taskId);
            if (response?.data) {
              return response.data as TaskType; // Cast to the expected type
            }
            throw new Error("No task data found");
          } catch (error) {
            console.error("Failed to fetch task", error);
            throw new Error("Failed to fetch task");
          }
        },
      },
      // fetchTasksSuccess: (payload: { tasks: Task[]; }) => { },
      // fetchTasksFailure: (payload: { error: string; }) => {},
      // fetchTasksRequest: () => {},
      // completeAllTasksSuccess: (success: string) => {},
      // completeAllTasks: (payload: { task: Task[]; }) =>  {},
      // completeAllTasksFailure: (payload: { error: string; }) => {},
      // NOTIFICATION_MESSAGE: "",
      // NOTIFICATION_MESSAGES: {},
      // setDynamicNotificationMessage: (message: string) => {},
      // takeTaskSnapshot: (taskId: string) => {},
      // markTaskAsComplete: (taskId: string) => {},
      // updateTaskPositionSuccess: (payload: { task: Task; }) => {},
      // batchFetchTaskSnapshotsRequest: (snapshotData: Record<string, Task[]>) => {},
    },

    // iconStore: {
    //   dispatch: "",
    // },
    // calendarStore: {
    //   openScheduleEventModal: "",
    //   openCalendarSettingsPage: "",
    //   getData: async (): Promise<SnapshotStore<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]> => {
    //     // Implement logic to get the data
    //     try {
    //       // Fetch or generate data for SnapshotStore instances
    //       const snapshotStores = await snapshotApi.getSnapshotStores();
    //       // someDataFetchingFunction();
    //       return snapshotStores;
    //     } catch (error) {
    //       console.error("Failed to get data", error);
    //       return [];
    //     }
    //   },
    //   // updateDocumentReleaseStatus: "",
    //   // getState: "",
    //   // action: "",
    //   // events: "",
    //   // eventTitle: "",
    //   // eventDescription: "",
    //   // eventStatus: "",
    //   // assignedEventStore: "",
    //   // snapshotStore: "",
    // },
    // enableGroupManagement: true,
    // enableTeamManagement: false,
    // idleTimeout: undefined,

    bannerUrl: "",
    interests: [],
    privacySettings: {
      isDataSharingEnabled: true,
      dataSharing: {
        sharingLevel: "", // 'public', 'private', etc.
        sharingScope: "", // 'team', 'organization', 'all', etc.
        sharingFrequency: "", // e.g., 'daily', 'weekly'
        sharingDuration: "", // e.g., '30 days'
        sharingPermissions: [], // e.g., 'read', 'write', 'delete'
        sharingAccess: "", // e.g., 'public', 'private'
        sharingLocation: "", // e.g., 'global', 'local'
        sharingTags: [], // Optional: tags for categorization
        sharingGroups: [], // Optional: specify groups involved
        sharingUsers: [], // Optional: specify individual users
        allowSharing: false,
        allowSharingWith: [], // Users, groups, or teams allowed to share with
        allowSharingWithTeams: [], // Teams allowed for sharing
        allowSharingWithGroups: [], // Groups allowed for sharing
        allowSharingWithPublic: false, // Allows sharing with the public
        allowSharingWithTeamsAndGroups: false, // Allows sharing with both teams and groups
        isAllowingSharingWithPublic: [],
        isAllowingingSharingWithTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeamsAndGroups: [],
        isAllowingingSharingWithPublicAndTeams: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [],
        isAllowingSharingWithTeamsAndGroups: [],
        isAllowingSharingingWithPublicAndTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeams: [],
        enableDatabaseEncryption: false,
        sharingOptions: [], // Define additional sharing options if needed
        sharingPreferences: {
          email: false,
          push: false,
          sms: false,
          chat: false,
          calendar: false,
          audioCall: false,
          videoCall: false,
          fileSharing: false,
          blockchainCommunication: false,
          decentralizedStorage: false,
          databaseEncryption: false,
          databaseVersion: "",
          appVersion: "",
          enableDatabaseEncryption: false,
        }, // Add the corresponding sharing preferences
        allowSharingWithPublicAndTeams: false,
        allowSharingWithPublicAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublic: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups:
          false,
      },
      thirdPartyTracking: true,
    },
    notifications: {
      channels: {
        email: false,
        push: false,
        sms: false,
        chat: false,
        calendar: false,
        audioCall: false,
        videoCall: false,
        screenShare: false,
        inApp: false
      },
      types: {
        mention: false,
        reaction: false,
        follow: false,
        poke: false,
        activity: false,
        thread: false,
        inviteAccepted: false,
        task: false,
        file: false,
        meeting: false,
        directMessage: false,
        announcement: false,
        reminder: false,
        project: false,
        inApp: false,
        // Add additional properties if they are not included in the NotificationTypes interface
        comment: false,
        like: false,
        dislike: false,
        bookmark: false,
      },
      enabled: true,
      notificationType: "all",
    },
    activityLog: [],
    socialLinks: {},
    relationshipStatus: "",

    hobbies: ["Reading", "Traveling"],
    skills: ["Project Management", "Software Development"],
    achievements: ["Completed 100 projects", "Employee of the Month"],
    profileVisibility: "Public",
        profileAccessControl: {
      // Privacy Levels
      isPrivate: false,
      isPrivateOnly: false,
      isPrivateOnlyForContacts: false,
      isPrivateOnlyForGroups: false,
      friendsOnly: true,
      
      // Messaging Controls
      allowMessagesFromNonContacts: true,
      allowMessagesFromFriendContacts: true,
      canSendMessages: true,
      
      // Visibility Controls
      canViewProfile: true,
      canSeeFriends: true,
      canSeeActivity: true,
      canSeeOnlineStatus: true,
      canSeeLastSeen: true,
      canSeeProfilePicture: true,
      canSeePosts: true,
      canSeeContactInfo: true,
      canSeeMutualFriends: true,
      
      // Interaction Controls
      allowTagging: true,
      canCommentOnPosts: true,
      canAddToGroups: true,
      canShareProfile: true,
      
      // Security & Blocking
      blockList: [],
      isAuthorized: true,
      shareProfileWithSearchEngines: false,
      
      // Status (you'll need to define ActivityStatus or use a default)
      activityStatus: "active" // or whatever default ActivityStatus value you have
    },
    currentMetadata: {
      area: "coreData",
      currentMeta: currentMeta,
      metadataEntries: {},
      latestVersion: createLatestVersion<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>(),
    },
    currentMeta: currentMeta,
    // startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {},
    // idleTimeoutDuration: 300,
    // activePhase: "development",
    // realTimeChatEnabled: true,
    // todoManagementEnabled: false,
    // notificationEmailEnabled: true,
    // analyticsEnabled: true,
    // twoFactorAuthenticationEnabled: true,
    // projectManagementEnabled: true,
    // documentationSystemEnabled: false,
    // versionControlEnabled: true,
    // userProfilesEnabled: true,
    // accessControlEnabled: true,
    // taskManagementEnabled: true,
    // loggingAndNotificationsEnabled: true,
    // securityFeaturesEnabled: true,
    // theme: ThemeEnum.DARK,
    // language: LanguageEnum.English,
    // fontSize: 14,
    // darkMode: true,
    // enableEmojis: true,
    // enableGIFs: true,
    // emailNotifications: true,
    // pushNotifications: true,
    // notificationSound: "ding",
    // timeZone: "UTC",
    // dateFormat: "YYYY-MM-DD",
    // timeFormat: "24-hour",
    // defaultProjectView: "list",
    // taskSortOrder: "priority",
    // showCompletedTasks: true,
    // projectColorScheme: "blue",
    // showTeamCalendar: false,
    // teamViewSettings: [],
    // defaultTeamDashboard: "overview",
    // passwordExpirationDays: 90,
    // thirdPartyApiKeys: { key1: "value1", key2: "value2" },
    // externalCalendarSync: true,
    // dataExportPreferences: [],
    // dashboardWidgets: [],
    // customTaskLabels: [],
    // customProjectCategories: [],
    // customTags: [],
    // formHandlingEnabled: true,
    // paginationEnabled: true,
    // modalManagementEnabled: true,
    // sortingEnabled: true,
    // notificationSoundEnabled: true,
    // localStorageEnabled: true,
    // clipboardInteractionEnabled: true,
    // deviceDetectionEnabled: true,
    // loadingSpinnerEnabled: true,
    // errorHandlingEnabled: true,
    // toastNotificationsEnabled: true,
    // datePickerEnabled: true,
    // themeSwitchingEnabled: true,
    // imageUploadingEnabled: true,
    // passwordStrengthEnabled: true,
    // browserHistoryEnabled: true,
    // geolocationEnabled: true,
    // webSocketsEnabled: true,
    // dragAndDropEnabled: true,
    // idleTimeoutEnabled: true,
    // enableAudioChat: true,
    // enableVideoChat: true,
    // enableFileSharing: true,
    // enableBlockchainCommunication: true,
    // enableDecentralizedStorage: true,
    // selectDatabaseVersion: "v1.0",
    // selectAppVersion: "v1.0",
    // enableDatabaseEncryption: true,
  },
  interests: [],
  privacySettings: {
    isDataSharingEnabled: true,
    dataSharing: {
      sharingLevel: "public",
      sharingScope: "all",
      sharingFrequency: "daily",
      sharingDuration: "30 days",
      sharingPermissions: ["read", "write", "delete"],
      sharingAccess: "public",
      sharingLocation: "global",
      sharingTags: ["tag1", "tag2"],
      sharingGroups: ["group1", "group2"],
      sharingUsers: ["user1", "user2"],
      sharingPreferences: {
        email: true,
        push: true,
        sms: true,
        chat: true,
        calendar: true,
        audioCall: false,
        videoCall: false,
        fileSharing: true,
        blockchainCommunication: false,
        decentralizedStorage: false,
        databaseEncryption: true,
        databaseVersion: "v1.0",
        appVersion: "v1.0",
        enableDatabaseEncryption: true,
      },

      allowSharing: true,
      allowSharingWith: ["user1", "user2"],
      allowSharingWithTeams: ["team1", "team2"],
      allowSharingWithGroups: ["group1", "group2"],

      allowSharingWithPublic: true,
      isAllowingSharingWithTeamsAndGroups: ["team1", "team2"],
      allowSharingWithTeamsAndGroups: true,
      enableDatabaseEncryption: true,
      isAllowingSharingWithPublicAndTeams: ["team1", "team2"],
      allowSharingWithPublicAndTeams: true,

      allowSharingWithPublicAndGroups: true,
      isAllowingSharingingWithPublicAndTeamsAndGroups: ["team1", "team2"],
      allowSharingWithPublicAndTeamsAndGroups: true,
      allowSharingWithPublicAndTeamsAndGroupsAndPublic: true,
      isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [""],
      isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups:
        [],
      allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: true,
      isAllowingSharingWithPublic: [],
      isAllowingingSharingWithTeamsAndGroups: [],
      isAllowingSharingWithPublicAndTeamsAndGroups: [],
      isAllowingingSharingWithPublicAndTeams: [],
    },
    thirdPartyTracking: false,
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
    types: {},
    enabled: true,
    notificationType: "push",
  },
  activityLog: [
    {
      action: "Logged in",
      timestamp: "2023-05-10T12:00:00Z",
      id: "",
      activity: "",
    },
    {
      action: "Updated profile",
      timestamp: "2023-05-10T12:00:00Z",
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
  emailVerificationStatus: true,
  phoneVerificationStatus: true,
  walletAddress: "0x123456789abcdef",

  transactionHistory: [
    createCustomTransaction({
      id: "tx1",
      amount: 100,
      date: new Date(),
      description: "Sample transaction",
      type: "buy", // ← Business category (string)
      transactionType: 3, // ← Ethereum transaction type (number) - ADD THIS
      typeName: "cancun",
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
        return !!(
          this.transactionType &&
          this.typeName &&
          this.from &&
          this.signature
        );
      },
      serialized: "",
      unsignedSerialized: "",
      inferType(): number {
        return this.transactionType ?? 0;
      },

      inferTypes(): number[] {
        return [this.transactionType ?? 0];
      },

      isLegacy() {
        return this.transactionType === 0 && this.gasPrice !== null;
      },
      isBerlin() {
        return (
          this.transactionType === 1 &&
          this.gasPrice !== null &&
          this.accessList !== null
        );
      },
      isLondon() {
        return (
          this.transactionType === 2 &&
          this.accessList !== null &&
          this.maxFeePerGas !== null &&
          this.maxPriorityFeePerGas !== null
        );
      },
      isCancun() {
        return (
          this.transactionType === 3 &&
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
          transactionType: 0,
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
          currency: "",
          timestamp: new Date(),
          status: "pending",
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
        let myBigInt: bigint = this.value as bigint;
        const customTransaction: CustomTransaction = {
          id: this.id ?? null,
          type: this.type ?? null,
          transactionType: this.transactionType ?? 0,
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
          value: myBigInt,
          currency: this.currency ?? "USD", // Default currency
          timestamp: this.timestamp ?? new Date(), // Default to now
          status: this.status ?? "completed", // Default status
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
  getData: function (): Promise<
    SnapshotStore<DataEntity, DataK, DataMeta, DataAttachment, DataExcludedFields, DataIncludedFields>[]
  > {
    return Promise.resolve([]);
  },
  metadata: {
    version: "",
    permissions: [],
    childIds: [],
    relatedData: [],
  },

  configuration: {
    timeout: 0,
    retryAttempts: 0,
    apiEndpoint: "",
    apiKey: undefined,
  },
};

export type {
  BaseData,
  ChildRelationship,
  CommonRelationship,
  Data,
  DataDetails,
  DataDetailsComponent,
  DataDetailsProps, DataWithOmittedFields,
  SharedRelationshipData,
  TodoSubtasks
};

// Clean the coreData to replace empty strings with null
const cleanedCoreData = cleanEmptyStrings(coreData);

export { cleanedCoreData, coreData };
export type { SharedConfigType, SharedPhaseData };

