// data/DataStore.ts
import { Data } from "@/app/components/models/data/Data";
import Version from "@/app/components/versions/Version";
import { useDispatch } from "react-redux";
import * as apiData from '../../../../api//ApiData';
import { DataActions } from "../DataActions";
export interface DataStore {
  data: Data[];
  fetchData: () => void;
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
}

const useDataStore = (): DataStore => {
  const data: Data[] = [];
  const dispatch = useDispatch();

  const fetchData = () => {
    // Dispatch the fetchDataRequest action
    dispatch(DataActions.fetchDataRequest());
    // You can use Redux or any other state management library here
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
        // Adjust this part according to the structure of your Version class
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
