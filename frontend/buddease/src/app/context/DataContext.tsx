// DataContext.tsx
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '@/app/components/models/data/Data';
import * as React from "react";
import { createContext, ReactNode, useContext } from "react";
import { K, T } from "../components/models/data/dataStoreMethods";
import {
  DataStore,
  useDataStore,
  VersionedData,
} from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "../components/snapshots";

interface DataContextProps <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  dataStore: DataStore<T, K> & VersionedData<T, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K>[]
}

const DataContext = createContext<DataContextProps<T, K<T>> | undefined>(undefined);
  
export const DataProvider = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>({
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


export { DataContext };
