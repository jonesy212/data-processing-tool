// SnapshotConfigProps.ts
import { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";
import { DataStore } from "@/app/state/stores/DataStore";
import SnapshotStore from "./SnapshotStore";

// SnapshotCommonProps for properties specific to snapshots, extending BaseEntity for common properties
interface SnapshotCommonProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
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
  store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Optional store to retrieve from
  callback?: (data: T) => void; // Define the callback type as needed
}



interface SnapshotConfigProps<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotCommonProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  subscriberId: string;
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  metadata: any; // Replace `any` with the appropriate type
  endpointCategory: string; // Adjust the type as necessary
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  snapshotStoreConfigData: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Replace `any` with the appropriate type
}



export type { SnapshotConfigProps };
