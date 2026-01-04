useSnapshotHandler.ts
 useSnapshotHandler.ts
import { useState } from 'react';
import { CustomSnapshotData } from '@/core/snapshots/SnapshotData';
import type {  Snapshot } from '@/core/snapshots/Snapshot';
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { BaseData } from '@/core/models/data/Data';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';

const useSnapshotHandler = <T extends BaseDataEntity, K extends CustomSnapshotData>() => {
  const [snapshotStoreConfig, setSnapshotStoreConfig] = useState<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>(undefined);
  const [snapshots, setSnapshots] = useState<Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>(new Map());

  const handleSnapshot =  (
    id: string,
    snapshotId: string,
    snapshot: T | null,
    snapshotData: T,
    category?: Category,//     callback: (snapshot: T) => void,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: T
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
    // Your logic for handling snapshot
    if (snapshotStoreConfig?.delegate?.length) {
      return snapshotStoreConfig.delegate[0].handleSnapshot(
        id,
        snapshotId,
        snapshot,
        snapshotData,
        category,
        callback,
        snapshots,
        type,
        event,
        snapshotContainer,
        snapshotStoreConfig
      );
    }
    return null;
  };

  return {
    handleSnapshot,
    snapshotStoreConfig,
    setSnapshotStoreConfig,
    snapshots,
    setSnapshots,
  };
};
