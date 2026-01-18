// isCompatibleTempData.ts
//isCompatibleTempData.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { BaseData } from '@/core/models/data/Data';
import { T } from '@/core/models/data/dataStoreMethods';
import { TempData } from "@/core/models/data/TempData";
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { ConfigureSnapshotStorePayload } from "@/core/snapshots/SnapshotConfig";
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import { Subscriber } from "@/core/subscribers/Subscriber";
import { Callback } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import SnapshotStore from "./SnapshotStore";

type U = T;
type WrappedU = U extends BaseDataEntity ? U : BaseData<U, U, StructuredMetadata<U, U>, Attachment>;


interface SnapshotConversionMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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

