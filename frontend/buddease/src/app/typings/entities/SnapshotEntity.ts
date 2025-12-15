// SnapshotEntity.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Data } from '@/app/models/data/Data';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { ExtendedVersionData } from "@/app/versions/VersionData";
// --- Core Snapshot type definitions ---

type SnapshotEntity = BaseDataEntity 
type SnapshotK = SnapshotEntity;
type SnapshotMeta = DefaultMeta<SnapshotEntity, SnapshotK>;
type SnapshotAttachment = Attachment;
type SnapshotExcludedFields = DefaultExcludedFields<SnapshotEntity>;
type SnapshotIncludedFields = keyof SnapshotEntity;

type AppSnapshotContainer = SnapshotContainer<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>

// --- Main parameters container ---
type SnapshotBaseParams = {
  T: SnapshotEntity;
  K: SnapshotK;
  Meta: SnapshotMeta;
  AttachmentType: SnapshotAttachment;
  ExcludedFields: SnapshotExcludedFields;
  IncludedFields: SnapshotIncludedFields;
};

// --- Unified & Structured Metadata ---
type SnapshotUnifiedMetadata = UnifiedMetadata<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotStructuredMetadata = StructuredMetadata<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

// --- Snapshot types ---
type SnapshotEntityType = Snapshot<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotEntityData = SnapshotData<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
> | null; 

type SnapshotEntityStore = SnapshotStore<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotEntityWithCriteria = SnapshotWithCriteria<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotEntitySubscriberCollection = SubscriberCollection<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotEntityRealtimeDataItem = RealtimeDataItem<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

// --- Configuration types ---
type SnapshotEntityStoreConfig = SnapshotStoreConfig<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

type SnapshotEntitySnapshotsArray = SnapshotsArray<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;

// --- Params ---
type SnapshotEntityParams = SnapshotConfigParams<
  SnapshotBaseParams['T'],
  SnapshotBaseParams['K'],
  SnapshotBaseParams['Meta'],
  SnapshotBaseParams['AttachmentType'],
  SnapshotBaseParams['ExcludedFields'],
  SnapshotBaseParams['IncludedFields']
>;


// Create comprehensive helper types
type SnapshotFullType<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  Snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  SnapshotStoreProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// Default snapshot types using your entity pattern
type DefaultSnapshotTypes = SnapshotFullType<
  SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields
>;


// --- Field filter utility ---
type SnapshotEntityApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  IncludedFields extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, IncludedFields>;


// --- SnapshotEntity data interface ---
interface SnapshotEntityDataInterface<
  T extends BaseDataEntity = SnapshotEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  version?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
    isDirty?: boolean;
  lastAccessed?: number
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  [key: string]: any;
}

// --- Default empty snapshot ---
const emptySnapshotData: SnapshotEntityDataInterface<
  SnapshotEntity,
  SnapshotK,
  SnapshotMeta,
  SnapshotAttachment,
  SnapshotExcludedFields,
  SnapshotIncludedFields
> = {


  taskIdToAssign: "",
  schema: "",
  currentCategory: "",
  initializedState: "",
  storeId: 0,
  
  mappedSnapshotData: new Map(),
  versionInfo: {} as ExtendedVersionData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
  
  onInitialize: (callback: () => void) => {},
  config: {} as Promise<SnapshotStoreConfig<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null>,
  snapshotContainer: {} as SnapshotContainer<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,

  // Core Snapshot fields
  id: '',
  deleted: false,
  isCore: false,
  initialState: {} as SnapshotEntityData,
  initialConfig: {} as SnapshotEntityStoreConfig,
  snapshotConfig: {} as SnapshotEntityStoreConfig,
  storeConfig: {} as SnapshotEntityStoreConfig,
  subscribers: [] as SnapshotEntitySubscriberCollection[],
  snapshotType: 'default',

  // Extended entity fields
  name: '',
  description: '',
  category: '',
  tags: [],
  version: '',
  createdBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),

  // Metadata
  metadata: {} as SnapshotUnifiedMetadata,

  // Optional additional structure for flexibility
  data: {} as Data<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>,
  store: {} as SnapshotEntityStore,
};

// --- Helper function ---
const createDefaultSnapshotData = (
  baseData: Partial<SnapshotEntityDataInterface>
): SnapshotEntityDataInterface => ({
  ...emptySnapshotData,
  ...baseData,
  id: baseData.id || `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  createdAt: baseData.createdAt || new Date(),
  updatedAt: new Date(),
});

export type { AppSnapshotContainer, DefaultSnapshotTypes, SnapshotAttachment, SnapshotBaseParams, SnapshotEntity, SnapshotEntityApplyFieldFilters, SnapshotEntityData, SnapshotEntityDataInterface, SnapshotEntityParams, SnapshotEntityRealtimeDataItem, SnapshotEntitySnapshotsArray, SnapshotEntityStore, SnapshotEntityStoreConfig, SnapshotEntitySubscriberCollection, SnapshotEntityType, SnapshotEntityWithCriteria, SnapshotExcludedFields, SnapshotFullType, SnapshotIncludedFields, SnapshotK, SnapshotMeta, SnapshotStructuredMetadata, SnapshotUnifiedMetadata };

    export {
    createDefaultSnapshotData, emptySnapshotData
  };

