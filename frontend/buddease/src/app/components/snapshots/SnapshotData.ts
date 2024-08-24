// SnapshotData.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Order } from "../crypto/Orders";
import { BaseData, Data } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { Subscription } from "../subscriptions/Subscription";
import { AuditRecord } from "../users/Subscriber";
import Version from "../versions/Version";
import { VersionHistory } from "../versions/VersionData";
import { Snapshot } from "./LocalStorageSnapshotStore";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { Category } from "../libraries/categories/generateCategoryProperties";

interface CustomSnapshotData extends Data {
  timestamp?: string | number | Date | undefined
  value?: string | number | undefined;
  orders?: Order[];
}



interface SnapshotData<T extends Data, K extends Data = T> {
  _id?: string;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: TagsRecord
  key?: string;
  topic?: string;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, K> | null;
  version?: Version 
  versionHistory?: VersionHistory
  config?: SnapshotStoreConfig<SnapshotWithCriteria<T, BaseData>, K>[]| null;
  metadata?: StructuredMetadata;
  isExpired?: boolean;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  subscribers: SubscriberCollection<T, K>;
  delegate?: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K>[];
  value?: string | number | Snapshot<T, K> | undefined;
  todoSnapshotId?: string;
  dataStoreMethods?: DataStoreWithSnapshotMethods<T, K> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  snapshotStore: SnapshotStore<T, K> | null;
  status?: StatusType | undefined
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  category?: Category
  timestamp: string | number | Date | undefined;
  getSnapshotData: () => Map<string, Snapshot<T, K>> | null | undefined;
  then?: (
    callback: (newData: Snapshot<T, K>) => void
  ) => Snapshot<Data, T> | undefined;

}

export type {
  CustomSnapshotData,
  SnapshotData
};
