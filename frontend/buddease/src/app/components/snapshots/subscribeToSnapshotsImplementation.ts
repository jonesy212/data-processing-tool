// subscribeToSnapshotsImplementation.ts

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Subscriber } from "../users/Subscriber";
import { BaseData } from "../models/data/Data";
import { Snapshot, SnapshotsArray, SnapshotUnion, Snapshots } from "./LocalStorageSnapshotStore";


type Callback<T> = (snapshot: T) => void;
type UnifiedCallback<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = (snapshot: Snapshot<T, K>) => Subscriber<T, K> | Snapshot<T, K> | null;

type SingleEventCallbacks<T> = {
  [event: string]: Callback<T>[];
};

// For handling multiple events with one or more callbacks
type MultipleEventsCallbacks<T> = {
  [event: string]: Callback<T>[];
};

// Type guard to check if subscriber is a function
const isFunction = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(fn: any): fn is (snap: Snapshot<T, K>) => void => {
  return typeof fn === 'function';
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


const subscribeToSnapshotsImpl = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  snapshotCallback: (
    snapshotStore: SnapshotStore<T, K>, 
    snapshots: SnapshotsArray<T>
  ) => Subscriber<T, K> | null,
  snapshotStore: SnapshotStore<T, K>, 
  snapshot: SnapshotsArray<T>
) => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }
  
  const typedCallback = addSubscriptionMethods<SnapshotUnion<T>>((snapshot) => {
    snapshotCallback([snapshot as unknown as SnapshotStore<T, K>] as unknown as Snapshots<T>);
  }, snapshotId);

  snapshotSubscribers.get(snapshotId)?.push(typedCallback);

  // Process each snapshot in the array
  snapshot.forEach((snap: SnapshotUnion<T>) => {
    typedCallback(snap);
  });

  const snapshots: Snapshots<T> = [];

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
        data: snap.data ?? ({} as T)
      } as SnapshotUnion<T>);
    }
  });
};


const subscribeToSnapshotImpl = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
  snapshot: Snapshot<T, K> | Snapshots<T> | SnapshotsArray<T>
): Subscriber<T, K> | null => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }

  const subscriber = callback(snapshot as Snapshot<T, K>);
  if (subscriber) {
    const callbackWrapper: Callback<Snapshot<any, any>> = (snap) => {
      if (isFunction(subscriber)) {
        subscriber(snap as Snapshot<T, K>);
      }
    };
    snapshotSubscribers.get(snapshotId)?.push(callbackWrapper);
  }

  // Process each snapshot in the array
  if (Array.isArray(snapshot)) {
    snapshot.forEach(snap => {
      const subscriber = callback(snap as Snapshot<T, K>);
      if (subscriber) {
        const callbackWrapper: Callback<Snapshot<any, any>> = (s) => {
          if (isFunction(subscriber)) {
            subscriber(snap as Snapshot<T, K>);
          }
        };
        snapshotSubscribers.get(snapshotId)?.push(callbackWrapper);
      }
    });
  }

  return subscriber;
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
export type { Callback, MultipleEventsCallbacks, SingleEventCallbacks, UnifiedCallback };

