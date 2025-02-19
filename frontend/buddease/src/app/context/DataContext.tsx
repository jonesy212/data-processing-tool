// DataContext.tsx
import { BaseData } from "@/app/components/models/data/Data";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { createContext, ReactNode, useContext } from "react";
import { K, T } from "../components/models/data/dataStoreMethods";
import {
  DataStore,
  useDataStore,
  VersionedData,
} from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "../components/snapshots";

interface DataContextProps<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  dataStore: DataStore<T, K> & VersionedData<T, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K>[];
}

// Fix the createContext to use correct generics
const DataContext = createContext<DataContextProps<any, any>>({
  dataStore: {} as DataStore<any, any> & VersionedData<any, any>,
  useSimulatedDataSource: false,
  simulatedDataSource: [],
});

export const DataProvider = <
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>({
  children,
}: {
  children: ReactNode;
}) => {
  // Initialize the data store
  const dataStore = useDataStore<T, K>() as DataStore<T, K> &
    VersionedData<T, K>;
  const simulatedDataSource: SnapshotStoreConfig<T, K>[] = [];

  // Define the DataContext here to bind T, K dynamically
  const DataContext = createContext<DataContextProps<T, K, Meta> | undefined>(
    undefined
  );

  return (
    <DataContext.Provider
      value={{
        dataStore,
        useSimulatedDataSource: false,
        simulatedDataSource: [],
      }}
    >
      {children}
    </DataContext.Provider>
  );
};


// Hook to access DataContext
export const useDataContext = <
  T extends BaseData<any>,
  K extends T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>() => {
  const context = useContext<DataContextProps<T, K, Meta> | undefined>(DataContext as any);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};


export { DataContext };
