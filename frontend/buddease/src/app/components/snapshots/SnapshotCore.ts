// SnapshotCore.ts
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { PriorityTypeEnum } from '@/app/components/models/data/StatusType';
import { DataStoreMethods } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { EventRecord, InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { MapExcludedFieldsToMetaKeys } from '@/app/components/routing/Fields';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { AuditRecord } from '@/app/components/users/Subscriber';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { UnifiedMetadata } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SchemaField } from '../../../server/database/SchemaField';
import { Category } from '../libraries/categories/generateCategoryProperties';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { ExtendedVersionData } from '../versions/VersionData';
import { Snapshots, SnapshotsArray, SnapshotUnion } from './LocalStorageSnapshotStore';
import { InitializedData, UnifiedConfigOption } from './SnapshotStoreOptions';
import { TagsRecord } from './SnapshotWithCriteria';
import { MultipleEventsCallbacks } from "./subscribeToSnapshotsImplementation";

interface SnapshotCore<
  T extends BaseDataEntity,  
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>  extends SharedIdentifiers<T, K> {
  initialState: InitializedState<T, K, Meta, ExcludedFields> | {};  
  schema: string | Record<string, SchemaField>
  versionInfo: ExtendedVersionData<T, K, Meta, ExcludedFields> | null;  

  isCore: boolean;
  taskIdToAssign: string | undefined;


  // Identity and storage
  storeId: number;
  snapshotIds?: string[];
  
  // Metadata
  description?: string | null;
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;
  state?: SnapshotsArray<T, K, Meta> | null;
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
  records?: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>;  

  storeConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields> | null;

  callback: (data: T) => void;
  multipleCallbacks: MultipleEventsCallbacks<T>;

  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, Meta, ExcludedFields>) => boolean): number;  
}


  export type { SnapshotCore, SnapshotStoreCore };
