// useSnapshotApi.ts

import { CreateOptions, FetchAllOptions } from '@/app/snapshots/SnapshotOptions';
import { useCallback } from 'react';
import snapshotApi from './snapshotApi';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Snapshot } from "@/app/snapshots/Snapshot";

export const useSnapshotApi = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  // Create snapshot with proper typing
  const createSnapshot = useCallback(
    async (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      options?: CreateOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {
      return snapshotApi.create(snapshot, options);
    },
    []
  );

  // Fetch by ID
  const fetchById = useCallback(
    async (id: string, storeId: number, additionalHeaders?: Record<string, string>) => {
      return snapshotApi.fetchById(id, storeId, additionalHeaders);
    },
    []
  );

  // Update snapshot
  const updateSnapshot = useCallback(
    async (
      snapshotId: string,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: UpdateSnapshotPayload<Data<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>
    ) => {
      return snapshotApi.update(snapshotId, data, newData, payload);
    },
    []
  );

  // Delete snapshot
  const deleteSnapshot = useCallback(
    async (snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return snapshotApi.delete(snapshotToRemove);
    },
    []
  );

  // Fetch all snapshots
  const fetchAll = useCallback(
    async (options?: FetchAllOptions<T, K>) => {
      return snapshotApi.fetchAll(options);
    },
    []
  );

  // Validate snapshot
  const validateSnapshot = useCallback(
    async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return snapshotApi.validate(snapshot);
    },
    []
  );

  return {
    createSnapshot,
    fetchById,
    updateSnapshot,
    deleteSnapshot,
    fetchAll,
    validateSnapshot,
    // Direct access to the API for other methods
    api: snapshotApi
  };
};

export default useSnapshotApi;