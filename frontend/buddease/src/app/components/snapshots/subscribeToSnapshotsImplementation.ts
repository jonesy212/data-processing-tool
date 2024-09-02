// subscribeToSnapshotsImplementation.ts
import { BaseData } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";

type Callback<T> = (snapshot: T) => void;

type SingleEventCallbacks<T> = {
  [event: string]: Callback<T>[];
};

// For handling multiple events with one or more callbacks
type MultipleEventsCallbacks<T> = {
  [event: string]: Callback<T>[];
};
const snapshotSubscribers: Map<string, Callback<Snapshot<any, any>>[]> =
  new Map();


  const addSubscriptionMethods = <T extends Snapshot<any, any>>(callback: Callback<T>, snapshotId: string): Callback<T> & { subscribe: (cb: Callback<T>) => void; unsubscribe: (cb: Callback<T>) => void } => {
    const wrappedCallback = ((snapshot: T) => callback(snapshot)) as Callback<T> & { subscribe: (cb: Callback<T>) => void; unsubscribe: (cb: Callback<T>) => void };

    wrappedCallback.subscribe = (cb: Callback<T>) => {
      if (!snapshotSubscribers.has(snapshotId)) {
        snapshotSubscribers.set(snapshotId, []);
      }
      snapshotSubscribers.get(snapshotId)?.push(cb as Callback<Snapshot<any, any>>);
    };

    wrappedCallback.unsubscribe = (cb: Callback<T>) => {
      const subscribers = snapshotSubscribers.get(snapshotId);
      if (subscribers) {
        const index = subscribers.indexOf(cb as Callback<Snapshot<any, any>>);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };

    return wrappedCallback;
  };
  
  const subscribeToSnapshotsImpl = <T extends BaseData, K extends BaseData>(
    snapshotId: string,
    snapshotCallback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshot: SnapshotsArray<T>
  ) => {
    if (!snapshotSubscribers.has(snapshotId)) {
      snapshotSubscribers.set(snapshotId, []);
    }

    const typedCallback = addSubscriptionMethods<Snapshot<T, K>>((snapshot) => {
      snapshotCallback([snapshot as unknown as SnapshotStore<T, K>] as unknown as Snapshots<T>);
    }, snapshotId);

    snapshotSubscribers.get(snapshotId)?.push(typedCallback);
  
    // Process each snapshot in the array
    snapshot.forEach(snap => {
      typedCallback(snap);
    });

    const snapshots: Snapshots<T> = []; // Replace with actual logic to get snapshots

    snapshots.forEach(snap => {
      if (snap.type !== null && snap.type !== undefined && snap.timestamp !== undefined) {
        typedCallback({
          ...snap,
          type: snap.type as string,
          timestamp: typeof snap.timestamp === 'number' ? new Date(snap.timestamp) : snap.timestamp,
          store: snap.store,
          dataStore: snap.dataStore,
          events: snap.events ?? [],
          meta: snap.meta,
          data: snap.data ?? ({} as T

          )} as Snapshot<T, K>);
      }
    });
  };
  


  const subscribeToSnapshotImpl = <T extends BaseData, K extends BaseData>(
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | Snapshots<T> | SnapshotsArray<T>
  ): Subscriber<T, K> | null => {
    if (!snapshotSubscribers.has(snapshotId)) {
      snapshotSubscribers.set(snapshotId, []);
    }
  
    const subscriber = callback(snapshot as Snapshot<T, K>); // Ensure callback returns Subscriber or null
    if (subscriber) {
      snapshotSubscribers.get(snapshotId)?.push(subscriber);
    }
  
    // Process each snapshot in the array
    if (Array.isArray(snapshot)) {
      snapshot.forEach(snap => {
        const subscriber = callback(snap as Snapshot<T, K>);
        if (subscriber) {
          snapshotSubscribers.get(snapshotId)?.push(subscriber);
        }
      });
    }
  
    return subscriber; // Return the Subscriber or null
  };

// Function to trigger callbacks when a snapshot is updated
// export const updateSnapshot = (snapshotId: string, snapshot: Snapshot<any, any>) => {
//   const subscribers = snapshotSubscribers.get(snapshotId);
//   if (subscribers) {
//     subscribers.forEach((callback: Callback<Snapshot<any, any>>) =>
//       callback(snapshot)
//     );
//   }
// };

export { subscribeToSnapshotImpl, subscribeToSnapshotsImpl };
export type { Callback, MultipleEventsCallbacks, SingleEventCallbacks };

