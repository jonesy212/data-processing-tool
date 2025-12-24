// SnapshotStoreMethods.ts
// SnapshotSttoreMethods.ts
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { DataStore } from '@/app/state/stores/DataStore';
import { Subscription } from '@/app/subscriptions/Subscription';

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Snapshot, SnapshotStoreConfig } from "@/app/snapshots/Snapshot";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";

// Separate interface for store operations
interface SnapshotStoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Store CRUD Operations
  addStore: (
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  
  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  // Snapshot-specific method
  createSnapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<{snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>}>;

  // ... other methods
}

export type { SnapshotStoreMethods };
