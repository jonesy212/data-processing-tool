// // CoreSnapshot.ts
// import { Task } from "react-native";
// import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
// import { Category } from "../libraries/categories/generateCategoryProperties";
// import { Content } from "../models/content/AddContent";
// import { BaseData, Data } from "../models/data/Data";
// import { ProjectPhaseTypeEnum, StatusType } from "../models/data/StatusType";

// import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
// import { SnapshotData } from ".";
// import { ContentItem } from "../cards/DummyCardLoader";
// import { InitializedData, InitializedDataStore } from "../hooks/SnapshotStoreOptions";
// import { CombinedEvents } from "../hooks/useSnapshotManager";
// import { Phase } from "../phases/Phase";
// import { Label } from "../projects/branding/BrandingSettings";
// import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
// import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
// import { AllTypes } from "../typings/PropTypes";
// import { Subscriber } from "../users/Subscriber";
// import { User } from "../users/User";
// import {
//     Snapshot,
//     Snapshots,
//     SnapshotsArray,
//     SnapshotUnion
// } from "./LocalStorageSnapshotStore";
// import { SnapshotOperation } from "./SnapshotActions";
// import { SnapshotConfig } from "./SnapshotConfig";
// import { SnapshotEvents } from "./SnapshotEvents";
// import { SnapshotItem } from "./SnapshotList";
// import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
// import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
// import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
// import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
// import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";

// interface CoreSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
//   extends SnapshotSubscriberManagement<T, Meta, K>
// {
//   id: string | number | undefined
//   config: Promise<SnapshotStoreConfig<T, Meta, K> | null>;
//   configs?: SnapshotStoreConfig<T, Meta, K>[] | null;
//   data: InitializedData | null | undefined
//   parentId?: string | null;
//   children?: CoreSnapshot<T, Meta, K>[];
//   operation?: SnapshotOperation
//   description?: string | null;
//   name?: string;
//   timestamp: string | number | Date | undefined;
//   orders?: any;
//   createdBy?: string;
//   eventRecords?: Record<string, CalendarManagerStoreClass<T, Meta, K>[]> | null;
//   subscriberId?: string;
//   length?: number;
//   task?: Task;
//   category?: symbol | string | Category | undefined;
//   categoryProperties?: CategoryProperties | undefined;
//   date?: string | number | string | number | Date | null;
//   status?: StatusType | undefined;
//   content?: string | Content<T, Meta, K>;
//   contentItem?: string | ContentItem ;
//   label: Label | undefined;
//   message?: string;
//   user?: User;
//   type?: AllTypes;
//   phases?: ProjectPhaseTypeEnum;
//   phase?: Phase<T> | null;
//   ownerId?: string;
//   store?: SnapshotStore<T, Meta, K> | null;
//   state?: SnapshotsArray<T, Meta> | null; // Ensure state matches Snapshot<T> or null/undefined
//   dataStore?: InitializedDataStore
//   snapshotId?: string | number | null;
//   configOption?:
//   | string
//   | SnapshotConfig<T, Meta, K>
//   | SnapshotStoreConfig<T, Meta, K>
//   | null;
//   snapshotItems?: SnapshotItem<T, Meta, K>[];
//   snapshots?: Snapshots<T, Meta>;
//   initialState?: InitializedState<T, Meta, K> | {}
//   nestedStores?: SnapshotStore<T, Meta, K>[];
//   events: CombinedEvents<T, Meta, K> | undefined;

//   tags?: TagsRecord | string[] | undefined;  
//   setSnapshotData?: (
//     snapshotStore: SnapshotStore<T, Meta, K>,
//     data: Map<string, Snapshot<T, Meta, K>>,
//     subscribers: Subscriber<T, Meta, K>[],
//     snapshotData: Partial<
//     SnapshotStoreConfig<T, Meta, K>
//     >,
//     id?: string, 
//   ) => void;
//   event?: Event;
//   snapshotConfig?:
//     | SnapshotConfig<T, Meta, K>[]
//     | undefined;
   
//   snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null;
  
//   snapshotStoreConfigSearch?: SnapshotStoreConfig<
//     SnapshotWithCriteria<any, Meta, BaseData>,
//     Meta, K> | null;

//   set?: (
//     data: T | Map<string, Snapshot<T, Meta, K>>,
//     type: string,
//     event: Event
//   ) => void;
  
//   setStore?: (
//     data: T | Map<string, SnapshotStore<T, Meta, K>>,
//     type: string,
//     event: Event
//   ) => void | null;

//   restoreSnapshot: (
//     id: string,
//     snapshot: Snapshot<T, Meta, K>,
//     snapshotId: string,
//     snapshotData: SnapshotData<T, Meta, K>,
//     savedState: SnapshotStore<T, Meta, K>,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: T) => void,
//     snapshots: SnapshotsArray<T, Meta>,
//     type: string,
//     event: string | SnapshotEvents<T, Meta, K>,
//     subscribers: SubscriberCollection<T, Meta, K>,
//     snapshotContainer?: T,
//     snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, Meta, K> | undefined,
//    ) => void;

//   handleSnapshot: (
//     id: string,
//     snapshotId: string | number,
//     snapshot: T extends SnapshotData<T, Meta, K> ? Snapshot<T, Meta, K> : null,
//     snapshotData: T,
//     category: symbol | string | Category | undefined,
//     categoryProperties: CategoryProperties | undefined,
//     callback: (snapshot: T) => void,
//     snapshots: SnapshotsArray<T, Meta>,
//     type: string,
//     event: Event,
//     snapshotContainer?: T | undefined,
//     snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null | undefined,
//     storeConfigs?: SnapshotStoreConfig<T, Meta, K>[]
//   ) => Promise<Snapshot<T, Meta, K> | null>

//   getItem: (key: T) => Promise<Snapshot<T, Meta, K> | undefined>;
//   meta: Map<string, Snapshot<T, Meta, K>> | {};
//   snapshotMethods: SnapshotStoreMethod<T, Meta, K>[]
//   getSnapshotsBySubscriber: (subscriber: string) => Promise<T[]>;
// }

// export type { CoreSnapshot };
