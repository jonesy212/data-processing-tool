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
import { Snapshot, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { SnapshotConfig } from "./snapshot";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";

interface CustomSnapshotData extends Data {
  timestamp?: string | number | Date | undefined
  value?: string | number | undefined;
  orders?: Order[];
}

interface SnapshotRelationships<T extends Data, K extends Data = T> {
  parentId: string | null;
  childIds: string[] | null;
  getParentId(id: string, snapshot: Snapshot<BaseData, T>): string | null;
  getChildIds(id: string, childSnapshot: Snapshot<BaseData, K>): string[];

  addChild(parentId: string, childId: string, childSnapshot: Snapshot<T, K>): void;
  removeChild(parentId: string, childId: string, childSnapshot: Snapshot<T, K>): void;
  getChildren(id: string, childSnapshot: Snapshot<T, K>): Snapshot<T, K>[];
  hasChildren(id: string): boolean;
  isDescendantOf(
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<T, K>,
    childSnapshot: Snapshot<T, K>
  ): boolean;
}


interface SnapshotData<T extends Data, K extends Data = T> extends SnapshotMethods<T, K> {
  _id?: string;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: TagsRecord
  key?: string;
  state?: Snapshot<T, K>[] | null;
  topic?: string;
  configOption?:
    | string
    | SnapshotStoreConfig<T, K>
    | null;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, K> | null;
  version?: Version 
  versionHistory?: VersionHistory
  config: SnapshotStoreConfig<T, K>| null
  metadata?: StructuredMetadata;
  isExpired?: boolean;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers: SubscriberCollection<T, K>;
  delegate?: SnapshotStoreConfig<T, K>[];
  value?: string | number | Snapshot<T, K> |  null | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStoreWithSnapshotMethods<T, K> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  snapshotStore: SnapshotStore<T, K> | null;
  status?: StatusType | undefined
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  category?: Category
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
