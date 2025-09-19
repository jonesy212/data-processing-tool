// // SnapshotStoreMethod.tsx
import { Snapshot } from "@/app/components/snapshots";
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from "@/app/configs/BaseConfig";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainerType } from './SnapshotContainer';
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";

// Define the necessary types
interface SnapshotStoreMethod<
  T extends BaseDataEntity, 
  K extends T = T,
 Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  > {
  snapshot?: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    dataStore: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>,
    subscription: Subscription<T, K, Meta, ExcludedFields>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
  ) => Promise<{snapshot: Snapshot<T, K, Meta, ExcludedFields>}>,
  // Add other required properties here
}

export type { SnapshotStoreMethod };
