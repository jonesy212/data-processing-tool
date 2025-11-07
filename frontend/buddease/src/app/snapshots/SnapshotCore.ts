// SnapshotCore.ts
import { MapExcludedFieldsToMetaKeys } from '@/app/components/routing/Fields';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { Snapshots, SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { UnifiedConfigOption } from '@/app/snapshots/SnapshotStoreOptions';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { EventRecord, InitializedState } from '@/app/state/stores/DataStore';
import { AuditRecord } from '@/app/subscribers/Subscriber';
import { MultipleEventsCallbacks } from '@/app/subscribers/subscribeToSnapshotsImplementation';
import { MemberEntity } from '@/app/typings/entities/MemberEntity';
import { ExtendedVersionData } from '@/app/versions/VersionData';

interface SnapshotCore<
  T extends BaseDataEntity = MemberEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends SharedIdentifiers<T, K> {
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};  
  schema: string | Record<string, SchemaField>
  versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;  

  isCore: boolean;
  taskIdToAssign: string | undefined;


  // Identity and storage
  storeId: number;
  snapshotIds?: string[];
  
  // Metadata
  description?: string | null;
  tags?: TagsRecord<T>| string[] | undefined;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topic?: string;
  meta?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  metadata?: UnifiedMetadata<
    T,
    K,
    Meta,
    AttachmentType,
    MapExcludedFieldsToMetaKeys<T, K,  Meta, AttachmentType, ExcludedFields, IncludedFields>
  > | {};
  
  // Config and category
  configOption?: UnifiedConfigOption<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
  priority?: string | PriorityTypeEnum;
  categoryProperties?: CategoryProperties
  
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
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dataStoreMethods?: DataStoreMethods<T, K, Meta> | null;
  
  // Timestamps
  updatedAt?: string | Date;
  timestamp: string | number | Date | undefined;
  // Other core properties
}

interface SnapshotStoreCore<
  T extends BaseDataEntity = MemberEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id?: string | number | undefined;             
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;  
  createdAt: string | Date;
  updatedAt: string | Date;
  
  storeId: string | number;
  category: Category;
  criteria?: CriteriaType;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp?: string | number | Date | undefined;
  eventRecords: Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
  records?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;  

  storeConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  callback: (data: T) => void;
  multipleCallbacks: MultipleEventsCallbacks<T>;

  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): number;  
}


  export type { SnapshotCore, SnapshotStoreCore };
