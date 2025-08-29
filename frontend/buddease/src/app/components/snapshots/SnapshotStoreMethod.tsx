// // SnapshotStoreMethod.tsx
import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from "@/app/components/snapshots";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { SnapshotConfig } from "./SnapshotConfig";
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
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Promise<{snapshot: Snapshot<T, K>}>,
  // Add other required properties here
}

export type { SnapshotStoreMethod };
