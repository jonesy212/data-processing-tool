import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ContentItem } from "../cards/DummyCardLoader";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { createSnapshotInstance } from "./snapshot";
 

interface SnapshotItem<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends Snapshot<T, Meta, K> {
  message?: string | undefined;
  itemContent?: ContentItem; 
  data: T | Map<string, Snapshot<T, Meta, K>> | null | undefined; // Data associated with the snapshot
}


class SnapshotList<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  private snapshots: SnapshotItem<T, Meta, K>[];
  private id: string;
  public category: string;
  constructor() {
    this.id = UniqueIDGenerator.generateSnapshoItemID(Date.now().toString());
    this.snapshots = [];
    this.category = "";
  }

  sortSnapshotByDate() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
        ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
        : 0;
      const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
        ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
        : 0;
      return aTimestamp - bTimestamp;
    });
  }
  sort() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
      ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
      : 0;
    const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
      ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
      : 0;
    return aTimestamp - bTimestamp;
    });
  }
  sortByDate() {
    this.sortSnapshotByDate();
  }

  filterByCategories(categories: Category[]) {
    // Filter snapshots by categories
    return this.snapshots.filter((snapshot) => {
      return categories.every((category) =>
        snapshot.categories?.includes(category)
      );
    });
  }

  getSnapshotList(snapshots: SnapshotItem<T, Meta, K>[]) {
    return snapshots;
  }


  getSnapshot(index: number): SnapshotItem<T, Meta, K> | undefined {
    return this.snapshots[index];
  }

  getSnapshots(): SnapshotItem<T, Meta, K>[] {
    return this.snapshots;
  }

  sortSnapshotItems() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
      ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
      : 0;
    const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
      ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
      : 0;
    return aTimestamp - bTimestamp;
    });
  }

  
  sortSnapshotsByUser() {
    this.snapshots.sort((a, b) => {
      if (a.user && b.user) {
        return a.user.username.localeCompare(b.user.username);  // Use the string property for sorting
      }
      return 0;  // Handle cases where `user` might be undefined
    });
  }

  sortSnapshotsByAlphabeticalOrder() {
    this.snapshots.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.text.localeCompare(b.label.text);  // Use the string property for sorting
      }
      return 0;  // Handle cases where `label` might be undefined
    });
  }

  sortSnapshotsByTags() {
    this.snapshots.sort((a, b) => {
      const aTags = (a.value && typeof a.value === 'object' && 'tags' in a.value && Array.isArray(a.value.tags)) ? a.value.tags : [];
      const bTags = (b.value && typeof b.value === 'object' && 'tags' in b.value && Array.isArray(b.value.tags)) ? b.value.tags : [];
      return aTags.join(",").localeCompare(bTags.join(","));
    });
  }

  // Methods to manipulate snapshot items
  addSnapshot(snapshot: SnapshotItem<T, Meta, K>) {
    snapshot.id = UniqueIDGenerator.generateSnapshoItemID(this.id);
    this.snapshots.push(snapshot);
  }

  fetchSnaphostById(id: string): SnapshotItem<T, Meta, K> | undefined {
    return this.snapshots.find((snapshot) => snapshot.id === id);
  }

  removeSnapshot(snapshotToRemove: string) {
    // Find the index of the snapshot with the specified ID
    const index = this.snapshots.findIndex(
      (snapshot) => snapshot.id === snapshotToRemove
    );

    // If the snapshot is found, remove it from the array
    if (index !== -1) {
      this.snapshots.splice(index, 1);
    }
  }

  // Implementing the Iterable interface
  [Symbol.iterator]() {
    let index = 0;
    const snapshots = this.snapshots;

    return {
      next(): IteratorResult<SnapshotItem<T, Meta, K>> {
        if (index < snapshots.length) {
          const value = snapshots[index++];
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  toArray(): SnapshotItem<T, Meta, K>[] {
    return this.snapshots;
  }
  // Other methods as needed
}



const createSnapshotItem = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | null,
  data: T,
  category: symbol | string | Category | undefined,
  snapshotStore: SnapshotStore<T, Meta, K> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K> | null
): SnapshotItem<T, Meta, K> => {
  const baseSnapshot = createSnapshotInstance(snapshotId, data, category, snapshotStore, snapshotStoreConfig);

  // Extend baseSnapshot with additional properties for SnapshotItem
  const snapshotItem: SnapshotItem<T, Meta, K> = {
    ...baseSnapshot, // Spread the baseSnapshot properties
    message: "Custom message",
    itemContent: undefined, // Add additional fields specific to SnapshotItem
    data, // This could be adjusted based on specific requirements
  };

  return snapshotItem;
};


export default SnapshotList;
export { createSnapshotItem };
export type { SnapshotItem };

