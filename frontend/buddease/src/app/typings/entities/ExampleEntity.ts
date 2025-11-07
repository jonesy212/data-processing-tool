// ExampleEntity.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { AppMetadata } from '@/app/typings/metadataTypes'

// --- Core entity definition ---
interface ExampleEntity extends BaseDataEntity {
  name: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  // Add any other Example-specific properties
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// --- 6-type alias pattern ---
type ExampleK = ExampleEntity;
type ExampleMeta = DefaultMeta<ExampleEntity, ExampleK>;
type ExampleAttachment = Attachment;
type ExampleExcludedFields = DefaultExcludedFields<ExampleEntity>;
type ExampleIncludedFields = keyof ExampleEntity;

// --- App Metadata ---
type AppExampleMetadata = AppMetadata<
  ExampleEntity,
  ExampleK,
  ExampleMeta,
  ExampleAttachment,
  ExampleExcludedFields,
  ExampleIncludedFields
>;

// --- Structured & Unified Metadata ---
type ExampleStructuredMetadata = StructuredMetadata<
  ExampleEntity,
  ExampleK,
  ExampleMeta,
  ExampleAttachment,
  ExampleExcludedFields,
  ExampleIncludedFields
>;

type ExampleUnifiedMetadata = UnifiedMetadata<
  ExampleEntity,
  ExampleK,
  ExampleMeta,
  ExampleAttachment,
  ExampleExcludedFields,
  ExampleIncludedFields
>;

// --- Parameters container ---
type ExampleBaseParams = {
  T: ExampleEntity;
  K: ExampleK;
  Meta: ExampleMeta;
  AttachmentType: ExampleAttachment;
  ExcludedFields: ExampleExcludedFields;
  IncludedFields: ExampleIncludedFields;
};

// --- Snapshot types ---
type ExampleSnapshot = Snapshot<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleSnapshotData = SnapshotData<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleSnapshotStore = SnapshotStore<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleSnapshotWithCriteria = SnapshotWithCriteria<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleSubscriberCollection = SubscriberCollection<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleRealtimeDataItem = RealtimeDataItem<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleCollection = ExampleEntity[];

// --- Config types ---
type ExampleSnapshotStoreConfig = SnapshotStoreConfig<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleSnapshotsArray = SnapshotsArray<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;
type ExampleParams = SnapshotConfigParams<ExampleEntity, ExampleK, ExampleMeta, ExampleAttachment, ExampleExcludedFields, ExampleIncludedFields>;

// --- Utility types ---
type ApplyExampleFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

// --- Extended types for specific use cases ---

// Example-specific metadata extension
interface ExampleExtendedMetadata extends ExampleMeta {
  customExampleField?: string;
  exampleConfig?: {
    maxItems?: number;
    validationRules?: string[];
    uiSettings?: Record<string, any>;
  };
}

// Example-specific entity with additional properties
interface ExampleExtendedEntity extends ExampleEntity {
  extendedProperty?: string;
  calculatedField?: number;
  relationships?: {
    parentId?: string;
    childrenIds?: string[];
    relatedExamples?: ExampleEntity[];
  };
}

// Example-specific unified metadata
type ExampleExtendedUnifiedMetadata = UnifiedMetadata<
  ExampleExtendedEntity,
  ExampleK,
  ExampleExtendedMetadata,
  ExampleAttachment,
  ExampleExcludedFields,
  ExampleIncludedFields
>;

// Factory type for creating example instances
type ExampleFactory = {
  create: (data: Partial<ExampleEntity>) => ExampleEntity;
  createExtended: (data: Partial<ExampleExtendedEntity>) => ExampleExtendedEntity;
  validate: (entity: ExampleEntity) => boolean;
};

// Query types for example entities
type ExampleQuery = {
  filters?: {
    isActive?: boolean;
    priority?: number;
    category?: string;
    tags?: string[];
  };
  sortBy?: keyof ExampleEntity;
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    page: number;
    pageSize: number;
  };
};

// Export all types
export type {
  // Core types
  ExampleEntity,
  ExampleK,
  ExampleMeta,
  ExampleAttachment,
  ExampleExcludedFields,
  ExampleIncludedFields,
  
  // Metadata types
  AppExampleMetadata,
  ExampleStructuredMetadata,
  ExampleUnifiedMetadata,
  
  // Params and base
  ExampleBaseParams,
  
  // Snapshot and store types
  ExampleSnapshot,
  ExampleSnapshotData,
  ExampleSnapshotStore,
  ExampleSnapshotWithCriteria,
  ExampleSubscriberCollection,
  ExampleRealtimeDataItem,
  ExampleCollection,
  ExampleSnapshotStoreConfig,
  ExampleSnapshotsArray,
  ExampleParams,
  
  // Utility types
  ApplyExampleFieldFilters,
  
  // Extended types
  ExampleExtendedEntity,
  ExampleExtendedMetadata,
  ExampleExtendedUnifiedMetadata,
  ExampleFactory,
  ExampleQuery
};


// Optional: Default exports for commonly used types
export type DefaultExampleEntity = ExampleEntity;
export type DefaultExampleUnifiedMetadata = ExampleUnifiedMetadata;