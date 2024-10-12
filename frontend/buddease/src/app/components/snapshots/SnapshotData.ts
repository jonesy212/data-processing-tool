// SnapshotData.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Order } from "../crypto/Orders";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { Subscription } from "../subscriptions/Subscription";
import { AuditRecord } from "../users/Subscriber";
import Version from "../versions/Version";
import { VersionHistory } from "../versions/VersionData";
import { CoreSnapshot, Snapshot, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { TagsRecord } from "./SnapshotWithCriteria";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ContentItem } from "../cards/DummyCardLoader";
import { SnapshotConfig } from "./SnapshotConfig";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { InitializedData } from "../hooks/SnapshotStoreOptions";
import { SnapshotBase } from "./SnapshotContainer";

interface CustomSnapshotData extends Data {
  timestamp?: string | number | Date | undefined
  value?: string | number | undefined;
  orders?: Order[];
}

interface SnapshotRelationships<T extends Data, K extends Data = T> {
  parentId?: string | null;
  parent?: Snapshot<T, K> | null;
  children?: CoreSnapshot<K, T>[];
  childIds: string[] | null;
  getParentId(id: string, snapshot: Snapshot<SnapshotUnion<BaseData>, T>): string | null;
  getChildIds(id: string, childSnapshot: Snapshot<BaseData, K>): (string | number | undefined)[]
  snapshotCategory: SnapshotCategory<T, K> | undefined, 
  snapshotSubscriberId: string | undefined;
  addChild(parentId: string, childId: string, childSnapshot: Snapshot<T, K>): void;
  removeChild(childId: string,
    parentId: string, parentSnapshot: Snapshot<Data, Data>,
    childSnapshot: Snapshot<Data, Data>): void;
  getChildren(id: string, childSnapshot: Snapshot<T, K>): CoreSnapshot<Data, BaseData>[];
  hasChildren(id: string): boolean;
  isDescendantOf(
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<T, K>,
    childSnapshot: Snapshot<T, K>
  ): boolean;
  getSnapshotById: (
    id: string,
    // snapshotStore: SnapshotStore<T, K>
  ) => Snapshot<T, K> | null
}


interface SnapshotData<T extends Data, K extends Data = T> extends SnapshotBase<T, K>,
  SnapshotMethods<T, K> {
  _id?: string;
  storeId: number;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: TagsRecord | string[] | undefined
  key?: string;
  state?: SnapshotsArray<T> | null;
  topic?: string;
  
  configOption?:
    | string
    | SnapshotConfig<T, K>
    | SnapshotStoreConfig<T, K>
    | null;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, K> | null;
  version?: number | Version 
  versionHistory?: VersionHistory
  config: SnapshotStoreConfig<T, K>| null
  metadata?: UnifiedMetaDataOptions | {};
  isExpired: () => boolean | undefined
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers: SubscriberCollection<T, K>[];
  delegate?: SnapshotStoreConfig<T, K>[];
  value?: string | number | Snapshot<T, K> |  null | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStoreWithSnapshotMethods<T, K> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  snapshotStore: SnapshotStore<T, K> | null;
  status?: StatusType | undefined
  data: InitializedData | null | undefined
  category?: Category
  categoryProperties?: CategoryProperties | undefined
  timestamp: string | number | Date | undefined;
  setSnapshotCategory: (id: string, newCategory: Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
  getSnapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>
  ) => Map<string, Snapshot<T, K>> | null | undefined;
  deleteSnapshot: (id: string) => void;
  then?: (
    callback: (newData: Snapshot<T, K>) => void
  ) => Snapshot<Data, T> | undefined;
}

export type {
  CustomSnapshotData,
  SnapshotData,
  SnapshotRelationships
};
