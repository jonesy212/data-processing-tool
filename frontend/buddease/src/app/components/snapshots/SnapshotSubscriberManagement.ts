import { SnapshotsArray, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Subscriber } from '@/app/components/users/Subscriber';
import { Callback, SnapshotStoreConfig, SubscriberCollection } from '@/app/components/snapshots';
import { Snapshots } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { SnapshotWithCriteria } from '@/app/components/snapshots';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { Snapshot } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { NotificationType } from '../support/NotificationContext';
import { NotificationPosition } from '../models/data/StatusType';
import { SnapshotMethods } from "./SnapshotMethods";
import { Content } from '../models/content/AddContent';
import { Subscription } from '../subscriptions/Subscription';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';

interface SnapshotSubscriberManagement<T extends Data, K extends Data = T> {
    subscribers: SubscriberCollection<T, K>[];
    subscription?: Subscription<T, K> | null;
    snapshotSubscriberId: string | null | undefined;
    isSubscribed: boolean;

    getSubscribers: (
        subscribers: Subscriber<T, K>[], 
        snapshots: Snapshots<T>
    )=> Promise<{
        subscribers: Subscriber<T, K>[]; 
        snapshots: Snapshots<T>;
    }>
    notifySubscribers: (
        message: string,
        subscribers: Subscriber<T, K>[],
        callback: (data: Snapshot<T, BaseData>) => Subscriber<T, K>[],
        data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData>, K>>
      ) => Subscriber<T, K>[];
    

      notify: (
        id: string,
        message: string,
        content: Content<T, K>,
        data: any,
        date: Date,
        type: NotificationType,
        notificationPosition?: NotificationPosition
    ) => void;
    
    subscribe: (snapshotId: string | number,
        unsubscribe: UnsubscribeDetails,
        subscriber: Subscriber<T, K> | null,
        data: T,
        event: Event,
        callback: Callback<Snapshot<T, K>>,
        value: T,
    ) => [] | SnapshotsArray<T>;



    subscribeToSnapshot: (
        snapshotId: string,
        callback: Callback<Snapshot<T, K>>,
        snapshot: Snapshot<T, K>
      ) => Snapshot<T, K>;

    subscribeToSnapshotList: (
    snapshotId: string, 
    callback: (snapshots: Snapshot<T, K>) => void
    ) => void;
  
    
    unsubscribeFromSnapshot: (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, K>) => void
      ) => void;

  
      subscribeToSnapshotsSuccess: (
        callback: (snapshots: Snapshots<T>) => void
      ) => string;
  
      unsubscribeFromSnapshots: (
        callback: (snapshots: Snapshots<T>) => void
      ) => void;
  


     

    unsubscribe: (
        unsubscribeDetails: {
        userId: string; snapshotId: string;
        unsubscribeType: string; unsubscribeDate:
        Date; unsubscribeReason: string; unsubscribeData: any;
    },

    callback: Callback<Snapshot<T, K>> | null
    ) => void;

    
    subscribeToSnapshots: (
        snapshot: SnapshotStore<T, K>,
        snapshotId: string,
        snapshotData: SnapshotStore<T, K>,
        category: Category | undefined,
        snapshotConfig: SnapshotStoreConfig<T, K>,
        callback: (snapshotStore: SnapshotStore<any, any>) => void,
        snapshots: SnapshotsArray<T>
    ) => SnapshotsArray<T> | [];



  clearSnapshot: () => void;
  clearSnapshotSuccess: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }) => void

    
  addToSnapshotList: (
    snapshots: Snapshot<T, K>,
    subscribers: Subscriber<T, K>[]
  ) => void | null;

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
        callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
        snapshot: Snapshot<T, K> | null
    ) => void;


    getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;

    getSnapshotsBySubscriberSuccess: (snapshots: Snapshots<T>) => void;

    // More subscriber-related methods
}

interface SnapshotCRUD<T extends Data, K extends Data = T> {
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
        dataCallback?: (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T>
        ) => Promise<SnapshotUnion<T>[]>
    ) => Promise<Snapshot<T, K>[]>;

    updateData: (id: number, newData: Snapshot<T, K>) => void;
    removeData: (id: number) => void;

    // Additional CRUD operations
}

export type { SnapshotSubscriberManagement, SnapshotCRUD }