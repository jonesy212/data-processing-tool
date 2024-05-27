// data/DataStore.ts
import { Data } from "@/app/components/models/data/Data";
import Version from "@/app/components/versions/Version";
import { useDispatch } from "react-redux";
import * as apiData from '../../../../api//ApiData';
import { DataActions } from "../DataActions";
import SnapshotStore, { Snapshot } from "@/app/components/snapshots/SnapshotStore";
export interface DataStore {
  data: Data[];
  addData: (data: Data) => void;
  removeData: (id: number) => void;
  updateData: (id: number, newData: Data) => void;
  updateDataTitle: (id: number, title: string) => void;
  updateDataDescription: (description: string) => void;
  updateDataStatus: (status: "pending" | "inProgress" | "completed") => void;
  addDataSuccess: (payload: { data: Data[] }) => void;
  getDataVersions: (id: number) => Promise<Data[] | undefined>
  updateDataVersions: (id: number, versions: Data[]) => void;
  getBackendVersion: () => Promise<string>;
  getFrontendVersion: () => Promise<string>;
  fetchData: () => Promise<SnapshotStore<Snapshot<Data>>[]>; // Modify the signature to return a Promise

}

const useDataStore = (): DataStore => {
  const data: Data[] = [];
  const dispatch = useDispatch();


  const fetchData = async (): Promise<SnapshotStore<Snapshot<Data>>[]> => {
    try {
      // Dispatch the fetchDataRequest action
      dispatch(DataActions.fetchDataRequest());
      
      // Simulate fetching data from an API
      const responseData = await fetch('https://api.example.com/data');
      const jsonData = await responseData.json();

      // Assuming jsonData is the format you expect, convert it to SnapshotStore<Snapshot<Data>>[]
      const snapshotData: SnapshotStore<Snapshot<Data>>[] = jsonData.map((item: any) => ({
        // Map item properties to your Snapshot<Data> structure
      }));

      return snapshotData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const addData = (newData: Data) => {
    // Dispatch the addData action
    dispatch(DataActions.addData(newData));
  };

  const removeData = (id: number) => {
    // Dispatch the removeData action
    dispatch(DataActions.removeData(id));
  };

  const updateData = (id: number, newData: Data) => {
    // Dispatch the updateData action
    dispatch(DataActions.updateData({ id, newData }));
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


  const getDataVersions = async (id: number): Promise<Data[] | undefined> => {
    try {
      const response = apiData.getDataVersions(id);
      // Assuming response contains Version objects, convert them to Data objects
      const dataVersions: Data[] = (await response).map((version: Version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        appVersion: version.appVersion,
        content: version.content,
        getData: async () => {
          const snapshots: SnapshotStore<Snapshot<Data>>[] = []; // Initialize an empty array
          // Perform any necessary operations to populate the snapshots array
          return snapshots;
        },
      }));
      return dataVersions;
    } catch (error) {
      console.error("Error fetching data versions:", error);
      // Handle error if needed
      return undefined;
    }
  };
  

  const addDataSuccess = (payload: { data: Data[] }) => {
    // Add data to store
    const { data: newData } = payload;
    data.push(...newData); // Assuming 'data' is intended to store the array of Data objects
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

  const getBackendVersion = async () => {
    try {
      const response = await apiData.getBackendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching backend version:", error);
      throw error;
    }
  };

  const getFrontendVersion = async () => {
    try {
      const response = await apiData.getFrontendVersion();
      return response;
    } catch (error) {
      console.error("Error fetching frontend version:", error);
      throw error;
    }
  }
  // Other methods...

  return {
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion
  };
};
export { useDataStore };
