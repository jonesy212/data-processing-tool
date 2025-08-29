// SnapshotSubscriberManagement.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, SnapshotData, SnapshotStoreConfig } from '@/app/components/snapshots';
import { Snapshots, SnapshotsArray, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/components/snapshots/Snapshot';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { Subscriber } from '@/app/components/users/Subscriber';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { NotificationType } from '@/app/context/NotificationContext';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Content } from '../models/content/AddContent';
import { NotificationPosition } from '../models/data/StatusType';
import { SubscriberCallbackType } from "../subscriptions/Subscription";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields, BaseDataRoot } from '@/app/configs/BaseConfig';


interface SnapshotContext<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> {
  snapshot: Snapshot<T, K, Meta, ExcludedFields>;
  snapshots: Snapshots<T, K, Meta, ExcludedFields>;
  snapshotStore: SnapshotStore<T, K>;
  snapshotData: SnapshotData<T, K>;
  subscribers: SubscriberCollection<T, K>;
  category?: Category;
}

// OptionalSnapshotSubscriberHelpers.ts
export interface OptionalSnapshotSubscriberHelpers<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  /** Batch or convenience subscription/unsubscription methods */
  
  unsubscribeFromSnapshots?: (
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => void;

  subscribeToSnapshotsSuccess?: (
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => string;

  unsubscribeFromSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => void;

  /** Optional: subscribe to multiple snapshots at once */
  subscribeToSnapshots?: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    callback: (
      snapshotStore: SnapshotStore<T, K>,
      snapshots: SnapshotsArray<T, K, Meta>
    ) => Subscriber<T, K> | null,
    snapshots: SnapshotsArray<T, K, Meta>,
    unsubscribe?: UnsubscribeDetails
  ) => SnapshotsArray<T, K, Meta> | [];
}

interface SnapshotSubscriberManagement<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends OptionalSnapshotSubscriberHelpers<T, K, Meta, ExcludedFields> {
  /** Mainstream / standard subscription properties */
  subscribers: SubscriberCollection<T, K>[];
  snapshotSubscriberId?: string | null;
  isSubscribed: boolean;

  /** Core subscription methods */
  subscribe: (
    snapshotId: string,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: string | Event,
    callback: Callback<SnapshotContext<T, K, Meta, ExcludedFields>>
  ) => [] | SnapshotsArray<T, K, Meta>;

  unsubscribe: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K> | null,
    ctx?: SnapshotContext<T, K, Meta, ExcludedFields>
  ) => void;

  /** Alternative subscription patterns */
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => Subscriber<T, K> | null,
    snapshot?: Snapshot<T, K, Meta, ExcludedFields>
  ) => Subscriber<T, K> | null;

  subscribeToSnapshotList?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => void;

  subscribeToSnapshotWithMetadata?: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K> | null,
    data: T,
    event: Event,
    callback: Callback<Snapshot<T, K, Meta, ExcludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta>;

  /** Notify methods */
  notifySubscribers: (
    message: string,
    subscribers: Subscriber<T, K>[],
    callback: (data: Snapshot<T, K, Meta, ExcludedFields>) => Subscriber<T, K>[],
    data?: Partial<SnapshotStoreConfig<T, K>>
  ) => Promise<Subscriber<T, K>[]>;

  notify?: (
    id: string,
    message: string,
    content: Content<T, K>,
    data: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition
  ) => void;

  /** Primary sources / context */
  manageSubscription?: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, ExcludedFields>>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>
  ) => Snapshot<T, K, Meta, ExcludedFields>;

  getSubscribers?: (
    subscribers: SubscriberCollection<T, K>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K>;
    snapshots: Snapshots<T, K, Meta, ExcludedFields>;
  }>;
}

interface SnapshotCRUD<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  getAllSnapshots: (
    storeId: number,
    event: Event,
    ctx: SnapshotContext<T, K, Meta, ExcludedFields> & {
      timestamp: string;
      type: string;
      id: number;
      categoryProperties?: CategoryProperties;
      dataStoreMethods: DataStore<T, K>;
      data: T;
    },
    filter?: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta, ExcludedFields>[]>
  ) => Promise<Snapshot<T, K, Meta, ExcludedFields>[]>;
  
  updateData: (id: number, newData: Snapshot<T, K, Meta, ExcludedFields>) => void;
  removeData: (id: number) => void;

  // Additional CRUD operations
}

export type { SnapshotContext, SnapshotCRUD, SnapshotSubscriberManagement };

