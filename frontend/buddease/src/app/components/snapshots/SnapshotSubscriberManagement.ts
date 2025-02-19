import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, SnapshotData, SnapshotStoreConfig, SnapshotStoreProps, SnapshotWithCriteria } from '@/app/components/snapshots';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { Subscriber } from '@/app/components/users/Subscriber';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Content } from '../models/content/AddContent';
import { NotificationPosition } from '../models/data/StatusType';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType } from '../support/NotificationContext';


interface SnapshotSubscriberManagement<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  // ExcludedFields extends keyof T = never
> {
    subscribers: SubscriberCollection<T, K>[];
    subscription?: Subscription<T, K> | null;
    snapshotSubscriberId: string | null | undefined;
    isSubscribed: boolean;

    getSubscribers: (
        subscribers: Subscriber<T, K>[], 
        snapshots: Snapshots<T, K>
    )=> Promise<{
        subscribers: Subscriber<T, K>[]; 
        snapshots: Snapshots<T, K>;
    }>
    
    notifySubscribers: (
        message: string,
        subscribers: Subscriber<T, K>[],
        callback: (data: Snapshot<T, K>) => Subscriber<T, K>[],
        data: Partial<SnapshotStoreConfig<T, K>>
      ) => Promise<Subscriber<T, K>[]>;
    

      notify: (
        id: string,
        message: string,
        content: Content<T, K>,
        data: any,
        date: Date,
        type: NotificationType,
        notificationPosition?: NotificationPosition | undefined
    ) => void;
    
    subscribe: (snapshotId: string | number | null,
        unsubscribe: UnsubscribeDetails,
        subscriber: Subscriber<T, K> | null,
        data: T,
        event: Event,
        callback: Callback<Snapshot<T, K>>,
        value: T,
    ) => [] | SnapshotsArray<T, K>;

      manageSubscription: (
        snapshotId: string,
        callback: Callback<Snapshot<T, K>>,
        snapshot: Snapshot<T, K>
      ) => Snapshot<T, K>;

    subscribeToSnapshotList: (
    snapshotId: string, 
    callback: (snapshots: Snapshot<T, K>) => void
    ) => void;
  
    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
      snapshot: Snapshot<T, K>
    ) =>  Subscriber<T, K> | null;
    
    unsubscribeFromSnapshot: (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, K>) => void
      ) => void;

  
      subscribeToSnapshotsSuccess: (
        callback: (snapshots: Snapshots<T, K>) => void
      ) => string;
  
      unsubscribeFromSnapshots: (
        callback: (snapshots: Snapshots<T, K>) => void
      ) => void;
  


     

    unsubscribe: (
    unsubscribeDetails: {
      userId: string; 
      snapshotId: string;
      unsubscribeType: string; 
      unsubscribeDate: Date; 
      unsubscribeReason: string; 
      unsubscribeData: any;
    },
    callback: Callback<Snapshot<T, K>> | null
    ) => void;

    
    subscribeToSnapshots: (
        snapshotStore: SnapshotStore<T, K>,
        snapshotId: string,
        snapshotData: SnapshotData<T, K>,
        category: symbol | string | Category | undefined,
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (
          snapshotStore: SnapshotStore<T, K>, 
          snapshots: SnapshotsArray<T, K>
        ) => Subscriber<T, K> | null,
        snapshots: SnapshotsArray<T, K>,
        unsubscribe?: UnsubscribeDetails, 
    ) => SnapshotsArray<T, K> | [];



  clearSnapshot: () => void;
  clearSnapshotSuccess: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }) => void

    
  addToSnapshotList: (
    snapshots: Snapshot<T, K>,
    subscribers: Subscriber<T, K>[],
    storeProps?: SnapshotStoreProps<T, K>
  ) =>  Promise<Subscription<T, K> | null>;

    removeSubscriber: (
        event: string,
        snapshotId: string,
        snapshot: Snapshot<T, K>,
        snapshotStore: SnapshotStore<T, K>,
        dataItems: RealtimeDataItem[],
        criteria: SnapshotWithCriteria<T, K>,
        category: Category
    ) => void;
    
    addSnapshotSubscriber: (
        snapshotId: string,
        subscriber: Subscriber<T, K>
    ) => void;

    removeSnapshotSubscriber: (
        snapshotId: string,
        subscriber: Subscriber<T, K>
    ) => void;


    transformSubscriber: (subscriberId: string, sub: Subscriber<T, K>) => Subscriber<T, K>;


    defaultSubscribeToSnapshots: (
        snapshotId: string,
        callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
        snapshot: Snapshot<T, K> | null
    ) => void;


    getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;

    getSnapshotsBySubscriberSuccess: (snapshots: Snapshots<T, K>) => void;

    // More subscriber-related methods
}

interface SnapshotCRUD<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    getAllSnapshots: (
        storeId: number,
        snapshotId: string,
        snapshotData: T,
        timestamp: string,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<T, K>,
        data: T,
        filter?: (snapshot: Snapshot<T, K>) => boolean,
        dataCallback?: (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T, K>
        ) => Promise<SnapshotUnion<T, K, Meta>[]>
    ) => Promise<Snapshot<T, K>[]>;

    updateData: (id: number, newData: Snapshot<T, K>) => void;
    removeData: (id: number) => void;

    // Additional CRUD operations
}

export type { SnapshotCRUD, SnapshotSubscriberManagement };
