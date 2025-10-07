// // SnapshotStoreMethod.tsx
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Subscription } from "@/app/subscriptions/Subscription";
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from "@/config/BaseConfig";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainerType } from '@/app/snapshots/SnapshpshotContainer';
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
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>,
  ) => Promise<{snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>}>,
  // Add other required properties here
}

export type { SnapshotStoreMethod };
