import SubscriberCollection from '@/app/components/snapshots/SnapshotStore';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { Snapshot, SnapshotUnion } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

interface SnapshotStorePublicMethods<
  T extends BaseData,
  K extends T = T> {
  // Method to retrieve snapshot items
  getSnapshotItems(): Snapshot<T, K>[];

  // Method to find the index of a snapshot item
  findIndex(predicate: (snapshot: SnapshotUnion<T, K>) => boolean): number;

  // Method to splice items from the snapshot
  splice(start: number, deleteCount: number): Snapshot<T, K>[];

  // Methods for snapshot store management
  saveSnapshotStore(): void;
  addSnapshotToStore(
    storeId: number,
    snapshot: Snapshot<T, K>, 
    snapshotStore: SnapshotStore<T, K>, 
    snapshotStoreData: SnapshotStore<T, K>, 
    category: Category, 
    categoryProperties: CategoryProperties | undefined, 
    subscribers: SubscriberCollection<T, K>
  ): void;
  determineSnapshotStoreCategory(storeId: number, snapshotStore: SnapshotStore<T, K>, configs: SnapshotStoreConfig<T, K>[]): string;
  getSnapshotStoreData(): any; // Define a more specific type if possible

  // Additional methods as needed
  addNestedStore(store: SnapshotStore<T, K>): void;
  removeSnapshot(id: string): void;
  clearSnapshots(): void;
  // ...other methods
}


export type { SnapshotStorePublicMethods };
