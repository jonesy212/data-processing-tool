// transformMethods.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config//BaseConfig";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Subscriber } from "@/app/users/Subscriber";
import { UniqueIDGenerator } from '@/app/generators/GenerateUniqueIds';
import { Snapshots } from "@/app/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/Snapshot";
import { SnapshotCoreBase } from '@/app/snapshots';
import { SnapshotStoreConfig } from "@/app/snapshotstoreConfig";
import { Attachment } from "@/app/documents/Attachment/attachment";

// -------------------------------
// SnapshotStore Cnfig with Core
// -------------------------------

interface SnapshotStoreConfigWithCore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, SnapshotCoreBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {}
// -------------------------------
// Transform Subscriber
// -------------------------------

export const TransformMethods = {

  transformSubscriber: function <
  T extends BaseDataEntity = BaseDataRoot,
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
    // Simple transformation for the interface
    const transformedSubscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...sub,
      id: subscriberId,
      metadata: {
        ...sub.metadata,
        transformedAt: new Date(),
        transformedBy: this.id || 'unknown'
      }
    };
    return transformedSubscriber;
  },

  transformSubscriberMapped: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T,
    U extends BaseDataEntity = T,
    V extends U = U,
    Meta2 = DefaultMeta<U, V>,
    AttachmentType2 extends Attachment = Attachment,
    ExcludedFields2 extends keyof U = DefaultExcludedFields<U>,
    IncludedFields2 extends keyof U = keyof U

  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<U, V, Meta2, ExcludedFields2, IncludedFields2>,
      snapshotStore: SnapshotStore<U, V, Meta2, ExcludedFields2, IncludedFields2>,
      dataItems: any[],
      criteria: any,
      category: symbol | string | undefined
    ) => void,
    transformSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Snapshot<U, V, Meta2, ExcludedFields2, IncludedFields2>,
    transformSnapshotStore: (
      store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => SnapshotStore<U, V, Meta2, ExcludedFields2, IncludedFields2>,
    transformSnapshotCriteria: (criteria: any) => any
  ): (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => void {
    return (
      event,
      snapshotId,
      snapshot,
      snapshotStore,
      dataItems,
      criteria,
      category
    ) => {
      const transformedSnapshot = transformSnapshot(snapshot);
      const transformedSnapshotStore = transformSnapshotStore(snapshotStore);
      const transformedCriteria = transformSnapshotCriteria(criteria);

      subscriber(
        event,
        snapshotId,
        transformedSnapshot,
        transformedSnapshotStore,
        dataItems,
        transformedCriteria,
        category
      );
    };
  },

  transformDelegate: async function <
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    transformSubscriberFn: (sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return Promise.all(
      delegate.map(async (config) => {
        // Resolve subscribers for this delegate
        const subscribersPromise = await config.getSubscribers(
          subscribers,
          snapshots
        );

        return {
          ...config,
          subscribers: subscribersPromise.subscribers.map((sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) =>
            transformSubscriberFn(sub)
          ),
          configOption:
            config.configOption && typeof config.configOption !== "string"
              ? {
                  ...config.configOption,
                  subscribers: (
                    await config.configOption.getSubscribers(
                      subscribers,
                      snapshots
                    )
                  ).subscribers.map((sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) =>
                    transformSubscriberFn(sub)
                  ),
                }
              : config.configOption,
        };
      })
    );
  },

  transformMappedData: function <
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    value: T | Partial<T> 
  ): T {
    // Define default fields for BaseDataEntity with proper typing
    const defaults: Partial<BaseDataEntity> = {
      id: UniqueIDGenerator.generateID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Merge defaults with incoming value using Object.assign for better typing
    const normalized = Object.assign(
      {} as Partial<T>,
      defaults,
      value
    ) as T;

    return normalized;
  },

  transformConfigOption: function <
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    option: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | string | null | undefined
  ): SnapshotStoreConfigWithCore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string | null {
    if (!option) return null;

    // If option is already a string, return as-is
    if (typeof option === "string") return option;

    // Otherwise, normalize the object
    return {
      ...option,
      id: option.id ?? UniqueIDGenerator.generateID(),
      storeId: option.storeId ?? Math.floor(Math.random() * 1000000),
      subscribers: option.subscribers ?? [],
      snapshotIds: option.snapshotIds ?? [],
      configOption: option.configOption ?? null,
      priority: option.priority ?? "normal",
      // Add defaults for other fields as needed
    } as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
};



export type { SnapshotStoreConfigWithCore };
