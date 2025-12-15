// successFailureMethods.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Payload } from '@/app/interfaces/payload/payloadTypes';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';


export const SuccessFailureMethods = {
  
  createSnapshotSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): void {
    if (snapshot.id !== undefined) {
      // Use this.notify or this context for notification
      this.notify?.(
        String(snapshot.id),
        `Snapshot ${snapshot.id} created successfully.`,
        "",
        new Date(),
        'SUCCESS' // Use appropriate notification type
      );
    } else {
      console.error("Snapshot id is undefined.");
    }
  },

  clearSnapshotSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }
  ): void {
    try {
      const configs = this.getConfigPromise?.() || [];
      configs.forEach((config) => {
        if (config.clearSnapshotSuccess) {
          config.clearSnapshotSuccess(context);
        }
      });
    } catch (error) {
      console.error("Error clearing snapshot:", error);
    }
    // Use public version instead of private
    this.notifyPublicSuccess?.("Snapshot cleared successfully.");
    // OR using the unified version:
    // this.notifyPublic?.('success', "Snapshot cleared successfully.");
  },

  clearSnapshotFailure: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }
  ): void {
    this.getDelegate?.(context).clearSnapshotFailure?.();
    // Use public version instead of private
    this.notifyPublicFailure?.("Error clearing snapshot.");
    // OR using the unified version:
    // this.notifyPublic?.('error', "Error clearing snapshot.");
  },

  createSnapshotFailure: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error }
  ): void {
    this.notify?.(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      'ERROR' // Use appropriate notification type
    );
  },


  fetchSnapshotSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: FetchSnapshotPayload<K> | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    snapshotData: (
      snapshotManager: SnapshotManager<SnapshotUnion<BaseData, Meta>, T>,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>
    ) => void
  ): void {
    const delegate = this.ensureDelegate?.();
    delegate?.fetchSnapshotSuccess?.(
      snapshotId,
      snapshotStore,
      payload,
      snapshot,
      data,
      snapshotData
    );
  },

  fetchSnapshotFailure: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    date: Date | undefined,
    payload: { error: Error }
  ): void {
    const delegate = this.ensureDelegate?.();
    delegate?.fetchSnapshotFailure?.(payload, snapshot);
  },


  setSnapshotSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    this.executeDelegateMethod?.(
      'setSnapshotSuccess',
      snapshotData,
      subscribers
    );
  },

  setSnapshotFailure: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    error: Error
  ): void {
    this.executeDelegateMethod?.(
      'setSnapshotFailure',
      error
    );
  },

  updateSnapshotsSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotData: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void
  ): void {
    this.executeDelegateMethod?.(
      'updateSnapshotsSuccess',
      snapshotData
    );
  },

  updateSnapshotsFailure: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    error: Payload
  ): void {
    this.executeDelegateMethod?.(
      'updateSnapshotsFailure',
      error
    );
  },

  takeSnapshotSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    this.executeDelegateMethod?.(
      'takeSnapshotSuccess',
      snapshot
    );
  },

  takeSnapshotsSuccess: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: T[]
  ): void {
    this.executeDelegateMethod?.(
      'takeSnapshotsSuccess',
      snapshots
    );
  }


};