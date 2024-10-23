import { Data } from '@/app/components/models/data/Data';
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { VideoMetadata } from '@/app/configs/StructuredMetadata';
import { ProjectMetadata, StructuredMetadata } from '../../../app/configs/StructuredMetadata';
import { PriorityTypeEnum } from './../../components/models/data/StatusType';
import { AllStatus } from './../../components/state/stores/DetailsListStore';
import { User } from './../../components/users/User';
import { TagsRecord } from '@/app/components/snapshots';
 

interface BaseMetadata {
  startDate: Date | undefined; // Optional for flexibility
  endDate: Date | undefined;
  description?: string;
}

  // Define the base interface
interface BaseMetaDataOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  extends StructuredMetadata<T, Meta, K>,
  BaseMetadata {
    id: string
    title?: string;
    description?: string | undefined;
    createdBy: string;
    createdAt?: string | Date;
    updatedBy?: string;
    updatedAt?: string | Date;
    maxAge?: number | string;
    timestamp: string | number | Date | undefined;
  }



// Define extended interfaces
interface SnapshotMetaDataOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  extends StructuredMetadata<T, Meta, K>, BaseMetaDataOptions<T, Meta, K> {
  structuredMetadata: StructuredMetadata<T, Meta, K>;
  simulatedDataSource?: Record<string, any>;
  // simulatedDataSource?: { [key: string]: string | number | boolean | object };
}

interface ProjectMetaDataOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends ProjectMetadata, BaseMetaDataOptions<T, Meta, K> {
  simulatedDataSource?: Record<string, any>;
}


// Define the task metadata options interface
interface TaskMetaDataOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  extends BaseMetaDataOptions<T, Meta, K> {
  priority: PriorityTypeEnum | undefined; // Specific to tasks
  assignedTo: User | User[] | null;
  status?: AllStatus; // Status specific to tasks
  // Additional task-specific metadata fields can be added here
}

// Task metadata extending base metadata
// Extend the task metadata to include other relevant interfaces if needed
interface TaskMetadata<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  extends TaskMetaDataOptions<T, Meta, K> {
  // You can add more specific fields or methods here if required
  analysisType?: AnalysisTypeEnum; // Example of adding a task-specific field
}

interface MediaMetadata {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[]; // Assuming MediaImage is defined elsewhere
}


interface AdditionalMetaDataOptions {
  enableSnapshot?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  eventRecords?: any[];  
}


// Unified metadata interface
interface UnifiedMetaDataOptions extends SnapshotMetaDataOptions<Data, UnifiedMetaDataOptions>,
  ProjectMetaDataOptions<Data, UnifiedMetaDataOptions> {
  videoMetadata?: VideoMetadata; 
  mediaMetadata?: MediaMetadata;
  mediaSession?: CustomMediaSession;
}


export type { AdditionalMetaDataOptions, ProjectMetaDataOptions, SnapshotMetaDataOptions, TaskMetadata, UnifiedMetaDataOptions, BaseMetaDataOptions, BaseMetadata };

