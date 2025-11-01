// DataContext.tsx
import { BaseData } from '@/app/models/data/Data';
import {
    DataStore,
    useDataStore,
    VersionedData,
} from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from "@/app/snapshots";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { createContext, ReactNode, useContext } from "react";

interface DataContextProps<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
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
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
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
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>() => {
  const context = useContext<DataContextProps<T, K, Meta> | undefined>(DataContext as any);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};


export { DataContext };
