
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { SnapshotStoreOptions } from '../hooks/SnapshotStoreOptions';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { Data } from '../models/data/Data';
import { Callback, MultipleEventsCallbacks } from '../snapshots/index';
import { Snapshot } from '../snapshots/LocalStorageSnapshotStore';


class SnapshotStoreComponent<T extends Data, Meta extends UnifiedMetaDataOptions,
  K extends Data = T> {
  private id: string | number | null;
  private category: symbol | string | Category | undefined;
  private snapshots: Map<string, Snapshot<T, Meta, K>>;
  private callbacks: MultipleEventsCallbacks<Snapshot<T, Meta, K>>;

  constructor(options: SnapshotStoreOptions<T, Meta, K>) {
    this.id = options.id
    this.category = options.category;
    this.snapshots = new Map<string, Snapshot<T, Meta, K>>();
    this.callbacks = options.callbacks || {};
  }

  // Method to add a snapshot
  addSnapshot(snapshot: Snapshot<T, Meta, K>): void {
    if (!snapshot || !snapshot.id) {
      throw new Error('Invalid snapshot data.');
    }
    this.snapshots.set(snapshot.id.toString(), snapshot);
    this.triggerCallbacks('add', snapshot);
  }

  // Method to remove a snapshot
  removeSnapshot(id: string): boolean {
    if (!this.snapshots.has(id)) {
      console.warn(`Snapshot with id ${id} does not exist.`);
      return false;
    }
    const removed = this.snapshots.get(id);
    this.snapshots.delete(id);
    if (removed) this.triggerCallbacks('remove', removed);
    return true;
  }

  // Method to update a snapshot
  updateSnapshot(snapshot: Snapshot<T, Meta, K>): void {
    if (!snapshot || !snapshot.id) {
      throw new Error('Invalid snapshot data.');
    }
    if (!this.snapshots.has(snapshot.id.toString())) {
      throw new Error(`Snapshot with id ${snapshot.id} does not exist.`);
    }
    this.snapshots.set(snapshot.id.toString(), snapshot);
    this.triggerCallbacks('update', snapshot);
  }

  // Method to retrieve a snapshot
  getSnapshot(id: string): Snapshot<T, Meta, K> | undefined {
    return this.snapshots.get(id);
  }

  // Method to retrieve all snapshots
  getAllSnapshots(): Snapshot<T, Meta, K>[] {
    return Array.from(this.snapshots.values());
  }

  // Method to trigger callbacks
  private triggerCallbacks(event: string, snapshot: Snapshot<T, Meta, K>): void {
    const eventCallbacks = this.callbacks[event] || [];
    eventCallbacks.forEach(callback => callback(snapshot));

    // Trigger 'default' callbacks if defined
    const defaultCallbacks = this.callbacks['default'] || [];
    defaultCallbacks.forEach(callback => callback(snapshot));
  }

  // Method to register a callback for an event
  on(event: string, callback: Callback<Snapshot<T, Meta, K>>): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // Method to unregister a callback for an event
  off(event: string, callback: Callback<Snapshot<T, Meta, K>>): void {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  // Method to clear all snapshots
  clearSnapshots(): void {
    this.snapshots.clear();
    this.triggerCallbacks('clear', {} as Snapshot<T, Meta, K>); // Trigger clear event
  }

  // Method to find snapshots by a specific criterion
  findSnapshotsByCriterion(predicate: (snapshot: Snapshot<T, Meta, K>) => boolean): Snapshot<T, Meta, K>[] {
    return Array.from(this.snapshots.values()).filter(predicate);
  }

  // Method to sort snapshots
  sortSnapshots(compareFn: (a: Snapshot<T, Meta, K>, b: Snapshot<T, Meta, K>) => number): Snapshot<T, Meta, K>[] {
    return Array.from(this.snapshots.values()).sort(compareFn);
  }

  // Method to categorize snapshots
  categorizeSnapshots(): Map<string, Snapshot<T, Meta, K>[]> {
    const categories = new Map<string, Snapshot<T, Meta, K>[]>();
    this.snapshots.forEach((snapshot) => {
      const category = snapshot.category ?? 'uncategorized';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(snapshot);
    });
    return categories;
  }

  // Method to convert snapshot store to a plain object for serialization
  toObject(): Record<string, any> {
    const obj: Record<string, any> = {
      id: this.id,
      category: this.category,
      snapshots: {},
    };
    this.snapshots.forEach((snapshot, id) => {
      obj.snapshots[id] = snapshot;
    });
    return obj;
  }
}
export default SnapshotStoreComponent