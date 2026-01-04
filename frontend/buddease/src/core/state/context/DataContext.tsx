// DataContext.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { BaseData } from '@/core/config/BaseConfig';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type {
    DataStore,
    VersionedData,
} from "@/core/state/stores/DataStore";
import { useDataStore } from "@/core/state/stores/DataStore";
import { ReactNode } from "react";
import { createContext, useContext } from "react";

interface DataContextProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  dataStore: DataStore<T, K> & VersionedData<T, K>;
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

// Fix the createContext to use correct generics
const DataContext = createContext<DataContextProps<any, any, any, any, any, any>>({
  dataStore: {} as DataStore<any, any> & VersionedData<any, any, any, any, any, any>,
  useSimulatedDataSource: false,
  simulatedDataSource: [],
});

export const DataProvider = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  children,
}: {
  children: ReactNode;
}) => {
  // Initialize the data store
  const dataStore = useDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>() as DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
    VersionedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  const simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

  // Define the DataContext here to bind T, K dynamically
  const DataContext = createContext<DataContextProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>(
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
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
>() => {
  const context = useContext<DataContextProps<T, K, Meta> | undefined>(DataContext as any);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};


export { DataContext };
