//  DataStoreMethods.ts
import { SnapshotStoreMethods } from '@/app/snapshots/SnapshotStoreMethods';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/models/data/Data';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { Snapshots, SnapshotsArray, SnapshotsObject } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { DataStore } from "./DataStore";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

interface DataStoreWithSnapshotMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> 
  extends DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  snapshotMethods: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined
}

type AddDataParams<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  id: string;
  data: T;
  snapshotConfig?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;
  categoryProps?: CategoryProperties;
  // Optional: Only needed for advanced cases
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataStoreMethods?: DataStoreMethods<T, K>;
};

export interface DataStoreMethods <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> { 
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
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: K,
      index: number,
      category?: Category,
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties?: CategoryProperties,
  ) => Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>

  addSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K> | undefined
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>;

  addSnapshotSuccess: (snapshot: T, subscribers: SubscriberCollection<T, K>) => void;

  getSnapshot: (
    snapshot: (id: string | number) =>
      | Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        category?: Category;
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
    data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & K, StructuredMetadata<T, CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & K>>
  ) => Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined>;
  removeData: (id: number) => void;

  updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  getSnapshotsByTopicSuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByCategorySuccess: (snapshots: Snapshots<T, K>) => void;
  getSnapshotsByKey: (key: string) => Promise<T[]>;
  getSnapshotsByKeySuccess: (snapshots: Snapshots<T, K>) => void;

  getSnapshotsByPrioritySuccess: (snapshots: Snapshots<T, K>) => void;

  snapshotMethods: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined;
  // More methods as required...
}

export type { DataStoreWithSnapshotMethods };
