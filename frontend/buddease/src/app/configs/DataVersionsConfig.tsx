import React from "react";
import { useDataStore } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import AppStructure, { AppStructureItem } from "./appStructure/AppStructure";

interface DataVersionsProps {
  dataPath: string; // Added a prop to pass the data path
}

interface DataVersions {
  backend: Record<string, AppStructureItem> | undefined;
  frontend: Record<string, AppStructureItem> | undefined;
}

const DataVersionsComponent: React.FC<DataVersionsProps> = ({
  dataPath: DATA_PATH,
}) => {

  const dataStore = useDataStore(); // Initialize DataStore

  const [dataVersions, setDataVersions] = React.useState<DataVersions>({
    backend: undefined,  // No Promise, just undefined initially
    frontend: undefined, // No Promise, just undefined initially
  });

  React.useEffect(() => {
      const fetchBackendData = async () => {
      const appStructure = new AppStructure("backend"); // Initialize for backend
      const data = await appStructure.getBackendStructure(DATA_PATH); // Assuming this returns a Record<string, AppStructureItem>
      setDataVersions((prev) => ({ ...prev, backend: data }));
    };

    const fetchFrontendData = async () => {
      const appStructure = new AppStructure("backend"); // Initialize for backend
      const data = await appStructure.getFrontendStructure(DATA_PATH); // Assuming this returns a Record<string, AppStructureItem>
      setDataVersions((prev) => ({ ...prev, frontend: data }));
    };

    fetchBackendData();
    fetchFrontendData();
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
