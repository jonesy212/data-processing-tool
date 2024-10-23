// DataContext.tsx
import * as React from "react";
import { createContext, ReactNode, useContext } from "react";
import { Data } from "../components/models/data/Data";
import {
    DataStore,
    useDataStore,
    VersionedData,
} from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "../components/snapshots";

interface DataContextProps <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  dataStore: DataStore<T, Meta, K> & VersionedData<T, Meta, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]
}

const DataContext = createContext<DataContextProps<any, any> | undefined>(undefined);
  
export const DataProvider = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>({
  children,
}: {
  children: ReactNode;
}) => {
  const dataStore = useDataStore<T, Meta, K>();

  return (
    <DataContext.Provider
      value={{
        dataStore,
        useSimulatedDataSource: false,
        simulatedDataSource: []
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};


export { DataContext };
