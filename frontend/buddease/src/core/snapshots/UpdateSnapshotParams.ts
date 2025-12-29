// UpdateSnapshotParams.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { SnapshotManager } from "@/core/hooks/useSnapshotManager";
import { UpdateSnapshotPayload } from '@/core/interfaces/payload/payloadTypes';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
;

interface UpdateSnapshotParams<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
 snapshotId: string | number | null;
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp: Date;
  payload: UpdateSnapshotPayload<T>;
  category?: Category;
  payloadData: T | K;
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export type { UpdateSnapshotParams };
