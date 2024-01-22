// data/DataStore.ts
import { Data } from "@/app/components/models/data/Data";
import { makeAutoObservable } from "mobx";
import { useDispatch } from "react-redux";
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
    dispatch(DataActions.updateDataDescription(description));
  };

  const updateDataStatus = (status: "pending" | "inProgress" | "completed") => {
    // Dispatch the updateDataStatus action
    dispatch(DataActions.updateDataStatus(status));
  };

  // Add more methods or properties as needed

  makeAutoObservable({
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
  });

  return {
    data,
    fetchData,
    addData,
    removeData,
    updateData,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    // Add more methods or properties as needed
  };
};

export { useDataStore };
