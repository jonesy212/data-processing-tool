import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CategoryProperties } from './../../pages/personas/ScenarioBuilder';
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";


interface SnapshotCommonProps<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  criteria?: any; // Define a more specific type if you have one
  category?: string | symbol | Category; // Optional category
  categoryProperties?: CategoryProperties; // Define the type as needed
  delegate?: any; // Specify the type if known
  snapshot?: Snapshot<T, Meta, K>; // Optional snapshot
  events?: Event[]; // Specify the type for events if known
  dataItems?: T[]; // Define the type based on your data structure
  newData?: T; // Define what type newData should be
  payload?: any; // Specify the type if known
  store?: SnapshotStore<T, Meta, K>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}


interface SnapshotConfigProps<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends SnapshotCommonProps<T, Meta, K> {
  id: string;
  subscriberId: string;
  dataStoreMethods: DataStoreMethods<T, Meta, K>; // Replace `any` with the appropriate type
  dataStore: DataStore<T, Meta, K>; // Replace `any` with the appropriate type
  metadata: any; // Replace `any` with the appropriate type
  endpointCategory: string; // Adjust the type as necessary
  storeProps: SnapshotStoreProps<T, Meta, K>; // Replace `any` with the appropriate type
  snapshotConfigData: SnapshotConfig<T, Meta, K>; // Replace `any` with the appropriate type
  snapshotStoreConfigData: SnapshotStoreConfig<T, Meta, K>; // Replace `any` with the appropriate type
  snapshotContainer: SnapshotContainer<T, Meta, K>; // Replace `any` with the appropriate type
}



export type { SnapshotConfigProps };
