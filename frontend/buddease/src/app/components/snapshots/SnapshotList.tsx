import { Snapshot } from "@/app/components/snapshots/SnapshotStore";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Data } from "../models/data/Data";

interface SnapshotItem {
  user: any;
  id: string;
  value: Snapshot<Data>;
  label: string;
  category: string;
  categories?: string[];
  updatedAt: Date | undefined
  // Define properties of a snapshot item
}

class SnapshotList {
  private snapshots: SnapshotItem[];
  private id: string;
  public category: string;
  constructor() {
    this.id = UniqueIDGenerator.generateSnapshoItemID(Date.now().toString());
    this.snapshots = [];
    this.category = "";
  }

  sortSnapshotByDate() {
    this.snapshots.sort((a, b) => {
      return (
        (a.value?.timestamp?.getTime() ?? 0) -
        (b.value?.timestamp?.getTime() ?? 0)
      );
    });
  }
  sort() {
    this.snapshots.sort((a, b) => {
      return (
        (a.value?.timestamp?.getTime() as number) -
        (b.value?.timestamp?.getTime() as number)
      );
    });
  }
  sortByDate() {
    this.sortSnapshotByDate();
  }

  filterByCategories(categories: string[]) {
    // Filter snapshots by categories
    return this.snapshots.filter((snapshot) => {
      return categories.every((category) =>
        snapshot.categories?.includes(category)
      );
    });
  }

  getSnapshotList(snapshots: SnapshotItem[]) {
    return snapshots;
  }

  sortSnapshotItems() {
    this.snapshots.sort((a, b) => {
      return (
        (a.value?.timestamp?.getTime() as number) -
        (b.value?.timestamp?.getTime() as number)
      );
    });
  }

  sortSnapshotsByUser() {
    this.snapshots.sort((a, b) => {
      return a.user.localeCompare(b.user);
    });
  }

  sortSnapshotsByAlpabeticalOrder() {
    this.snapshots.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }

  sortSnapshotsByTags() {
    this.snapshots.sort((a, b) => {
      const aTags = a.value.tags || [];
      const bTags = b.value.tags || [];
      return aTags.join(",").localeCompare(bTags.join(","));
    });
  }

  // Methods to manipulate snapshot items
  addSnapshot(snapshot: SnapshotItem) {
    snapshot.id = UniqueIDGenerator.generateSnapshoItemID(this.id);
    this.snapshots.push(snapshot);
  }

  fetchSnaphostById(id: string): SnapshotItem | undefined {
    return this.snapshots.find((snapshot) => snapshot.id === id);
  }

  removeSnapshot(snapshotId: string) {
    // Find the index of the snapshot with the specified ID
    const index = this.snapshots.findIndex(
      (snapshot) => snapshot.value.id === snapshotId
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
      next(): IteratorResult<Snapshot<Data>> {
        if (index < snapshots.length) {
          const value = snapshots[index++];
          // Assuming `value` contains a `Snapshot<Data>` object
          return { value: value.value, done: false }; // Return `value.value` instead of `value`
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  toArray(): SnapshotItem[] {
    return this.snapshots;
  }
  // Other methods as needed
}

export default SnapshotList;
export type { SnapshotItem };
