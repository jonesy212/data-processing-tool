// subscribeToSnapshotsImplementation.ts
import { BaseData } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots } from "./LocalStorageSnapshotStore";

type Callback<T> = (snapshot: T) => void;
type Subscriber<T, K> = (snapshot: Snapshot<T, K>) => void;

const snapshotSubscribers: Record<string, Callback<Snapshot<any, any>>[]> = {};

const subscribeToSnapshotsImpl = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  callback: Subscriber<T, K> // Ensure this matches the expected type
) => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }

  // Add the callback to the list of subscribers for the snapshotId
  snapshotSubscribers.get(snapshotId)?.push(callback);

  // Simulate fetching or creating snapshots
  const snapshots: Snapshots<T> = []; // Replace with actual logic to get snapshots

  // Call the callback with each snapshot
  snapshots.forEach(snapshot => callback(snapshot as Snapshot<T, K>));
};

  
  
  const subscribeToSnapshotImpl = <T extends BaseData>(
    snapshotId: string,
    callback: Callback<Snapshot<T>>,
    snapshot: Snapshot<T, T>
  ) => {
    // Add the callback to the list of subscribers for the given snapshotId
    if (!snapshotSubscribers[snapshotId]) {
      snapshotSubscribers[snapshotId] = [];
    }
    snapshotSubscribers[snapshotId].push(callback);
  
    // Call the callback immediately with the current snapshot
    callback(snapshot);
  };
// Function to trigger callbacks when a snapshot is updated
const updateSnapshot = (snapshotId: string, snapshot: Snapshot<any, any>) => {
  if (snapshotSubscribers[snapshotId]) {
    snapshotSubscribers[snapshotId].forEach((callback) => callback(snapshot));
  }
};

export { subscribeToSnapshotImpl, subscribeToSnapshotsImpl, updateSnapshot };
export type { Callback };

