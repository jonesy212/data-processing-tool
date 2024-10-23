// SnapshotData.ts
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Order } from "../crypto/Orders";
import { InitializedData } from "../hooks/SnapshotStoreOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { AuditRecord } from "../users/Subscriber";
import Version from "../versions/Version";
import { VersionHistory } from "../versions/VersionData";
import { CoreSnapshot, Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotBase } from "./SnapshotContainer";
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { TagsRecord } from "./SnapshotWithCriteria";

interface CustomSnapshotData extends Data {
  timestamp?: string | number | Date | undefined
  value?: string | number | undefined;
  orders?: Order[];
}

interface SnapshotRelationships<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  parentId?: string | null;
  parent?: Snapshot<T, Meta, K> | null;
  children?: CoreSnapshot<T, Meta, K>[];
  childIds: string[] | null;
  getParentId(id: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, Meta, T>): string | null;
  getChildIds(id: string, childSnapshot: Snapshot<T, Meta, K>): (string | number | undefined)[]
  snapshotCategory: SnapshotCategory<T, Meta, K> | undefined, 
  snapshotSubscriberId: string | null | undefined;
  addChild(parentId: string, childId: string, childSnapshot: CoreSnapshot<T, Meta, K>): void;
  removeChild(childId: string,
    parentId: string, parentSnapshot: CoreSnapshot<T, Meta, K>,
    childSnapshot: CoreSnapshot<T, Meta, K>): void;
  getChildren(id: string, childSnapshot: Snapshot<T, Meta, K>): CoreSnapshot<T, Meta, K>[];
  hasChildren(id: string): boolean;
  isDescendantOf(
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<T, Meta, K>,
    childSnapshot: Snapshot<T, Meta, K>
  ): boolean;
  getSnapshotById: (
    id: string,
    // snapshotStore: SnapshotStore<T, Meta, K>
  ) => Snapshot<T, Meta, K> | null
}


interface SnapshotData<T extends Data, 
  Meta extends UnifiedMetaDataOptions,
  K extends Data = T,
  ExcludedFields extends Data = never

  > extends SnapshotBase<T, Meta, K>,
  SnapshotMethods<T, Meta, K> {
  _id?: string;
  storeId: number;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: TagsRecord | string[] | undefined
  key?: string;
  state?: SnapshotsArray<T, Meta> | null;
  topic?: string;
  
  configOption?:
    | string
    | SnapshotConfig<T, Meta, K>
    | SnapshotStoreConfig<T, Meta, K>
    | null;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, Meta, K> | null;
  version?: string | number | Version | undefined
  versionHistory?: VersionHistory
  config: Promise<SnapshotStoreConfig<T, Meta, K> | null>;
  metadata?: UnifiedMetaDataOptions | {};
  isExpired: () => boolean | undefined
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  snapshots?: Snapshots<T, Meta>
  subscribers: SubscriberCollection<T, Meta, K>[];
  delegate?: SnapshotStoreConfig<T, Meta, K>[];
  value?: string | number | Snapshot<T, Meta, K> |  null | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStoreWithSnapshotMethods<T, Meta, K> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  snapshotStore: SnapshotStore<T, Meta, K> | null;
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
    dataStoreMethods: DataStore<T, Meta, K>
  ) => Map<string, Snapshot<T, Meta, K>> | null | undefined;
  deleteSnapshot: (id: string) => void;
  then?: (
    callback: (newData: Snapshot<T, Meta, K>) => void
  ) => Snapshot<Data, Meta, K> | undefined;
}

export type {
    CustomSnapshotData,
    SnapshotData,
    SnapshotRelationships
};

