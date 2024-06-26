import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
// data/DataStore.ts
import { BaseData, Data } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { useDispatch } from "react-redux";
import * as apiData from "../../../../api//ApiData";
import { DataActions } from "../DataActions";

type T = BaseData | undefined;
export interface DataStore<T extends BaseData> {
  data: Map<string, Snapshot<T>>;
  addData: (data: T) => void;
  getItem: (id: string) => Snapshot<T> | undefined;
  removeData: (id: number) => void;
  updateData: (id: number, newData: T) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (description: string) => void;
  updateDataStatus: (status: "pending" | "inProgress" | "completed") => void;
  addDataSuccess: (payload: { data: T[] }) => void;
  getDataVersions: (id: number) => Promise<T[] | undefined>;
  updateDataVersions: (id: number, versions: T[]) => void;
  getBackendVersion: () => Promise<string>;
  getFrontendVersion: () => Promise<string>;
  fetchData: () => Promise<SnapshotStore<Snapshot<T>>[]>; // Modify the signature to return a Promise
}

interface VersionedData<T extends BaseData> {
  versionNumber: string;
  appVersion: string;
  content: any;
  getData: () => Promise<SnapshotStore<Snapshot<T>>[]>;
}

const useDataStore = <T extends BaseData>(): DataStore<T> => {
  const data: Map<string, Snapshot<T>> = new Map<string, Snapshot<T>>();
  const dispatch = useDispatch();

  const fetchData = async (): Promise<SnapshotStore<Snapshot<T>>[]> => {
    try {
      // Dispatch the fetchDataRequest action
      dispatch(DataActions.fetchDataRequest());

      // Simulate fetching data from an API
      const responseData = await fetch("https://api.example.com/data");
      const jsonData = await responseData.json();

      // Assuming jsonData is the format you expect, convert it to SnapshotStore<Snapshot<Data>>[]
      const snapshotData: SnapshotStore<Snapshot<T>>[] = jsonData.map(
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


  const getItem = (id: string): Snapshot<T> | undefined => {
    return data.get(id);
  };


  const updateDataTitle = (id: number, title: string) => {
    // Dispatch the updateDataTitle action
    dispatch(DataActions.updateDataTitle({ id, title }));
  };

  const updateDataDescription = (description: string) => {
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
      if (item.id !== undefined) {
        data.set(item.id.toString(), item);
      }
    });
  };

  const updateDataVersions = (id: number, versions: Data[]) => {
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
  // Other methods...

  return {
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    getItem,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion,
  };
};
export { useDataStore };
