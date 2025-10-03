import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// // SnapshotStoreDelegate.ts
// Assuming you have the correct configuration for T and K
export const snapshotStoreDelegate: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<unknown, unknown>[];
  } = {
    useSimulatedDataSource: true, // or false, depending on your needs
    simulatedDataSource: [] // Provide the actual array of SnapshotStoreConfig<unknown, unknown>
  };


