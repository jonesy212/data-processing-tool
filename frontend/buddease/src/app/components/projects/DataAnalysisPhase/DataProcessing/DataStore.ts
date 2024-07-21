import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
// data/DataStore.ts
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { BaseData } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";
import transformDataToSnapshot from '@/app/components/snapshots/transformDataToSnapshot';
import { convertMapToSnapshotStore } from '@/app/components/typings/YourSpecificSnapshotType';

export interface DataStore<T extends BaseData, K extends BaseData> {
  data?: Map<string, T> | undefined;
  addData: (data: T) => void;
  getItem: (id: string) => Promise<T | undefined>;
  removeData: (id: number) => void;
  updateData: (id: number, newData: T) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => void;
  updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => void;
  addDataSuccess: (payload: { data: T[] }) => void;
  getDataVersions: (id: number) => Promise<T[] | undefined>;
  updateDataVersions: (id: number, versions: T[]) => void;
  getBackendVersion: () => Promise<string | undefined>;
  getFrontendVersion: () => Promise<string | undefined>;
  getAllKeys: () => Promise<string[]>;
  fetchData: (id: number) => Promise<SnapshotStore<T, K>[]>; // Modify the signature to return a Promise
  setItem: (id: string, item: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: () => Promise<T[]>;
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
      // Dispatch the fetchDataRequest action
      dispatch(DataActions.fetchDataRequest());

      // Simulate fetching data from an API
      const responseData = await fetch("https://api.example.com/data");
      const jsonData = await responseData.json();

      // Assuming jsonData is the format you expect, convert it to SnapshotStore<Snapshot<Data>>[]
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
    dispatch(DataActions.addData(newData));
  };

  const removeData = (id: number) => {
    // Dispatch the removeData action
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
    // Dispatch the updateDataTitle action
    dispatch(DataActions.updateDataTitle({ id, title }));
  };

  const updateDataDescription = (id: number, description: string) => {
    // Dispatch the updateDataDescription action
    dispatch(
      DataActions.updateDataDescription({
        type: "updateDataDescription",
        payload: "Updated description",
      })
    );
  };

  const updateDataStatus = (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => {
    // Dispatch the updateDataStatus action
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

      // Use type assertion to map response to T[]
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
        const snapshotItem: Snapshot<T> = transformDataToSnapshot(item);


        if (snapshotItem.data) {
          snapshotItem.data.set(item.id!.toString(), item);
        }
      }
    });
  };

  const addDataStatus = (id: number, status: "pending" | "inProgress" | "completed"): void => {
    // Implement your logic here
    // Example: Update data status based on id and status
    const newData = data.get(id.toString());
    
    if (newData) {
      let initialState: SnapshotStore<T, K> | Snapshot<T, K> | null | undefined = null;
  
      if (newData.initialState instanceof SnapshotStore) {
        initialState = newData.initialState;
      } else if (newData.initialState === null || newData.initialState === undefined) {
        initialState = null;
      } else {
        // Transform newData.initialState to Map<string, T> if necessary
        // Example:
        initialState = convertMapToSnapshotStore(newData.initialState); 
      }
  
      const snapshotItem: Snapshot<T> = {
        id: id.toString(),
        data: new Map<string, T>().set(id.toString(), newData),
        initialState: initialState,
        timestamp: new Date(),
      };
  
      // Update or set the data in the map
      data.set(id.toString(), snapshotItem as T);
  
      // Dispatch the addDataSuccess action
      dispatch(DataActions.addDataSuccess({ data: [snapshotItem] }));
    } else {
      // Dispatch the addDataFailure action
      dispatch(DataActions.addDataFailure({ error: "Invalid data" }));
    }
  };
  


  const updateDataVersions = (id: number, versions: T[]) => {
    // Dispatch the updateDataVersions action
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

  // Return the composed object with all methods and properties
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
    content: {}, // Provide appropriate values
    getData: fetchData, // Provide appropriate values
    getAllKeys
  };
};

export { useDataStore };
