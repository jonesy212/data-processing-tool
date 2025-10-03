import { SubscriberCollection } from '@/app/users/SubscriberCollection'
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData } from "@/app/models/data/Data";
import { Snapshot } from "./Snapshot";
import {  SnapshotUnion } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotStorePublicMethods<
  T extends BaseDataEntity,
  K extends T = T> {
  // Method to retrieve snapshot items
  getSnapshotItems(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Method to find the index of a snapshot item
  findIndex(predicate: (snapshot: SnapshotUnion<T, K, Meta, ExcludedFields>) => boolean): number;

  // Method to splice items from the snapshot
  splice(start: number, deleteCount: number): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Methods for snapshot store management
  saveSnapshotStore(): void;
  addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, 
    snapshotStoreData: SnapshotStore<T, K, Meta, ExcludedFields>, 
    category: Category, 
    categoryProperties: CategoryProperties | undefined, 
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
  ): void;
  determineSnapshotStoreCategory(storeId: number, snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): string;
  getSnapshotStoreData(): any; // Define a more specific type if possible

  // Additional methods as needed
  addNestedStore(store: SnapshotStore<T, K, Meta, ExcludedFields>): void;
  removeSnapshot(id: string): void;
  clearSnapshots(): void;
  // ...other methods
}


export type { SnapshotStorePublicMethods };
