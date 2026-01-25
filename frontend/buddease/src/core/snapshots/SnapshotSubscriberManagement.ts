// SnapshotSubscriberManagement.ts
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { BaseData } from '@/core/models/data/Data';
import { NotificationPosition } from "@/core/models/data/StatusType";
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { DataStoreMethods } from '@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import { EventManagement } from '@/core/snapshots/SnapshotEvents';
import type { DataStore } from '@/core/state/stores/DataStore';
import { Callback } from '@/core/subscribers/subscribeToSnapshotsImplementation';
import { SnapshotEvent } from '@/core/typings/snapshotTypes';

import type { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";

import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Content } from '@/core/models/content/AddContent';
import type { SnapshotStoreProps } from '@/core/snapshots//useSnapshotStore';
import type { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import { Snapshots } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotContainerType } from '@/core/snapshots/SnapshotContainer';
import { SnapshotLifecycleMethods } from '@/core/snapshots/SnapshotMethods';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { Subscriber } from '@/core/subscribers/Subscriber';
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { SubscriberCallbackType, Subscription } from '@/core/subscriptions/Subscription';
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';


interface SnapshotContext<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;
}

export interface OptionalSnapshotSubscriberHelpers<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  /** Batch or convenience subscription/unsubscription methods */
  
  unsubscribeFromSnapshots?: (
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  unsubscribeFromSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  /** Optional: subscribe to multiple snapshots at once */
  subscribeToSnapshots?: (
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
    unsubscribe?: UnsubscribeDetails
  ) => SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | [];

    subscribeToSnapshot?: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
    unsubscribeToSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
}

interface SnapshotSubscriberManagement<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends EventManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
OptionalSnapshotSubscriberHelpers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  /** Mainstream / standard subscription properties */
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshotSubscriberId?: string | null;
  isSubscribed: boolean;

  /** Core subscription methods */
  subscribe: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: string | SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

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
    callback: SubscriberCallbackType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;

  /** Alternative subscription patterns */
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  subscribeToSnapshotList?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  subscribeToSnapshotWithMetadata?: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  /** Notify methods */
  notifySubscribers: (
    message: string,
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    data?: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  notify?: (
    id: string,
    message: string,
    content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>;
}

interface SnapshotCRUD<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotLifecycleMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>{
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
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties?: CategoryProperties,
    callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    dataStore?: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods?: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {},
    subscriberId?: string,
    endpointCategory?: string | number,
    storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string | number | null,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>,
  
}

export type { SnapshotContext, SnapshotCRUD, SnapshotSubscriberManagement };

