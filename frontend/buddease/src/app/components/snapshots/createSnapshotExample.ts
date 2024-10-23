import { Data } from '../models/data';
import { Snapshot } from "./LocalStorageSnapshotStore";
import { snapshot } from './snapshot';
import { K, T } from "./SnapshotConfig";
import SnapshotStore from "./SnapshotStore";
import { snapshotConfig } from "./snapshotStoreConfigInstance";

// createSnapshotExample.ts
const createSnapshotExample = async (
  id: string,
  snapshotData: SnapshotData<any, Data>,
  category: string
): Promise<{ snapshot: Snapshot<T, Meta, K> }> => {
  const currentConfig = snapshotConfig.find(
    (config) => (config.snapshotId as string) === id
  );

  return new Promise<{ snapshot: Snapshot<Data, Meta, Data> }>(
    (resolve, reject) => {
      if (currentConfig && typeof currentConfig.createSnapshot === "function") {
        // Ensure currentConfig.createSnapshot is called with correct arguments
        currentConfig.createSnapshot(
          id,
          snapshotData,
          category,
          (snapshot: Snapshot<Data, Meta, Data>) => {
            // Check if snapshot returned is valid
            if (snapshot instanceof SnapshotStore) {
              resolve({ snapshot });
            } else {
              reject(new Error("Invalid snapshot returned."));
            }
          }
        );
      } else {
        reject(
          new Error(
            "Snapshot configuration not found or createSnapshot method not callable."
          )
        );
      }
    }
  );
};


// Call the example
createSnapshotExample("snapshot1", snapshot[0], "category1").then(
  (result) => {
    console.log("Snapshot creation result:", result);
  }
);