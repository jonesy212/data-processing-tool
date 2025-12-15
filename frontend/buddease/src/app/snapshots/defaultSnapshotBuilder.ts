// defaultSnapshotBuilder.ts
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta
} from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';

import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';

import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotConfigBuilder } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { Subscribers } from '@/app/subscribers/Subscriber';
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { Snapshot } from './Snapshot';
import { default as SnapshotStore } from './SnapshotStore';

// Utility: flatten map
function flatMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
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
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  baseData: T,
  baseMeta: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeOptions?: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotConfigBuilder<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    buildBaseConfig: async () => ({
      data: baseData,
      meta: baseMeta,
      props: storeProps,
      options: storeOptions || {},
      id, category, mappedSnapshot, mappedMeta, 
      
    }),

    buildStoreMethods: async () => ({} as StoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildEventHandlers: async () => ({} as EventHandlers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildSnapshotStore: async () => ({} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildSnapshotUnion: async () => ({} as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildLifecycle: async () => ({} as Lifecycle<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildMeta: async () => ({} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildStoreConfig: async () => ({} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildSnapshotEvents: async () => ({} as SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildContainer: async () => ({} as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildSubscribers: async () => ({} as Subscribers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildWithCriteria: async () => ({} as SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    buildManager: async () => ({} as SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
  };
}


export { compareSnapshots, defaultSnapshotBuilder, flatMap };
