// VersionEntity.ts
import FrontendStructure from "@/core/config/appStructure/FrontendStructureComponent";
import { IBackendStructure } from '@/core/config/appStructure/IBackendStructure';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { HistoryEntry } from "@/core/state/stores/HistoryStore";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import { Version, default as VersionImpl } from "@/core/versions/Version";
import { VersionData } from '@/core/versions/VersionData';

// --- Core Version type definitions ---
type VersionEntity = BaseDataEntity;
type VersionK = VersionEntity;
type VersionMeta = DefaultMeta<VersionEntity, VersionK>;
type VersionAttachment = Attachment;
type VersionExcludedFields = DefaultExcludedFields<VersionEntity>;
type VersionIncludedFields = keyof VersionEntity;

// --- Main parameters container ---
type VersionBaseParams = {
  T: VersionEntity;
  K: VersionK;
  Meta: VersionMeta;
  AttachmentType: VersionAttachment;
  ExcludedFields: VersionExcludedFields;
  IncludedFields: VersionIncludedFields;
};

// --- Unified & Structured Metadata ---
type VersionUnifiedMetadata = UnifiedMetadata<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionStructuredMetadata = StructuredMetadata<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

// --- Version types ---
type VersionEntityType = Version<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntityData = VersionData<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntityImpl = VersionImpl<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

// --- Frontend and backend structure types ---
type VersionEntityFrontendStructure = FrontendStructure<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntityBackendStructure = IBackendStructure<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

// --- Snapshot compatibility types ---
type VersionEntitySnapshot = Snapshot<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntitySnapshotData = SnapshotData<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntitySnapshotStore = SnapshotStore<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntitySnapshotStoreConfig = SnapshotStoreConfig<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntitySnapshotsArray = SnapshotsArray<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

// --- Collection types ---
type VersionEntitySubscriberCollection = SubscriberCollection<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

type VersionEntityRealtimeDataItem = RealtimeDataItem<
  VersionBaseParams['T'],
  VersionBaseParams['K'],
  VersionBaseParams['Meta'],
  VersionBaseParams['AttachmentType'],
  VersionBaseParams['ExcludedFields'],
  VersionBaseParams['IncludedFields']
>;

// --- History type ---
type VersionEntityHistoryEntry = HistoryEntry;

// --- Field filter utility ---
type VersionEntityApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  IncludedFields extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, IncludedFields>;

// --- VersionEntity data interface ---
interface VersionEntityDataInterface<
  T extends BaseDataEntity = VersionEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  version?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Version-specific properties
  versionNumber: string | number;
  versionTag?: string;
  data: T | null;
  backend?: IBackendStructure<T>;
  frontend?: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  history?: HistoryEntry[];
  parentVersionId?: string | null;
  childVersions?: string[];
  isActive: boolean;
  attachments?: AttachmentType[];
  context?: Record<string, any>;

  [key: string]: any;
}

// --- Default empty version ---
const emptyVersionData: VersionEntityDataInterface<
  VersionEntity,
  VersionMeta,
  VersionAttachment,
  VersionExcludedFields,
  VersionIncludedFields
> = {
  // Core Version fields
  id: '',
  versionNumber: '1.0.0',
  major, minor, patch, buildNumber,
   
  data: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  // Extended entity fields
  name: '',
  description: '',
  category: '',
  tags: [],
  version: '',
  createdBy: '',
  
  // Version-specific implementations
  clone: function(): any {
    return { ...this };
  },
  updateMetadata: function(meta: Partial<any>): void {
    if (this.metadata) {
      Object.assign(this.metadata, meta);
      this.updatedAt = new Date();
    }
  },
  deactivate: function(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  },
  activate: function(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  },

  // Metadata
  metadata: {} as VersionUnifiedMetadata,

  // Optional structure for flexibility
  backend: undefined,
  frontend: undefined,
  history: [],
  attachments: [],
  context: {}
};

// --- Helper function ---
const createDefaultVersionData = (
  baseData: Partial<VersionEntityDataInterface>
): VersionEntityDataInterface => ({
  ...emptyVersionData,
  ...baseData,
  id: baseData.id || `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  createdAt: baseData.createdAt || new Date(),
  updatedAt: new Date(),
});

export type {
    VersionAttachment, VersionBaseParams, VersionEntity, VersionEntityApplyFieldFilters,
    VersionEntityBackendStructure,
    VersionEntityData,
    VersionEntityDataInterface,
    VersionEntityFrontendStructure,
    VersionEntityHistoryEntry,
    VersionEntityImpl,
    VersionEntityRealtimeDataItem,
    VersionEntitySnapshot,
    VersionEntitySnapshotData,
    VersionEntitySnapshotsArray,
    VersionEntitySnapshotStore,
    VersionEntitySnapshotStoreConfig,
    VersionEntitySubscriberCollection,
    VersionEntityType, VersionExcludedFields,
    VersionIncludedFields, VersionK,
    VersionMeta, VersionStructuredMetadata,
    VersionUnifiedMetadata
};

    export {
        createDefaultVersionData,
        emptyVersionData
    };

// Export specific type alias for AppVersion
export type AppVersion = VersionEntityType;