// subscribeToSnapshotsImplementation.ts
import { BaseData } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";

type Callback<T> = (snapshot: T) => void;

const snapshotSubscribers: Map<string, Callback<Snapshot<any, any>>[]> =
  new Map();

const subscribeToSnapshotsImpl = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  snapshotCallback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
  snapshot: Snapshot<T, K>
) => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }

  // Add the callback to the list of subscribers for the given snapshotId
  const typedCallback: Callback<Snapshot<T, K>> = (snapshot) => {
    // Safely convert snapshot to unknown first before casting to desired type
    snapshotCallback([snapshot as unknown as SnapshotStore<T, K>] as unknown as Snapshots<T>);
  };

  snapshotSubscribers.get(snapshotId)?.push(typedCallback);

  // Call the callback immediately with the current snapshot
  typedCallback(snapshot);

  // Simulate fetching or creating snapshots
  const snapshots: Snapshots<T> = []; // Replace with actual logic to get snapshots

  // Call the callback with each snapshot
  snapshots.forEach(snap => {
    if (snap.type !== null && snap.type !== undefined && snap.timestamp !== undefined) {
      typedCallback(
        {
        ...snap,
        type: snap.type as string,
        timestamp: typeof snap.timestamp === 'number' ? new Date(snap.timestamp) : snap.timestamp,
        store: snap.store,
        dataStore: snap.dataStore,
        events: snap.events ?? [],
        meta: snap.meta,
        data: snap.data ?? ({} as T),
        },
      );
    }
  });
};

const subscribeToSnapshotImpl = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  callback: Callback<Snapshot<T, K>>,
  snapshot: Snapshot<T, K>
) => {
  // Add the callback to the list of subscribers for the given snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }
  snapshotSubscribers.get(snapshotId)?.push(callback);

  // Call the callback immediately with the current snapshot
  callback(snapshot);
};
// Function to trigger callbacks when a snapshot is updated
const updateSnapshot = (snapshotId: string, snapshot: Snapshot<any, any>) => {
  const subscribers = snapshotSubscribers.get(snapshotId);
  if (subscribers) {
    subscribers.forEach((callback: Callback<Snapshot<any, any>>) =>
      callback(snapshot)
    );
  }
};

export { subscribeToSnapshotImpl, subscribeToSnapshotsImpl, updateSnapshot };
export type { Callback };

