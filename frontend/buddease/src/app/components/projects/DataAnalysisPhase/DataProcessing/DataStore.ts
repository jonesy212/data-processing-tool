import SnapshotStore, { SubscriberCollection } from '@/app/components/snapshots/SnapshotStore';
// data/DataStore.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { SnapshotManager } from '@/app/components/hooks/useSnapshotManager';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from "@/app/components/models/data/Data";
import { NotificationPosition, StatusType } from '@/app/components/models/data/StatusType';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { ConfigureSnapshotStorePayload, SnapshotConfig, SnapshotData, SnapshotItem, SnapshotStoreMethod } from '@/app/components/snapshots';
import { Payload, Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, UpdateSnapshotPayload } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { SnapshotContainer } from '@/app/components/snapshots/SnapshotContainer';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { subscribeToSnapshots } from '@/app/components/snapshots/snapshotHandlers';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import CalendarManagerStoreClass from '@/app/components/state/stores/CalendarEvent';
import { NotificationType } from '@/app/components/support/NotificationContext';
import { convertMapToSnapshot, convertSnapshotStoreToSnapshot, isSnapshotStore } from '@/app/components/typings/YourSpecificSnapshotType';
import { Subscriber } from '@/app/components/users/Subscriber';
import { isSnapshot, isSnapshotOfType } from '@/app/components/utils/snapshotUtils';
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { DataContext } from '@/app/context/DataContext';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { IHydrateResult } from 'mobx-persist';
import { useContext } from 'react';
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";
import { DataStoreWithSnapshotMethods } from './ DataStoreMethods';

const dispatch = useDispatch()

export interface DataStore<T extends Data, K extends Data> {
  id: string | number | undefined
  data?: T | Map<string, Snapshot<T, K>> | null;
  metadata: StructuredMetadata | undefined;
  dataStore?: T | Map<string, SnapshotStore<T, K>> | null;
  storage?: SnapshotStore<T, K>[] | undefined;
  config: SnapshotStoreConfig<T, K> | null;
  mapSnapshot: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    snapshotContainer: SnapshotContainer<T, K>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, K> | null | undefined>;


  // New method
  getSubscribers: () => Promise<Subscriber<T, K>[]>;
  getSnapshotByKey: (
    storeId: number,
    snapshotKey: string
  ) => Promise<Snapshot<T, K> | null | undefined>;

  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: K,
      index: number
    ) => SnapshotsObject<T>
  ) => SnapshotsObject<T>

  mapSnapshotStore: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<any, any>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<any, any>,
    data: any
  ) => Promise<SnapshotContainer<T, K> | undefined>;
  // mapSnapshotStores: (
  //   category: any,
  //   timestamp: any,
  //   id: number,
  //   snapshot: Snapshot<T, K>,
  //   snapshotStore: SnapshotStore<Data, any>,
  //   data: Data
  // ) => Promise<SnapshotStore<T>[]>;


  getSuubscribers: (
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
  ) => Promise<Subscriber<T, K>[]>;

  determineSnapshotStoreCategory: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K>,
    configs: SnapshotStoreConfig<T, K>[]
  ) => string;

  addData: (data: Snapshot<T, K>) => void;
  getDataWithSearchCriteria:(id: number) => Promise<SnapshotWithCriteria<T, K> | undefined>;
  getData: (id: number) => Promise<SnapshotStore<T, K>[] | undefined>;
  initializedState: T | null
  getStoreData: (id: number) => Promise<SnapshotStore<T, K>[]>;
  getItem: (key: T, id: number) => Promise<Snapshot<T, K> | undefined>;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T, K>) => void;
  updateStoreData: (
    data: Data,
    id: number,
    newData: SnapshotStore<T, K>
  ) => void;

  getAllData: ()=>  Promise<Snapshot<T, K>[]>;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  addDataStatus: (id: number, status: StatusType | undefined) => void;
  updateDataStatus: (id: number, status: StatusType | undefined) => void;
  addDataSuccess: (payload: { data: Snapshot<T, K>[] }) => void;
  getDataVersions: (id: number) => Promise<Snapshot<T, K>[] | undefined>;
  updateDataVersions: (id: number, versions: Snapshot<T, K>[]) => void;
  getBackendVersion: () => Promise<string | undefined>;
  getFrontendVersion: () => IHydrateResult<number> | Promise<string>;

  getAllKeys: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K> | null,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
  ) => Promise<string[] | undefined>;

  fetchData: (id: number) => Promise<SnapshotStore<T, K>>; 
  defaultSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>) => void;
  handleSubscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) => void;
  setItem: (id: string, item: Snapshot<T, K>) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: (
    storeId: number,
    snapshotId: string,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T
  ) => Promise<Snapshot<T, K>[]> | undefined;

  getDelegate: (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, any>[]
  }) => Promise<SnapshotStoreConfig<T, K>[]>;


  updateDelegate: (
    delegate: SnapshotStoreConfig<T, K>[]
  ) => Promise<SnapshotStoreConfig<T, K>[]>;

  getSnapshot: (
    snapshot: (id: string) =>
      | Promise<{
        snapshotId: number;
        snapshotData: T;
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, K>;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K>;
        snapshotStore: SnapshotStore<T, K>;
        data: T;
        }>
      | undefined
  ) => Promise<Snapshot<T, K> | undefined>;

  getSnapshotWithCriteria: (
    category: any,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
  ) => Promise<SnapshotWithCriteria<T, K> | undefined>;

  getSnapshotContainer: (
    category: string, // Adjusted to more specific type
    timestamp: string, // Adjusted to more specific type
    id: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotData: SnapshotStore<T, K>,
    data: Data,
    snapshotsArray: SnapshotsArray<T>,
    snapshotsObject: SnapshotsObject<T>
  ) => Promise<SnapshotContainer<T, K> | undefined>
  snapshotMethods?: SnapshotStoreMethod<T, K>[] | undefined;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K>[] | undefined;
  getSnapshotVersions: (
    category: any,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
  ) => Promise<Snapshot<T, K>[] | undefined>;
  // storage: SnapshotStore<T> | undefined;
  getSnapshotWithCriteriaVersions: (
    category: any,
    timestamp: any,
    id: number,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    data: T
  ) => Promise<SnapshotWithCriteria<T, K>[] | undefined>
  dataStoreConfig: DataStore<T, K> | undefined
}



interface VersionedData<T extends BaseData, K extends BaseData> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: (id: number) => Promise<SnapshotStore<T, K>[]>;
}

const useVersionedData = <T extends BaseData, K extends BaseData>(
  data: Map<string, T>,
  fetchData: () => Promise<SnapshotStore<T, K>[]>,
): VersionedData<T, K> => {
  const { versionNumber } = getCurrentAppInfo();
  return {
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {}, // Provide appropriate values
    getData: fetchData, // Provide appropriate values
  };
};



interface CallbackItem<T extends Data, K extends Data> extends SnapshotItem<T, K> {
  callback: (snapshot: Snapshot<T, K>) => void;
}

type InitializedState<T extends BaseData, K extends BaseData> = 
  Snapshot<T, K> 
  | SnapshotStore<T, K> 
  | Map<string, Snapshot<T, K>> 
  | null | undefined;

const initializeState = <T extends Data, K extends Data>(
  initialState: InitializedState<T, K>
): InitializedState<T, K> => {
  if (isSnapshot(initialState)) {
    return initialState;
  } else if (isSnapshotStore(initialState)) {
    return initialState;
  } else if (initialState instanceof Map) {
    return initialState;
  } else {
    return null; // or undefined, depending on your use case
  }
};

const useDataStore = <T extends Data, K extends Data>(
  initialState: InitializedState<T, K> = null
): DataStore<T, K> & VersionedData<T, K> => {
  const data: Map<string, Snapshot<T, K>> = new Map<string, Snapshot<T, K>>();
  const context = useContext(DataContext);
  const dispatch = useDispatch();
  // Function to convert a Snapshot<T, K> into T
  const convertSnapshotToData = (snapshot: Snapshot<T, K>): T => {
    // Assuming Snapshot<T, K> has a property 'data' that holds T
    return snapshot.data as T;
  };




  const fetchData = async (): Promise<SnapshotStore<T, K>[]> => {

    try {
      const dataStore = useDataStore<T, K>();
      if (!context) {
        throw new Error("Context is undefined");
      }
      const delegateConfigs = await dataStore.getDelegate({
        useSimulatedDataSource: context.useSimulatedDataSource,
        simulatedDataSource: context.simulatedDataSource
      });
      console.log("Delegate Configs:", delegateConfigs);

      dispatch(DataActions().fetchDataRequest());
      const responseData = await fetch("https://api.example.com/data");
      const jsonData = await responseData.json();
      const snapshotData: SnapshotStore<T, K>[] = jsonData.map(
        (item: any) => ({
          // Map item properties to your Snapshot<Data> structure
        })
      );
      return snapshotData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };



  const addData = (newData: T): void => {
    dispatch(DataActions().addData(newData));
  };

  const removeData = (id: number) => {
    dispatch(DataActions().removeData(id));
  };

  const typeCheck = (snapshot: Snapshot<any, any>): snapshot is Snapshot<any, any> => {
    // Implement actual type checking logic here
    return snapshot && snapshot.id !== undefined;
  };
  
  const updateData = (id: number, newData: Snapshot<T, K>): void => {
    if (isSnapshotOfType<T, K>(newData, typeCheck)) {
      dispatch(DataActions<T, K>().updateData({ id, newData }));
    }
  };


  // Function to set an item in the data store
  const setItem = (id: string, item: T): Promise<void> => {
    return new Promise((resolve) => {
      const snapshot: Snapshot<T, K> = {
        data: item,
        // other properties that Snapshot<T, K> requires
      } as Snapshot<T, K>;

      data.set(id, snapshot);
      resolve();
    });
  };

  // Function to get an item from the data store
  const getItem = (id: string): Promise<T | undefined> => {
    return new Promise((resolve) => {
      const snapshot = data.get(id);
      if (snapshot) {
        resolve(convertSnapshotToData(snapshot));
      } else {
        resolve(undefined);
      }
    });
  };

  const getAllItems = (): Promise<Snapshot<T, K>[]> => {
    return new Promise((resolve) => {
      const items = Array.from(data.values());
      resolve(items);
    });
  };

  const removeItem = (key: string): Promise<void> => {
    return new Promise((resolve) => {
      data.delete(key);
      resolve();
    });
  };

  const updateDataTitle = (id: number, title: string) => {
    dispatch(DataActions().updateDataTitle({ id, title }));
  };

  const updateDataDescription = (id: number, description: string) => {
    dispatch(
      DataActions().updateDataDescription({
        type: "updateDataDescription",
        payload: description,
      })
    );
  };

  const updateDataStatus = (
    id: number,
    status: StatusType | undefined
  ) => {
    dispatch(
      DataActions().updateDataStatus({
        type: "updateDataStatus",
        payload: status,
      })
    );
  };

  const getDataVersions = async (id: number): Promise<Snapshot<T, K>[] | undefined> => {
    try {
      const response = await apiData.getDataVersions(id);
      const dataVersions: Snapshot<T, K>[] = response.map((version): Snapshot<T, K> => {
        const { id, versionNumber, appVersion, content, ...rest } = version;
        return rest as unknown as Snapshot<T, K>
      });
      return dataVersions;
    } catch (error) {
      console.error("Error fetching data versions:", error);
      return undefined;
    }
  };

  const addDataSuccess = async (payload: { data: Snapshot<T, K>[] }): Promise<void> => {
    const { data: newData } = payload;
  
    for (const item of newData) {
      if ('id' in item && item.id) {
        try {
          const snapshot = await snapshotApi.getSnapshot(item.id);
  
          if (snapshot) {
            const { id, versionNumber, appVersion, content, ...rest } = snapshot as Record<string, any>;
            const newSnapshot = rest as Snapshot<T, K>;
            data.set(item.id.toString(), newSnapshot);
            
            // Ensure snapshotConfig and criteria are defined
            const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
            if (numericId !== null && !isNaN(numericId)) {
              const snapshotConfig = await snapshotApi.getSnapshotConfig(numericId, snapshotApi.snapshotContainer, criteria);
              const snapshotItem: Snapshot<T, K> = transformDataToSnapshot(item, snapshotConfig, snapshotStoreConfig);
              
              if (snapshotItem.data instanceof Map) {
                snapshotItem.data.set(item.id!.toString(), item);
              }
            }
          }
        } catch (error) {
          console.error("Error processing item:", item, error);
          // Handle error appropriately
        }
      }
    }
  };
  




  const addDataStatus = (id: number, status: StatusType | undefined): void => {
    const newData = data.get(id.toString());

    if (newData) {
      let initialState: Snapshot<T, K> | null | undefined = null;
      let initialConfig: SnapshotConfig<T, K> | null | undefined = null;
      if (newData.initialState instanceof SnapshotStore) {
        // Convert SnapshotStore to Snapshot
        initialState = convertSnapshotStoreToSnapshot(newData.initialState) as Snapshot<T, K>;
      } else if (newData.initialState === null || newData.initialState === undefined) {
        initialState = null;
      } else {
        // Convert initialState data to SnapshotStore
        initialState = convertMapToSnapshot(
          newData.initialState.data
            ? new Map<string, Snapshot<T, K>>(Object.entries(newData.initialState.data))
            : new Map<string, Snapshot<T, K>>(),
          newData.initialState.timestamp
        );
      }

      const snapshotItem: Snapshot<T, K> = {
        id: id.toString(),
        data: new Map<string, Snapshot<T, K>>().set(id.toString(), newData),
        initialState: initialState,
        initialConfig: initialConfig,
        removeSubscriber, onInitialize, onError, snapshot,
        setCategory, applyStoreConfig, snapshotData, getSnapshotItems,
        defaultSubscribeToSnapshots, versionInfo, transformSubscriber, transformDelegate,
        getBackendVersion,
        getFrontendVersion,
        fetchData,
        defaultSubscribeToSnapshot: defaultSubscribeToSnapshot,
        handleSubscribeToSnapshot: handleSubscribeToSnapshot,
        removeItem: removeItem,
        getSnapshot: getSnapshot,
        getSnapshotSuccess: getSnapshotSuccess,
        setItem: setItem as T,
        getItem: getItem as T,
        getDataStore: getDataStore,
        getDataStoreMap: getDataStoreMap,

        updateDataStatus: updateDataStatus,
        addDataSuccess: addDataSuccess,
        getDataVersions: getDataVersions,
        updateDataVersions: updateDataVersions,

        initializedState: initializedState,
        getAllKeys, getAllItems, addDataStatus,
        removeData, updateData, updateDataTitle, updateDataDescription,

        timestamp: new Date(),
        events: {
          on: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            if (snapshotItem.data instanceof Map) {
              snapshotItem.data.forEach((item: Snapshot<T, K>) => {
                callback(item);
              });

              return () => {
                // Check if events and eventRecords are defined before accessing
                if (snapshotItem.events && snapshotItem.events.eventRecords) {
                  snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
                    (callbackItem: CalendarManagerStoreClass<T, K>) => callbackItem.callback !== callback
                  );
                } else {
                  console.error("Events or eventRecords are not defined.");
                }
              };
            }
          },

          off: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event] = snapshotItem.events.eventRecords[event].filter(
              (record) => record.callback !== callback
            );
          },

          emit: (
            event: string,
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>,
            snapshotStore: SnapshotStore<T, K>,
            dataItems: RealtimeDataItem[],
            criteria: SnapshotWithCriteria<T, K>,
            category: Category
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event].forEach(record => record.callback(snapshot));
          },

          once: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            const onceCallback = (snapshot: Snapshot<T, K>) => {
              callback(snapshot);
              snapshotItem.events?.off(event, onceCallback);
            };
            snapshotItem.events?.on(event, onceCallback);
          },

          addRecord: (event: string, record: CalendarManagerStoreClass<T, K>, callback: (snapshot: CalendarManagerStoreClass<T, K>) => void) => {
            if (!snapshotItem.events) return;
            if (!snapshotItem.events.eventRecords) {
              snapshotItem.events.eventRecords = {};
            }
            if (!snapshotItem.events.eventRecords[event]) {
              snapshotItem.events.eventRecords[event] = [];
            }
            snapshotItem.events.eventRecords[event].push({ record, callback });
          },

          removeAllListeners: (event?: string) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords) return;
            if (event) {
              delete snapshotItem.events.eventRecords[event];
            } else {
              snapshotItem.events.eventRecords = {};
            }
          },

          subscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            snapshotItem.events?.on(event, callback);
          },

          unsubscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
            snapshotItem.events?.off(event, callback);
          },

          trigger: (
            event: string,
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>
          ) => {
            if (!snapshotItem.events || !snapshotItem.events.eventRecords || !snapshotItem.events.eventRecords[event]) return;
            snapshotItem.events.eventRecords[event].forEach(record => record.callback(snapshot));
          },


          eventsDetails: [],

          eventRecords: {},
          callbacks: {
            // Define the `onUpdate` event
            onUpdate: [
              (snapshot: Snapshot<T, K>) => {
                // Process each snapshot
                if (snapshot.id !== undefined && snapshot.data) {
                  updateDataVersions(
                    Number(snapshot.id),
                    Array.from(snapshot.data.values())
                  );
                  const snapshotData = snapshot.data.get(snapshot.id);
                  if (snapshotData) {
                    updateDataStatus(
                      Number(snapshot.id),
                      snapshotData.status as StatusType | undefined
                    );
                    updateDataTitle(
                      Number(snapshot.id),
                      snapshotData.title as string
                    );
                    updateDataDescription(
                      Number(snapshot.id),
                      snapshotData.description as string
                    );
                    updateData(
                      Number(snapshot.id),
                      snapshotData as T
                    );
                  }
                }
              }
            ],
          },

          onSnapshotAdded: (event: string, snapshot: Snapshot<T, K>) => {
            console.log("onSnapshotAdded", snapshot);
            (this.updateSnapshot as NonNullable<typeof this.updateSnapshot>)(
              snapshot.id,
              snapshot.data,
              snapshot.events,
              snapshot.snapshotStore,
              snapshot.dataItems,
              snapshot,
              snapshot.payload,
              snapshot.store
            );
            return snapshot;
          },

          onSnapshotUpdated: (
            snapshotId: string,
            snapshot: Snapshot<T, K>,
            data: Map<string, Snapshot<T, K>>,
            events: Record<string, CalendarManagerStoreClass<T, K>[]>,
            snapshotStore: SnapshotStore<T, K>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, K>,
            payload: UpdateSnapshotPayload<T>,
            store: SnapshotStore<any, K>
          ) => {
            console.log("onSnapshotUpdated", snapshot);

            // Add an explicit check to ensure `updateSnapshot` is defined
            if (this.updateSnapshot) {
              this.updateSnapshot(
                snapshotId,
                data,
                events,
                snapshotStore,
                dataItems,
                newData,
                payload,
                store
              );
            }
          },
          onSnapshotRemoved: (
            event: string,
            snapshot: Snapshot<T, K>,
            snapshotId: string,
            subscribers: SubscriberCollection<T, K>,
            snapshotStore: SnapshotStore<T, K>,
            dataItems: RealtimeDataItem[],
            criteria: SnapshotWithCriteria<T, K>,
            category: Category
          ) => {
            console.log("onSnapshotRemoved", snapshot);

          },
          subscribers: [],
          eventIds: [],
        },
        meta: new Map<string, Snapshot<T, K>>(),
      };

      data.set(id.toString(), snapshotItem.data?.get(id.toString())!);
      dispatch(DataActions().addDataSuccess({ data: [snapshotItem] }));
    } else {
      dispatch(DataActions().addDataFailure({ error: "Invalid data" }));
    }
  };


  const

  const updateDataVersions = (id: number, versions: Snapshot<T, K>[]) => {
    dispatch(
      DataActions().updateDataVersions({
        payload: {
          id,
          versions,
        },
        type: "updateDataVersions",
      })
    );
  };

  const getBackendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getBackendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching backend version:", error);
      throw error;
    }
  };

  const getFrontendVersion = async (): Promise<string> => {
    try {
      const response = await apiData.getFrontendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching frontend version:", error);
      throw error;
    }
  };

  const getAllKeys = async (): Promise<string[]> => {
    try {
      const response = await apiData.getAllKeys();
      return response;
    } catch (error) {
      console.error("Error fetching all keys:", error);
      throw error;
    }
  };




  // Define your snapshotMethods array
  const snapshotMethods: SnapshotStoreMethod<T, K>[] = [
    {
      snapshot: (
        id: string | number | undefined,
        snapshotId: number | null,
        snapshotData: Snapshot<T, K>,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties,
        callback: (snapshotStore: SnapshotStore<T, K>) => void,
        dataStoreMethods: DataStore<T, K>,
        snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
        snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
      ): Promise<Snapshot<T, K>> => {
        try {
          const item = data.get(id);
          if (item) {
            const snapshotItem: Snapshot<T, K> = transformDataToSnapshot(item);

            // Call the callback with snapshotStore
            callback({
              addData: (data: Snapshot<T, K>) => { }, // Implement addData logic
              getItem: (key: string) => {
                return new Promise<Snapshot<T, K> | undefined>((resolve, reject) => {
                  try {
                    if (snapshotItem.data) {
                      resolve(snapshotItem.data.get(key)); // Safely access snapshotItem.data
                    } else {
                      resolve(undefined); // Handle case where snapshotItem.data is null or undefined
                    }
                  } catch (error) {
                    reject(error);
                  }
                });
              },


              id: '',
              snapshotId: '',
              key: '',
              topic: '',
              date: undefined,
              configOption: null,
              config: undefined,
              title: '',
              category: undefined,
              message: undefined,
              timestamp: undefined,
              createdBy: '',
              type: undefined,
              subscribers: [],
              set: undefined,
              data: {} as Map<string, Snapshot<T, K>>,
              state: null,
              store: null,
              snapshots: [],
              snapshotConfig: [],
              dataStore: null,
              initialState: undefined,
              dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
              delegate: [],
              subscriberId: '',
              length: 0,
              content: '',
              value: 0,
              todoSnapshotId: '',
              events: undefined,
              snapshotStore: null,
              dataItems: [],
              newData: null,
              initializedState: undefined,
              subscribeToSnapshots: subscribeToSnapshots,
              subscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): void {
                throw new Error('Function not implemented.');
              },
              transformSubscriber: function (sub: Subscriber<T, K>): Subscriber<BaseData, K> {
                throw new Error('Function not implemented.');
              },
              transformDelegate: function (): SnapshotStoreConfig<T, K>[] {
                throw new Error('Function not implemented.');
              },
              getAllKeys: function (
                storeId: number,
                snapshotId: string,
                category: symbol | string | Category | undefined,
                categoryProperties: CategoryProperties | undefined,
                snapshot: Snapshot<T, K>,
                timestamp: string | number | Date | undefined,
                type: string,
                event: Event,
                id: number,
                snapshotStore: SnapshotStore<T, K>,
                data: T
              ): Promise<string[] | undefined> {
                throw new Error('Function not implemented.');
              },
              getAllItems: function (): Promise<Snapshot<T, K>[]> {
                throw new Error('Function not implemented.');
              },
              addDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              removeData: function (id: number): void {
                throw new Error('Function not implemented.');
              },
              updateData: function (id: number, newData: Snapshot<T, K>): void {
                throw new Error('Function not implemented.');
              },
              updateDataTitle: function (id: number, title: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataDescription: function (id: number, description: string): void {
                throw new Error('Function not implemented.');
              },
              updateDataStatus: function (id: number, status: StatusType | undefined): void {
                throw new Error('Function not implemented.');
              },
              addDataSuccess: function (payload: { data:  Snapshot<T, K>[];}): void {
                throw new Error('Function not implemented.');
              },
              getDataVersions: function (id: number): Promise<Snapshot<T, K>[] | undefined> {
                throw new Error('Function not implemented.');
              },
              updateDataVersions: function (id: number, versions: Snapshot<T, K>[]): void {
                throw new Error('Function not implemented.');
              },
              getBackendVersion: function (): IHydrateResult<number> | Promise<string> {
                throw new Error('Function not implemented.');
              },
              getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
                throw new Error('Function not implemented.');
              },
              fetchData: function (id: number): Promise<SnapshotStore<T, K>[]> {
                throw new Error('Function not implemented.');
              },
              defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): string {
                throw new Error('Function not implemented.');
              },
              handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): void {
                throw new Error('Function not implemented.');
              },
              removeItem: function (key: string): Promise<void> {
                throw new Error('Function not implemented.');
              },
              getSnapshot: function (
                snapshot: (id: string) =>
                | Promise<{
                    category: Category | undefined;
                    categoryProperties: CategoryProperties;
                    timestamp: string | number | Date | undefined;
                    id: string | number | undefined;
                    snapshot: Snapshot<T, K>;
                    snapshotStore: SnapshotStore<T, K>;
                    data: T;
                  }>
                | undefined
              ): Promise<Snapshot<T, K> | undefined> {
                throw new Error('Function not implemented.');
              },
              getSnapshotSuccess: function (snapshot: Snapshot<T, K>): Promise<SnapshotStore<T, K>> {
                throw new Error('Function not implemented.');
              },
              getSnapshotId: function (key: SnapshotData<T, K>): Promise<string | undefined> {
                throw new Error('Function not implemented.');
              },
              setItem: function (key: string, value: Snapshot<T, K>): Promise<void> {
                throw new Error('Function not implemented.');
              },
              addSnapshotFailure: function (
                date: Date, 
                snapshotManager: SnapshotManager<T, K>, 
                snapshot: Snapshot<T, K>, 
                payload: { error: Error; }
              ): void {
                throw new Error('Function not implemented.');
              },
              getDataStore: function (): Promise<DataStore<T, K>[]> {
                throw new Error('Function not implemented.');
              },
              addSnapshotSuccess: function (
                snapshot: T,
                subscribers: SubscriberCollection<T, K>
              ): void {
                throw new Error('Function not implemented.');
              },
              compareSnapshotState: function (
                stateA: Snapshot<T, K> | Snapshot<T, K>[] | null | undefined, 
                stateB: Snapshot<T, K> | null | undefined
              ): boolean {
                throw new Error('Function not implemented.');
              },
              deepCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              shallowCompare: function (objA: any, objB: any): boolean {
                throw new Error('Function not implemented.');
              },
              getDataStoreMethods: function () {
                throw new Error('Function not implemented.');
              },
              getDelegate: function (): SnapshotStoreConfig<T, K>[] {
                throw new Error('Function not implemented.');
              },
              determineCategory: function (snapshot: Snapshot<T, K> | null | undefined): string {
                throw new Error('Function not implemented.');
              },
              determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
                throw new Error('Function not implemented.');
              },
              updateSnapshot: function (
                snapshotId: string,
                data: Map<string, Snapshot<T, K>>,
                events: Record<string, CalendarManagerStoreClass<T, K>[]>,
                snapshotStore: SnapshotStore<T, K>,
                dataItems: RealtimeDataItem[],
                newData: Snapshot<T, K>,
                payload: UpdateSnapshotPayload<T>,
                store: SnapshotStore<any, K>
              ): Promise<{ snapshot: Snapshot<T, K>; }> {
                throw new Error('Function not implemented.');
              },
              updateSnapshotSuccess: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotFailure: function (
                snapshotManager: SnapshotManager<T, K>,
                snapshot: Snapshot<T, K>,
                date: Date | undefined,
                payload: { error: Error; }
              ): void {
                throw new Error('Function not implemented.');
              },
              removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              addSnapshot: function (snapshot: SnapshotStore<any, T>, subscribers: Subscriber<BaseData, K>[]): Promise<void> {
                throw new Error('Function not implemented.');
              },
              createSnapshot: function (
                id: string,
                snapshotData: SnapshotStoreConfig<any, T>,
                category: string): Snapshot<Data, Data> {
                throw new Error('Function not implemented.');
              },
              createSnapshotSuccess: function (snapshot: Snapshot<Data, Data>): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotSuccess: function (snapshotData: any, subscribers: ((data: Snapshot<BaseData, BaseData>) => void)[]): void {
                throw new Error('Function not implemented.');
              },
              setSnapshotFailure: function (error: Error): void {
                throw new Error('Function not implemented.');
              },
              createSnapshotFailure: function (snapshot: Snapshot<T, BaseData>, error: Error): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T>) => void): void {
                throw new Error('Function not implemented.');
              },
              updateSnapshotsFailure: function (error: Payload): void {
                throw new Error('Function not implemented.');
              },
              initSnapshot: function (
                snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
                snapshotId: number,
                snapshotData: SnapshotStore<T, K>, // Ensure snapshotData matches SnapshotStore<T, K>
                category: symbol | string | Category | undefined,
                categoryProperties: CategoryProperties | undefined,
                categoryProperties: CategoryProperties,
                snapshotConfig: SnapshotStoreConfig<T, K>, // Use K instead of T for snapshotConfig
                callback: (snapshotStore: SnapshotStore<any, any>) => void
              ): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshot: function (snapshot: SnapshotStore<T, K>, subscribers: Subscriber<T, K>[]): Promise<{ snapshot: SnapshotStore<T, K>; }> {
                throw new Error('Function not implemented.');
              },
              takeSnapshotSuccess: function (snapshot: SnapshotStore<T, K>): void {
                throw new Error('Function not implemented.');
              },
              takeSnapshotsSuccess: function (snapshots: T[]): void {
                throw new Error('Function not implemented.');
              },
              configureSnapshotStore: function (
                snapshotStore: SnapshotStore<T, K>,
                snapshotId: string,
                data: Map<string, Snapshot<T, K>>,
                events: Record<string, CalendarManagerStoreClass<T, K>[]>,
                dataItems: RealtimeDataItem[],
                newData: Snapshot<T, K>,
                payload: ConfigureSnapshotStorePayload<T>,
                store: SnapshotStore<any, K>,
                callback: (snapshotStore: SnapshotStore<T, K>) => void
              ): void {
                throw new Error('Function not implemented.');
              },
              getData: function (id: number, snapshot: Snapshot<T, K>): Promise<T> {
                throw new Error('Function not implemented.');
              },
              flatMap: function (value: SnapshotStoreConfig<BaseData, K>, index: number, array: SnapshotStoreConfig<BaseData, K>[]): void {
                throw new Error('Function not implemented.');
              },
              setData: function (data: T): void {
                throw new Error('Function not implemented.');
              },
              getState: function () {
                throw new Error('Function not implemented.');
              },
              setState: function (state: any): void {
                throw new Error('Function not implemented.');
              },
              validateSnapshot: function (snapshot: Snapshot<T, K>): boolean {
                throw new Error('Function not implemented.');
              },
              handleSnapshot: function (
                id: string,
                snapshotId: number,
                snapshot: T | null,
                snapshotData: T,
                category: Category | undefined,
                categoryProperties: CategoryProperties,
                callback: (snapshot: T) => void,
                snapshots: SnapshotsArray<T>,
                type: string,
                event: Event,
                snapshotContainer?: T,
                snapshotStoreConfig?: SnapshotStoreConfig<T, K>
              ): Promise<Snapshot<T, K> | null> {
                throw new Error('Function not implemented.');
              },
              handleActions: function (): void {
                throw new Error('Function not implemented.');
              },
              setSnapshot: function (snapshot: Snapshot<T, K>): void {
                throw new Error('Function not implemented.');
              },
              transformSnapshotConfig: function <T extends BaseData, K extends BaseData>(
                config: SnapshotConfig<BaseData, K>
              ): SnapshotConfig<BaseData, K> {
                throw new Error('Function not implemented.');
              },
              setSnapshotData: function (
                snapshotStore: SnapshotStore<T, K>,
                data: Map<string, Snapshot<T, K>>,
                subscribers: Subscriber<T, K>[],
                snapshotData: Partial<SnapshotStoreConfig<T, K>>
              ): void {
                throw new Error('Function not implemented.');
              },
              setSnapshots: function  (snapshots: Snapshots<T>): void {
                throw new Error('Function not implemented.');
              },
              clearSnapshot: function (): void {
                throw new Error('Function not implemented.');
              },
              mergeSnapshots: function (snapshots: Snapshots<T>, category: string): void {
                throw new Error('Function not implemented.');
              },
              reduceSnapshots: function <U>(callback: (
                acc: U, 
                snapshot: Snapshot<T, K>
              ) => U,
               initialValue: U): U | undefined {
                throw new Error('Function not implemented.');
              },
              sortSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              filterSnapshots: function (): void {
                throw new Error('Function not implemented.');
              },
              mapSnapshots: function (
                storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    snapshot: Snapshot<T, K>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: T,
    ) => Promise<SnapshotsArray<T>>
              ): Promise<SnapshotsArray<T>> {
                throw new Error('Function not implemented.');
              },
              findSnapshot: function (): void {
                throw new Error('Function not implemented.');
              },
              getSubscribers: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T>; }> {
                throw new Error('Function not implemented.');
              },
              notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
                throw new Error('Function not implemented.');
              },
              notifySubscribers: function (subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, K>[] {
                throw new Error('Function not implemented.');
              },
              subscribe: function (): void {
                throw new Error('Function not implemented.');
              },
              unsubscribe: function (): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshot: function (
                snapshotId: string,
                category: symbol | string | Category | undefined,
                categoryProperties: CategoryProperties | undefined,
                timestamp: Date, snapshot: Snapshot<T, BaseData>,
                data: T,
                delegate: SnapshotStoreConfig<BaseData, BaseData>[]): Promise<{
                  id: any;
                  category: Category
                  timestamp: any;
                  snapshot: Snapshot<T, K>;
                  data: T; getItem?: ((snapshot: Snapshot<T, K>) => Snapshot<T, K> | undefined) | undefined;
                }> {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotSuccess: function (
                snapshotData: (
                  snapshotManager: SnapshotManager<T, K>,
                  subscribers: Subscriber<T, K>[],
                  snapshot: Snapshot<T, K>) => void
              ): void {
                throw new Error('Function not implemented.');
              },
              fetchSnapshotFailure: function (payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              getSnapshots: function (category: string, data: Snapshots<T>): void {
                throw new Error('Function not implemented.');
              },
              getAllSnapshots: function (data: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => Promise<Snapshots<T>>): void {
                throw new Error('Function not implemented.');
              },
              generateId: function (): string {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshots: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T>; }>): void {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
                throw new Error('Function not implemented.');
              },
              batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
                throw new Error('Function not implemented.');
              },
              batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
                throw new Error('Function not implemented.');
              },
              batchTakeSnapshot: function (
                snapshotStore: SnapshotStore<T, K>,
                 snapshots: Snapshots<T>): Promise<{ snapshots: Snapshots<T>; }> {
                throw new Error('Function not implemented.');
              },
              handleSnapshotSuccess: function (snapshot: Snapshot<Data, Data> | null, snapshotId: string): void {
                throw new Error('Function not implemented.');
              },
              [Symbol.iterator]: function (): IterableIterator<Snapshot<T, K>> {
                throw new Error('Function not implemented.');
              }
            });
            // Return the snapshotItem
            return Promise.resolve(snapshotItem)
          } else {
            // Handle case where item is not found
            throw new Error("Item not found");
          }
        } catch (error) {
          console.error("Error in snapshot method:", error);
          throw error; // Propagate the error
        }
      },
      // Add other methods and properties as needed
    }
  ];

  const { versionNumber } = getCurrentAppInfo();
  return {
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    getItem,
    setItem,
    removeItem,
    getAllItems,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    addDataStatus,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion,
    versionNumber: versionNumber,
    appVersion: currentAppVersion,
    content: {},
    getData: fetchData,
    getAllKeys,
    snapshotMethods
  };
};

export { initializeState, useDataStore };
export type { InitializedState, VersionedData };

