import { dynamicMeetingMetadata, MeetingMetadata } from '@/app/components/calendar/ScheduledData';
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { BaseData } from '@/app/components/models/data/Data';
import { TransactionData } from '@/app/components/payment/Transaction';
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { TodoImpl } from '@/app/components/todos/Todo';
import { createLastUpdatedWithVersion } from "@/app/components/versions/createLatestVersion";
import { MetadataEntry, projectMetadata, VideoMetadata } from '@/app/configs/StructuredMetadata';
import { useMeta } from '@/app/configs/useMeta';
import { ProjectMetadata, StructuredMetadata } from '../../../app/configs/StructuredMetadata';
import { PriorityTypeEnum } from './../../components/models/data/StatusType';
import { AllStatus } from './../../components/state/stores/DetailsListStore';
import { User } from './../../components/users/User';
import { version } from './../../components/versions/Version';

import { SharedBaseData } from "@/app/components/models/data/Data";
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { Task } from '@/app/components/models/tasks/Task';
import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { baseConfig } from '../BaseConfig';
import { SharedMetadata } from '../metadata/createMetadataState';


interface BaseMetadata<K extends T = T> extends SharedBaseData<K>, SharedMetadata<K> {
  description?: string; // Common descriptive text
  title?: string; // A generic title for all metadata
  tags?: TagsRecord<T, K> | string[] | undefined; 
  author?: string; // Optional, common metadata
}

// Define the base interface
interface BaseMetaDataOptions<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T>
  extends StructuredMetadata<T, K>,
  BaseMetadata<K>  {
    id: string
    title?: string;
    description?: string | undefined;
    createdBy: string;
    createdAt?: string | Date;
    updatedBy?: string;
    updatedAt?: string | Date;
    maxAge?: string | number;
    source?: string;  // Add source information for identification
    timestamp: string | number | Date | undefined;
    tags?: TagsRecord<T, K> | string[] | undefined;

  }

// Define extended interfaces
interface SnapshotMetaDataOptions<
  T extends  BaseData<any>,
  K extends T = T>
  extends StructuredMetadata<T, K>, BaseMetaDataOptions<T, K> {
  structuredMetadata: StructuredMetadata<T, K>;
  simulatedDataSource?: Record<string, any>;
  // simulatedDataSource?: { [key: string]: string | number | boolean | object };
}

interface ProjectMetaDataOptions<
  T extends  BaseData<any>, 
  K extends T = T
> extends ProjectMetadata<T, K>, BaseMetaDataOptions<T, K> {
  simulatedDataSource?: Record<string, any>;
}


// Define the task metadata options interface
interface TaskMetaDataOptions<
  T extends  BaseData<any>, 
  K extends T = T
>
  extends BaseMetaDataOptions<T, K> {
  priority: PriorityTypeEnum | undefined; // Specific to tasks
  assignedTo: User | User[] | null;
  status?: AllStatus; // Status specific to tasks
  // Additional task-specific metadata fields can be added here
}

// Task metadata extending base metadata
// Extend the task metadata to include other relevant interfaces if needed
interface TaskMetadata<
  T extends  BaseData<any>,
  K extends T = T,
  Sub = Task<T, K> | TodoImpl<any, any, any>
> extends TaskMetaDataOptions<T, K> {
    taskId: string,
    taskName: string,
    _id: string
  // You can add more specific fields or methods here if required
  analysisType?: AnalysisTypeEnum; // Example of adding a task-specific field
  subtasks?: Task<T, K>[] | null;       // Subtasks associated with the task
  assignee?: User | null;               // Current assigned user
  scheduleType?: "one-time" | "recurring"; // New field to indicate if the task is recurring or one-time
  scheduledDate?: Date | undefined;     // Explicit scheduled date
}

interface MediaMetadata extends BaseMetaDataOptions {
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

// Unified metadata interface with two required type arguments T and K
interface UnifiedMetaDataOptions<
  T extends BaseData<any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends Omit<BaseMetadata, 'tags'>, SharedBaseData<K> {
  author?: string;
  timestamp?: string | Date | undefined;
  revisionNotes?: string;
  area: string | undefined; // Area of the app (e.g., 'dashboard', 'profile')
  currentMeta: Meta; // Core metadata, always required
  tags?: TagsRecord<T, K> | string[] | undefined; 
  childIds?: K[]
  relatedData?: K[] | undefined
  projectId?: number;
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

}


function transformProjectToUnifiedMetadata<
  T extends  BaseData<any> = BaseData<any, any>,
  K extends T = T
>(projectMetadata: ProjectMetadata<T, K>): UnifiedMetaDataOptions<T, K> {
  
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
    versionData: projectMetadata.versionData || [], 
    latestVersion: createLatestVersion({
      id: 1,
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
        contributors: ["Emily Davis", "Michael Brown"],
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
      releaseDate: undefined,
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
      data: data,
      _structure: {},
      versionHistory: {
        versionData: undefined
      },
      getVersionNumber: undefined,
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
      id: 0,
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
      version: version,
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
    permissions: ["admin", "editor", "viewer"],
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
    currentMeta: structuredMetadata, // Add this line
    metadataEntries: metadataEntries, // Add this line
  };
}

export type {
    AdditionalMetaDataOptions, BaseMetadata,
    BaseMetaDataOptions, MediaMetadata, MyDataType, ProjectMetaDataOptions,
    SnapshotMetaDataOptions, TaskMetadata, UnifiedMetaDataOptions
};


  
interface MyDataType extends BaseData {
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
const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;
const currentMeta: StructuredMetadata<T, K<T>> = useMeta<T, K<T>>(area)
// console.log(area);  // Output: "1920x1080"

// const currentMeta = useMeta<MyDataType, MyDataType>(area)

// Example media data
const mediaData: UnifiedMetaDataOptions<MyDataType> = {
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
    title: 'My Awesome Video',
    artist: 'John Doe',
    album: 'Greatest Hits',
    artwork: [{ /* MediaImage data */ 
      src: ""
    }]
  },
  customMediaSession: {
    sessionId: 'session-001',
    status: 'active' // Currently playing
  },
  childIds: [], relatedData: []
};


// `VideoMetadata` is a type, not just an object type
function createVideoMetadata<T extends BaseData<any>, K extends T>(
  title: string,
  url: string,
  options?: Partial<Omit<VideoMetadata<T, K>, "title" | "url">>
): VideoMetadata<T, K> {
  return {
    bitrate: options?.bitrate ?? 3000,
    codec: options?.codec ?? "H.264",
    colorSpace: options?.colorSpace ?? "sRGB",
    audioCodec: options?.audioCodec ?? "AAC",
    audioChannels: options?.audioChannels ?? 2,
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



function createMediaMetadata(
  title: string,
  artist: string,
  album: string,
  artworkSrc: string = ""
): UnifiedMetaDataOptions<MyDataType>["mediaMetadata"] {
  return {
    title,
    artist,
    album,
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
const dynamicMediaMetadata = createMediaMetadata("Dynamic Title", "Dynamic Artist", "Dynamic Album");



// Dynamically create TaskMetadata based on the Task interface
export const taskMetadata = <T extends BaseData<any>, K extends T = T>(
  task: Task<T, K>
): TaskMetadata<T, K> => {
  return {
    subtasks: task.dependencies || [],
    scheduledDate: task.scheduled?.startDate || undefined, // Dynamically assign scheduledDate
    taskId: task.taskId,
    taskName: task.taskName,
    _id: task._id,
    priority: task.priority,
    assignedTo: "",
    id: "",
    createdBy: "",
    timestamp: "",
   
    metadataEntries: "",
    version: "",
    isActive: "",
    config: "",
   
    // Add other dynamic properties here as needed
  };
};
// console.log(area);  // Output: "1920x1080"
  
// const currentMeta = useMeta<MyDataType, MyDataType>(area)


const myMetaData: UnifiedMetaDataOptions<BaseData<MyDataType>> = {
  area: '',
  tags: [],
  videoMetadata: dynamicVideoMetadata,
  mediaMetadata: dynamicMediaMetadata,
  projectMetadata: projectMetadata,
  taskMetadata: taskMetadata,
  meetingMetadata: dynamicMeetingMetadata,
  structuredMetadata: currentMeta, 
  metadataEntries: {},
  customMediaSession: {
    sessionId: 'session123',
    status: 'active'
  },
  currentMeta: currentMeta
};

export { fetchUserAreaDimensions };
