// // useSnapshotHandler.ts
// import { useState } from 'react';
// import { CustomSnapshotData, Snapshot } from './LocalStorageSnapshotStore';
// import { CategoryProperties } from './../app/pages/personas/ScenarioBuilder';
// import { BaseData } from '../models/data/Data';
// import { SnapshotStoreConfig } from './SnapshotStoreConfig';

// const useSnapshotHandler = <T extends BaseData, K extends CustomSnapshotData>() => {
//   const [snapshotStoreConfig, setSnapshotStoreConfig] = useState<SnapshotStoreConfig<T, K> | undefined>(undefined);
//   const [snapshots, setSnapshots] = useState<Map<string, Snapshot<T, K>>>(new Map());

//   const handleSnapshot =  (
//     id: string,
//     snapshotId: string,
//     snapshot: T | null,
//     snapshotData: T,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: T) => void,
//     type: string,
//     event: Event,
//     snapshotContainer?: T
//   ): Promise<Snapshot<T, K> | null> => {
//     // Your logic for handling snapshot
//     if (snapshotStoreConfig?.delegate?.length) {
//       return snapshotStoreConfig.delegate[0].handleSnapshot(
//         id,
//         snapshotId,
//         snapshot,
//         snapshotData,
//         category,
//         callback,
//         snapshots,
//         type,
//         event,
//         snapshotContainer,
//         snapshotStoreConfig
//       );
//     }
//     return null;
//   };

//   return {
//     handleSnapshot,
//     snapshotStoreConfig,
//     setSnapshotStoreConfig,
//     snapshots,
//     setSnapshots,
//   };
// };
