import { Snapshot } from "./LocalStorageSnapshotStore";
import { K, T } from "./SnapshotConfig";

// Implement the getSnapshotEntries method
const getSnapshotEntries: Snapshot<T, K>['getSnapshotEntries'] = (snapshotId: string) => {
  const snapshot = this.getSnapshot(snapshotId); // Retrieve the snapshot by its ID
  if (snapshot && snapshot.data instanceof Map) {
    return snapshot.data; // Return the map of entries if the snapshot contains one
  }
  return undefined; // Return undefined if no entries are found
};

// Implement the getAllSnapshotEntries method
const getAllSnapshotEntries: Snapshot<T, K>['getAllSnapshotEntries'] = () => {
  const entries: Map<string, T>[] = [];
  const allSnapshots = this.getSnapshots(); // Retrieve all snapshots
  
  if (allSnapshots) {
    allSnapshots.forEach(snapshot => {
      if (snapshot.data instanceof Map) {
        entries.push(snapshot.data); // Collect entries from each snapshot
      }
    });
  }
  return entries;
};
export { getAllSnapshotEntries, getSnapshotEntries };
