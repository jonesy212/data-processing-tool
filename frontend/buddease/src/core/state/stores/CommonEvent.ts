// CommonEvent.ts
import * as snapshotApi from '@/core/api/SnapshotApi';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { useMetadata } from '@/core/config/useMetadata';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { snapshotContainer } from '@/core/snapshots/SnapshotContainer';
import type { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { BaseData, Data } from '@/core/models/data/Data';
import { StatusType } from '@/core/models/data/StatusType';
import type { Member } from '@/core/models/members/Member';
import type { TagsRecord } from '@/core/models/tracker/Tag';
import type { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { FetchSnapshotPayload } from '@/core/snapshots/FetchSnapshotPayload';
import type { SnapshotsArray, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import type { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import type { SnapshotData } from '@/core/snapshots/SnapshotData';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { snapshotStoreConfigInstance } from '@/core/snapshots/snapshotStoreConfigInstance';
import { Subscriber } from '@/core/subscribers/Subscriber';
import type { Callback } from '@/core/subscribers/subscribeToSnapshotsImplementation';
import { AnalysisTypeEnum } from '@/core/typings/AnalysisType';
import type { EventAttachment, EventEntity, EventExcludedFields, EventIncludedFields, EventK, EventMeta } from '@/core/typings/entities/EventEntity';
import type { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import type { VideoData } from '@/core/typings/videoTypes/Video';
import { convertToDataSnapshot } from '@/core/typings/YourSpecificSnapshotType';
import type { ExtendedVersionData } from '@/core/versions/VersionData';
import { isSnapshot } from '@/utils/snapshotUtils';


interface CommonEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Remove extends Data
{  
  title: string;
  date: string | Date | undefined;
  startTime?: string;
  endTime?: string;
  tags?: TagsRecord<T> | string[] | undefined;
  recurring?: boolean;
  recurrenceRule?: string;
  category?: symbol | string | Category | undefined;
  timezone?: string;
  participants: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  language?: string;
  agenda?: string;
  collaborationTool?: string;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Keep the data property with proper type
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  then?: <
    TT extends BaseDataEntity,
    KK extends TT = TT,
    MM extends DefaultMeta<TT, KK> = DefaultMeta<TT, KK>,
    AA extends Attachment = Attachment,
    EF extends keyof TT = DefaultExcludedFields<TT>,
    IF extends keyof TT = keyof TT
  >(
    callback: (
      newData: Snapshot<TT, KK, MM, AA, EF, IF>
    ) => void
  ) => Snapshot<TT, KK, MM, AA, EF, IF> | undefined;
}

// Define the function to implement the `then` functionality
export function implementThen<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    
  const { latestVersion = createLatestVersion<VT, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), ...rest } = data;
  
  const snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "someId",
    data: new Map([
      ["someId", {
        id: "someId",
        title: "someTitle",
        description: "someDescription",
        timestamp: new Date(),
        length: 0,
        // Add all required properties from Data interface
        latestVersion: latestVersion, // This is required
        major: 1,
        minor: 0,
        patch: 0,
        category: undefined,
        categoryProperties: undefined,
        subtasks: [],
        actions: [],
        snapshotWithCriteria: undefined,
        value: null,
        label: null,
        metadata: {},
        toInitializedData: () => ({} as any),
        // BaseData properties
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        // Add any other required properties from BaseData
        sharedData: undefined,
        children: [],
        data: {} as any,
        size: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(),
        isScheduled: false,
        status: null,
        tags: [],
        phase: null,
        phaseType: undefined,
        initialState: undefined,
        dueDate: null,
        priority: null,
        assignee: null,
        collaborators: [],
        comments: undefined,
        attachments: [],
        analysisType: null,
        analysisResults: [],
        audioUrl: undefined,
        videoUrl: undefined,
        videoThumbnail: undefined,
        videoDuration: undefined,
        collaborationOptions: [],
        videoData: undefined,
        additionalData: undefined,
        ideas: [],
        members: [],
        leader: null,
        snapshotStores: [],
        snapshots: undefined,
        text: undefined,
        notificationTypes: undefined,
        userConfig: undefined,
        scheduled: undefined,
        // Data specific
        events: undefined,
        meta: undefined,
        snapshotStoreConfig: {},
        getSnapshotItems: () => [],
        defaultSubscribeToSnapshots: () => { },
        versionInfo: {},
      } as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>],
    ]),
    timestamp: new Date(),
    subscriberId: "someSubscriberId",
    category: "someCategory",
    content: {

      apiEndpoint: 'snapshot-apiEndpoint',
      apiKey: 0,
      timeout: 'snapshot-timeout',
      retryAttempts: 0,
     

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
    store: {} as CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: {} as Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    // Corrected getSnapshotId implementation
    getSnapshotId: function (key: string | T,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
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
    dataItems: undefined,
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
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null): void {
      // Remove reference to callback
      let callbackRef = callback;
      callbackRef = null;
      // Remove reference to callback
      callback = null;
    },

    fetchSnapshot: function (
      snapshotId: string,
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K> | undefined,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payloadData: T | Data,
        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K>[],
        category?: Category
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      if (callback) {
        
        const convertedSnapshot = convertToDataSnapshot(snapshot);

        const criteria = snapshotApi.getSnapshotCriteria(
          snapshotContainer as unknown as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    versionInfo: {} as ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
   

    handleSnapshot: function (
      id: string,
      snapshotId: string | number | null,
      snapshot: T extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ? Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> : null,  // Use conditional type to ensure properties exist
      snapshotData: T,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
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
      snapshotId: string | number | null,
      unsubscribe: UnsubscribeDetails,
      subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      data: T,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      value: T,
    ): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      const foundSubscriber = subscriber as Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
    
      // Return an appropriate SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> value.
      return [newSnapshot as unknown as SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>];
    }
  }
  callback(snapshot);
  return snapshot;
}

const area = fetchUserAreaDimensions().toString()
const metadata: UnifiedMetadata<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields> = useMetadata<BaseData<any>>(area);

// Define the `defaultCommonEvent` object using the `CommonEvent` interface
const defaultCommonEvent: CommonEvent<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields> = {
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
  then: (
    callback: (
      newData: Snapshot<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>
    ) => void) => implementThen(callback),
  analysisType: {} as AnalysisTypeEnum.COMPARATIVE,
  analysisResults: [],
  videoData: {} as VideoData<EventEntity, EventK>,
};
export { defaultCommonEvent };
export type { CommonEvent };

