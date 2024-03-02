//ApiStore.ts
// useApiManagerStore.ts
import { ApiConfig } from "@/app/configs/ConfigurationService";
import { generateNewApiConfig } from "@/app/generators/generateNewApiConfig";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import SnapshotStore, { SnapshotStoreConfig } from "./SnapshotStore";


type ApiConfigData = ApiConfig[] & Data

export interface ApiManagerStore {
  apiConfigs: ApiConfig[];
  apiConfigName: string;
  apiConfigUrl: string;
  apiConfigTimeout: number;
  updateApiConfigName: (name: string) => void;
  updateApiConfigUrl: (url: string) => void;
  updateApiConfigTimeout: (timeout: number) => void;
  addApiConfigSuccess: (payload: { apiConfig: ApiConfig }) => void;
  addApiConfig: (apiConfig: ApiConfig) => void;
  addApiConfigs: (apiConfigs: ApiConfig[]) => void;
  removeApiConfig: (apiConfigId: number) => void;
  removeApiConfigs: (apiConfigIds: number[]) => void;
  fetchApiConfigsSuccess: (payload: { apiConfigs: ApiConfig[] }) => void;
  fetchApiConfigsFailure: (payload: { error: string }) => void;
  fetchApiConfigsRequest: () => void;
  updateApiConfigSuccess: (apiConfig: any ) => void;
  updateApiConfig: (apiConfigId: number, newConfig: ApiConfig) => void;
  updateApiConfigFailure: (payload: { error: string }) => void;
  removeApiConfigSuccess: (payload: { apiConfigId: number }) => void;
  removeApiConfigsSuccess: (payload: { apiConfigIds: number[] }) => void;
  removeApiConfigFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<ApiConfig[]>;
  takeApiConfigSnapshot: (apiConfigId: number) => void;
  // Add more methods or properties as needed
}

const useApiManagerStore = (): ApiManagerStore => {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [apiConfigName, setApiConfigName] = useState<string>("");
  const [apiConfigUrl, setApiConfigUrl] = useState<string>("");
  const [apiConfigTimeout, setApiConfigTimeout] = useState<number>(0);
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");
  const snapshotStore = new SnapshotStore<ApiConfig[]>(
    timestamp,
    data,
    {
      initialState: apiConfigs
    } as SnapshotStoreConfig<ApiConfig[]>,
    "apiConfigs"
  );


  // Method to update the name of the API configuration
  const updateApiConfigName = (name: string) => {
    setApiConfigName(name);
  };

  // Method to update the URL of the API configuration
  const updateApiConfigUrl = (url: string) => {
    setApiConfigUrl(url);
  };

  // Method to update the timeout of the API configuration
  const updateApiConfigTimeout = (timeout: number) => {
    setApiConfigTimeout(timeout);
  };

  // Method to handle successful addition of an API configuration
  const addApiConfigSuccess = (payload: { apiConfig: ApiConfig }) => {
    const { apiConfig } = payload;
    setApiConfigs((prevApiConfigs) => [...prevApiConfigs, apiConfig]);
  };

  // Method to add a new API configuration
  const addApiConfig = () => {
    // Validate input before adding
    if (apiConfigName.trim().length === 0 || apiConfigUrl.trim().length === 0 || apiConfigTimeout <= 0) {
      console.error("Invalid API configuration input");
      return;
    }

    const newApiConfig = generateNewApiConfig(apiConfigName, apiConfigUrl, apiConfigTimeout);

    // Simulate asynchronous addition
    setTimeout(() => {
      addApiConfigSuccess({ apiConfig: newApiConfig });
      setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
    }, 1000);

    // Reset input fields after adding an API configuration
    setApiConfigName("");
    setApiConfigUrl("");
    setApiConfigTimeout(0);
  };

  // Method to add multiple API configurations
  const addApiConfigs = (apiConfigsToAdd: ApiConfig[]) => {
    // Validate input
    if (apiConfigsToAdd.length === 0) {
      console.error("At least one API configuration must be passed");
      return;
    }

    setApiConfigs((prevApiConfigs) => [...prevApiConfigs, ...apiConfigsToAdd]);

    // Reset input fields after adding API configurations
    setApiConfigName("");
    setApiConfigUrl("");
    setApiConfigTimeout(0);
  };

  // Method to remove an API configuration by ID
  const removeApiConfig = (apiConfigId: number) => {
    setApiConfigs((prevApiConfigs) => prevApiConfigs.filter((config) => config.id !== apiConfigId));
  };

  // Method to remove multiple API configurations by IDs
  const removeApiConfigs = (apiConfigIds: number[]) => {
    setApiConfigs((prevApiConfigs) => prevApiConfigs.filter((config) => !apiConfigIds.includes(config.id)));
  };

  // Method to handle successful fetch of API configurations
  const fetchApiConfigsSuccess = (payload: { apiConfigs: ApiConfig[] }) => {
    const { apiConfigs: newApiConfigs } = payload;
    setApiConfigs((prevApiConfigs) => [...prevApiConfigs, ...newApiConfigs]);
  };
    

  // Method to handle failure in fetching API configurations
  const fetchApiConfigsFailure = (payload: { error: string }) => {
    console.error("Fetch API Configs Failure:", payload.error);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
  };

  // Method to handle the initiation of API configurations fetch
  const fetchApiConfigsRequest = () => {
    console.log("Fetching API Configurations...");
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
  };

  // Method to handle successful update of an API configuration
  const updateApiConfigSuccess = () => {
    console.log("API Configuration updated successfully!");
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  // Method to update an existing API configuration
  const updateApiConfig = (apiConfigId: number, newConfig: ApiConfig) => {
    setApiConfigs((prevApiConfigs) =>
      prevApiConfigs.map((config) => (config.id === apiConfigId ? { ...config, ...newConfig } : config))
    );
    updateApiConfigSuccess();
  };

  // Method to handle failure in updating an API configuration
  const updateApiConfigFailure = (payload: { error: string }) => {
    console.error("Update API Config Failure:", payload.error);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_UPDATING_DATA);
  };

  // Method to handle successful removal of an API configuration
  const removeApiConfigSuccess = (payload: { apiConfigId: number }) => {
    console.log(`API Configuration with ID ${payload.apiConfigId} removed successfully!`);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  // Method to handle successful removal of multiple API configurations
  const removeApiConfigsSuccess = (payload: { apiConfigIds: number[] }) => {
    console.log(`API Configurations with IDs ${payload.apiConfigIds.join(", ")} removed successfully!`);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  // Method to handle failure in removing an API configuration
  const removeApiConfigFailure = (payload: { error: string }) => {
    console.error("Remove API Config Failure:", payload.error);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_REMOVING_DATA);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  // Method to take a snapshot of API configurations
  const takeApiConfigSnapshot = (apiConfigId: number) => {
    // Ensure the apiConfigId exists in the apiConfigs
    if (!apiConfigs.find((config) => config.id === apiConfigId)) {
      console.error(`API Configuration with ID ${apiConfigId} does not exist.`);
      return;
    }

    // Create a snapshot of the current API configurations for the specified apiConfigId
    const apiConfigSnapshot = apiConfigs.filter((config) => config.id === apiConfigId);

    // Store the snapshot in the SnapshotStore
    snapshotStore.takeSnapshot(apiConfigSnapshot as ApiConfigData);
  };

  makeAutoObservable({
    apiConfigs,
    apiConfigName,
    apiConfigUrl,
    apiConfigTimeout,
    updateApiConfigName,
    updateApiConfigUrl,
    updateApiConfigTimeout,
    addApiConfigSuccess,
    addApiConfig,
    addApiConfigs,
    removeApiConfig,
    removeApiConfigs,
    fetchApiConfigsSuccess,
    fetchApiConfigsFailure,
    fetchApiConfigsRequest,
    updateApiConfigSuccess,
    updateApiConfig,
    updateApiConfigFailure,
    removeApiConfigSuccess,
    removeApiConfigsSuccess,
    removeApiConfigFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    snapshotStore,
    takeApiConfigSnapshot,
  });

  return {
    apiConfigs,
    apiConfigName,
    apiConfigUrl,
    apiConfigTimeout,
    updateApiConfigName,
    updateApiConfigUrl,
    updateApiConfigTimeout,
    addApiConfigSuccess,
    addApiConfig,
    addApiConfigs,
    removeApiConfig,
    removeApiConfigs,
    fetchApiConfigsSuccess,
    fetchApiConfigsFailure,
    fetchApiConfigsRequest,
    updateApiConfigSuccess,
    updateApiConfig,
    updateApiConfigFailure,
    removeApiConfigSuccess,
    removeApiConfigsSuccess,
    removeApiConfigFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    snapshotStore,
    takeApiConfigSnapshot,
    // Add more methods or properties as needed
  };
};

export { useApiManagerStore };
