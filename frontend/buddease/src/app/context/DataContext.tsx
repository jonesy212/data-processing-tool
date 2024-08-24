// DataContext.tsx
import * as React from "react";
import { createContext, useContext, ReactNode } from "react";
import {
  DataStore,
  useDataStore,
  VersionedData,
} from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotWithCriteria } from "../components/snapshots/SnapshotWithCriteria";
import { BaseData, Data } from "../components/models/data/Data";
import { SnapshotStoreConfig, SnapshotUnion } from "../components/snapshots";

interface DataContextProps<T extends BaseData, K extends BaseData> {
  dataStore: DataStore<T, K> & VersionedData<T, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<SnapshotUnion<T>, K>[]
}

const DataContext = createContext<DataContextProps<any, any> | undefined>(undefined);
  
export const DataProvider = <T extends Data, K extends BaseData>({
  children,
}: {
  children: ReactNode;
}) => {
  const dataStore = useDataStore<T, K>();

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


export {DataContext}