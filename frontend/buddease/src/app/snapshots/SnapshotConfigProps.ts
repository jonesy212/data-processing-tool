import { BaseEntity } from "@/app/components/routing/FuzzyMatch";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { CategoryProperties } from '@/pages/personas/ScenarioBuilder';
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";

// SnapshotCommonProps for properties specific to snapshots, extending BaseEntity for common properties
interface SnapshotCommonProps<T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseEntity {
  criteria?: any; // Define a more specific type if needed
  category?:  Category; // Optional category
  categoryProperties?: CategoryProperties; // Define the type as needed
  delegate?: any; // Specify the type if known
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Optional snapshot
  events?: Event[]; // Specify the type for events if known
  dataItems?: T[]; // Define the type based on your data structure
  newData?: T; // Define what type newData should be
  payload?: any; // Specify the type if known
  store?: SnapshotStore<T, K, Meta, ExcludedFields>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}



interface SnapshotConfigProps<T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotCommonProps<T, K, Meta, ExcludedFields> {
  id: string;
  subscriberId: string;
  dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>; // Replace `any` with the appropriate type
  dataStore: DataStore<T, K, Meta, ExcludedFields>; // Replace `any` with the appropriate type
  metadata: any; // Replace `any` with the appropriate type
  endpointCategory: string; // Adjust the type as necessary
  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>; // Replace `any` with the appropriate type
  snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>; // Replace `any` with the appropriate type
  snapshotStoreConfigData: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>; // Replace `any` with the appropriate type
}



export type { SnapshotConfigProps };
