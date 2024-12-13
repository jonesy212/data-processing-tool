// getCurrentSnapshotConfigOptions.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { createSnapshotStoreConfig } from '@/app/components/snapshots/snapshotStorageOptionsInstance';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from '../libraries/categories/generateCategoryProperties';
import { BaseData } from "../models/data/Data";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataWithPriority, DataWithTimestamp, DataWithVersion } from "../utils/versionUtils";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

export const getCurrentSnapshotConfigOptions = <
  T extends BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  snapshotId: string | null,
  snapshotContainer: SnapshotContainer<T, K>,
  criteria: CriteriaType,
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  delegate: any,
  snapshotData: SnapshotData<T, K>
): SnapshotStoreConfig<T, K> => {

  // Use createSnapshotStoreConfig to initialize the base configuration
  const baseConfig = createSnapshotStoreConfig({
    snapshotId,
    snapshotContainer,
    criteria,
    category,
    categoryProperties,
    delegate,
    snapshotData,
  });

  // Type guards for conditional properties in the configuration
  const isDataWithPriority = (data: any): data is Partial<DataWithPriority> => 
    data && typeof data === 'object' && 'priority' in data;

  const isDataWithVersion = (data: any): data is Partial<DataWithVersion> => 
    data && typeof data === 'object' && 'version' in data;

  const isDataWithTimestamp = (data: any): data is Partial<DataWithTimestamp> => 
    data && typeof data === 'object' && 'timestamp' in data;

  // Conditional logic for configuring based on data properties
  if (isDataWithPriority(snapshotData)) {
    console.log(`Priority level: ${snapshotData.priority}`);
    // Extend baseConfig if needed based on priority
  }

  if (isDataWithVersion(snapshotData)) {
    console.log(`Version: ${snapshotData.version}`);
    // Extend baseConfig if needed based on version
  }

  if (isDataWithTimestamp(snapshotData)) {
    console.log(`Timestamp: ${snapshotData.timestamp}`);
    // Extend baseConfig if needed based on timestamp
  }

  // Return the final configuration, integrating configureSnapshot method and ensuring tempData is accessible
  return {
    ...baseConfig,
    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, K>,
      dataStoreMethods: DataStore<T, K>,
      category?: string | symbol | Category,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> 
    ): { snapshot: Snapshot<T, K>, config: SnapshotConfig<T, K> } | null => {
      // Ensure snapshotStore exists within snapshotData
      if (!snapshotData.snapshotStore) {
        throw new Error("snapshotStore cannot be null");
      }

      // Link baseConfig to snapshotStore
      snapshotData.snapshotStore.snapshotStoreConfig = baseConfig;

      // Return configured snapshot and config
      return { snapshot: snapshotData.snapshotStore.snapshot, config: baseConfig };
    },
    // Ensure tempData access is part of the configuration
    tempData: baseConfig.tempData
  };
};
