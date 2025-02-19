import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CategoryProperties } from './../../pages/personas/ScenarioBuilder';
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";





// SnapshotCommonProps for properties specific to snapshots, extending BaseEntity for common properties
interface SnapshotCommonProps<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> extends BaseEntity {
  criteria?: any; // Define a more specific type if needed
  category?: string | symbol | Category; // Optional category
  categoryProperties?: CategoryProperties; // Define the type as needed
  delegate?: any; // Specify the type if known
  snapshot?: Snapshot<T, K>; // Optional snapshot
  events?: Event[]; // Specify the type for events if known
  dataItems?: T[]; // Define the type based on your data structure
  newData?: T; // Define what type newData should be
  payload?: any; // Specify the type if known
  store?: SnapshotStore<T, K>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}



interface SnapshotConfigProps<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> extends SnapshotCommonProps<T, K> {
  id: string;
  subscriberId: string;
  dataStoreMethods: DataStoreMethods<T, K>; // Replace `any` with the appropriate type
  dataStore: DataStore<T, K>; // Replace `any` with the appropriate type
  metadata: any; // Replace `any` with the appropriate type
  endpointCategory: string; // Adjust the type as necessary
  storeProps: SnapshotStoreProps<T, K>; // Replace `any` with the appropriate type
  snapshotConfigData: SnapshotConfig<T, K>; // Replace `any` with the appropriate type
  snapshotStoreConfigData: SnapshotStoreConfig<T, K>; // Replace `any` with the appropriate type
  snapshotContainer: SnapshotContainer<T, K>; // Replace `any` with the appropriate type
}



export type { SnapshotConfigProps };
