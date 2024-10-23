import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, SnapshotData, SnapshotStoreConfig, SnapshotWithCriteria, SubscriberCollection } from '@/app/components/snapshots';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { Subscriber } from '@/app/components/users/Subscriber';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Content } from '../models/content/AddContent';
import { NotificationPosition } from '../models/data/StatusType';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType } from '../support/NotificationContext';

interface SnapshotSubscriberManagement<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    subscribers: SubscriberCollection<T, Meta, K>[];
    subscription?: Subscription<T, Meta, K> | null;
    snapshotSubscriberId: string | null | undefined;
    isSubscribed: boolean;

    getSubscribers: (
        subscribers: Subscriber<T, Meta, K>[], 
        snapshots: Snapshots<T, Meta>
    )=> Promise<{
        subscribers: Subscriber<T, Meta, K>[]; 
        snapshots: Snapshots<T, Meta>;
    }>
    
    notifySubscribers: (
        message: string,
        subscribers: Subscriber<T, Meta, K>[],
        callback: (data: Snapshot<T, Meta, BaseData>) => Subscriber<T, Meta, K>[],
        data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>>
      ) => Promise<Subscriber<T, Meta, K>[]>;
    

      notify: (
        id: string,
        message: string,
        content: Content<T, Meta, K>,
        data: any,
        date: Date,
        type: NotificationType,
        notificationPosition?: NotificationPosition
    ) => void;
    
    subscribe: (snapshotId: string | number,
        unsubscribe: UnsubscribeDetails,
        subscriber: Subscriber<T, Meta, K> | null,
        data: T,
        event: Event,
        callback: Callback<Snapshot<T, Meta, K>>,
        value: T,
    ) => [] | SnapshotsArray<T, Meta>;



    subscribeToSnapshot: (
        snapshotId: string,
        callback: Callback<Snapshot<T, Meta, K>>,
        snapshot: Snapshot<T, Meta, K>
      ) => Snapshot<T, Meta, K>;

    subscribeToSnapshotList: (
    snapshotId: string, 
    callback: (snapshots: Snapshot<T, Meta, K>) => void
    ) => void;
  
    
    unsubscribeFromSnapshot: (
        snapshotId: string,
        callback: (snapshot: Snapshot<T, Meta, K>) => void
      ) => void;

  
      subscribeToSnapshotsSuccess: (
        callback: (snapshots: Snapshots<T, Meta>) => void
      ) => string;
  
      unsubscribeFromSnapshots: (
        callback: (snapshots: Snapshots<T, Meta>) => void
      ) => void;
  


     

    unsubscribe: (
        unsubscribeDetails: {
        userId: string; snapshotId: string;
        unsubscribeType: string; unsubscribeDate:
        Date; unsubscribeReason: string; unsubscribeData: any;
    },

    callback: Callback<Snapshot<T, Meta, K>> | null
    ) => void;

    
    subscribeToSnapshots: (
        snapshotStore: SnapshotStore<T, Meta, K>,
        snapshotId: string,
        snapshotData: SnapshotData<T, Meta, K>,
        category: Category | undefined,
        snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
        callback: (snapshotStore: SnapshotStore<any, any>) => Subscriber<T, Meta, K> | null,
        snapshots: SnapshotsArray<T, Meta>
    ) => SnapshotsArray<T, Meta> | [];



  clearSnapshot: () => void;
  clearSnapshotSuccess: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
  }) => void

    
  addToSnapshotList: (
    snapshots: Snapshot<T, Meta, K>,
    subscribers: Subscriber<T, Meta, K>[]
  ) => void | null;

    removeSubscriber: (
        event: string,
        snapshotId: string,
        snapshot: Snapshot<T, Meta, K>,
        snapshotStore: SnapshotStore<T, Meta, K>,
        dataItems: RealtimeDataItem[],
        criteria: SnapshotWithCriteria<T, Meta, K>,
        category: Category
    ) => void;
    
    addSnapshotSubscriber: (
        snapshotId: string,
        subscriber: Subscriber<T, Meta, K>
    ) => void;

    removeSnapshotSubscriber: (
        snapshotId: string,
        subscriber: Subscriber<T, Meta, K>
    ) => void;


    transformSubscriber: (subscriberId: string, sub: Subscriber<T, Meta, K>) => Subscriber<T, Meta, K>;


    defaultSubscribeToSnapshots: (
        snapshotId: string,
        callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null,
        snapshot: Snapshot<T, Meta, K> | null
    ) => void;


    getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;

    getSnapshotsBySubscriberSuccess: (snapshots: Snapshots<T, Meta>) => void;

    // More subscriber-related methods
}

interface SnapshotCRUD<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    getAllSnapshots: (
        storeId: number,
        snapshotId: string,
        snapshotData: T,
        timestamp: string,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, Meta, K>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        dataStoreMethods: DataStore<T, Meta, K>,
        data: T,
        filter?: (snapshot: Snapshot<T, Meta, K>) => boolean,
        dataCallback?: (
            subscribers: Subscriber<T, Meta, K>[],
            snapshots: Snapshots<T, Meta>
        ) => Promise<SnapshotUnion<T, Meta>[]>
    ) => Promise<Snapshot<T, Meta, K>[]>;

    updateData: (id: number, newData: Snapshot<T, Meta, K>) => void;
    removeData: (id: number) => void;

    // Additional CRUD operations
}

export type { SnapshotCRUD, SnapshotSubscriberManagement };
