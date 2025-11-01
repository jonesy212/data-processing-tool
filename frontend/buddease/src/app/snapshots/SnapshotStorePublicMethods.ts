import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

interface SnapshotStorePublicMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Method to retrieve snapshot items
  getSnapshotItems(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Method to find the index of a snapshot item
  findIndex(
    predicate: (snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ): number;

  // Method to splice items from the snapshot
  splice(
    start: number,
    deleteCount: number
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Methods for snapshot store management
  saveSnapshotStore(): void;
  addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotStoreData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    category: Category, 
    categoryProperties: CategoryProperties | undefined, 
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;
  
  determineSnapshotStoreCategory(
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): string;
  
  getSnapshotStoreData(): any; // can be more specific if you know the type

  // Additional methods
  addNestedStore(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  removeSnapshot(id: string): void;
  clearSnapshots(): void;
  // ...other methods
}



export type { SnapshotStorePublicMethods };
