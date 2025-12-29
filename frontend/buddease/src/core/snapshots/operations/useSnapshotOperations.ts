// useSnapshotOperations.ts
// hooks/useSnapshotOperations.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { useCallback, useRef } from 'react';

import { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import {
    clearSnapshotFailure,
    configureSnapshot,
    createMockSnapshot,
    getChildIds,
    getParentId,
    getSnapshot,
    getSnapshotById,
    getSnapshotItems,
    getSnapshots,
    handleSnapshot,
    mapSnapshots,
    removeSnapshot,
    SnapshotOperations,
    takeSnapshot,
    updateSnapshot,
    validateSnapshot
} from '@/core/snapshots/snapshotOperations';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { Subscriber } from '@/core/subscribers/Subscriber';

const useSnapshotOperations = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  

  // Add this before the useSnapshotOperations function
  const initialValue: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    mapSnapshot: () => ({} as any),
    mapSnapshotWithDetails: () => ({} as any),
    removeStore: () => {},
    fetchSnapshot: async () => ({} as any),
    fetchSnapshotSuccess: () => {},
    updateSnapshotFailure: () => {},
    fetchSnapshotFailure: () => {},
    configureSnapshotStore: () => {},
    onSnapshot: () => {},
    onSnapshots: () => {},
    events: [],
    parentId: '',
    // ... all other required methods with default implementations
  };
  // Use ref to maintain stable operations across re-renders
  const operationsRef = useRef<SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(initialValue);

  if (!operationsRef.current) {
    operationsRef.current = {
      // Existing methods
      mapSnapshot: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        // Implement mapping logic
        return { ...snapshot, mapped: true };
      }, []),

      mapSnapshotWithDetails: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        // Implement detailed mapping logic
        return { ...snapshot, details: 'mapped-with-details' };
      }, []),

      removeStore: useCallback((id: string) => {
        // Implement remove store logic
        console.log('Removing store:', id);
      }, []),

      fetchSnapshot: useCallback(async (id: string) => {
        return getSnapshot(id, 0, createMockSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), 'type', {} as any, {} as any);
      }, []),

      fetchSnapshotSuccess: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log('Snapshot fetched successfully:', snapshot.id);
      }, []),

      updateSnapshotFailure: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, error: Error) => {
        console.error('Snapshot update failed:', snapshot.id, error);
      }, []),

      fetchSnapshotFailure: useCallback((id: string, error: Error) => {
        console.error('Snapshot fetch failed:', id, error);
      }, []),

      configureSnapshotStore: useCallback((options: any) => {
        console.log('Configuring snapshot store:', options);
      }, []),

      onSnapshot: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log('Snapshot received:', snapshot.id);
      }, []),

      onSnapshots: useCallback((snapshots: any) => {
        console.log('Snapshots received:', snapshots.length);
      }, []),

      events: [],
      parentId: '',

      // New methods with implementations
      getParentId: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return getParentId(snapshot.id, snapshot as any);
      }, []),

      getChildIds: useCallback((id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return getChildIds(id, childSnapshot as any);
      }, []),

      clearSnapshotFailure: useCallback(() => {
        return clearSnapshotFailure();
      }, []),

      validateSnapshot: useCallback((snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        return validateSnapshot(snapshot as any);
      }, []),

      getSnapshot: useCallback(async (id: string) => {
        return getSnapshot(id, 0, createMockSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), 'type', {} as any, {} as any);
      }, []),

      takeSnapshot: useCallback(async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
        return takeSnapshot(snapshot as any, subscribers as any);
      }, []),

      removeSnapshot: useCallback((snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        removeSnapshot(snapshotToRemove as any);
      }, []),

      updateSnapshot: useCallback(async (
        snapshotId: string,
        data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        events: Record<string, any[]>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems: any[],
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payload: any,
        store: SnapshotStore<any, any>
      ) => {
        return updateSnapshot(snapshotId, snapshotId, data as any, newData as any, events, snapshotStore as any, dataItems, payload, store);
      }, []),

      getSnapshots: useCallback((category: string, data: any) => {
        return getSnapshots(category, data);
      }, []),

      getSnapshotItems: useCallback(async (category: any, snapshots: any) => {
        return getSnapshotItems(category, snapshots);
      }, []),

      getSnapshotContainer: useCallback(async (
        id: string | number,
        snapshotFetcher: (id: string | number) => Promise<any>
      ) => {
        return getSnapshotContainer(id, snapshotFetcher);
      }, []),

      // New methods from the provided logic
      mapSnapshots: useCallback(async (
        storeIds: number[],
        snapshotId: string,
        category: any,
        categoryProperties: any,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: any,
        type: string,
        event: any,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: any,
        callback: any
      ) => {
        return mapSnapshots(storeIds, snapshotId, category, categoryProperties, snapshot, timestamp, type, event, id, snapshotStore, data, callback);
      }, []),

      getSnapshotById: useCallback(async (
        fetchSnapshot: (id: string) => Promise<any>,
        id: string,
        snapshotProvider: (data: any) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => {
        return getSnapshotById(fetchSnapshot, id, snapshotProvider);
      }, []),

      handleSnapshot: useCallback(async (
        id: string,
        snapshotId: string,
        data: any,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
        snapshotData: any,
        category: any,
        callback: any,
        snapshots: any,
        type: string,
        event: any,
        snapshotContainer?: any,
        snapshotStoreConfig?: any
      ) => {
        return handleSnapshot(id, snapshotId, data, snapshot, snapshotData, category, callback, snapshots, type, event, snapshotContainer, snapshotStoreConfig);
      }, []),

      configureSnapshot: useCallback((
        id: string,
        category?: any,
        callback?: any,
        snapshotData?: any,
        snapshotStoreConfig?: any,
        subscribers?: any
      ) => {
        return configureSnapshot(id, category, callback, snapshotData, snapshotStoreConfig, subscribers);
      }, []),

      // Optional lifecycle methods
      preDelete: async (id: string, config: any) => {
        console.log('Pre-delete hook for snapshot:', id);
      },

      postDelete: async (id: string) => {
        console.log('Post-delete hook for snapshot:', id);
      }
    };
  }

  return operationsRef.current;
};

export default useSnapshotOperations;