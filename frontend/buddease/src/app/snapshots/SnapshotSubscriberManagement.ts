// SnapshotSubscriberManagement.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/models/data/Data';
import { NotificationType } from '@/app/context/NotificationContext';
import { NotificationPosition } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, SnapshotConfig, SnapshotData, SnapshotStoreConfig } from '@/app/snapshots';
import { SnapshotStoreProps } from '@/app/snapshots//useSnapshotStore';
import { Snapshots, SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnsubscribeDetails } from '@/app/event/DynamicEventHandlerExample';
import { Content } from '@/models/content/AddContent';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotContainerType } from '@/SnapshotContainer';
import { SnapshotLifecycleMethods } from '@/SnapshotMethods';
import { SubscriberCallbackType, Subscription } from '@/subscriptions/Subscription';
import { SnapshotWithCriteria } from '.';


interface SnapshotContext<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> {
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotData: SnapshotData<T, K, Meta, ExcludedFields>;
  subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
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
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>) => void
  ) => void;

  unsubscribeFromSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  /** Optional: subscribe to multiple snapshots at once */
  subscribeToSnapshots?: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: SnapshotsArray<T, K, Meta>
    ) => Subscriber<T, K, Meta, ExcludedFields> | null,
    snapshots: SnapshotsArray<T, K, Meta>,
    unsubscribe?: UnsubscribeDetails
  ) => SnapshotsArray<T, K, Meta> | [];

    subscribeToSnapshot?: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, ExcludedFields> | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Subscriber<T, K, Meta, ExcludedFields> | null;
  
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
    unsubscribeToSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
}

interface SnapshotSubscriberManagement<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends OptionalSnapshotSubscriberHelpers<T, K, Meta, ExcludedFields> {
  /** Mainstream / standard subscription properties */
  subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>[];
  snapshotSubscriberId?: string | null;
  isSubscribed: boolean;

  /** Core subscription methods */
  subscribe: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, ExcludedFields> | null,
    data: T,
    event: string | Event,
    callback: Callback<SnapshotContext<T, K, Meta, ExcludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields>;

   // Pattern 1: Detailed unsubscribe
  unsubscribeDetailed: (
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  // Pattern 2: Simplified unsubscribe  
  unsubscribeSimple: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K, Meta, ExcludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, ExcludedFields>
  ) => void;

  /** Alternative subscription patterns */
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, ExcludedFields> | null,
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, ExcludedFields> | null;

  subscribeToSnapshotList?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>) => void
  ) => void;

  subscribeToSnapshotWithMetadata?: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, ExcludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields>;

  /** Notify methods */
  notifySubscribers: (
    message: string,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, ExcludedFields>[],
    data?: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Promise<Subscriber<T, K, Meta, ExcludedFields>[]>;

  notify?: (
    id: string,
    message: string,
    content: Content<T, K, Meta, ExcludedFields>,
    data: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition
  ) => void;

  /** Primary sources / context */
  manageSubscription?: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  getSubscribers?: (
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
    snapshots: Snapshots<T, K, Meta, ExcludedFields, IncludedFields>;
  }>;
}

interface SnapshotCRUD<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotLifecycleMethods<T, K, Meta, ExcludedFields>{
  // Core CRUD Operations 
  getAll(): T[];
  getData: (id: number | string, snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => BaseData<any> | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
  setData: (id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  addData: (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  
  itemsfind: (
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  // Store Management (CRUD-like operations)
  createSnapshot: ( 
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category?: Category,
    categoryProperties?: CategoryProperties,
    callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore?: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods?: DataStoreMethods<T, K, Meta, ExcludedFields>,
    metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {},
    subscriberId?: string,
    endpointCategory?: string | number,
    storeProps?: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    snapshotConfigData?: SnapshotConfig<T, K, Meta, ExcludedFields>,
    subscription?: Subscription<T, K, Meta, ExcludedFields>,
    snapshotId?: string | number | null,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>,
  
}

export type { SnapshotContext, SnapshotCRUD, SnapshotSubscriberManagement };

