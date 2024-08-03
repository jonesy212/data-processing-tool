// DataContext.tsx
import * as React from "react";
import { createContext, useContext, ReactNode } from "react";
import {
  DataStore,
  useDataStore,
  VersionedData,
} from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotWithCriteria } from "../components/snapshots/SnapshotWithCriteria";
import { BaseData } from "../components/models/data/Data";
import { SnapshotStoreConfig } from "../components/snapshots/SnapshotConfig";

interface DataContextProps<T extends BaseData, K extends BaseData> {
  dataStore: DataStore<T, K> & VersionedData<T, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K>[]
}

const DataContext = createContext<
  | DataContextProps<SnapshotWithCriteria<BaseData, BaseData>, BaseData>
  | undefined
>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dataStore = useDataStore<
    SnapshotWithCriteria<BaseData, BaseData>,
    BaseData
  >();

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