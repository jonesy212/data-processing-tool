// CommonEvent.ts
import { snapshotContainer } from '@/app/api/SnapshotApi';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

import * as snapshotApi from '@/app/api/SnapshotApi';
import { StatusType } from "@/app/models/data/StatusType";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { isSnapshot } from "@/app/utils/snapshotUtils";
import { useMetadata } from '@/config/useMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { EventStore } from '@/app/components/event/EventStore';
import { Category } from '../@/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from "@/app/models/data/Data";
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { Member } from "@/app/models/teams/TeamMembers";
import { AnalysisTypeEnum } from '@/app/components/projects/DataAnalysisPhase/AnalysisType';
import { SnapshotData, SnapshotStoreConfig } from '@/app/snapshots';
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { snapshotStoreConfigInstance } from '@/app/snapshots/snapshotStoreConfigInstance';
import { SnapshotWithCriteria, TagsRecord } from '@/app/snapshots/SnapshotWithCriteria';
import { Callback } from '@/app/snapshots/subscribeToSnapshotsImplementation';
import { convertToDataSnapshot } from '@/app/components/typings/YourSpecificSnapshotType';
import { Subscriber } from '@/app/components/users/Subscriber';
import { ExtendedVersionData } from '@/app/versions/VersionData';
import { VideoData } from "@/app/video/Video";

interface CommonEvent<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
 {  
  // Fixed: Data requires T, K, Meta
  title: string;

  // Shared date properties
  date: string | Date | undefined;

  // Shared time properties
  startTime?: string;
  endTime?: string;
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;

  // Recurrence properties
  recurring?: boolean;
  recurrenceRule?: string;
  
  // Other common properties
  category?: symbol | string | Category | undefined;
  timezone?: string;
  participants: Member[];
  language?: string;
  agenda?: string;
  collaborationTool?: string;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  
  // Implement the `then` function using the reusable function
  then?: <T extends BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
    callback: (newData: Snapshot<BaseData, K>) => void
  ) => Snapshot<Data<T, K, Meta>, K> | undefined; // Fixed return type
}

// Define the function to implement the `then` functionality
export function implementThen<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
  const snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "someId",
    data: new Map([
      ["someId", {
        id: "someId",
        title: "someTitle",
        description: "someDescription",
        timestamp: new Date(),
        length: 0,
        data: {} as T,
        events: undefined,
        meta: undefined,
        snapshotStoreConfig: {},
        getSnapshotItems: () => [],
        defaultSubscribeToSnapshots: () => { },
        versionInfo: {},
      } as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]
    ]),
    timestamp: new Date(),
    subscriberId: "someSubscriberId",
    category: "someCategory",
    content: {
      id: "someId",
      title: "someTitle",
      description: "someDescription",
      subscriberId: "someSubscriberId",
      category: "someCategory",
      categoryProperties: undefined,
      timestamp: new Date(),
      length: 0,
      items: [],
      data: {} as T,
    },
    store: undefined,
    events: {} as EventStore<T, K, Meta, ExcludedFields>,
    meta: {},
    // Corrected getSnapshotId implementation
    getSnapshotId: function (key: string | SnapshotData<T, K, Meta, ExcludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
      // If the key is a string, you can use it directly
      if (typeof key === 'string') {
        return snapshot.id; // or some logic to derive the ID
      }
      
      // If the key is of type T, you can derive the ID based on its properties
      // This assumes T has a method or property that can be used to get an ID
      if (key && typeof key !== 'string') {
        // Logic to derive the ID from key
        return key.id || snapshot.id; // Adjust as needed
      }
      
      return null; // Return null or some default value if no ID can be determined
    },
    compareSnapshotState: function (
      snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): boolean {
      // Check if snapshot1 exists and has a state property
      if (snapshot1 && snapshot1.state) {
        // Compare the two states and return true or false based on your logic
        // For example, check if the states are equal in length or content
        return snapshot1.state.length === (snapshot2.state?.length || 0);
      }

      // If snapshot1 is null or has no state, return false
      return false;
    },
    eventRecords: null,
    snapshotStore: null,
    dataItems: null,
    newData: null,
    stores: null,
    unsubscribe: function (
      unsubscribeDetails: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      },
      callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null): void {
      // Remove reference to callback
      let callbackRef = callback;
      callbackRef = null;
      // Remove reference to callback
      callback = null;
    },

    fetchSnapshot: function (
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K> | undefined,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payloadData: T | Data,
        category: Category | undefined,        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K>[]
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      if (callback) {
        
        const convertedSnapshot = convertToDataSnapshot(snapshot);

        const criteria = snapshotApi.getSnapshotCriteria(
          snapshotContainer as unknown as SnapshotContainer<Data, Data>,
          convertedSnapshot 
        );
        const id = snapshotApi.getSnapshotId(criteria);
        const dummySnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        const dummyPayloadData: T | Data = {} as T | Data;
        const dummyCategory: symbol | string | Category | undefined = undefined;
        const categoryProperties: CategoryProperties = {} as CategoryProperties;
        const dummyTimestamp: Date = new Date();
        const dummyData: T = {} as T;
        const dummyDelegate: SnapshotWithCriteria<T, K>[] = [];
        
        // Wrap the callback result in a Promise
        const result = callback(String(id), undefined, dummySnapshotStore, dummyPayloadData, dummyCategory, categoryProperties, dummyTimestamp, dummyData, dummyDelegate);
        return Promise.resolve(result);
      }
      return Promise.resolve(undefined);
    },
    snapshotStoreConfig: snapshotStoreConfigInstance,
    getSnapshotItems: () => [],
    defaultSubscribeToSnapshots: () => { },
    versionInfo: {} as ExtendedVersionData,
   

    handleSnapshot: function (
      id: string,
      snapshotId: string,
      snapshot: T extends SnapshotData<T, K, Meta, ExcludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,  // Use conditional type to ensure properties exist
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K, Meta>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
     
      if (snapshot && isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot)) {
        // Now TypeScript knows that `snapshot` is of type `Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`
        snapshot.state = snapshots;
        snapshot.event = event;
        snapshot.type = type;
    
        return Promise.resolve(snapshot);
      }    
      return Promise.resolve(null)
    },
    subscribe: function (
      snapshotId: number,
      unsubscribe: UnsubscribeDetails,
      subscriber: Subscriber<T, K> | null,
      data: T,
      event: Event,
      callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      value: T,
    ): SnapshotsArray<T, K, Meta> {
      const foundSubscriber = subscriber as Subscriber<T, K>;
      if (foundSubscriber) {
        foundSubscriber.getState(data);
        foundSubscriber.setEvent(event, value);
      }
    
      // Create a new snapshot of type Snapshot<T, BaseData>
      const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        ...snapshot,
        initialState: snapshot.initialState,
        mappedSnapshotData: snapshot.mappedSnapshotData
      };
    
      // Type assertion when passing to callback
      callback(newSnapshot as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
    
      // Return an appropriate SnapshotsArray<T, K, Meta> value.
      return [newSnapshot as unknown as SnapshotUnion<T, K, Meta>];
    }
  }
  callback(snapshot);
  return snapshot;
}

const metadata: UnifiedMetadata<T, K> = useMetadata<BaseData<any>>(area);

// Define the `defaultCommonEvent` object using the `CommonEvent` interface
const defaultCommonEvent: CommonEvent = {
  _id: "",
  id: "",
  title: "",
  date: new Date(),
  startTime: "",
  endTime: "",
  recurring: false,
  recurrenceRule: "",
  category: "",
  timezone: "",
  participants: [],
  language: "",
  agenda: "",
  collaborationTool: "",
  metadata: metadata,

  status: StatusType.Scheduled,
  isActive: false,
  tags: { },
  phase: null,
  // Implement the `then` function using the reusable function
  then: <T extends  BaseData<any>,  K extends T = T,  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
    callback: (newData: Snapshot<Data<T, K, Meta>, K>) => void) => implementThen(callback),
  analysisType: {} as AnalysisTypeEnum.COMPARATIVE,
  analysisResults: [],
  videoData: {} as VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
};
export { CommonEvent, defaultCommonEvent };

