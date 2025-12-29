// subscriptionMethods.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import { Snapshot, } from "@/core/snapshots/Snapshot";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { Subscriber } from "@/core/subscribers/Subscriber";
import { Callback } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import { SnapshotEvent } from "@/core/typings/snapshotTypes";


const NULL_KEY = "__null__";

export const SubscriptionMethods = {
  addSnapshotSubscriber: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    if (!this.subscribers[snapshotId]) {
      this.subscribers[snapshotId] = [];
    }
    this.subscribers[snapshotId].push(subscriber);
  },

  removeSnapshotSubscribe: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    const list = this.subscribers[snapshotId];
    if (list) {
      this.subscribers[snapshotId] = list.filter(sub => sub !== subscriber);
    }
  },

  transformSubscriber: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string,
    sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // example: wrap or modify subscriber before use
    return sub;
  },


  subscribeToSnapshot: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Create a proper subscriber object instead of passing callback directly
    const subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      callback,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.addSnapshotSubscriber(snapshotId, subscriber);
    
    // Optionally call the callback immediately with the current snapshot if available
    const currentSnapshot = this.getSnapshot(snapshotId);
    if (currentSnapshot) {
      callback(currentSnapshot);
      return currentSnapshot;
    }
    
    return undefined;
  },

  unsubscribeFromSnapshot: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) {
    this.removeSnapshotSubscriber(snapshotId, callback as any);
  },


  defaultSubscribeToSnapshot: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): string {
    this.subscribeToSnapshot(snapshotId, callback, snapshot);
    return snapshotId;
  },

  handleSubscribeToSnapshot: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) {
    // Hook point for additional logic when a subscription occurs
    this.subscribeToSnapshot(snapshotId, callback, snapshot);
  },


subscribeToSnapshots: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,
  unsubscribeDetails?: UnsubscribeDetails 
): [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Example: register callback for multiple snapshots
  snapshots.forEach(snap => {
    this.addSnapshotSubscriber(snap.id, callback(snapshotStore, snapshots) as any);
  });

  // Optional: handle unsubscribe logic using the details object
  if (unsubscribeDetails) {
    // Use the unsubscribe details for logging, tracking, or cleanup
    console.log(`User ${unsubscribeDetails.userId} unsubscribed from snapshot ${unsubscribeDetails.snapshotId}`);
    console.log(`Reason: ${unsubscribeDetails.unsubscribeReason}`);
    console.log(`Unsubscribe date: ${unsubscribeDetails.unsubscribeDate}`);
    
    // Perform actual unsubscribe logic here
    this.removeSnapshotSubscriber(
      unsubscribeDetails.snapshotId, 
      unsubscribeDetails.userId
    );
    
    // You might also want to store the unsubscribe details for analytics
    this.storeUnsubscribeEvent(unsubscribeDetails);
  }

  return snapshots;
},
  subscribeToSnapshotsSuccess: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta>) => void
  ): string {
    // Notify immediately with current snapshots
    callback(this.snapshots as Snapshots<T, K, Meta>);
    const subscriptionId = `sub_${Date.now()}`;
    return subscriptionId;
  },

  unsubscribeFromSnapshots: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta>) => void
  ) {
    // Remove this callback from all subscribers
    Object.keys(this.subscribers).forEach(snapshotId => {
      this.subscribers[snapshotId] = this.subscribers[snapshotId].filter(
        sub => sub !== callback
      );
    });
  },

  subscribeToSnapshotList: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      this.addSnapshotSubscriber(snapshotId, callback as any);
    }
  },

  defaultSubscribeToSnapshots: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) {
    if (snapshot) {
      this.subscribeToSnapshotList(snapshotId, callback as any);
    }
  },

  subscribe: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ): [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Determine the snapshot(s) to notify
    const snapshotsToNotify = snapshotId
      ? this.snapshots.filter(snap => snap.id === snapshotId)
      : this.snapshots;

    snapshotsToNotify.forEach(snap => {
      if (subscriber) {
        const transformed = this.transformSubscriber(snap.id, subscriber);
        this.addSnapshotSubscriber(snap.id, transformed);
      }
      callback(snap);
    });

    // Optionally handle unsubscribe
    if (unsubscribe) {
      unsubscribe();
    }

    return snapshotsToNotify;
  },

  subscribeSimple: function <   
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snap: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): () => void {
    // Simple wrapper using the main subscribe method
    const unsubscribeFn = () => {
      this.subscribers[NULL_KEY]?.forEach(sub => this.removeSnapshotSubscriber(null as any, sub));
    };

    this.subscribe(null, {} as any, null, {} as any, "onUpdate", callback as any, {} as any);
    return unsubscribeFn;
  },

};
