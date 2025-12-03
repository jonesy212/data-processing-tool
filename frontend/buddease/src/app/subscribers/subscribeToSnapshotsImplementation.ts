// subscribeToSnapshotsImplementation.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Snapshots, SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';

type Callback<T> = (snapshot: T) => void;

type UnifiedCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

type SingleEventCallbacks<T> = {
  [event: string]: Callback<T>[];
};

// For handling multiple events with one or more callbacks
type MultipleEventsCallbacks<T> = {
  [event: string]: Callback<T>[];
};



type SimplifiedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

const handleSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snap: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  callback: (snapshot: SimplifiedSnapshot<T>) => void
) => {
  if (isSnapshotWithMetadata(snap)) {
    callback(snap); // It's a valid Snapshot<T>
  } else {
    callback(snap as SimplifiedSnapshot<T>); // Narrow to simpler type
  }
};

function isSnapshotWithMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snap: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): snap is Snapshot<T, T, StructuredMetadata<T, T>, never> {
  return 'metadata' in snap; // Assuming metadata field is a discriminant
}


// Type guard to check if subscriber is a function
const isFunction = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(fn: any): fn is (snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void => {
  return typeof fn === 'function';
};

const snapshotSubscribers: Map<string, Callback<Snapshot<any, any, any, any, any, any>>[]> =
  new Map();


const addSubscriptionMethods = <T extends Snapshot<any, any, any, any, any, any>>(callback: Callback<T>, snapshotId: string): Callback<T> & { subscribe: (cb: Callback<T>) => void; unsubscribe: (cb: Callback<T>) => void } => {
  const wrappedCallback = ((snapshot: T) => callback(snapshot)) as Callback<T> & { subscribe: (cb: Callback<T>) => void; unsubscribe: (cb: Callback<T>) => void };

  wrappedCallback.subscribe = (cb: Callback<T>) => {
    if (!snapshotSubscribers.has(snapshotId)) {
      snapshotSubscribers.set(snapshotId, []);
    }
    snapshotSubscribers.get(snapshotId)?.push(cb as Callback<Snapshot<any, any, any, any, any, any>>);
  };

  wrappedCallback.unsubscribe = (cb: Callback<T>) => {
    const subscribers = snapshotSubscribers.get(snapshotId);
    if (subscribers) {
      const index = subscribers.indexOf(cb as Callback<Snapshot<any, any, any, any, any, any>>);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    }
  };

  return wrappedCallback;
};


const subscribeToSnapshotsImpl = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  snapshotCallback: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  snapshot: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }
  
  const typedCallback = addSubscriptionMethods<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>((snapshot) => {
    snapshotCallback(
      snapshot as unknown as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots as unknown as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    );
  }, snapshotId);

  snapshotSubscribers.get(snapshotId)?.push(typedCallback);

  // Process each snapshot in the array
  snapshot.forEach((snap) => {
    typedCallback(snap as unknown as Snapshot<T, K, Meta, never>);
  });

  const snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];

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
      } as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
    }
  });
};


const subscribeToSnapshotImpl = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }

  const subscriber = callback(snapshot as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
  if (subscriber) {
    const callbackWrapper: Callback<Snapshot<any, any, any, any, any, any>> = (snap) => {
      if (isFunction(subscriber)) {
        subscriber(snap as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      }
    };
    snapshotSubscribers.get(snapshotId)?.push(callbackWrapper);
  }

  // Process each snapshot in the array
  if (Array.isArray(snapshot)) {
    snapshot.forEach(snap => {
      const subscriber = callback(snap as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      if (subscriber) {
        const callbackWrapper: Callback<Snapshot<any, any, any, any, any, any>> = (s) => {
          if (isFunction(subscriber)) {
            subscriber(snap as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
          }
        };
        snapshotSubscribers.get(snapshotId)?.push(callbackWrapper);
      }
    });
  }

  return subscriber;
};

// Function to trigger callbacks when a snapshot is updated
const updateSnapshot = (snapshotId: string, snapshot: Snapshot<any, any, any, any, any, any>) => {
  const subscribers = snapshotSubscribers.get(snapshotId);
  if (subscribers) {
    subscribers.forEach((callback: Callback<Snapshot<any, any, any, any, any, any>>) =>
      callback(snapshot)
    );
  }
};

export { subscribeToSnapshotImpl, subscribeToSnapshotsImpl, updateSnapshot };
export type { Callback, MultipleEventsCallbacks, SingleEventCallbacks, UnifiedCallback };

