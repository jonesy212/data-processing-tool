// createSnapshotInstance.ts
import {
  BaseDataEntity,
  BaseDataRoot,
  DefaultExcludedFields,
  DefaultMeta,
  ExcludedFields
} from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotContainer, SnapshotUnion, SnapshotWithCriteria } from '.';

import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';

import { Subscribers } from '@/app/subscribers/Subscriber';
import { SnapshotConfigBuilder } from '@/app/snapshots/SnapshpshotConfigBuilder';
import { SnapshotEvents } from '@/app/snapshots/SnapshpshotEvents';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshpshotStoreConfig';
import { SnapshotStoreProps } from '@/useSnapshotStore';
import { Snapshot } from "./Snapshot";
import { default as SnapshotStore } from "./SnapshotStore";

// Utility: flatten map
function flatMap<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  callback: (
    value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    index: number, 
    array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => T
): T extends (infer I)[] ? I[] : T[] {
  return array.reduce((acc, value, index) => {
    const result = callback(value, index, array);
    return Array.isArray(result) ? [...acc, ...result] : [...acc, result];
  }, [] as any) as T extends (infer I)[] ? I[] : T[];
}

// Utility: compare snapshots
function compareSnapshots<T extends object>(
  snap1: T,
  snap2: T,
  options?: { compareData?: boolean }
): Record<string, { snapshot1: unknown; snapshot2: unknown }> {
  const differences: Record<string, { snapshot1: unknown; snapshot2: unknown }> = {};
  const allKeys = new Set([...Object.keys(snap1), ...Object.keys(snap2)]);

  for (const key of allKeys) {
    const typedKey = key as keyof T;

    if (typedKey in snap1 && typedKey in snap2) {
      const value1 = snap1[typedKey];
      const value2 = snap2[typedKey];

      if (options?.compareData ?? true) {
        if (!deepEqual(value1, value2)) {
          differences[key] = { snapshot1: value1, snapshot2: value2 };
        }
      }
    }
  }
  return differences;
}

// Utility: deep equality
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

function defaultSnapshotBuilder<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Excluded extends keyof T = DefaultExcludedFields<T>
>(
  baseData: T,
  baseMeta: Map<string, Snapshot<T, K, Meta, Excluded>>,
  storeProps: SnapshotStoreProps<T, K, Meta, Excluded>,
  storeOptions?: SnapshotStoreOptions<T, K, Meta, Excluded>
): SnapshotConfigBuilder<T, K, Meta, Excluded> {
  return {
    buildBaseConfig: async () => ({
      data: baseData,
      meta: baseMeta,
      props: storeProps,
      options: storeOptions || {},
      id, category, mappedSnapshot, mappedMeta, 
      
    }),

    buildStoreMethods: async () => ({} as StoreMethods<T, K, Meta, Excluded>),
    buildEventHandlers: async () => ({} as EventHandlers<T, K, Meta, Excluded>),
    buildSnapshotStore: async () => ({} as SnapshotStore<T, K, Meta, Excluded>),
    buildSnapshotUnion: async () => ({} as SnapshotUnion<T, K, Meta, Excluded>),
    buildLifecycle: async () => ({} as Lifecycle<T, K, Meta, Excluded>),
    buildMeta: async () => ({} as UnifiedMetadata<T, K, Meta, Excluded>),
    buildStoreConfig: async () => ({} as SnapshotStoreConfig<T, K, Meta, Excluded>),
    buildSnapshotEvents: async () => ({} as SnapshotEvents<T, K, Meta, Excluded>),
    buildContainer: async () => ({} as SnapshotContainer<T, K, Meta, Excluded>),
    buildSubscribers: async () => ({} as Subscribers<T, K, Meta, Excluded>),
    buildWithCriteria: async () => ({} as SnapshotWithCriteria<T, K, Meta, Excluded>),
    buildManager: async () => ({} as SnapshotManager<T, K, Meta, Excluded>),
  };
}


export { compareSnapshots, defaultSnapshotBuilder, flatMap };
