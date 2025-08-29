// subscribeToSnapshotsImplementation.ts

import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";

type Callback<T> = (snapshot: T) => void;
type UnifiedCallback<T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> = (snapshot: Snapshot<T, K>) => Subscriber<T, K> | Snapshot<T, K> | null;

type SingleEventCallbacks<T> = {
  [event: string]: Callback<T>[];
};

// For handling multiple events with one or more callbacks
type MultipleEventsCallbacks<T> = {
  [event: string]: Callback<T>[];
};



type SimplifiedSnapshot<T extends BaseDataEntity<any, any>> = Snapshot<T, T, StructuredMetadata<T, T>, never>;

const handleSnapshot = <T extends BaseDataEntity<any, any>>(
  snap: SnapshotUnion<T, K, Meta>, 
  callback: (snapshot: SimplifiedSnapshot<T>) => void
) => {
  if (isSnapshotWithMetadata(snap)) {
    callback(snap); // It's a valid Snapshot<T>
  } else {
    callback(snap as SimplifiedSnapshot<T>); // Narrow to simpler type
  }
};

function isSnapshotWithMetadata<T extends BaseDataEntity<any, any>>(
  snap: SnapshotUnion<T, K, Meta>
): snap is Snapshot<T, T, StructuredMetadata<T, T>, never> {
  return 'metadata' in snap; // Assuming metadata field is a discriminant
}


// Type guard to check if subscriber is a function
const isFunction = <T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(fn: any): fn is (snap: Snapshot<T, K>) => void => {
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


const subscribeToSnapshotsImpl = <T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  snapshotId: string,
  snapshotCallback: (
    snapshotStore: SnapshotStore<T, K>, 
    snapshots: SnapshotsArray<T, K, Meta>
  ) => Subscriber<T, K> | null,
  snapshotStore: SnapshotStore<T, K>, 
  snapshot: SnapshotsArray<T, K, Meta>
) => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }
  
  const typedCallback = addSubscriptionMethods<SnapshotUnion<T, K, Meta>>((snapshot) => {
    snapshotCallback(
      snapshot as unknown as SnapshotStore<T, K>,
      snapshots as unknown as SnapshotsArray<T, K, Meta>
    );
  }, snapshotId);

  snapshotSubscribers.get(snapshotId)?.push(typedCallback);

  // Process each snapshot in the array
  snapshot.forEach((snap) => {
    typedCallback(snap as unknown as Snapshot<T, K, Meta, never>);
  });

  const snapshots: Snapshots<T, K> = [];

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
      } as SnapshotUnion<T, K, Meta>);
    }
  });
};


const subscribeToSnapshotImpl = <T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
  snapshot: Snapshot<T, K> | Snapshots<T, K> | SnapshotsArray<T, K, Meta>
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

