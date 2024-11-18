import { MeetingMetadata } from '@/app/components/calendar/ScheduledData';
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { BaseData } from '@/app/components/models/data/Data';
import { TransactionData } from '@/app/components/payment/Transaction';
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { projectMetadata, videoMetadata, VideoMetadata } from '@/app/configs/StructuredMetadata';
import { ProjectMetadata, StructuredMetadata } from '../../../app/configs/StructuredMetadata';
import { PriorityTypeEnum } from './../../components/models/data/StatusType';
import { AllStatus } from './../../components/state/stores/DetailsListStore';
import { User } from './../../components/users/User';
 

interface BaseMetadata {
  description?: string; // Common descriptive text
  title?: string; // A generic title for all metadata
  tags: string[]; // Tags for classification and searchability
  author?: string; // Optional, common metadata
}



  // Define the base interface
interface BaseMetaDataOptions<T extends  BaseData<T>,
  K extends T = T>
  extends StructuredMetadata<T, K>,
  BaseMetadata {
    id: string
    title?: string;
    description?: string | undefined;
    createdBy: string;
    createdAt?: string | Date;
    updatedBy?: string;
    updatedAt?: string | Date;
    maxAge?: number | string;
    source?: string;  // Add source information for identification
    timestamp: string | number | Date | undefined;
  }

// Define extended interfaces
interface SnapshotMetaDataOptions<
  T extends  BaseData<T>,
  K extends T = T>
  extends StructuredMetadata<T, K>, BaseMetaDataOptions<T, K> {
  structuredMetadata: StructuredMetadata<T, K>;
  simulatedDataSource?: Record<string, any>;
  // simulatedDataSource?: { [key: string]: string | number | boolean | object };
}

interface ProjectMetaDataOptions<
  T extends  BaseData<T>, 
  K extends T = T
> extends ProjectMetadata<T, K>, BaseMetaDataOptions<T, K> {
  simulatedDataSource?: Record<string, any>;
}


// Define the task metadata options interface
interface TaskMetaDataOptions<
  T extends  BaseData<T>, 
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
  T extends  BaseData<T>,
  K extends T = T
>
  extends TaskMetaDataOptions<T, K> {
    taskId: string,
    taskName: string,
  // You can add more specific fields or methods here if required
  analysisType?: AnalysisTypeEnum; // Example of adding a task-specific field
}

interface MediaMetadata {
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
  T extends BaseData<T>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends BaseMetadata {
  area: string; // Area of the app (e.g., 'dashboard', 'profile')
  overrides?: Partial<Omit<Meta, ExcludeKeys>>; // Overrides excluding specific keys
  relatedKeys?: Array<keyof T>; // Optional keys from T related to this metadata

  videoMetadata?: VideoMetadata<T, K>;
  mediaMetadata?: MediaMetadata;
  projectMetadata?: ProjectMetadata<T, K>;
  taskMetadata?: TaskMetadata<T, K>;
  meetingMetadata?: MeetingMetadata;
  customMediaSession?: CustomMediaSession;
}


export type {
  AdditionalMetaDataOptions, BaseMetadata,
  BaseMetaDataOptions, MediaMetadata, MyDataType, ProjectMetaDataOptions,
  SnapshotMetaDataOptions, TaskMetadata, UnifiedMetaDataOptions
};


interface MyDataType extends BaseData<MyDataType> {
  transactionHistory: TransactionData[];
  recentActivity?: { action: string; timestamp: Date }[];
  metadata?: Omit<UnifiedMetaDataOptions<MyDataType>, 'metadata'>;
}



// Example media data
const mediaData: UnifiedMetaDataOptions<MyDataType> = {
  area: "", 
  tags: [],
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
  }
};



const myMetaData: UnifiedMetaDataOptions<MyDataType> = {
  area: '',
  tags: [],
  videoMetadata: videoMetadata,
  mediaMetadata: mediaData,
  projectMetadata: projectMetadata,
  taskMetadata: taskMetadata,
  meetingMetadata: meetingMetadata,
  customMediaSession: {
    sessionId: 'session123',
    status: 'active'
  }
};