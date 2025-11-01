// utilMethods.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { Snapshot } from "@/app/types"; // adjust path to where Snapshot<T,K> lives
import { convertEventsToRecord } from '@/app/typings/convertSnapshotEvents';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import SnapshotStore from "@/app/snapshotstore";
import { SnapshotUnion, SnapshotsArray } from '@/LocalStorageSnapshotStore';




export const UtilMethods = {
  deepCompare: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    objA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    objB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let key of keysA) {
      if (objA[key as keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>] !== objB[key as keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]) {
        return false;
      }
    }

    return true;
  },

  shallowCompare: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
      objA: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      objB: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): boolean {
    return JSON.stringify(objA) === JSON.stringify(objB);
  },

  /**
   * Compare two full snapshots and return differences + version info
   */
  compareSnapshots: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: { compareData?: boolean }
  ): {
    snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    differences: Record<string, { snapshot1: any; snapshot2: any }>;
    versionHistory: { snapshot1Version: number; snapshot2Version: number };
  } | null {
    if (!snap1 || !snap2) return null;

    const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};
    const keysToCompare = options?.compareData ? ['data'] : Object.keys({ ...snap1, ...snap2 });

    for (const key of keysToCompare) {
      const val1 = (snap1 as any)[key];
      const val2 = (snap2 as any)[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences[key] = { snapshot1: val1, snapshot2: val2 };
      }
    }

    return {
      snapshot1: snap1,
      snapshot2: snap2,
      differences,
      versionHistory: {
        snapshot1Version: (snap1 as any).versionInfo?.version ?? 0,
        snapshot2Version: (snap2 as any).versionInfo?.version ?? 0,
      },
    };
  },


  /**
   * Compare snapshot items only by specific keys
   */
  compareSnapshotItems: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    snap1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snap2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    keys: (keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[]
  ): {
    itemDifferences: Record<
      keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      {
        snapshot1: any;
        snapshot2: any;
        differences: { [K in keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]?: { value1: any; value2: any } };
      }
    >;
  } | null {
    if (!snap1 || !snap2) return null;

    const itemDifferences: any = {};

    for (const key of keys) {
      const val1 = snap1[key];
      const val2 = snap2[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        itemDifferences[key] = {
          snapshot1: val1,
          snapshot2: val2,
          differences: { [key]: { value1: val1, value2: val2 } },
        };
      }
    }

    return { itemDifferences };
  },

  getEventsAsRecord: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return convertEventsToRecord(this.events);
  },

 getDataStoreMap: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<Map<string, DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    const dataStoreMap = new Map<string, DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

    try {
      for (const store of this.getDataStores()) {
        const id = store.id;
        if (id) {
          dataStoreMap.set(id.toString(), store);
        } else {
          console.warn("Data store missing ID:", store);
        }
      }

      return Promise.resolve(dataStoreMap);
    } catch (error) {
      console.error("Error getting data store map:", error);
      return Promise.reject(error);
    }
  },

  /**
   * Assign a prefix based on category
   */
  determinePrefix: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
    category: string
  ): string {
    const mapping: Record<string, string> = {
      user: "USR",
      team: "TM",
      project: "PRJ",
      task: "TSK",
      event: "EVT",
      file: "FIL",
      document: "DOC",
      message: "MSG",
      location: "LOC",
      coupon: "CPN",
      video: "VID",
      survey: "SRV",
      analytics: "ANL",
      chat: "CHT",
      thread: "THD",
      snapshot: "SNAP",
      store: "STR",
      config: "CFG",
      delegate: "DLG",
      subscriber: "SUB",
      notification: "NOT",
      version: "VER",
      metadata: "META"
    };

    if (mapping[category]) return mapping[category];
    if (snapshot?.name) return "SNAP";
    if (snapshot?.title) return snapshot.title.substring(0, 3).toUpperCase();
    return "GEN"; // Default prefix
  },

  determineCategory: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(input: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string): string {
    if (typeof input === 'string') {
      return input; // Already a category string
    }

    if ('storeId' in input) {
      // It's a SnapshotStore
      return input.category?.toString() || input.name || 'store';
    }

    if ('id' in input && 'data' in input) {
      // It's a Snapshot
      return input.category?.toString() ||
        (input.data as any)?.category ||
        (input.data as any)?.type ||
        'snapshot';
    }

    return 'unknown';
  },



  // utilMethods.ts
  getAllKeys: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    storeId: number,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;, T> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;, T, Meta, ExcludedFields>,
    data: T,
    category?: Category
  ): Promise<string[] | undefined> {
    try {
      const keys: string[] = [];

      // Add snapshot store keys
      if (snapshotStore.snapshotIds) {
        keys.push(...snapshotStore.snapshotIds);
      }

      // Add data store keys
      if (snapshotStore.getDataStores()) {
        snapshotStore.getDataStores().forEach(store => {
          if (store.id) keys.push(store.id.toString());
        });
      }

      // Add config keys
      if (snapshotStore.getConfigs()) {
        snapshotStore.getConfigs().forEach(config => {
           if (config.id !== undefined && config.id !== null) {
            keys.push(String(config.id)); // ensure it's a string
          }
        });
      }

      return Promise.resolve(keys.length > 0 ? keys : undefined);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return Promise.resolve(undefined);
    }
  },

  getAllValues: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const values: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];

    // This would typically be implemented to return all snapshot values
    // For now, returning empty array as placeholder
    return values;
  },

  getAllItems: async function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
  },

  getSnapshotEntries: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
  },

getAllSnapshotEntries: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(): Map<string, T>[] {
    const allEntries: Map<string, T>[] = [];

    try {
      if (this.snapshots && Array.isArray(this.snapshots)) {
        for (const snapshot of this.snapshots) {
          const entries = this.getSnapshotEntries(snapshot.id?.toString() || '');
          if (entries) {
            allEntries.push(entries);
          }
        }
      }

      return allEntries;
    } catch (error) {
      console.error('Error getting all snapshot entries:', error);
      return [];
    }
  }
}