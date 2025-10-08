// SnapshotCore.ts
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { MapExcludedFieldsToMetaKeys } from '@/app/components/routing/Fields';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { EventRecord, InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { AuditRecord } from '@/app/subscribers/Subscriber';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Snapshots, SnapshotsArray, SnapshotUnion } from '@/LocalStorageSnapshotStore';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SchemaField } from '@/server/database/SchemaField';
import { InitializedData, UnifiedConfigOption } from '@/app/snapshots/SnapshpshotStoreOptions';
import { TagsRecord } from '@/app/snapshots/SnapshpshotWithCriteria';
import { ExtendedVersionData } from '@/versions/VersionData';
import { MultipleEventsCallbacks } from "./subscribeToSnapshotsImplementation";

interface SnapshotCore<
  T extends BaseDataEntity,  
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>  extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  initialState: InitializedState<T, K, Meta, ExcludedFields> | {};  
  schema: string | Record<string, SchemaField>
  versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;  

  isCore: boolean;
  taskIdToAssign: string | undefined;


  // Identity and storage
  storeId: number;
  snapshotIds?: string[];
  
  // Metadata
  description?: string | null;
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topic?: string;
  meta?: StructuredMetadata<T, K>;
  metadata?: UnifiedMetadata<
    T,
    K,
    Meta,
    MapExcludedFieldsToMetaKeys<T, K, StructuredMetadata<T, K>, ExcludedFields>
  > | {};
  
  // Config and category
  configOption?: UnifiedConfigOption<T, K, Meta, ExcludedFields>; 
  priority?: string | PriorityTypeEnum;
  categoryProperties?: CategoryProperties | undefined;
  
  // Lifecycle
  isExpired: () => boolean | undefined;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  deleted?: boolean;
  
  // Audit
  auditTrail?: AuditRecord[];
  
  // Data
  data: InitializedData<T, K, Meta, ExcludedFields> | null | undefined;
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields> | null;
  dataStoreMethods?: DataStoreMethods<T, K, Meta> | null;
  
  // Timestamps
  updatedAt?: string | Date;
  timestamp: string | number | Date | undefined;
  // Other core properties
}

interface SnapshotStoreCore<
  T extends BaseDataEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T> 
> {
  id?: string | number | undefined;             
  data: InitializedData<T, K, Meta, ExcludedFields> | undefined;  
  createdAt: string | Date;
  updatedAt: string | Date;
  
  storeId: string | number;
  category: Category;
  criteria?: CriteriaType;
  snapshots?: Snapshots<T, K, Meta, ExcludedFields>;
  timestamp?: string | number | Date | undefined;
  eventRecords: Record<string, EventRecord<T, K, Meta, ExcludedFields>[]> | null;
  records?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;  

  storeConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  callback: (data: T) => void;
  multipleCallbacks: MultipleEventsCallbacks<T>;

  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, Meta, ExcludedFields>) => boolean): number;  
}


  export type { SnapshotCore, SnapshotStoreCore };
