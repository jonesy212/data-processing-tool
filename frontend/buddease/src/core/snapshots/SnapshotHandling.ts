// SnapshotHandling.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { Data } from '@/core/models/data/Data';
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { Snapshots, SnapshotsArray, SnapshotsObject } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotEvent } from '@/core/typings/snapshotTypes';

import type { Attachment } from '@/core/documents/attachment/Attachment';


interface SnapshotHandling<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  mapSnapshots(
    storeIds: number[],
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Data,
    callback: (
      storeIds: number[],
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      index: number,
      category?: Category,
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
  ): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>    

  createSnapshotStore: (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotStoreData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    category?: Category
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
    
  updateSnapshotStore: (
    id: string,
    snapshotId: number,
    snapshotStoreData: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?:  Category,
    callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

  initSnapshot: (
    snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    category?: Category
  ) => void;

  deleteSnapshot: (id: string) => void;

  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, b: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string) => Promise<void>;
}
