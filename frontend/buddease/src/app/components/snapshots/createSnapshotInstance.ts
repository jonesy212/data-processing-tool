// createSnapshotInstance.ts
import * as snapshotApi from '@/app/api/SnapshotApi';
import { useSnapshotManager } from "@/app/components/hooks/useSnapshotManager";

import { SnapshotStoreOptions } from '@/app/components/snapshots/SnapshotStoreOptions';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { internalCache } from './../../utils/InternalCache';
import { createBaseSnapshot } from "./createBaseSnapshot";

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import {
  Snapshot
} from "./LocalStorageSnapshotStore";
import { default as SnapshotStore } from "./SnapshotStore";
import { SnapshotStoreConfig } from './SnapshotStoreConfig';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SnapshotStoreProps } from './useSnapshotStore';


function flatMap<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  array: SnapshotStoreConfig<T, K>[],
  callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => T
): T extends (infer I)[] ? I[] : T[] {
  return array.reduce((acc, value, index) => {
    const result = callback(value, index, array);
    return Array.isArray(result) ? [...acc, ...result] : [...acc, result];
  }, [] as any) as T extends (infer I)[] ? I[] : T[];
}


function compareSnapshots<T extends object>(snap1: T, snap2: T): Record<string, { snapshot1: unknown; snapshot2: unknown }> {
  const differences: Record<string, { snapshot1: unknown; snapshot2: unknown }> = {};

  // Get all keys from both objects (union of keys)
  const allKeys = new Set([...Object.keys(snap1), ...Object.keys(snap2)]);

  for (const key of allKeys) {
    // Type assertion since we know these are keys of the objects
    const typedKey = key as keyof T;
    
    // Check if both snapshots have this property
    if (typedKey in snap1 && typedKey in snap2) {
      const value1 = snap1[typedKey];
      const value2 = snap2[typedKey];

      // Deep comparison for objects/arrays
      if (!deepEqual(value1, value2)) {
        differences[key] = { 
          snapshot1: value1, 
          snapshot2: value2 
        };
      }
    }
  }

  return differences;
}


function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}


const createSnapshotInstance = <
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
  baseData: T,
  baseMeta: Map<string, Snapshot<T, K>>,
  snapshotId: string | null,
  category: Category | undefined,  snapshotStore: SnapshotStore<T, K> | null,
  snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, K> | null,
  isSubscribed: boolean = false,
  storeProps?: SnapshotStoreProps<T, K>,
  storeOptions?: SnapshotStoreOptions<T, K>,
): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const id = snapshotApi.fetchSnapshotById(String(snapshotId)).toString();
      const existingSnapshot = internalCache.get(id);

      if (existingSnapshot) {
        return resolve(existingSnapshot);
      }

      if (!storeProps) {
        throw new Error("storeProps is undefined");
      }

      // Create base snapshot
      const { data: baseSnapshot } = await createBaseSnapshot(
        baseData,
        baseMeta,
        storeProps,
        storeOptions
      );

      // Initialize private stores
      const snapshotStores = new Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>();
      if (snapshotStore) {
        snapshotStores.set(0, snapshotStore);
      }

      // Get snapshot manager if needed
      const activeSnapshotManager = snapshotManager || 
        (snapshotStore ? await useSnapshotManager<T, K, Meta>(snapshotStore.storeId) : null);

      // Create new instance with proper prototype
      const newSnapshot = Object.create(
        Object.getPrototypeOf(baseSnapshot)
      ) as Snapshot<T, K, Meta, ExcludedFields>;

      // Copy all properties from base snapshot
      Object.assign(newSnapshot, baseSnapshot, {
        equals: function(
          this: Snapshot<T, K, Meta, ExcludedFields>,
          other: Snapshot<T, K, Meta, ExcludedFields>
        ) {
          return compareSnapshots(this, other);
        },

        compareWith: function(
          this: Snapshot<T, K, Meta, ExcludedFields>,
          other: Snapshot<T, K, Meta, ExcludedFields>,
          options?: { compareData?: boolean }
        ) {
          return compareSnapshots(this, other, options?.compareData);
        },

        deepEquals: function(
          this: Snapshot<T, K, Meta, ExcludedFields>,
          other: Snapshot<T, K, Meta, ExcludedFields>
        ) {
          return deepEqual(this.data, other.data);
        }
      });

      // Define methods
      const methods = {
        manageSubscription: function(
          this: Snapshot<T, K, Meta, ExcludedFields>,
          snapshotId: string, 
          callback: Callback<Snapshot<T, K, Meta, ExcludedFields>>
        ) {
          if (this.id === snapshotId) {
            callback(this);
            const subscribed = Object.create(Object.getPrototypeOf(this));
            Object.assign(subscribed, this, { isSubscribed: true });
            return subscribed;
          }
          return this;
        },

        equals: function(this: Snapshot<T, K, Meta, ExcludedFields>, other: Snapshot<T, K, Meta, ExcludedFields>) {
          return other?.id && this.id === other.id && deepEqual(this.data, other.data);
        },

        getStores: () => activeSnapshotManager?.getAllSnapshots() || [],
        initializeStores: (stores: DataStore<T, K, Meta>[]) => {
          activeSnapshotManager?.initializeStores(stores);
        }
      };

      // Assign all properties and methods
      Object.assign(newSnapshot, {
        id,
        category,
        subscribed: isSubscribed,
        dataStores: [],
        auditRecords: [],
        deleted: false,
        ...methods,
        // Default implementations for required methods
        get: function(key: keyof T) {
          return this.data[key];
        },
        updateState: function(state: any) {
          this.state = { ...this.state, ...state };
        },
        getCurrentState: function() {
          return this.state;
        }
      });

      // Cache the new snapshot
      internalCache.set(id, newSnapshot);
      resolve(newSnapshot);

    } catch (error) {
      console.error('Error creating snapshot:', error);
      reject(error);
    }
  });
};

export { createSnapshotInstance };
