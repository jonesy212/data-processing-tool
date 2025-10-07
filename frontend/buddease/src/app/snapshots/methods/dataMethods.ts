import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { StatusType } from "@/app/models/data/StatusType";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { isSnapshot } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotsArray } from '@/snapshots/LocalStorageSnapshotStore';
import { SnapshotUnion } from '@/LocalStorageSnapshotStore';
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from '@/app/snapshots/SnapshpshotStore';

export function addDataSnapshot<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
  // Ensure dataStoreMethods is defined and has the addData method
  this.dataStoreMethods?.addData(data);

  // Ensure data.id is a number before passing to addDataStatus
  const idAsNumber =
    typeof data.id === "string" ? parseInt(data.id, 10) : data.id;

  // Add a check to handle NaN cases if needed
  if (!isNaN(idAsNumber)) {
    this.dataStoreMethods?.addDataStatus(idAsNumber, StatusType.Pending);
  } else {
    console.error("Invalid ID: Not a number");
  }
}

export function getData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  id: number | string,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  const snapshot = snapshotStore.getSnapshot(id); // Assuming this returns Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  
  // Use the existing type guard function to verify if it's a valid snapshot
  if (snapshot && isSnapshot(snapshot) && snapshot !== undefined) {
    return Promise.resolve(snapshot);
  }
  
  return Promise.reject(
    new Error(`Snapshot with id ${id} is not of type Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`)
  );
}

export function removeData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number): void {
  if (this.dataStoreMethods?.removeData) {
    return this.dataStoreMethods.removeData(id);
  }
  throw new Error("removeData method is not implemented in dataStoreMethods");
}

export function updateData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
  if (this.dataStoreMethods?.updateData) {
    return this.dataStoreMethods.updateData(id, newData);
  }
  throw new Error("updateData method is not implemented in dataStoreMethods");
}

export function updateDataTitle<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number, title: string): void {
  if (this.dataStoreMethods?.updateDataTitle) {
    return this.dataStoreMethods.updateDataTitle(id, title);
  }
  throw new Error("updateDataTitle method is not implemented in dataStoreMethods");
}

export function updateDataDescription<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number, description: string): void {
  if (this.dataStoreMethods?.updateDataDescription) {
    return this.dataStoreMethods.updateDataDescription(id, description);
  }
  throw new Error("updateDataDescription method is not implemented in dataStoreMethods");
}

export function updateDataStatus<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number, status: StatusType | undefined): void {
  if (this.dataStoreMethods?.updateDataStatus) {
    return this.dataStoreMethods.updateDataStatus(id, status);
  }
  throw new Error("updateDataStatus method is not implemented in dataStoreMethods");
}

export function addDataSuccess<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }): void {
  if (this.dataStoreMethods?.addDataSuccess) {
    return this.dataStoreMethods.addDataSuccess(payload);
  }
  throw new Error("addDataSuccess method is not implemented in dataStoreMethods");
}

export function addDataStatus<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: number, status: StatusType | undefined): void {
  if (this.dataStoreMethods?.addDataStatus) {
    return this.dataStoreMethods.addDataStatus(id, status);
  }
  throw new Error("addDataStatus method is not implemented in dataStoreMethods");
}




// dataMethods.ts
export function setData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
  try {
    if (!this.dataStore) {
      throw new Error("Data store is not initialized");
    }

    // Clear existing data for this ID
    this.dataStore.delete(id);
    
    // Set new data
    data.forEach((snapshot, key) => {
      this.dataStore.set(key, snapshot);
    });

    // Update the snapshot store reference
    this.snapshots = Array.from(data.values());
    
    // Notify subscribers of data change
    this.notifySubscribers(`Data set for ID: ${id}`, this.subscribers || [], {
      operation: 'setData',
      id,
      dataSize: data.size
    });

  } catch (error) {
    console.error(`Error setting data for ID ${id}:`, error);
    throw new Error(`Failed to set data: ${error.message}`);
  }
}


export function addDataPartial<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(this: SnapshotStore<T, K, Meta, ExcludedFields>, id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
  try {
    if (!this.dataStore) {
      throw new Error("Data store is not initialized");
    }

    // Get existing snapshot or create new one
    let existingSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
    if (this.dataStore.has(id)) {
      existingSnapshot = this.dataStore.get(id);
    }

    // Merge with existing data or create new snapshot
    const mergedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...(existingSnapshot || {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
      ...data,
      id: data.id || id,
      timestamp: data.timestamp || new Date(),
      updatedAt: new Date()
    };

    // Store the merged snapshot
    this.dataStore.set(id, mergedSnapshot);

    // Update snapshots array if it exists
    const existingIndex = this.snapshots.findIndex(s => s.id === id);
    if (existingIndex !== -1) {
      this.snapshots[existingIndex] = mergedSnapshot;
    } else {
      this.snapshots.push(mergedSnapshot);
    }

    // Update snapshot items if they exist
    if (this.snapshotItems) {
      const itemIndex = this.snapshotItems.findIndex(item => 
        (item as SnapshotItem<T, K, Meta, ExcludedFields>).id === id
      );
      if (itemIndex !== -1) {
        this.snapshotItems[itemIndex] = {
          ...this.snapshotItems[itemIndex],
          snapshot: mergedSnapshot
        } as SnapshotItem<T, K, Meta, ExcludedFields>;
      }
    }

    // Notify subscribers
    this.notifySubscribers(`Data added for ID: ${id}`, this.subscribers || [], {
      operation: 'addData',
      id,
      snapshot: mergedSnapshot
    });

  } catch (error) {
    console.error(`Error adding data for ID ${id}:`, error);
    throw new Error(`Failed to add data: ${error.message}`);
  }
}





export function getAllKeys<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  storeId: number,
  snapshotId: string,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  snapshot: Snapshot<SnapshotUnion<T, K, Meta>, T> | null,
  timestamp: string | number | Date | undefined,
  type: string,
  event: SnapshotEvent<T, K, Meta, ExcludedFields>,
  id: number,
  snapshotStore: SnapshotStore<SnapshotUnion<T, K, Meta>, T, Meta, ExcludedFields>,
  data: T
): Promise<string[] | undefined> {
  try {
    const keys: string[] = [];
    
    // Add snapshot store keys
    if (snapshotStore.snapshotIds) {
      keys.push(...snapshotStore.snapshotIds);
    }
    
    // Add data store keys
    if (snapshotStore.dataStores) {
      snapshotStore.dataStores.forEach(store => {
        if (store.id) keys.push(store.id.toString());
      });
    }
    
    // Add config keys
    if (snapshotStore.configs) {
      snapshotStore.configs.forEach(config => {
        if (config.id) keys.push(config.id);
      });
    }
    
    return Promise.resolve(keys.length > 0 ? keys : undefined);
  } catch (error) {
    console.error('Error getting all keys:', error);
    return Promise.resolve(undefined);
  }
}

export function getAllValues<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): SnapshotsArray<T, K, Meta> {
  const values: SnapshotsArray<T, K, Meta> = [];
  
  // This would typically be implemented to return all snapshot values
  // For now, returning empty array as placeholder
  return values;
}

export async function getAllItems<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
  try {
    const items: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    
    // Add all snapshots from the store
    if (this.snapshots && Array.isArray(this.snapshots)) {
      items.push(...this.snapshots.filter(s => s !== null && s !== undefined));
    }
    
    // Add snapshot items if available
    if (this.snapshotItems && Array.isArray(this.snapshotItems)) {
      for (const item of this.snapshotItems) {
        if ('snapshot' in item && item.snapshot) {
          items.push(item.snapshot);
        }
      }
    }
    
    return items.length > 0 ? items : undefined;
  } catch (error) {
    console.error('Error getting all items:', error);
    return undefined;
  }
}

export function getSnapshotEntries<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotId: string
): Map<string, T> | undefined {
  try {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return undefined;
    
    const entries = new Map<string, T>();
    
    // Add basic snapshot properties
    if (snapshot.id) entries.set('id', snapshot.id as unknown as T);
    if (snapshot.data) entries.set('data', snapshot.data);
    if (snapshot.timestamp) entries.set('timestamp', snapshot.timestamp as unknown as T);
    if (snapshot.category) entries.set('category', snapshot.category as unknown as T);
    
    // Add metadata entries if available
    if (snapshot.meta && typeof snapshot.meta === 'object') {
      Object.entries(snapshot.meta).forEach(([key, value]) => {
        entries.set(`meta.${key}`, value as unknown as T);
      });
    }
    
    return entries.size > 0 ? entries : undefined;
  } catch (error) {
    console.error('Error getting snapshot entries:', error);
    return undefined;
  }
}
