//isCompatibleTempData.ts
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseData } from "@/app/components/models/data/Data";
import { T } from "@/app/components/models/data/dataStoreMethods";
import { TempData } from "@/app/components/models/data/TempData";
import { SnapshotData } from '@/app/components/snapshots/SnapshotData';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Subscriber } from "../users/Subscriber";
import { SnapshotsArray } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { Callback } from "./subscribeToSnapshotsImplementation";

type U = T;
type WrappedU = U extends BaseDataEntity ? U : BaseData<U, U, StructuredMetadata<U, U>, Attachment>;


interface SnapshotConversionMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {

  convertAndConfigureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, ExcludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    config: SnapshotStoreConfig<T, K, Meta, ExcludedFields>
  ) => void;

  // Type conversion utility
  convertType: <U extends BaseDataEntity>(
    data: T,
    targetType: new () => U
  ) => U;

  // Generic conversion method
  subscribe: (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, ExcludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: Callback<Snapshot<T, K, Meta, ExcludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta>;

  // Complex type conversion handler
  handleSnapshot: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K, Meta, ExcludedFields> ? Snapshot<T, K, Meta, ExcludedFields> : null,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields> | null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, ExcludedFields> | null>;

  // Additional conversion methods would go here
  convertToWrapped: (data: T) => WrappedU;
  convertFromWrapped: (wrappedData: WrappedU) => T;
  
  // Optional: Add more specific conversion methods if needed
  convertToWrappedWithMeta: (data: T, meta: Meta) => BaseData<U, U, Meta, Attachment>;
  convertFromWrappedWithMeta: (wrappedData: BaseData<U, U, Meta, Attachment>) => T;
  
  // Optional: Batch conversion methods
  convertArrayToWrapped: (data: T[]) => WrappedU[];
  convertArrayFromWrapped: (wrappedData: WrappedU[]) => T[];
}



function isCompatibleTempData<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>
>(
  tempData: TempData<U, K, Meta, ExcludedFields> | undefined
): boolean {
  if (!tempData) {
    return false;
  }

  // If `valueA` and `valueB` are both defined, check if they have the same keys
  if (tempData.valueA && tempData.valueB) {
    const valueAKeys = Object.keys(tempData.valueA);
    const valueBKeys = Object.keys(tempData.valueB);

    // Check that valueB has at least the same keys as valueA
    return valueAKeys.every((key) => valueBKeys.includes(key));
  }

  // If either `valueA` or `valueB` is missing, consider it incompatible
  return false;
}

export { isCompatibleTempData };
export type { U, WrappedU };

