// EventStore.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CombinedEvents } from '@/app/hooks/useSnapshotManager';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { NotificationPosition } from "@/app/models/data/StatusType";
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import StoreConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import { Snapshots, SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'
import { EventRecord, InitializedState } from "@/app/state/stores/DataStore";
import { Callback } from '@/app/subscribers/subscribeToSnapshotsImplementation';
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';

import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetaDataOptions } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { UpdateSnapshotPayload } from '@/app/server/database/Payload';
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { fetchAndCreateSnapshot } from '@/app/snapshots/defaultSnapshotSubscribeFunctions';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Content } from '@/models/content/AddContent';
import { SubscriberCallbackType, Subscription } from '@/app/subscriptions/Subscription';


export type EventStore<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
    eventRecords: Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
    callbacks: Record<string, Array<(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void>>;
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    eventIds: string[];
    initialConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    storeConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;// Optional storage configuration
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => void;
  
    onSnapshotRemoved: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void;
  
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => void;
  
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => void;
  
    onInitialize: () => void;
  
    onSnapshotUpdated: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) => void;
  
    on: (
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
    off: (
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
    emit: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void;
  
    once: (
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
    removeAllListeners: (event?: string) => void;
  
    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
  unsubscribe: (
    unsubscribeDetails: {
      userId: string; snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => void;
  
    trigger: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void;
  
    eventsDetails?: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  };
  

// Define the default event store
const defaultEventStore = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  storeId: number,
  additionalHeaders?: Record<string, string>,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<EventStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Fetch the snapshot data using fetchAndCreateSnapshot
  const coreSnapshot = await fetchAndCreateSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, storeId, additionalHeaders);
  const { category, config, expirationDate, payload, callback, endpointCategory } = storeProps || {};

  // Define the initialConfig object
  const initialConfig = {
    id: "snapshot-1",
    description: "Description of the snapshot",
    category: {} as Category,
    metadata: {} as UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotCriteria: {} as SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: {} as CriteriaType,
    priority: "high",
    version: 1,
    data: {} as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: [],
    storeConfig: {} as StoreConfig,
    initialState: {} as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    isCore: true,
    additionalData: {} as CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotData: coreSnapshot.snapshotData,
    snapshotId: coreSnapshot.snapshotId || '',
    snapshot: coreSnapshot.snapshot || {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Safely access `snapshot` with a fallback
    snapshotStore: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: coreSnapshot.dataItems,
    events: {} as CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    newData: {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: {} as UpdateSnapshotPayload<T>,
    eventRecords: {} as Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    store: {} as SnapshotStore<any, K>,

    // ADD THESE MISSING PROPERTIES:
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    mappedSnapshot: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
    mappedMeta: new Map<string, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
    hasSnapshots: async (): Promise<boolean> => {
      return false; // Default implementation
    }
  };

  // Define event handlers (mocked or implemented as needed)
  const eventHandlers: SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    onSnapshotAdded: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => {
      // Implementation...
    },
    onSnapshotRemoved: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {
      // Implementation...
    },
    onError: (
      event: string,
      error: Error,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => {
      // Implementation...
    },
    onSnapshotUpdated: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ) => {
      // Implementation...
    },
    emit: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {
      // Implementation...
    },
    once: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => {
      // Implementation...
    },
    addRecord: (
      event: string,
      record: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => {
      // Implementation...
    },
    removeSubscriber: (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      criteria: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category
    ) => {
      // Implementation...
    },
    removeAllListeners: (event?: string) => {
      // Implementation...
    },
    subscribe: (
      event: string,
      subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => {
      // Implementation...
    },
    unsubscribe: (
      snapshotId: number,
      unsubscribeDetails: UnsubscribeDetails,
      callback: SubscriberCallbackType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
    ) => {
      // Implementation...
    },
    trigger: (
      event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      eventDate: Date,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {
      // Implementation...
    },
    eventsDetails: {},
    eventRecords: null,
    records: null,
    eventIds: [],
    subscribers: [],
    snapshotSubscriberId: undefined,
    isSubscribed: false,
    getSubscribers: function (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<{ subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
      throw new Error('Function not implemented.');
    },
    notifySubscribers: function (message: string, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error('Function not implemented.');
    },
    notify: function (id: string, message: string, content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
      throw new Error('Function not implemented.');
    },
    manageSubscription: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error('Function not implemented.');
    },
    subscribeToSnapshotList: function (snapshotId: string, callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error('Function not implemented.');
    },
    subscribeToSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
      throw new Error('Function not implemented.');
    },
    subscribeToSnapshotWithMetadata: function (snapshotId: string | number | null, unsubscribe: UnsubscribeDetails, subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, data: T, event: SnapshotEvent, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, value: T): [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error('Function not implemented.');
    },
    unsubscribeFromSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error('Function not implemented.');
    },
    subscribeToSnapshotsSuccess: function (callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): string {
      throw new Error('Function not implemented.');
    },
    unsubscribeFromSnapshots: function (callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error('Function not implemented.');
    },
    subscribeToSnapshots: function (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotId: string, 
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      callback: (
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, 
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      unsubscribe?: UnsubscribeDetails,
      category?: Category, 
    ): [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
        throw new Error('Function not implemented.');
    },
    clearSnapshot: function (): void {
      throw new Error('Function not implemented.');
    },
    clearSnapshotSuccess: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
      throw new Error('Function not implemented.');
    },
    addToSnapshotList: function (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
      throw new Error('Function not implemented.');
    },
    addSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error('Function not implemented.');
    },
    removeSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error('Function not implemented.');
    },
    transformSubscriber: function (subscriberId: string, sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error('Function not implemented.');
    },
    defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): void {
      throw new Error('Function not implemented.');
    },
    getSnapshotsBySubscriber: function (subscriber: string): Promise<T[]> {
      throw new Error('Function not implemented.');
    },
    getSnapshotsBySubscriberSuccess: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error('Function not implemented.');
    }
  };

  // Return the final object - create a proper EventStore object without conflicts
  return {
    initialConfig: initialConfig as SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Cast to the expected type
    eventRecords: {} as Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null,
    callbacks: {},
    subscribers: {} as SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    eventIds: [],
    
    // Explicitly assign each event handler method to avoid property conflicts
    onSnapshotAdded: eventHandlers.onSnapshotAdded,
    onSnapshotRemoved: eventHandlers.onSnapshotRemoved,
    onError: eventHandlers.onError,
    onSnapshotUpdated: eventHandlers.onSnapshotUpdated,
    onInitialize: () => { /* implementation */ },
    on: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => { /* implementation */ },
    off: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => { /* implementation */ },
    emit: eventHandlers.emit,
    once: eventHandlers.once,
    addRecord: eventHandlers.addRecord,
    removeAllListeners: eventHandlers.removeAllListeners,
    removeSubscriber: eventHandlers.removeSubscriber,
    subscribe: (event: string, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => { /* implementation */ },
    unsubscribe: (
      unsubscribeDetails: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; unsubscribeReason: string; unsubscribeData: any; },
      event: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => { /* implementation */ },
    trigger: (
      event: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => { /* implementation */ },
    
    // Add any other required methods from EventStore that aren't in eventHandlers
  };
};

export { defaultEventStore };
