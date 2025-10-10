//isCompatibleTempData.ts
import { T } from '@/app/models/data/dataStoreMethods';
import { TempData } from "@/app/components/models/data/TempData";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { UnsubscribeDetails } from "@/app/event/DynamicEventHandlerExample";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData } from '@/app/models/data/Data';
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SnapshotsArray } from "./LocalStorageSnapshotStore";
import { Snapshot } from '@/app/snapshots/Snapshot';
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
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    value: T
  ) => [] | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Complex type conversion handler
  handleSnapshot: (
    id: string,
    snapshotId: string | number | null,
    snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,
    snapshotData: T,
    category?: Category,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: T | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
    storeConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

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

