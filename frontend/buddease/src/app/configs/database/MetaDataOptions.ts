import { dynamicMeetingMetadata, MeetingMetadata } from '@/app/components/calendar/ScheduledData';
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { SharedRelationshipData } from '@/app/components/models/data/Data';
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { FileMetadata } from '@/app/components/models/file/FileManager';
import { Task } from '@/app/components/models/tasks/Task';
import { TransactionData } from '@/app/components/payment/Transaction';
import { PhaseMeta } from '@/app/components/phases/Phase';
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { data, TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import TodoImpl from '@/app/components/todos/Todo';
import { createLastUpdatedWithVersion, createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { default as Version, versionData, default as VersionImpl } from '@/app/components/versions/Version';
import { VersionData, VersionHistory } from "@/app/components/versions/VersionData";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import { CoreMetadata, SharedMetadata } from '@/app/configs/metadata/createMetadataState';
import { MetadataEntriesType, MetadataEntry, projectMetadata, ProjectMetadata, StructuredMetadata, VideoMetadata } from '@/app/configs/StructuredMetadata';
import { useMeta } from '@/app/configs/useMeta';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { SchemaField } from '@/server/database/SchemaField';
import { baseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '../BaseConfig';
import { PriorityTypeEnum } from './../../components/models/data/StatusType';
import { AllStatus } from './../../components/state/stores/DetailsListStore';
import { User } from './../../components/users/User';
import { version } from './../../components/versions/Version';
import { Snapshot, initialState } from '@/app/components/snapshots';
import { category } from '@/app/components/utils/snapshotUtils';
import { AppStructurePermissions } from '../appStructure/AppStructure';

export type BaseAudit<T = any, K = any> = AuditEntry<T, K, StructuredMetadata<T, K>>;

export interface AuditEntry<
  T extends BaseDataEntity,
  K extends T = T,
 Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
> {
  id: string;

  // Core information about the change
  action: 'create' | 'update' | 'delete' | 'assign' | 'comment' | 'complete' | string;
  entityType: string; // e.g., "Task", "User", "Snapshot"
  entityId: string;
  entityKey?: keyof T;
  changes?: Partial<Record<keyof T, { from: any; to: any }>>;

  // Metadata and contextual info
  metadata?: Meta;
  version?: Version<T, K>;
  category?: Category;

  // Who and when
  performedBy: User | { id: string; name?: string }; // partial user or full User
  timestamp: Date;
  ipAddress?: string;
  location?: string;

  // Optional linkage to the snapshot or task
  snapshotId?: string;
  taskId?: string;
  previousVersionId?: string;

  // Custom payload or notes
  notes?: string;
  context?: Record<string, any>;
}


interface AppMetadata<
  T extends  BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
> extends SharedTimestamps,
  SharedStatusFlags,
  SharedMetadata<T, K> {
  version?: string | number | Version<T, K> | null;
  lastModifiedBy?: string;
  auditLog?: AuditEntry<T, K, Meta>[];
  tags?: string[];
  isSyncedWithBlockchain?: boolean;
  associatedPhase?: string;
}

// Version-related properties
interface VersionMetadata<T extends BaseDataEntity, K extends T> {
  version?: string | number | Version<T, K> | null;
  versionData?: string | VersionData<T, K> | null;
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;
  lastUpdated?: Date | VersionHistory<T, K>;
}

// Status/access control properties
interface StatusMetadata {
  isActive: boolean;
  permissions?: AppStructurePermissions[];
  maxAge?: string | number;
}

// Descriptive properties
interface DescriptiveMetadata {
  title?: string;
  description?: string | undefined;
  category?: Category;
  tags?: string[] | TagsRecord<any, any> | undefined; // Adjusted for flexibility
}

// Author/ownership properties
interface AuthorMetadata {
  author?: string;
  createdBy?: string | undefined;
  updatedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  source?: string;
}

// Config/customization properties
interface ConfigMetadata {
  customFields?: Record<string, any>;
  config?: Record<string, any>;
  baseUrl?: string;
}

// Structural properties
interface StructuralMetadata<T extends BaseDataEntity, K extends T> {
  metadataEntries: MetadataEntriesType<T, K>;
  keywords: string[];
  childIds?: K[];
  relatedData?: K[];
}

// Current state properties
interface CurrentStateMetadata<T extends BaseDataEntity, K extends T> {
  currentMetadata?: UnifiedMetadata<T, K>;
  currentMeta?: StructuredMetadata<T, K> | undefined;
}


interface BaseMetadata<K extends T> extends
  SharedMetadata<T, K>,
  DescriptiveMetadata,
  AuthorMetadata {
}

interface BaseMetaDataOptions<T extends BaseDataEntity, K extends T> extends
  CoreMetadata<T, K>,
  VersionMetadata<T, K>,
  StatusMetadata,
  ConfigMetadata,
  StructuralMetadata<T, K> {
}

// Project-specific metadata
interface ProjectMetaDataOptions<T extends BaseDataEntity, K extends T> extends
  Omit<BaseMetaDataOptions<T, K>, 'versionData'> {
  simulatedDataSource?: Record<string, any>;
  versionData: string | VersionData<T, K> | null;
}

// Snapshot-specific metadata
interface SnapshotMetaDataOptions<T extends BaseDataEntity, K extends T> extends
  Omit<BaseMetaDataOptions<T, K>, 'tags' | 'version' | 'customFields'> {
  structuredMetadata: StructuredMetadata<T, K>;
  simulatedDataSource?: Record<string, any>;
  tags?: TagsRecord<T, K> | string[];
  version: VersionImpl<T, K>;
}

// Define the task metadata options interface
interface TaskMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T
> extends BaseMetaDataOptions<T, K> {
  priority: PriorityTypeEnum | undefined; // Specific to tasks
  assignedTo: User | User[] | null;
  status?: AllStatus; // Status specific to tasks
  // Additional task-specific metadata fields can be added here
}

// Task metadata extending base metadata
// Extend the task metadata to include other relevant interfaces if needed
interface TaskMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Sub = Task<T, K> | TodoImpl<any, any, any>
> extends TaskMetaDataOptions<T, K>, SharedMetadata<T, K> {
  taskId: string,
  taskName: string,
  _id?: string
  // You can add more specific fields or methods here if required
  analysisType?: AnalysisTypeEnum; // Example of adding a task-specific field
  subtasks?: Task<T, K>[] | null;       // Subtasks associated with the task
  assignee?: User | null;               // Current assigned user
  scheduleType?: "one-time" | "recurring"; // New field to indicate if the task is recurring or one-time
  scheduledDate?: Date | undefined;     // Explicit scheduled date
}

interface MediaMetadata extends BaseMetaDataOptions<T, K> {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[]; // Assuming MediaImage is defined elsewhere
}

interface CustomMediaSession {
  sessionId: string;
  status: string;
}

interface AdditionalMetaDataOptions {
  enableSnapshot?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  eventRecords?: any[];
}

type UnifiedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = UnifiedMetaDataOptions<T, K, Meta, ExcludedFields> & {
  fileMetadata?: FileMetadata; // Optional file-specific metadata
  customMetadata?: Record<string, any>; // Optional custom metadata
  schema?: Record<string, SchemaField>;
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;
  author?: string;
  timestamp?: string | number | Date;
  revisionNotes?: string;
  transformed?: boolean
};

// Unified metadata interface with two required type arguments T and K
interface UnifiedMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends
  BaseMetadata<K>,
  SharedMetadata<T, K, ExcludedFields>,
  SharedRelationshipData<K>
{
  timestamp?: string | number | Date | undefined;
  revisionNotes?: string;
  area: string | undefined; // Area of the app (e.g., 'dashboard', 'profile')
  projectId?: number;
  initialState?: InitializedState<T, K>
  overrides?: Partial<Omit<Meta, ExcludedFields>>; // Overrides excluding specific keys
  relatedKeys?: Array<keyof K>; // Optional keys from T related to this metadata
  metadataEntries: Meta['metadataEntries']; // Include Meta properties directly
  videoMetadata?: VideoMetadata<T, K>;
  mediaMetadata?: MediaMetadata;
  projectMetadata?: ProjectMetadata<T, K>;
  taskMetadata?: TaskMetadata<T, K>;
  meetingMetadata?: MeetingMetadata;
  customMediaSession?: CustomMediaSession;
  phaseMetadata?: PhaseMeta<T, K>;
  structuredMetadata?: StructuredMetadata<T, K>;
  mappedSnapshot?: Map<string, Snapshot<T, K, StructuredMetadata<T, K>, ExcludedFields>>;
}


function transformProjectToUnifiedMetadata<
  T extends BaseDataEntity,
  K extends T = T
>(projectMetadata: ProjectMetadata<T, K>): UnifiedMetadata<T, K> {
  const { versionNumber, appVersion } = getCurrentAppInfo();

  // Get version data from project metadata
  const versionData = projectMetadata.versionData;

  // Enhanced type guard
  const isVersionData = (data: unknown): data is VersionData<T, K> => {
    if (!data || typeof data !== 'object') return false;
    const requiredProps = [
      'id', 'versionNumber', 'createdAt', 'notes',
      'timestamp', 'user', 'changes'
    ];
    return requiredProps.every(prop => prop in (data as Record<string, unknown>));
  };

  // Process version data with proper typing
  const processedVersionData: VersionData<T, K> | null = (() => {
    if (!versionData) return null;

    // Already valid VersionData
    if (isVersionData(versionData)) {
      return versionData;
    }

    // Handle string case
    if (typeof versionData === 'string') {
      return new VersionImpl({
        id: UniqueIDGenerator.generateVersionID(versionNumber), // Use the new generator
        versionNumber: versionNumber,
        parentVersion: versionData,
        // Required numeric fields
        major: 1,
        minor: 0,
        patch: 0,
        // Required string fields
        structureData: '',
        appVersion: appVersion,
        description: 'Auto-generated version',
        content: '',
        name: 'Version ' + versionNumber,
        url: '',
        checksum: UniqueIDGenerator.generateSnapshotID(), // Reuse existing generator
        userId: UniqueIDGenerator.generateUserID('system').next().value,
        documentId: UniqueIDGenerator.generateSnapshotID(),
        // Version history structures
        versions: {
          backend: createEmptyBackendStructure(),
          frontend: createEmptyFrontendStructure(),
          history: []
        },
        versionHistory: {
          versionData: {},
          latestVersion: createLatestVersion<T, K>(),
          history: [],
          timestamp: Date.now()
        },
        // Other required fields
        createdAt: new Date(),
        notes: [],
        timestamp: new Date(),
        user: 'system',
        changes: [],
        parentId: null,
        parentType: null,
        parentTitle: '',
        parentContent: '',
        parentName: '',
        parentUrl: '',
        parentChecksum: UniqueIDGenerator.generateSnapshotID(),
        parentMetadata: {},
        parentAppVersion: appVersion,
        parentVersionNumber: versionNumber,
      });
    }

    // Handle object case
    if (typeof versionData === 'object' && versionData !== null) {
      const versionObj = versionData as Record<string, unknown>;
      return new VersionImpl({
        versionNumber: (versionObj.versionNumber as string) || versionNumber,
        ...(versionObj as Partial<VersionData<T, K>>),
        createdAt: new Date(),
        notes: (versionObj.notes as string[]) || [],
        // Ensure all required fields are set
        id: (versionObj.id as string) || UniqueIDGenerator.generateSnapshotID(),
        timestamp: new Date(),
        user: (versionObj.user as string) || 'system',
        changes: (versionObj.changes as ChangeLogEntry<T, K>[]) || []
      });
    }

    return null;
  })();


  // Generate a project ID if it is undefined
  if (!projectMetadata.projectId) {
    projectMetadata.projectId = UniqueIDGenerator.generateProjectID("defaultProjectName");
  }

  // Create metadata entries based on project metadata
  const metadataEntries: Record<string, MetadataEntry> = {};

  // Assuming `projectMetadata` has the necessary properties to fill in the metadata entries
  // Example: Adding a single entry for demonstration purposes
  const entryId = projectMetadata.projectId.toString(); // or any unique identifier
  metadataEntries[entryId] = {
    originalPath: `/projects/${projectMetadata.projectId}`, // Replace with actual logic to derive paths
    alternatePaths: [`/projects/alt/${projectMetadata.projectId}`],
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown", // Assuming teamMembers are authors
    timestamp: new Date(), // Or use an appropriate date from projectMetadata
    fileType: "project", // Example file type, adjust as necessary
    title: projectMetadata.description || "Untitled Project", // Replace with the appropriate title
    description: projectMetadata.description || "",
    keywords: projectMetadata.tasks.map(task => task.taskName), // Assuming tasks contain titles as keywords
    authors: projectMetadata.teamMembers, // Assuming teamMembers are the authors
    contributors: [], // Populate this based on your logic or additional data
    publisher: "Your Organization", // Adjust as necessary
    copyright: "© Your Organization", // Adjust as necessary
    license: "MIT", // Example license, adjust based on your needs
    links: [], // Populate with relevant links if available
    tags: [], // Populate tags as needed
  };


  const structuredMetadata: StructuredMetadata<T, K> = {
    ...baseConfig,
    description: projectMetadata.description || "A project to manage structured metadata.",
    versionData: processedVersionData,
    latestVersion: createLatestVersion({
      id: "1",
      name: "Initial Release",
      versionNumber: "1.0.0",
      userId: "user123",
      content: "Initial version of the content.",
      metadata: {
        author: "Author Name",
        timestamp: new Date(),
      },
      releaseDate: "2024-11-24",
      major: 1,
      minor: 0,
      patch: 0,
      isPublished: true,
      publishedAt: new Date(),
      source: "Generated",
      status: "Active",
      comments: [{ id: "1", text: "First comment", timestamp: new Date() }], // Assuming a Comment type
      workspaceName: "Main Workspace",
    }),
    metadataEntries: {
      "entry1": {
        originalPath: "/documents/report.docx",
        alternatePaths: ["/backup/report_backup.docx", "/shared/report_shared.docx"],
        author: "John Doe",
        timestamp: new Date("2024-11-24T10:00:00Z"), // Replace with a valid date
        fileType: "docx",
        title: "Quarterly Report",
        description: "A detailed report covering the quarterly performance of the organization.",
        keywords: ["quarterly", "report", "performance", "organization"],
        authors: ["John Doe", "Jane Smith"],
        contributors: {},
        publisher: "ABC Publishing",
        copyright: "© 2024 ABC Corporation",
        license: "Creative Commons Attribution 4.0 International",
        links: ["https://example.com/report"],
        tags: ["finance", "quarterly", "reporting"],
      },
    },
    version: {
      major: 1, minor: 0, patch: 0,
      id: 0,
      isActive: false,
      releaseDate: "",
      name: '',
      url: '',
      versionNumber: '',
      documentId: '',
      draft: false,
      userId: '',
      content: '',
      description: '',
      buildNumber: '',
      versions: null,
      appVersion: '',
      checksum: '',
      parentId: null,
      parentType: '',
      parentVersion: '',
      parentTitle: '',
      parentContent: '',
      parentName: '',
      parentUrl: '',
      parentChecksum: '',
      parentAppVersion: '',
      parentVersionNumber: '',
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      source: '',
      status: '',
      workspaceId: '',
      workspaceName: '',
      workspaceType: '',
      workspaceUrl: '',
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      data: data as InitializedData<T, K>,
      _structure: {},
      versionHistory: {
        versionData: {},
        latestVersion: createLatestVersion<T, K>(),
        history: [],
        timestamp: new Date()
      },
      getVersionNumber: () => "",
      updateStructureHash: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
      setStructureData: function (newData: string): void {
        throw new Error('Function not implemented.');
      },
      hash: function (value: string): string {
        throw new Error('Function not implemented.');
      },
      currentHash: '',
      structureData: '',
      calculateHash: function (): string {
        throw new Error('Function not implemented.');
      }
    }, // Example version
    lastUpdated: {
      versionData: [{ major: 1, minor: 0, patch: 1 }],
      timestamp: new Date("2024-11-24T12:00:00Z"),
      lastUpdated: new Date("2024-11-24T12:00:00Z"),
      history: [],
      latestVersion: {
        id: "0",
        parentId: null,
        parentType: null,
        parentVersion: '',
        parentTitle: '',
        parentContent: '',
        parentName: '',
        parentUrl: '',
        parentChecksum: '',
        parentAppVersion: '',
        parentVersionNumber: '',
        createdBy: "",
        lastUpdated: createLastUpdatedWithVersion(),
        isLatest: false,
        isActive: false,
        isPublished: false,
        publishedAt: null,
        source: '',
        status: '',
        version: (version instanceof VersionImpl<T, K>) ? version : new VersionImpl<T, K>({
          major: 1,
          minor: 0,
          patch: 0,
          id: 0,
          isActive: false,
          releaseDate: "",
          name: '',
          url: ''
        }),
        timestamp: undefined,
        user: '',
        changes: [],
        comments: [],
        workspaceId: '',
        workspaceName: '',
        workspaceType: '',
        workspaceUrl: '',
        workspaceViewers: [],
        workspaceAdmins: [],
        workspaceMembers: [],
        history: [],
        data: undefined,
        backend: undefined,
        frontend: undefined,
        name: '',
        url: '',
        versionNumber: '',
        documentId: '',
        draft: false,
        userId: '',
        content: '',
        metadata: {
          author: '',
          timestamp: undefined,
          revisionNotes: undefined
        },
        releaseDate: '',
        major: 0,
        minor: 0,
        patch: 0,
        checksum: ''
      },

    },
    isActive: true,
    config: {
      theme: "dark",
      permissions: "read-write",
    },
    permissions: [],
    customFields: {
      projectType: "Documentation",
      priority: "High",
    },
    baseUrl: "https://example.com/metadata",
    childIds: [] as K[],
    relatedData: [] as K[],
    meta: {} as StructuredMetadata<T, K>
  };


  // Return as UnifiedMetaDataOptions
  return {
    area: "project", // Add this line
    tags: [],
    projectMetadata: projectMetadata,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    metadataEntries: metadataEntries, // Add this line
    latestVersion: latestVersion,
    schema: {}
  };
}

export type {
  AdditionalMetaDataOptions, AppMetadata, BaseMetadata, BaseMetaDataOptions, ConfigMetadata, MediaMetadata, MyDataType, ProjectMetaDataOptions,
  SnapshotMetaDataOptions, StatusMetadata, TaskMetadata, UnifiedMetadata, UnifiedMetaDataOptions, VersionMetadata
};


interface MyDataType extends BaseDataEntity {
  transactionHistory: TransactionData[];
  recentActivity?: { action: string; timestamp: Date }[];
  metadata?: Omit<UnifiedMetaDataOptions<MyDataType>, 'metadata'>;
}




const fetchUserAreaDimensions = (): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      resolve({ width, height });
    });
  });
};


// Convert the dimensions into a string format: "width x height"
const dimensions = await fetchUserAreaDimensions();
const area = `${dimensions.width}x${dimensions.height}`;
console.log(area);


const currentMeta: StructuredMetadata<T, K> = useMeta<T, K>(area)
// console.log(area);  // Output: "1920x1080"

// const currentMeta = useMeta<MyDataType, MyDataType>(area)

// Example media data
const mediaData: UnifiedMetadata<MyDataType> = {
  area: "",
  tags: [],
  structuredMetadata: currentMeta,
  currentMeta: currentMeta,
  metadataEntries: {},
  videoMetadata: {

    duration: 120, // 2 minutes
    resolution: '1920x1080',
    title: "",
    url: "",
    sizeInBytes: 0,
    format: "",
    aspectRatio: "16:9",
    subtitles: ["English", "Spanish"], // Array of subtitle languages
    closedCaptions: ["English"],
    license: "Creative Commons",
    isLicensedContent: true,
    isFamilyFriendly: true,
    isEmbeddable: true,
    isDownloadable: true,
    baseData: {},
    metadata: {
      area,
      currentMeta: currentMeta,
      metadataEntries: metadataEntries,
      latestVersion: latestVersion,

    },
    data: {
      // Example `Data` structure
      id: "123",
      name: "Video Data",
      createdAt: new Date(),
      updatedAt: new Date(),
      childIds: [],
      relatedData: []
    },
    uploadDate: new Date(),
    uploader: "",
    language: LanguageEnum.English,

    location: "",
    categories: [],
    views: 0,
    likes: 0,
    comments: 0,
    tags: [],
    frameRate: 30,

    bitrate: 3000, // Default bitrate in kbps
    codec: "H.264", // Default codec
    colorSpace: "sRGB", // Default color space
    audioCodec: "AAC", // Default audio codec
    audioChannels: 2, // Default to stereo
    audioSampleRate: 44100, // Default sample rate in Hz
    chapters: [], // Empty array if not provided
    thumbnailUrl: "", // Default empty string
    metadataSource: "user-generated", // Default metadata source
    childIds: [],
    relatedData: []
  },
  mediaMetadata: {
    id: "user",
    createdBy: '',
    timestamp: "",
    title: 'My Awesome Video',
    artist: 'John Doe',
    album: 'Greatest Hits',
    metadataEntries: {},
    artwork: [{ /* MediaImage data */
      src: "",
    }],
    keywords: [],
    isActive: true,
    permissions: [],
    customFields: [],

  },
  customMediaSession: {
    sessionId: 'session-001',
    status: 'active' // Currently playing
  },
  childIds: [],
  relatedData: []
};


// `VideoMetadata` is a type, not just an object type
function createVideoMetadata<T extends BaseDataEntity, K extends T>(
  title: string,
  url: string,
  options?: Partial<Omit<VideoMetadata<T, K>, "title" | "url">>
): VideoMetadata<T, K> {
  return {
    bitrate: options?.bitrate ?? 3000,
    codec: options?.codec ?? "H.264",
    colorSpace: options?.colorSpace ?? "sRGB",
    baseData: options?.baseData ?? {},
    metadata: options?.metadata ?? undefined,
    audioCodec: options?.audioCodec ?? "AAC",
    audioChannels: options?.audioChannels ?? 2,
    meta: options?.meta ?? {},
    audioSampleRate: options?.audioSampleRate ?? 44100,
    chapters: options?.chapters ?? [],
    thumbnailUrl: options?.thumbnailUrl ?? "",
    metadataSource: options?.metadataSource ?? "user-generated",
    duration: options?.duration ?? 120,
    resolution: options?.resolution ?? "1920x1080",
    title,
    url,
    sizeInBytes: options?.sizeInBytes ?? 0,
    format: options?.format ?? "",
    aspectRatio: options?.aspectRatio ?? "16:9",
    subtitles: options?.subtitles ?? [],
    closedCaptions: options?.closedCaptions ?? [],
    license: options?.license ?? "Creative Commons",
    isLicensedContent: options?.isLicensedContent ?? true,
    isFamilyFriendly: options?.isFamilyFriendly ?? true,
    isEmbeddable: options?.isEmbeddable ?? true,
    isDownloadable: options?.isDownloadable ?? true,
    data: options?.data ?? {
      id: "default-id",
      name: "Default Video Data",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    uploadDate: options?.uploadDate ?? new Date(),
    uploader: options?.uploader ?? "default uploader",
    language: options?.language ?? LanguageEnum.English,
    location: options?.location ?? "",
    categories: options?.categories ?? [],
    views: options?.views ?? 0,
    likes: options?.likes ?? 0,
    comments: options?.comments ?? 0,
    tags: options?.tags ?? [],
    frameRate: options?.frameRate ?? 30,
    childIds: options?.childIds ?? [],
    relatedData: options?.relatedData ?? []
  };
}


const transformedMetadataEntries: Record<string, any> = {};
for (const key in metadataEntries) {
  transformedMetadataEntries[key] = {
    ...metadataEntries[key],
    tags: Array.isArray(metadataEntries[key].tags)
      ? metadataEntries[key].tags
      : metadataEntries[key].tags ? Object.values(metadataEntries[key].tags) : [], // Convert TagsRecord to string[]
  };
}

function createMediaMetadata(
  title: string,
  artist: string,
  album: string,
  artworkSrc: string = "",
  metadataOptions: {
    id: string;
    createdBy: string;
    timestamp: Date;
    metadataEntries: Record<string, MetadataEntry>;
    keywords: string[];
    version: string;
    isActive: boolean;
    config: Record<string, any>;
  }
): UnifiedMetadata<MyDataType>["mediaMetadata"] {
  const {
    id,
    createdBy,
    timestamp,
    metadataEntries,
    keywords,
    version,
    isActive,
    config,
  } = metadataOptions;

  return {
    id,
    title,
    artist,
    album,
    createdBy,
    timestamp,
    metadataEntries: transformedMetadataEntries,
    keywords,
    version: typeof version === "string" ? new VersionImpl(version) : version, // Convert if necessary
    isActive,
    config,
    customFields,
    initialState,
    category,
    meta,
    permissions, name, metadata, versionData,
    artwork: [
      {
        src: artworkSrc,
      },
    ],
  };
}



// Generate dynamic video metadata
const dynamicVideoMetadata = createVideoMetadata("Sample Video", "https://example.com/video", {
  bitrate: 4500,
  codec: "VP9",
  duration: 300,
  subtitles: ["English", "French"],
});

// Generate dynamic media metadata
const dynamicMediaMetadata = createMediaMetadata(
  "Dynamic Title",
  "Dynamic Artist",
  "Dynamic Album",
  "https://example.com/artwork.jpg", // Provide artworkSrc
  {
    id: "media123",
    createdBy: "user456",
    timestamp: new Date(),
    metadataEntries: {},
    keywords: ["music", "album"],
    version: "1.0",
    isActive: true,
    config: {},
  }
);


const task: Task<MyDataType, MyDataType> = {
  id: "task123",
  title: "Sample Task",
  description: "This is a sample task.",
  _id: "",
  config: {} as Record<string, any>,
  permissions: [],
  customFields: {},

  timestamp: "",
  initialState: {} as InitializedState<MyDataType, MyDataType>,
  category: "",
  meta: {} as StructuredMetadata<MyDataType, MyDataType>,


  assignedTo: null,
  assigneeId: "user456",
  dueDate: new Date(),
  priority: undefined,
  type: "general",
  status: "open",
  isComplete: false,
  estimatedHours: null,
  actualHours: null,
  completionDate: null,
  dependencies: [],
  previouslyAssignedTo: [],
  done: false,
  data: undefined,
  source: "user",
  some: () => false,
  startDate: new Date(),
  endDate: new Date(),
  isActive: true,
  tags: undefined,
  analysisType: undefined,
  analysisResults: [],
  videoThumbnail: "",
  videoDuration: 0,
  videoUrl: "",
  userId: undefined,
  query: "",
  getData: async () => task,

  scheduled: {
    startDate: new Date(),
    scheduledDate: new Date(),
    createdBy: "system",
  },

  // Optional properties
  details: undefined,
};


// Dynamically create TaskMetadata based on the Task interface
export const taskMetadata = <T extends BaseDataEntity, K extends T = T>(
  task: Task<T, K>
): TaskMetadata<T, K> => {
  return {
    subtasks: task.dependencies || [],
    scheduledDate: task.scheduled?.startDate || undefined, // Dynamically assign scheduledDate
    taskId: task.taskId,
    taskName: task.taskName,
    _id: task._id,
    priority: task.priority,
    assignedTo: task.assignedTo,
    id: task.id,
    createdBy: task.createdBy,
    name: task.name,
    category: task.category,
    timestamp: task.timestamp,

    metadataEntries: task.metadataEntries,
    version: task.version || undefined,
    isActive: task.isActive,
    config: task.config,
    keywords: task.keywords,
    permissions: task.permissions,
    customFields: task.customFields,
    versionData: task.versionData,
    latestVersion: task.latestVersion,
    apiEndpoint: task.apiEndpoint,
    apiKey: task.apiKey,
    timeout: task.timeout,
    retryAttempts: task.retryAttempts,
    metadata: task.metadata,
    initialState: task.initialState,
    meta: task.meta,
    mappedSnapshot: task.mappedSnapshot,
    events: task.events,
    // Add other dynamic properties here as needed
  };
};

const { latestVersion = createLatestVersion<T, K>(), ...rest } = data;

// console.log(area);  // Output: "1920x1080"
// const currentMeta = useMeta<MyDataType, MyDataType>(area)
const myMetaData: UnifiedMetadata<BaseDataEntity<MyDataType>> = {
  area: '',
  tags: [],
  videoMetadata: dynamicVideoMetadata,
  mediaMetadata: dynamicMediaMetadata,
  projectMetadata: projectMetadata,
  taskMetadata: taskMetadata(task), // Invoke the function with `task`
  meetingMetadata: dynamicMeetingMetadata,
  structuredMetadata: currentMeta,
  latestVersion,
  schema: {},
  metadataEntries: {},
  customMediaSession: {
    sessionId: 'session123',
    status: 'active'
  },
  currentMeta: currentMeta,
  fileMetadata: {
    fileName: 'example.txt',
    fileSize: 1024,
    size: 1024,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  customMetadata: { customField: 'customValue' }
};

export { fetchUserAreaDimensions };
