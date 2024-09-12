import ProjectMetadata, { StructuredMetadata } from '../../../app/configs/StructuredMetadata';
 

  // Define the base interface
  interface BaseMetaDataOptions extends StructuredMetadata {
    id?: string;
    title?: string;
    description : string;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
    maxAge?: number | string;
    timestamp?: Date;
  }


         
interface SnapshotMetaDataOptions extends StructuredMetadata, BaseMetaDataOptions {
  simulatedDataSource?: Record<string, any>;
}

// Define extended interfaces
interface SnapshotMetaDataOptions extends StructuredMetadata, BaseMetaDataOptions {
  structuredMetadata: StructuredMetadata;
  simulatedDataSource?: Record<string, any>;
  // simulatedDataSource?: { [key: string]: string | number | boolean | object };
}

interface ProjectMetaDataOptions extends ProjectMetadata, BaseMetaDataOptions {
  simulatedDataSource?: Record<string, any>;
}


interface AdditionalMetaDataOptions {
  enableSnapshot?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  eventRecords?: any[]; // Adjust the type based on what `eventRecords` should be
}


// Unified metadata interface
interface UnifiedMetaDataOptions extends SnapshotMetaDataOptions, ProjectMetaDataOptions {}


export type { UnifiedMetaDataOptions };