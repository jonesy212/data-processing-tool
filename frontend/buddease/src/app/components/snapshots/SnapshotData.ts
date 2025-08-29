// SnapshotData.ts
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { SnapshotDataType } from '@/app/components/snapshots';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { SharedMetadata } from '@/app/configs/metadata/createMetadataState';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Order } from "../crypto/Orders";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, ChildRelationship, SharedRelationshipData } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { MapExcludedFieldsToMetaKeys } from "../routing/Fields";
import { Subscription } from "../subscriptions/Subscription";
import { AuditRecord } from "../users/Subscriber";
import { SubscriberCollection } from "../users/SubscriberCollection";
import { VersionHistory } from "../versions/VersionData";
import {  Snapshots, SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { CoreSnapshot } from "./CoreSnapshot";
import {  Snapshot } from "./Snapshot";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotBase } from "./SnapshotContainer";
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotStore from "./SnapshotStore";
import { InitializedData } from "./SnapshotStoreOptions";
import { TagsRecord } from "./SnapshotWithCriteria";
import { SnapshotStoreProps } from "./useSnapshotStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { Attachment } from "../documents/Attachment/attachment";
import { BaseDataRoot } from "../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig";

interface CustomSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseDataEntity<T, K, Meta, AttachmentType, ExcludedFields>,
  SharedRelationshipData<K>,
  SharedIdentifiers<T, K, Meta, ExcludedFields>
{
  timestamp?: string | number | Date | undefined
  orders?: Order[];
  customProperty?: unknown; 

}

// Original type of snapshotData
type OriginalSnapshotData<T extends BaseDataEntity, K extends T = T> = SnapshotData<T, K, never>;

interface SnapshotRelationships<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, ExcludedFields> {
  parentId?: string | null;
  parent?: Snapshot<T, K> | null;
  children?: ChildRelationship<T, K, Meta> | CoreSnapshot<T, K, Meta>[];
  childIds?: K[];
  getParentId(id: string, snapshot: Snapshot<T, K>): string | null;
  getChildIds(id: string, childSnapshot: CoreSnapshot<T, K>): (string | number | undefined)[]
  snapshotCategory: SnapshotCategory<T, K> | undefined, 
  initializeWithData(data: SnapshotUnion<T, K, Meta>[]): void | undefined
  hasSnapshots(): Promise<boolean>
  snapshotSubscriberId: string | null | undefined;
  addChild(parentId: string, childId: string, childSnapshot: CoreSnapshot<T, K>): void;
  removeChild(childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K>,
    childSnapshot: CoreSnapshot<T, K>
  ): void;
  getChildren(id: string, childSnapshot: Snapshot<T, K>): CoreSnapshot<T, K>[];
  hasChildren(id: string): boolean;
  isDescendantOf(
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<T, K>,
    snapshot: Snapshot<T, K>, 
    childSnapshot: Snapshot<T, K>
  ): boolean;
  
  getSnapshotById: (
    id: string,
    // snapshotStore: SnapshotStore<T, K>
  ) => Snapshot<T, K> | null
}

interface SnapshotData<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotBase<T, K, Meta, ExcludedFields>,
  SnapshotMethods<T, K, Meta, ExcludedFields>, // Extends SnapshotMethods
  SharedMetadata<T, K, ExcludedFields>
{
  _id?: string;
  storeId: number;
  snapshotIds?: string[];
  title?: string;
  description?: string | null;
  tags?: TagsRecord<T, K> | string[] | undefined
  key?: string;
  state?: SnapshotsArray<T, K, Meta> | null;
  topic?: string;
  meta?: StructuredMetadata<T, K>;
  criteria?: CriteriaType
  configOption?:
    | string
    | SnapshotConfig<T, K>
    | SnapshotStoreConfig<T, K>
    | null;
  priority?: string | PriorityTypeEnum;
  subscription?: Subscription<T, K> | null;
  versionHistory?: VersionHistory<T, K>
  metadata?: UnifiedMetadata<T, K, Meta, MapExcludedFieldsToMetaKeys<T, K, StructuredMetadata<T, K>, ExcludedFields>
  > | {};
  isExpired: () => boolean | undefined
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  auditTrail?: AuditRecord[];
  snapshots?: Snapshots<T, K>
  subscribers: SubscriberCollection<T, K>[];
  delegate?: SnapshotStoreConfig<T, K>[];
  todoSnapshotId?: string;
  dataStoreMethods?: DataStoreMethods<T, K, Meta> | null;
  updatedAt?: string | Date;
  snapshotStore: SnapshotStore<T, K> | null;
  status?: StatusType | undefined
  data: InitializedData<T, K>| null | undefined
  category?: string | symbol | Category
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
  ) => Snapshot<T, K> | undefined;

  snapshotData: (
    id: string | number | undefined,
    data: Snapshot<T, K, Meta, ExcludedFields>,
    mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
    snapshotData: SnapshotData<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStoreMethods<T, K>,
    storeProps: SnapshotStoreProps<T, K>,
    snapshotId?: string | number | null,
    storeId?: number
  ) => Promise<SnapshotDataType<T, K>>;
}


export type {
    CustomSnapshotData,
    SnapshotData,
    SnapshotRelationships
};

