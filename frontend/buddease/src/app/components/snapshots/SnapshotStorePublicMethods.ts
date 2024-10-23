import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { Snapshot, SnapshotUnion } from "./LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotStorePublicMethods<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  // Method to retrieve snapshot items
  getSnapshotItems(): Snapshot<T, Meta, K>[];

  // Method to find the index of a snapshot item
  findIndex(predicate: (snapshot: SnapshotUnion<T, Meta>) => boolean): number;

  // Method to splice items from the snapshot
  splice(start: number, deleteCount: number): Snapshot<T, Meta, K>[];

  // Methods for snapshot store management
  saveSnapshotStore(): void;
  addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, Meta, K>, 
    snapshotStore: SnapshotStore<T, Meta, K>, 
    snapshotStoreData: SnapshotStore<T, Meta, K>, 
    category: Category, 
    categoryProperties: CategoryProperties | undefined, 
    subscribers: SubscriberCollection<T, Meta, K>
  ): void;
  determineSnapshotStoreCategory(storeId: number, snapshotStore: SnapshotStore<T, Meta, K>, configs: SnapshotStoreConfig<T, Meta, K>[]): string;
  getSnapshotStoreData(): any; // Define a more specific type if possible

  // Additional methods as needed
  addNestedStore(store: SnapshotStore<T, Meta, K>): void;
  removeSnapshot(id: string): void;
  clearSnapshots(): void;
  // ...other methods
}


export type { SnapshotStorePublicMethods };
