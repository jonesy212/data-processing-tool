//  DataStoreMethods.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotContainer, SnapshotData } from '@/app/snapshots';
import { Snapshots, SnapshotsArray, SnapshotsObject } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreMethod } from "@/app/snapshots/SnapshotStoreMethod";
import { Subscriber } from "@/app/users/Subscriber";
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import { DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { DataStore } from "./DataStore";

interface DataStoreWithSnapshotMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> 
  extends DataStore<T, K, Meta> {
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined
}

type AddDataParams<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = {
  id: string;
  data: T;
  snapshotConfig?: SnapshotData<T, K>;
  category?: symbol | string | Category;
  categoryProps?: CategoryProperties;
  // Optional: Only needed for advanced cases
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataStoreMethods?: DataStoreMethods<T, K>;
};

export interface DataStoreMethods <
  T extends BaseData<any>,  
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends DataStoreWithSnapshotMethods<T, K, Meta> { 
  mapSnapshot: (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotContainer: SnapshotContainer<T, K>,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined>;


  mapSnapshots: (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,

    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: K,
      index: number
    ) => SnapshotsObject<T, K, Meta, ExcludedFields>
  ) => Promise<SnapshotsArray<T, K, Meta>>

  addSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: SubscriberCollection<T, K>) => void;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, K>;
        category: Category | undefined;
        categoryProperties: CategoryProperties | undefined;
        dataStoreMethods: DataStore<T, K> | null;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      }>
      | undefined
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  getSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K>[]) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  
  getSnapshotsByTopic: (topic: string) => Promise<Snapshots<T, K>>;

  getSnapshotsByCategory: (category: string) => Promise<Snapshots<T, K>>;
  getSnapshotsByPriority: (priority: string) => Promise<Snapshots<T, K>>;

 // Simple: Accepts a pre-built Snapshot
 addData(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  
 // Advanced: Accepts a config object + returns Promise
 addData(params: AddDataParams<T, K>): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
 
  getData: (
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, CustomSnapshotData<T, K, Meta> & K, StructuredMetadata<T, CustomSnapshotData<T, K, Meta> & K>>
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;

  removeData: (id: number) => void;

  updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T, K>) => void;

  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T, K>) => void;

  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;
  // More methods as required...
}

export type { DataStoreWithSnapshotMethods };
