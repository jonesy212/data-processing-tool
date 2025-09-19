import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from './BaseConfig';
import { Snapshot } from "@/app/components/snapshots/Snapshot";
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions, useSnapshotManager } from "../hooks/useSnapshotManager";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { CreateSnapshotStoresPayload, CreateSnapshotsPayload, Payload, UpdateSnapshotPayload } from "../../../server/database/Payload";
import { SnapshotWithCriteriaContract, TagsRecord, data } from "./SnapshotWithCriteria";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { Category } from "../libraries/categories/generateCategoryProperties";

interface UpdateSnapshotParams<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
 snapshotId: string | number | null;
  data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>;
  snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>;
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>;
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[];
  newData: Snapshot<T, K, Meta, ExcludedFields>;
  timestamp: Date;
  payload: UpdateSnapshotPayload<T>;
  category: Category | undefined;
  payloadData: T | K;
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, ExcludedFields>>;
  delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[];
  store: SnapshotStore<any, K, Meta, ExcludedFields>;
}

export { UpdateSnapshotParams }