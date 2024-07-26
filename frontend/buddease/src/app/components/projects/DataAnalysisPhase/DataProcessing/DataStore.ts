import SnapshotStore, { SnapshotData } from '@/app/components/snapshots/SnapshotStore';
// data/DataStore.ts
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { BaseData, Data } from "@/app/components/models/data/Data";
import { CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";
import transformDataToSnapshot from '@/app/components/snapshots/transformDataToSnapshot';
import { ChosenSnapshotState, convertMapToSnapshotStore, convertSnapshotStoreToSnapshot } from '@/app/components/typings/YourSpecificSnapshotType';
import { SnapshotStoreMethod } from '@/app/components/snapshots/SnapshotStorMethods';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotConfig';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { NotificationPosition } from '@/app/components/models/data/StatusType';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { NotificationType } from '@/app/components/support/NotificationContext';
import { Subscriber } from '@/app/components/users/Subscriber';
import { IHydrateResult } from 'mobx-persist';

export interface DataStore<T extends BaseData, K extends BaseData> {
  data?: Map<string, Snapshot<T, K>> | undefined;
  storage?: SnapshotStore<T, K> | undefined;
  addData: (data: Snapshot<T,K>) => void;
  getItem: (id: string) => Promise<Snapshot<T> | undefined>;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Snapshot<T>) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => void;
  updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => void;
  addDataSuccess: (payload: { data: Snapshot<T>[] }) => void;
  
  getDataVersions: (id: number) => Promise<Snapshot<T>[] | undefined>;
  updateDataVersions: (id: number, versions: Snapshot<T>[]) => void;
  getBackendVersion: () => IHydrateResult<number> | Promise<string>;
  getFrontendVersion: () => IHydrateResult<number> | Promise<string>;

  getAllKeys: () => Promise<string[]>;
  fetchData: (id: number) => Promise<SnapshotStore<T, K>[]>; // Modify the signature to return a Promise
  setItem: (id: string, item: Snapshot<T>) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: () => Promise<T[]>;
  getDelegate: () => SnapshotStoreConfig<T, T>[]
  snapshotMethods?: SnapshotStoreMethod<T, K>[];
  // storage: SnapshotStore<T> | undefined;
}

interface VersionedData<T extends BaseData, K extends BaseData> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: () => Promise<SnapshotStore<T,K>[]>;
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


const useDataStore = <T extends BaseData, K extends BaseData>(): DataStore<T, K> & VersionedData<T, K> => {
  const data: Map<string, T> = new Map<string, T>();
  const dispatch = useDispatch();

  const fetchData = async (): Promise<SnapshotStore<T, K>[]> => {
    try {
      dispatch(DataActions.fetchDataRequest());
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

  const addData = (newData: Snapshot<T,K>): void => {
    dispatch(DataActions.addData(newData));
  };

  const removeData = (id: number) => {
    dispatch(DataActions.removeData(id));
  };

  const updateData = (id: number, newData: T): void => {
    dispatch(DataActions.updateData({ id, newData }));
  };

  const getItem = (id: string): Promise<T | undefined> => {
    return new Promise((resolve) => {
      const item = data.get(id);
      resolve(item);
    });
  };

  const setItem = (id: string, item: T): Promise<void> => {
    return new Promise((resolve) => {
      data.set(id, item);
      resolve();
    });
  };

  const getAllItems = (): Promise<T[]> => {
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
    dispatch(DataActions.updateDataTitle({ id, title }));
  };

  const updateDataDescription = (id: number, description: string) => {
    dispatch(
      DataActions.updateDataDescription({
        type: "updateDataDescription",
        payload: description,
      })
    );
  };

  const updateDataStatus = (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => {
    dispatch(
      DataActions.updateDataStatus({
        type: "updateDataStatus",
        payload: status,
      })
    );
  };

  const getDataVersions = async (id: number): Promise<T[] | undefined> => {
    try {
      const response = await apiData.getDataVersions(id);
      const dataVersions: T[] = response.map((version): T => {
        const { id, versionNumber, appVersion, content, ...rest } = version;
        return rest as unknown as T;
      });
      return dataVersions;
    } catch (error) {
      console.error("Error fetching data versions:", error);
      return undefined;
    }
  };

  const addDataSuccess = (payload: { data: T[] }): void => {
    const { data: newData } = payload;
    newData.forEach((item: T) => {
      if ('id' in item) {
        const snapshotItem: Snapshot<T, K> = transformDataToSnapshot(item);
        if (snapshotItem.data) {
          snapshotItem.data.set(item.id!.toString(), item);
        }
      }
    });
  };

  
  const addDataStatus = (id: number, status: "pending" | "inProgress" | "completed"): void => {
    const newData = data.get(id.toString());
    
    if (newData) {
      let initialState: Snapshot<T, K> | null | undefined = null;
  
      if (newData.initialState instanceof SnapshotStore) {
        // Convert SnapshotStore to Snapshot
        initialState = convertSnapshotStoreToSnapshot(newData.initialState as Snapshot<T, K>) as Snapshot<BaseData, Bas>
      } else if (newData.initialState === null || newData.initialState === undefined) {
        initialState = null;
      } else {
        // Convert initialState data to SnapshotStore
        initialState = convertMapToSnapshotStore(newData.initialState.data as Map<string, T>) as SnapshotStore<T, K>;
      }
  
      const snapshotItem: Snapshot<T, K> = {
        id: id.toString(),
        data: new Map<string, T>().set(id.toString(), newData),
        initialState: initialState,
        timestamp: new Date(),
      };
  
      data.set(id.toString(), snapshotItem.data?.get(id.toString())!);
  
      dispatch(DataActions.addDataSuccess({ data: [snapshotItem] }));
    } else {
      dispatch(DataActions.addDataFailure({ error: "Invalid data" }));
    }
  };
  

  const updateDataVersions = (id: number, versions: T[]) => {
    dispatch(
      DataActions.updateDataVersions({
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


  const snapshotMethods: SnapshotStoreMethod<BaseData, BaseData>[] = [
    {
      snapshot: (
        id: string,
        snapshotData: SnapshotStoreConfig<any, BaseData>,
        category: string | CategoryProperties | undefined,
        callback: (snapshotStore: SnapshotStore<BaseData, BaseData>) => void) => {
        const item = data.get(id);
        if (item) {
          const snapshotItem: Snapshot<T> = transformDataToSnapshot(item);
          // Implement your logic to call the callback with snapshotStore
          // For example:
          callback({
            addData: (data: Snapshot<BaseData, BaseData>) => { }, // Implement addData logic
            getItem: (key: string) => {
              return new Promise<BaseData | undefined>((resolve, reject) => {
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
            data: {} as Map<string, T>,
            state: null,
            store: null,
            snapshots: [],
            snapshotConfig: [],
            dataStore: undefined,
            initialState: undefined,
            dataStoreMethods: {} as DataStore<T, T>,
            delegate: [],
            subscriberId: '',
            length: 0,
            content: '',
            value: 0,
            todoSnapshotId: '',
            events: undefined,
            snapshot: undefined,
            snapshotStore: null,
            dataItems: [],
            newData: undefined,
            initializedState: undefined,
            subscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null, snapshot?: Snapshot<T, T> | null): void {
              throw new Error('Function not implemented.');
            },
            subscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, T>>, snapshot: Snapshot<T, T>): void {
              throw new Error('Function not implemented.');
            },
            transformSubscriber: function (sub: Subscriber<T, T>): Subscriber<BaseData, T> {
              throw new Error('Function not implemented.');
            },
            transformDelegate: function (): SnapshotStoreConfig<T, T>[] {
              throw new Error('Function not implemented.');
            },
            getAllKeys: function (): Promise<string[]> {
              throw new Error('Function not implemented.');
            },
            getAllItems: function (): Promise<T[]> {
              throw new Error('Function not implemented.');
            },
            addDataStatus: function (id: number, status: 'pending' | 'inProgress' | 'completed'): void {
              throw new Error('Function not implemented.');
            },
            removeData: function (id: number): void {
              throw new Error('Function not implemented.');
            },
            updateData: function (id: number, newData: T): void {
              throw new Error('Function not implemented.');
            },
            updateDataTitle: function (id: number, title: string): void {
              throw new Error('Function not implemented.');
            },
            updateDataDescription: function (id: number, description: string): void {
              throw new Error('Function not implemented.');
            },
            updateDataStatus: function (id: number, status: 'pending' | 'inProgress' | 'completed'): void {
              throw new Error('Function not implemented.');
            },
            addDataSuccess: function (payload: { data: T[]; }): void {
              throw new Error('Function not implemented.');
            },
            getDataVersions: function (id: number): Promise<T[] | undefined> {
              throw new Error('Function not implemented.');
            },
            updateDataVersions: function (id: number, versions: T[]): void {
              throw new Error('Function not implemented.');
            },
            getBackendVersion: function (): Promise<string | undefined> {
              throw new Error('Function not implemented.');
            },
            getFrontendVersion: function (): Promise<string | undefined> {
              throw new Error('Function not implemented.');
            },
            fetchData: function (id: number): Promise<SnapshotStore<T, T>[]> {
              throw new Error('Function not implemented.');
            },
            defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, T>>, snapshot: Snapshot<T, T>): void {
              throw new Error('Function not implemented.');
            },
            handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, T>>, snapshot: Snapshot<T, T>): void {
              throw new Error('Function not implemented.');
            },
            removeItem: function (key: string): Promise<void> {
              throw new Error('Function not implemented.');
            },
            getSnapshot: function (snapshot: () => Promise<{ category: any; timestamp: any; id: any; snapshotStore: SnapshotStore<T, T>; data: T; }> | undefined): Promise<SnapshotStore<T, T>> {
              throw new Error('Function not implemented.');
            },
            getSnapshotSuccess: function (snapshot: Snapshot<T, T>): Promise<SnapshotStore<T, T>> {
              throw new Error('Function not implemented.');
            },
            getSnapshotId: function (key: SnapshotData): Promise<string | undefined> {
              throw new Error('Function not implemented.');
            },
            setItem: function (key: string, value: T): Promise<void> {
              throw new Error('Function not implemented.');
            },
            addSnapshotFailure: function (date: Date, error: Error): void {
              throw new Error('Function not implemented.');
            },
            getDataStore: function (): Map<string, T> {
              throw new Error('Function not implemented.');
            },
            addSnapshotSuccess: function (snapshot: T, subscribers: Subscriber<T, T>[]): void {
              throw new Error('Function not implemented.');
            },
            compareSnapshotState: function (stateA: Snapshot<T, T> | Snapshot<T, T>[] | null | undefined, stateB: Snapshot<T, T> | null | undefined): boolean {
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
            getDelegate: function (): SnapshotStoreConfig<T, T>[] {
              throw new Error('Function not implemented.');
            },
            determineCategory: function (snapshot: Snapshot<T, T> | null | undefined): string {
              throw new Error('Function not implemented.');
            },
            determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
              throw new Error('Function not implemented.');
            },
            updateSnapshot: function (snapshotId: string, data: Map<string, BaseData>, events: Record<string, CalendarEvent[]>, snapshotStore: SnapshotStore<T, T>, dataItems: RealtimeDataItem[], newData: Snapshot<T, T>, payload: UpdateSnapshotPayload<T>, store: SnapshotStore<any, T>): Promise<{ snapshot: SnapshotStore<T, T>; }> {
              throw new Error('Function not implemented.');
            },
            updateSnapshotSuccess: function (): void {
              throw new Error('Function not implemented.');
            },
            updateSnapshotFailure: function (payload: { error: string; }): void {
              throw new Error('Function not implemented.');
            },
            removeSnapshot: function (snapshotToRemove: SnapshotStore<T, T>): void {
              throw new Error('Function not implemented.');
            },
            clearSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            addSnapshot: function (snapshot: SnapshotStore<any, T>, subscribers: Subscriber<BaseData, T>[]): Promise<void> {
              throw new Error('Function not implemented.');
            },
            createSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, T>, category: string): Snapshot<Data, Data> {
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
            createSnapshotFailure: function (snapshot: Snapshot<BaseData, BaseData>, error: Error): void {
              throw new Error('Function not implemented.');
            },
            updateSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, T>[], snapshot: Snapshots<T>) => void): void {
              throw new Error('Function not implemented.');
            },
            updateSnapshotsFailure: function (error: Payload): void {
              throw new Error('Function not implemented.');
            },
            initSnapshot: function (snapshotConfig: SnapshotStoreConfig<T, T>, snapshotData: SnapshotStore<T, T>): void {
              throw new Error('Function not implemented.');
            },
            takeSnapshot: function (snapshot: SnapshotStore<T, T>, subscribers: Subscriber<T, T>[]): Promise<{ snapshot: SnapshotStore<T, T>; }> {
              throw new Error('Function not implemented.');
            },
            takeSnapshotSuccess: function (snapshot: SnapshotStore<T, T>): void {
              throw new Error('Function not implemented.');
            },
            takeSnapshotsSuccess: function (snapshots: T[]): void {
              throw new Error('Function not implemented.');
            },
            configureSnapshotStore: function (snapshot: SnapshotStore<T, T>): void {
              throw new Error('Function not implemented.');
            },
            getData: function (snapshot: Snapshot<T, T>): Promise<T> {
              throw new Error('Function not implemented.');
              },
            flatMap: function (value: SnapshotStoreConfig<BaseData, T>, index: number, array: SnapshotStoreConfig<BaseData, T>[]): void {
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
            validateSnapshot: function (snapshot: Snapshot<T, T>): boolean {
              throw new Error('Function not implemented.');
            },
            handleSnapshot: function (snapshot: Snapshot<BaseData, BaseData> | null, snapshotId: string): void {
              throw new Error('Function not implemented.');
            },
            handleActions: function (): void {
              throw new Error('Function not implemented.');
            },
            setSnapshot: function (snapshot: SnapshotStore<T, T>): void {
              throw new Error('Function not implemented.');
            },
            transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
              throw new Error('Function not implemented.');
            },
            setSnapshotData: function (subscribers: Subscriber<any, any>[], snapshotData: Partial<SnapshotStoreConfig<BaseData, T>>): void {
              throw new Error('Function not implemented.');
            },
            setSnapshots: function (snapshots: SnapshotStore<T, T>[]): void {
              throw new Error('Function not implemented.');
            },
            clearSnapshot: function (): void {
              throw new Error('Function not implemented.');
            },
            mergeSnapshots: function (snapshots: T[]): void {
              throw new Error('Function not implemented.');
            },
            reduceSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            sortSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            filterSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            mapSnapshots: function (): void {
              throw new Error('Function not implemented.');
            },
            findSnapshot: function (): void {
              throw new Error('Function not implemented.');
            },
            getSubscribers: function (subscribers: Subscriber<T, T>[], snapshots: Snapshots<T>): Promise<{ subscribers: Subscriber<T, T>[]; snapshots: Snapshots<T>; }> {
              throw new Error('Function not implemented.');
            },
            notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
              throw new Error('Function not implemented.');
            },
            notifySubscribers: function (subscribers: Subscriber<T, T>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, T>[] {
              throw new Error('Function not implemented.');
            },
            subscribe: function (): void {
              throw new Error('Function not implemented.');
            },
            unsubscribe: function (): void {
              throw new Error('Function not implemented.');
            },
            fetchSnapshot: function (snapshotId: string, category: string | CategoryProperties | undefined, timestamp: Date, snapshot: Snapshot<BaseData, BaseData>, data: T, delegate: SnapshotStoreConfig<BaseData, T>[]): Promise<{ id: any; category: string | CategoryProperties | undefined; timestamp: any; snapshot: Snapshot<BaseData, BaseData>; data: T; getItem?: ((snapshot: Snapshot<T, T>) => Snapshot<T, T> | undefined) | undefined; }> {
              throw new Error('Function not implemented.');
            },
            fetchSnapshotSuccess: function (snapshotData: (subscribers: Subscriber<T, T>[], snapshot: Snapshots<BaseData>) => void): void {
              throw new Error('Function not implemented.');
            },
            fetchSnapshotFailure: function (payload: { error: Error; }): void {
              throw new Error('Function not implemented.');
            },
            getSnapshots: function (category: string, data: Snapshots<T>): void {
              throw new Error('Function not implemented.');
            },
            getAllSnapshots: function (data: (subscribers: Subscriber<T, T>[], snapshots: Snapshots<T>) => Promise<Snapshots<T>>): void {
              throw new Error('Function not implemented.');
            },
            generateId: function (): string {
              throw new Error('Function not implemented.');
            },
            batchFetchSnapshots: function (subscribers: Subscriber<T, T>[], snapshots: Snapshots<T>): void {
              throw new Error('Function not implemented.');
            },
            batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
              throw new Error('Function not implemented.');
            },
            batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<T, T>[]) => Promise<{ subscribers: Subscriber<T, T>[]; snapshots: Snapshots<T>; }>): void {
              throw new Error('Function not implemented.');
            },
            batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, T>[], snapshots: Snapshots<T>): void {
              throw new Error('Function not implemented.');
            },
            batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error('Function not implemented.');
            },
            batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, T>[], snapshots: Snapshots<T>): void {
              throw new Error('Function not implemented.');
            },
            batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error('Function not implemented.');
            },
            batchTakeSnapshot: function (snapshotStore: SnapshotStore<T, T>, snapshots: Snapshots<T>): Promise<{ snapshots: Snapshots<T>; }> {
              throw new Error('Function not implemented.');
            },
            handleSnapshotSuccess: function (snapshot: Snapshot<Data, Data> | null, snapshotId: string): void {
              throw new Error('Function not implemented.');
            },
            [Symbol.iterator]: function (): IterableIterator<Snapshot<T, T>> {
              throw new Error('Function not implemented.');
            }
          });
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

export { useDataStore };
