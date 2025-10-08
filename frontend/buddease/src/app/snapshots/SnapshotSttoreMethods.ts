// SnapshotSttoreMethods.ts

import { Category } from "@/app/components/libraries/categories/generateCategoryProperties";
import { StatusType } from "@/app/components/models/data/StatusType";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { SnapshotStoreMap } from '@/app/snapshots/SnapshpshotMethods';
import { Snapshot, SnapshotStoreConfig } from ".";
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreReference } from "./SnapshotStoreReference";
import { SnapshotStoreProps } from "./useSnapshotStore";

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
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string,
    endpointCategory: string | number,
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription: Subscription<T, K, Meta, ExcludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
  ) => Promise<{snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>}>;

  // ... other methods
}

export type { SnapshotStoreMethods };
