import { IHydrateResult } from "mobx-persist";
import React from "react";
import { useDataStore } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";

interface DataVersionsProps {
  dataPath: string; // Added a prop to pass the data path
}

interface DataVersions {
  backend: IHydrateResult<number> | Promise<string> | undefined
  frontend: IHydrateResult<number> | Promise<string> | undefined; // Updated to use 'IHydrateResult<number>' or Promise<number>
}

const DataVersionsComponent: React.FC<DataVersionsProps> = ({
  dataPath: DATA_PATH,
}) => {

  const dataStore = useDataStore(); // Initialize DataStore

  const [dataVersions, setDataVersions] = React.useState<DataVersions>({
    backend: new Promise<string>(() => 0),
    frontend: new Promise<string>(() => 0),
  });
  React.useEffect(() => {
    const fetchData = async () => {
      const id = parseInt(DATA_PATH.split("/").pop()!);
      const versions = await dataStore.getDataVersions(id);
      if (versions) {
        dataStore.updateDataVersions(id, versions);
      }
    };
    fetchData();
  }, [DATA_PATH, dataStore]);

  React.useEffect(() => {
    // Check if IndexedDB is available
    if (window.indexedDB) {
      const openRequest = window.indexedDB.open("DataVersionsDB", 1);

      openRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("dataVersions");
      };

      openRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const transaction = db.transaction("dataVersions", "readwrite");
        const store = transaction.objectStore("dataVersions");

        // Add or retrieve dataVersions from IndexedDB
        const getBackendVersion = store.get("backend");
        const getFrontendVersion = store.get("frontend");

        getBackendVersion.onsuccess = () => {
          const backendVersion = getBackendVersion.result || 0;
          setDataVersions((prevDataVersions) => ({
            ...prevDataVersions,
            backend: backendVersion,
          }));
        };

        getFrontendVersion.onsuccess = () => {
          const frontendVersion = getFrontendVersion.result || 0;
          setDataVersions((prevDataVersions) => ({
            ...prevDataVersions,
            frontend: frontendVersion,
          }));
        };
      };
    } else {
      console.error("IndexedDB is not supported in this browser.");
    }
  }, [DATA_PATH]);

  return (
    <div>
      {/* Render your dataVersions content here */}
      {Object.entries(dataVersions).map(([key, value]) => (
        <div key={key}>
          <strong>{key}</strong>
          {/* Check if value is a Promise and handle accordingly */}
          <p>
            Version: {Promise.resolve(value) === value ? "Loading..." : value}
          </p>
        </div>
      ))}
    </div>
  );
};
export const dataVersions = {
  frontend: useDataStore().getFrontendVersion(),
  backend: useDataStore().getBackendVersion(),
}
export default DataVersionsComponent;
export type { DataVersions, DataVersionsProps };
