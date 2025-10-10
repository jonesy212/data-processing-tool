// SnapshotEntity.ts
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

// --- Core Snapshot type definitions ---
type SnapshotEntity = BaseDataEntity & {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  version?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: UnifiedMetadata<any, any>;
  [key: string]: any;
};

type SnapshotK = SnapshotEntity;
type SnapshotMeta = DefaultMeta<SnapshotEntity, SnapshotK>;
type SnapshotAttachment = Attachment;
type SnapshotExcludedFields = DefaultExcludedFields<SnapshotEntity>;
type SnapshotIncludedFields = keyof SnapshotEntity;

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
>;

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

// --- Field filter utility ---
type SnapshotEntityApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> = Pick<Omit<T, Excluded>, Included>;

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
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  [key: string]: any;
}

// --- Default empty snapshot ---
const emptySnapshotData: SnapshotEntityDataInterface = {
  id: '',
  name: '',
  description: '',
  category: '',
  tags: [],
  version: '',
  createdBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {} as SnapshotUnifiedMetadata,
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

export type {
  SnapshotAttachment, SnapshotBaseParams, SnapshotEntity, SnapshotEntityApplyFieldFilters, SnapshotEntityData, SnapshotEntityDataInterface, SnapshotEntityParams, SnapshotEntityRealtimeDataItem, SnapshotEntitySnapshotsArray, SnapshotEntityStore, SnapshotEntityStoreConfig, SnapshotEntitySubscriberCollection, SnapshotEntityType, SnapshotEntityWithCriteria, SnapshotExcludedFields,
  SnapshotIncludedFields, SnapshotK, SnapshotMeta, SnapshotStructuredMetadata, SnapshotUnifiedMetadata
};

    export {
    createDefaultSnapshotData, emptySnapshotData
  };

