import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
// data/DataStore.ts
import { currentAppVersion } from '@/app/api/headers/authenticationHeaders';
import { BaseData } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";

export interface DataStore<T extends BaseData> {
  data: Map<string, T> | undefined;
  addData: (data: T) => void;
  getItem: (id: string) => Promise<T | undefined>;
  removeData: (id: number) => void;
  updateData: (id: number, newData: T) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (id: number, description: string) => void;
  updateDataStatus: (status: "pending" | "inProgress" | "completed") => void;
  addDataSuccess: (payload: { data: T[] }) => void;
  getDataVersions: (id: number) => Promise<T[] | undefined>;
  updateDataVersions: (id: number, versions: T[]) => void;
  getBackendVersion: () => Promise<string | undefined>;
  getFrontendVersion: () => Promise<string | undefined>;
  getAllKeys: () => Promise<string[]>;
  fetchData: () => Promise<SnapshotStore<BaseData>[]>; // Modify the signature to return a Promise
  setItem: (id: string, item: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>
  getAllItems: () => Promise<T[]>;
}

interface VersionedData<T extends BaseData> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: () => Promise<SnapshotStore<BaseData>[]>;
}

const useDataStore = <T extends BaseData>(): DataStore<T> & VersionedData<T> => {
  const data: Map<string, T> = new Map<string, T>();
  const dispatch = useDispatch();

  const fetchData = async (): Promise<SnapshotStore<BaseData>[]> => {
    try {
      // Dispatch the fetchDataRequest action
      dispatch(DataActions.fetchDataRequest());

      // Simulate fetching data from an API
      const responseData = await fetch("https://api.example.com/data");
      const jsonData = await responseData.json();

      // Assuming jsonData is the format you expect, convert it to SnapshotStore<Snapshot<Data>>[]
      const snapshotData: SnapshotStore<BaseData>[] = jsonData.map(
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

  const updateDataDescription = (id: number,description: string) => {
    // Dispatch the updateDataDescription action
    dispatch(
      DataActions.updateDataDescription({
        type: "updateDataDescription",
        payload: "Updated description",
      })
    );
  };

  const updateDataStatus = (status: "pending" | "inProgress" | "completed") => {
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
        const snapshotItem: Snapshot<T> = {
          id: item.id,
          data: item,
          initialState: item.initialState || null,
          timestamp: new Date(),
        };

        data.set(item.id!.toString(), snapshotItem as T);
      }
    });
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
  const { versionNumber } = getCurrentAppInfo();
  // useVersionedData(data, fetchData);
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
