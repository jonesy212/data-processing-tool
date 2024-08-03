// import { Snapshots } from '@/app/components/snapshots/SnapshotStore';
import { handleApiError } from "@/app/api/ApiLogs";
import * as snapshotApi from '@/app/api/SnapshotApi';
import { getSnapshotId, getSnapshots, mergeSnapshots } from "@/app/api/SnapshotApi";
import appTreeApiService from "@/app/api/appTreeApi";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification
} from "@/app/components/support/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { AxiosError } from "axios";
import { subscribe } from "graphql";
import { flatMap } from "lodash";
import { IHydrateResult } from "mobx-persist";
import { useDispatch } from "react-redux";
import defaultImplementation from "../event/defaultImplementation";
import YourComponent from "../hooks/YourComponent";
import { CombinedEvents, SnapshotManager, SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { mapToSnapshotStore } from "../mappings/mapToSnapshotStore";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationPosition,
  PriorityTypeEnum,
  StatusType,
  SubscriberTypeEnum
} from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { initialState } from "../state/redux/slices/FilteredEventsSlice";
import { clearSnapshot, removeSnapshot } from "../state/redux/slices/SnapshotSlice";
import CalendarManagerStoreClass, { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import { convertSnapshotStoreToMap, convertSnapshotStoreToSnapshot, isSnapshotStore, snapshotType } from "../typings/YourSpecificSnapshotType";
import { userId } from "../users/ApiUser";
import { Subscriber } from "../users/Subscriber";
import { portfolioUpdates, TriggerIncentivesParams, unsubscribe } from "../utils/applicationUtils";
import { isSnapshot } from "../utils/snapshotUtils";
import { CoreSnapshot, CreateSnapshotStoresPayload, CustomSnapshotData, Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { SnapshotActions } from "./SnapshotActions";
import {
  AuditRecord,
  ConfigureSnapshotStorePayload,
  K,
  // K,
  RetentionPolicy,
  SnapshotStoreConfig,
  T,
} from "./SnapshotConfig";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { snapshot } from "./snapshot";
import {
  addSnapshotSuccess, batchFetchSnapshotsFailure,
  batchFetchSnapshotsRequest, batchFetchSnapshotsSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, batchUpdateSnapshots,
  batchUpdateSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  createInitSnapshot, createSnapshotFailure, createSnapshotSuccess, delegate, getAllSnapshots, initSnapshot, notifySubscribers, updateSnapshot, updateSnapshotFailure, updateSnapshotSuccess, updateSnapshots, updateSnapshotsSuccess
} from "./snapshotHandlers";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
import UserRoles from "../users/UserRoles";
import { SnapshotStoreMethod } from "./SnapshotStorMethods";
import { getTradeExecutions } from "../trading/TradingUtils";
import { useState } from "react";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
const { notify } = useNotification();
const dispatch = useDispatch();
const notificationContext = useNotification();

interface FetchableDataStore<T extends BaseData, K extends BaseData = T> {
  getData(): Promise<DataStore<T, K>[]>;
}


const initializeData = (): Data => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};

export const defaultCategory: CategoryProperties = {
  name: "DefaultCategory",
  description: "",
  icon: "",
  color: "",
  iconColor: "",
  isActive: true,
  isPublic: true,
  isSystem: true,
  isDefault: true,
  isHidden: false,
  isHiddenInList: false,
  UserInterface: [],
  DataVisualization: [],
  Forms: undefined,
  Analysis: [],
  Communication: [],
  TaskManagement: [],
  Crypto: [],
  brandName: "",
  brandLogo: "",
  brandColor: "",
  brandMessage: "",
};
 



// Example usage in defaultSubscribeToSnapshots

// Example usage in defaultSubscribeToSnapshots
export const defaultSubscribeToSnapshots = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  callback: (snapshots: Snapshot<T, K>[]) => Subscriber<BaseData, T> | null,
  snapshot: Snapshot<T, K> | null = null
) => {
  console.warn('Default subscription to snapshots is being used.');

  console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

  const snapshotStoreData= await snapshotApi.fetchSnapshotStoreData(snapshotId)
  // Simulate receiving a snapshot update
  setTimeout(() => {
    const snapshot: Snapshot<T, K> = {
      data: new Map<string, Snapshot<T, K>>().set("data1", {
        data: {
          id: "data1",
          title: "Sample Data",
          description: "Sample description",
          timestamp: new Date(),
          category: "Sample category",
        } as T,
        events: {
          eventRecords: {
            "event1": [{
              id: "event1",
              title: "Event 1",
              description: "Event 1 description",
              content: "Event 1 content",
              topics: ["topic1"],
              highlights: ["highlight1"],
              date: new Date(),
              files: [],
              rsvpStatus: "yes",
              participants: [],
              teamMemberId: "team1",
              getSnapshotStoreData: (): Promise<SnapshotStore<
                SnapshotWithCriteria<BaseData>,
                SnapshotWithCriteria<BaseData>>[]> => {
                throw new Error("Function not implemented.");
              },
              getData: (): Promise<Snapshot<
                SnapshotWithCriteria<BaseData>,
                SnapshotWithCriteria<BaseData>>> => {
                throw new Error("Function not implemented.");
              },
              meta: {
                timestamp: new Date().getTime()
              },
              timestamp: new Date().getTime()
            }
            ],
            "event2": [{
              id: "event2",
              title: "Event 2",
              description: "Event 2 description",
              content: "Event 2 content",
              topics: ["topic2"],
              highlights: ["highlight2"],
              date: new Date(),
              files: [],
              rsvpStatus: "no",
              participants: [],
              teamMemberId: "team2",
              meta: undefined,
              getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
                throw new Error("Function not implemented.");
              },
              getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
                throw new Error("Function not implemented.");
              },
              timestamp: undefined
            }]
          },
          callbacks: [
            {
              eventType: "update",
              callbackFunction: (data) => {
                console.log("Update callback triggered with data:", data);
              }
            },
            {
              eventType: "create",
              callbackFunction: (data) => {
                console.log("Create callback triggered with data:", data);
              }
            }
          ]
        },
        meta: {
          id: "data1",
          title: "Sample Data",
          description: "Sample description",
          timestamp: new Date(),
          category: "Sample category",
        } as K,
        store: null,
        configOption: null
      }),
      meta: {
        id: snapshotId,
        title: `Snapshot ${snapshotId}`,
        description: "Snapshot description",
        timestamp: new Date(),
        category: "Snapshot category",
      } as K,
      store: null,
      configOption: null,
      events: {
        callbacks: [
          {
            eventType: "snapshotUpdate",
            callbackFunction: (data: Snapshot<T, K>
            ) => {
              console.log("Snapshot update callback triggered with data:", data);
            }
          }
        ],
        eventRecords: {
          "snapshotEvent1": [{
            id: "snapshotEvent1",
            title: "Snapshot Event 1",
            description: "Snapshot Event 1 description",
            content: "Snapshot Event 1 content",
            topics: ["topic1"],
            highlights: ["highlight1"],
            date: new Date(),
            files: [],
            rsvpStatus: "yes",
            participants: [],
            teamMemberId: "team1",
            meta: undefined,
            getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
              throw new Error("Function not implemented.");
            },
            getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {

            },
            timestamp: undefined
          }]
        }
      }
    };

    // Define a variable of type Snapshot<BaseData, K>[] and assign the single snapshot to it
    const snapshots: Snapshot<T, K>[] = [snapshot];
    callback(snapshots);
  }, 1000); // Simulate a delay before receiving the update
};

// Function to unsubscribe from snapshots
export const defaultUnsubscribeFromSnapshots = <T extends Data, K extends Data>(
  snapshotId: string,
  callback: Callback<Snapshot<T, K>>,
  snapshot: Snapshot<T, K> // Ensure this matches the expected type
): void => {
  console.warn('Default unsubscription from snapshots is being used.');
  console.log(`Unsubscribed from snapshot with ID: ${snapshotId}`);
  
  // Ensure `snapshot` is of type `Snapshot<T, K>`
  callback(snapshot);

  // Simulate a delay before receiving the update
  setTimeout(() => {
    callback(snapshot);
  }, 1000);
};


export const defaultSubscribeToSnapshot = (
  snapshotId: string,
  callback: (snapshot: Snapshot<Data, Data>) => void
): void => {
  // Dummy implementation of subscribing to a single snapshot
  console.log(`Subscribed to single snapshot with ID: ${snapshotId}`);

  // Simulate receiving a snapshot update
  setTimeout(() => {
    const snapshot: CoreSnapshot<Data, Data> = {
      id: snapshotId,
      name: "Sample Snapshot",
      timestamp: new Date(),
      orders: [],
      createdBy: "User",
      subscriberId: "sub123",
      length: 1,
      category: "Sample category",
      date: new Date(),

      data: new Map<string, Data>().set("data1", {
        id: "data1",
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{ id: "1", name: "Important", color: "red" }],
      }),
      meta: {
        id: snapshotId,
        title: `Snapshot ${snapshotId}`,
        description: "Snapshot description",
        timestamp: new Date(),
        category: "Snapshot category",
      },
      snapshotItems: [],
      configOption: null,
      events: undefined
    };

    callback(snapshot); // Send as a single snapshot
  }, 1000); // Simulate a delay before receiving the update
};

export const defaultDelegate: SnapshotStoreConfig<BaseData, BaseData>[] = [];

const defaultDataStoreMethods: DataStore<BaseData, BaseData> = {
  data: new Map<string, Snapshot<BaseData>>(),
  getData(): Promise<SnapshotStore<BaseData, BaseData>[]> {
    return new Promise((resolve, reject) => {
      try {
        // Simulate fetching data from a data source or creating data
        // Example data, replace with actual logic to retrieve or create data
        const exampleData: SnapshotStore<T, K>[] = [
          {
            // Example SnapshotStore object
            id: "1",
            title: "Sample Data 1",
            description: "This is a sample description 1",
            timestamp: new Date(),
            category: "Sample Category 1",
            data: new Map<string, Snapshot<BaseData>>(),
            snapshotId: "",
            key: "",
            topic: "",
            date: undefined,
            configOption: null,
            config: undefined,
            message: undefined,
            createdBy: "",
            type: undefined,
            subscribers: [{
              id: "1",
              name: "John Doe",
              email: "john@example.com",
              _id: undefined,
              subscription: {
                unsubscribe: unsubscribe,
                portfolioUpdates: portfolioUpdates,
                tradeExecutions: tradeExections,
                marketUpdates: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
                  throw new Error("Function not implemented.");
                },
                triggerIncentives: function ({ userId, incentiveType, params }: TriggerIncentivesParams): void {
                  throw new Error("Function not implemented.");
                },
                communityEngagement: function ({ userId, snapshotId }: { userId: string; snapshotId: string; }): void {
                  throw new Error("Function not implemented.");
                },
                subscriberId: undefined,
                subscriptionId: undefined,
                subscriberType: undefined,
                subscriptionType: undefined,
                getPlanName: undefined,
                portfolioUpdatesLastUpdated: null,
                getId: undefined,
                determineCategory: function (data: Snapshot<T, K> | null | undefined): string {
                  throw new Error("Function not implemented.");
                },
                category: undefined,
                fetchSnapshotById: undefined,
                fetchSnapshotByIdCallback: undefined
              },
              subscriberId: "",
              subscribersById: undefined,
              subscribers: [],
              onSnapshotCallbacks: [],
              onErrorCallbacks: [],
              onUnsubscribeCallbacks: [],
              notifyEventSystem: undefined,
              updateProjectState: undefined,
              logActivity: undefined,
              triggerIncentives: undefined,
              optionalData: null,
              data: undefined,
              enabled: false,
              tags: [],
              snapshotIds: [],
              payload: undefined,
              fetchSnapshotIds: function (): Promise<string[]> {
                throw new Error("Function not implemented.");
              },
              getId: function (): string | undefined {
                throw new Error("Function not implemented.");
              },
              defaultSubscribeToSnapshots: [],
              subscribeToSnapshots: [],
              getSubscribers: [],
              transformSubscribers: [],
              setSubscribers: [],
              getOnSnapshotCallbacks: [],
              setOnSnapshotCallbacks: [],
              getOnErrorCallbacks: [],
              setOnErrorCallbacks: [],
              getOnUnsubscribeCallbacks: [],
              setOnUnsubscribeCallbacks: [],
              setNotifyEventSystem: undefined,
              setUpdateProjectState: undefined,
              setLogActivity: undefined,
              setTriggerIncentives: undefined,
              setOptionalData: null,
              setEmail: "",
              setSnapshotIds: [],
              getPayload: undefined,
              getEnabled: false,
              getTags: [],
              getDefaultSubscribeToSnapshots: async function (): Promise<void | null> {
                return null; // Implement your logic here if needed
              },
              getSubscribeToSnapshots: async function (): Promise<void | null> {
                return null; // Implement your logic here if needed
              },
              handleCallback: function (data: Snapshot<BaseData, BaseData>): void {
                throw new Error("Function not implemented.");
              },
              snapshotCallback: function (data: Snapshot<T, K>): void {
                throw new Error("Function not implemented.");
              },
              getEmail: function (): string {
                throw new Error("Function not implemented.");
              },
              subscribe: function (callback: (data: Snapshot<T, K>) => void): void {
                throw new Error("Function not implemented.");
              },
              unsubscribe: function (callback: (data: Snapshot<T, K>) => void): void {
                throw new Error("Function not implemented.");
              },
              getTransformSubscribers: function (): ((data: Snapshot<T, K>) => void)[] {
                throw new Error("Function not implemented.");
              },
              getOptionalData: function (): CustomSnapshotData | null {
                throw new Error("Function not implemented.");
              },
              getFetchSnapshotIds: function (): Promise<string[]> {
                throw new Error("Function not implemented.");
              },
              getSnapshotIds: function (): string[] {
                throw new Error("Function not implemented.");
              },
              getData: function (): Partial<SnapshotStore<T, K>> | null {
                throw new Error("Function not implemented.");
              },
              getNewData: function (): Promise<Partial<SnapshotStore<T, K>> | null> {
                throw new Error("Function not implemented.");
              },
              getNotifyEventSystem: function (): Function | undefined {
                throw new Error("Function not implemented.");
              },
              getUpdateProjectState: function (): Function | undefined {
                throw new Error("Function not implemented.");
              },
              getLogActivity: function (): Function | undefined {
                throw new Error("Function not implemented.");
              },
              getTriggerIncentives: function (): Function | undefined {
                throw new Error("Function not implemented.");
              },
              initialData: function (data: Snapshot<T, K>): void {
                throw new Error("Function not implemented.");
              },
              getName: function (): string {
                throw new Error("Function not implemented.");
              },
              getDetermineCategory: function (data: Snapshot<T, K>): Snapshot<T, K> {
                throw new Error("Function not implemented.");
              },
              fetchSnapshotById: function (userId: string, snapshotId: string): Promise<Snapshot<T, K>> {
                throw new Error("Function not implemented.");
              },
              snapshots: function (): Promise<SnapshotStoreConfig<BaseData, Data>[]> {
                throw new Error("Function not implemented.");
              },
              toSnapshotStore: function (initialState: Snapshot<T, K> | undefined, snapshotConfig: SnapshotStoreConfig<BaseData, Data>[], delegate: (snapshot: Snapshot<T, any>, initialState: Snapshot<T, any>, snapshotConfig: SnapshotStoreConfig<BaseData, Data>[]) => void): SnapshotStore<T, K>[] | undefined {
                throw new Error("Function not implemented.");
              },
              determineCategory: function (initialState: Snapshot<T, K>): string {
                throw new Error("Function not implemented.");
              },
              getDeterminedCategory: function (data: Snapshot<T, K>): string {
                throw new Error("Function not implemented.");
              },
              processNotification: function (id: string, message: string, snapshotContent: Map<string, Snapshot<T, K>> | null | undefined, date: Date, type: NotificationType, store: SnapshotStore<T, K>): Promise<void> {
                throw new Error("Function not implemented.");
              },
              receiveSnapshot: function (snapshot: T): void {
                throw new Error("Function not implemented.");
              },
              getState: function (prop: any) {
                throw new Error("Function not implemented.");
              },
              setEvent: function (prop: any, value: any): void {
                throw new Error("Function not implemented.");
              },
              onError: function (callback: (error: Error) => void): void {
                throw new Error("Function not implemented.");
              },
              getSubscriberId: function (): string {
                throw new Error("Function not implemented.");
              },
              getSubscribersById: function (): Map<string, Subscriber<T, K>> {
                throw new Error("Function not implemented.");
              },
              getSubscribersWithSubscriptionPlan: function (userId: string, snapshotId: string): SubscriberTypeEnum | undefined {
                throw new Error("Function not implemented.");
              },
              getSubscription: function (): Subscription<T, K> {
                throw new Error("Function not implemented.");
              },
              onUnsubscribe: function (callback: (callback: (data: Snapshot<T, K>) => void) => void): void {
                throw new Error("Function not implemented.");
              },
              onSnapshot: function (callback: (snapshot: Snapshot<T, K>) => void | Promise<void>): void {
                throw new Error("Function not implemented.");
              },
              onSnapshotError: function (callback: (error: Error) => void): void {
                throw new Error("Function not implemented.");
              },
              onSnapshotUnsubscribe: function (callback: (callback: (data: Snapshot<T, K>) => void) => void): void {
                throw new Error("Function not implemented.");
              },
              triggerOnSnapshot: function (snapshot: Snapshot<T, K>): void {
                throw new Error("Function not implemented.");
              }
            }],
            set: undefined,
            state: null,
            store: null,
            snapshots: [],
            snapshotConfig: [],
            dataStore: undefined,
            initialState: undefined,
            snapshotItems: [],
            nestedStores: [],
            dataStoreMethods: undefined,
            delegate: [],
            subscriberId: "",
            length: 0,
            content: "",
            value: 0,
            todoSnapshotId: "",
            events: undefined,
            snapshotStore: null,
            dataItems: [],
            newData: undefined,
            getData: this.getData,
            addSnapshotItem: function (item: SnapshotStoreConfig<BaseData, BaseData> | Snapshot<any, any>): void {
              throw new Error("Function not implemented.");
            },
            addNestedStore: function (store: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, BaseData> | null, snapshot?: Snapshot<BaseData, BaseData> | null): void {
              throw new Error("Function not implemented.");
            },
            subscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, BaseData> | null, snapshot?: Snapshot<BaseData, BaseData> | null): void {
              throw new Error("Function not implemented.");
            },
            transformSubscriber: function (sub: Subscriber<BaseData, BaseData>): Subscriber<BaseData, BaseData> {
              throw new Error("Function not implemented.");
            },
            transformDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            initializedState: undefined,
            getAllKeys: function (): Promise<string[]> {
              throw new Error("Function not implemented.");
            },
            getAllItems: function (): Promise<BaseData[]> {
              throw new Error("Function not implemented.");
            },
            addData: function (data: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            addDataStatus: function (id: number, status: "pending" | "inProgress" | "completed"): void {
              throw new Error("Function not implemented.");
            },
            removeData: function (id: number): void {
              throw new Error("Function not implemented.");
            },
            updateData: function (id: number, newData: BaseData): void {
              throw new Error("Function not implemented.");
            },
            updateDataTitle: function (id: number, title: string): void {
              throw new Error("Function not implemented.");
            },
            updateDataDescription: function (id: number, description: string): void {
              throw new Error("Function not implemented.");
            },
            updateDataStatus: function (id: number, status: "pending" | "inProgress" | "completed"): void {
              throw new Error("Function not implemented.");
            },
            addDataSuccess: function (payload: { data: BaseData[]; }): void {
              throw new Error("Function not implemented.");
            },
            getDataVersions: function (id: number): Promise<BaseData[] | undefined> {
              throw new Error("Function not implemented.");
            },
            updateDataVersions: function (id: number, versions: BaseData[]): void {
              throw new Error("Function not implemented.");
            },
            getBackendVersion: function (): Promise<string | undefined> {
              throw new Error("Function not implemented.");
            },
            getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
              throw new Error("Function not implemented.");
            },
            fetchData: function (id: number): Promise<SnapshotStore<BaseData, BaseData>[]> {
              throw new Error("Function not implemented.");
            },
            defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            handleSubscribeToSnapshot: function (
              snapshotId: string,
              callback: Callback<Snapshot<BaseData, BaseData>>,
              snapshot: Snapshot<BaseData, BaseData>
            ): void {
              throw new Error("Function not implemented.");
            },
            snapshot(
              id: string,
              snapshotData: SnapshotStoreConfig<any, K>[],
              category: string | CategoryProperties,
              dataStoreMethods: DataStore<T, K>
            ): Promise<{ snapshot: SnapshotStore<T, K> }> {
              return new Promise(async (resolve, reject) => {
                try {
                  // Convert the Map to the appropriate format
                  if (this.data === undefined) {
                    this.data = new Map<string, Snapshot<T, K>>();
                  }
            
                  if (this.data !== undefined) {
                    const convertedData = mapToSnapshotStore(this.data) as Partial<SnapshotStore<T, K>>;
            
                    // Logic to generate and return the snapshot
                    const newSnapshot: SnapshotStore<T, K> = new SnapshotStore<T, K>({
                      initialState: this,
                      category: category,
                      snapshotId: id, // Ensure to use the correct ID here
                      data: convertedData,
                      date: new Date(),
                      type: "snapshot",
                      snapshotConfig: snapshotData,
                      subscribeToSnapshots: this.subscribeToSnapshots,
                      subscribeToSnapshot: this.subscribeToSnapshot,
                      delegate: this.transformDelegate(),
                      dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
                      getDelegate: this.getDelegate,
                      getDataStoreMethods: this.getDataStoreMethods,
                      snapshotMethods: this.snapshotMethods,
                      handleSnapshotOperation: this.handleSnapshotOperation
                    });
            
                    resolve({ snapshot: newSnapshot });
                  } else {
                    reject("Snapshot is not available");
                  }
                } catch (error) {
                  reject(error);
                }
              })
            },
            removeItem: function (key: string): Promise<void> {
              throw new Error("Function not implemented.");
            },
            getSnapshot: function (
              snapshot: () => Promise<{
                category: any;
                timestamp: any;
                id: any;
                snapshot: Snapshot<T, K>;
                snapshotStore: SnapshotStore<T, K>;
                data: BaseData;
            }> | undefined): Promise<SnapshotStore<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            },
            getSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): Promise<SnapshotStore<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            },
            getSnapshotId: function (key: SnapshotData): Promise<string | undefined> {
              throw new Error("Function not implemented.");
            },
            getItem: function (key: string): Promise<BaseData | undefined> {
              throw new Error("Function not implemented.");
            },
            setItem: function (key: string, value: BaseData): Promise<void> {
              throw new Error("Function not implemented.");
            },
            addSnapshotFailure: function (date: Date, error: Error): void {
              throw new Error("Function not implemented.");
            },
            getDataStore: function (): Promise<DataStore<T, K>[]> {
              throw new Error("Function not implemented.");
            }
            addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<BaseData, BaseData>[]): void {
              throw new Error("Function not implemented.");
            },
            compareSnapshotState: function (stateA: Snapshot<BaseData, BaseData> | Snapshot<BaseData, BaseData>[] | null | undefined, stateB: Snapshot<BaseData, BaseData> | null | undefined): boolean {
              throw new Error("Function not implemented.");
            },
            deepCompare: function (objA: any, objB: any): boolean {
              throw new Error("Function not implemented.");
            },
            shallowCompare: function (objA: any, objB: any): boolean {
              throw new Error("Function not implemented.");
            },
            getDataStoreMethods: function (): DataStoreMethods<BaseData, BaseData> {
              throw new Error("Function not implemented.");
            },
            getDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            determineCategory: function (snapshot: Snapshot<BaseData, BaseData> | null | undefined): string {
              throw new Error("Function not implemented.");
            },
            determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
              throw new Error("Function not implemented.");
            },
            updateSnapshot: function (snapshotId: string, data: Map<string, BaseData>, events: Record<string, CalendarEvent[]>, snapshotStore: SnapshotStore<BaseData, BaseData>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, BaseData>, payload: UpdateSnapshotPayload<BaseData>, store: SnapshotStore<any, BaseData>): Promise<{ snapshot: SnapshotStore<BaseData, BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            updateSnapshotSuccess: function (): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotFailure({
              snapshotManager,
              snapshot,
              payload
            }: {
              snapshotManager: SnapshotManager<T, K>;
              snapshot: Snapshot<T, K>;
              payload: { error: string };
            }): void {
              notify(
                "updateSnapshotFailure",
                `Failed to update snapshot: ${payload.error}`,
                "",
                new Date(),
                NotificationTypeEnum.Error,
                NotificationPosition.TopRight
              );
            },
            removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            clearSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            addSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<void> {
              throw new Error("Function not implemented.");
            },
            createInitSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, BaseData>, category: string): Snapshot<Data> {
              throw new Error("Function not implemented.");
            },
            createSnapshotSuccess: function (snapshot: Snapshot<Data>): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotSuccess: function (snapshotData: SnapshotStore<BaseData, BaseData>, subscribers: ((data: Subscriber<BaseData, BaseData>) => void)[]): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotFailure: function (error: Error): void {
              throw new Error("Function not implemented.");
            },
            createSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData>, error: Error): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[], snapshot: Snapshots<BaseData>) => void): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotsFailure: function (error: Payload): void {
              throw new Error("Function not implemented.");
            },
            initSnapshot: function (snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            takeSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
              throw new Error("Function not implemented.");
            },
            configureSnapshotStore: function (snapshot: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            flatMap<U>(
              callback: (
                value: SnapshotStoreConfig<BaseData, BaseData>,
                index: number,
                array: SnapshotStoreConfig<BaseData, BaseData>[]
              ) => U
            ): U extends (infer I)[] ? I[] : U[] {
              // Use a generic array type to handle cases where U is not an array
              const result: Array<U extends (infer I)[] ? I : U> = [];
            
              this.snapshotStoreConfig?.forEach((delegateItem, i, arr) => {
                const mappedValues = callback(delegateItem, i, arr);
                // Check if mappedValues is an array
                if (Array.isArray(mappedValues)) {
                  result.push(...mappedValues as Array<U extends (infer I)[] ? I : U>);
                } else {
                  result.push(mappedValues as U extends (infer I)[] ? I : U);
                }
              });
            
              return result as U extends (infer I)[] ? I[] : U[];
            },
            setData: function (data: BaseData): void {
              throw new Error("Function not implemented.");
            },
            getState: function () {
              throw new Error("Function not implemented.");
            },
            setState: function (state: any): void {
              throw new Error("Function not implemented.");
            },
            validateSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): boolean {
              throw new Error("Function not implemented.");
            },
            handleSnapshot: function (snapshot: Snapshot<BaseData> | null, snapshotId: string): void {
              throw new Error("Function not implemented.");
            },
            handleActions: function (): void {
              throw new Error("Function not implemented.");
            },
            setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
              throw new Error("Function not implemented.");
            },
            setSnapshotData: function (subscribers: Subscriber<any, any>[], snapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>>): void {
              throw new Error("Function not implemented.");
            },
            setSnapshots: function (snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            clearSnapshot: function (): void {
              throw new Error("Function not implemented.");
            },
            mergeSnapshots: function (snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            reduceSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            sortSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            filterSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            mapSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            findSnapshot: function (): void {
              throw new Error("Function not implemented.");
            },
            getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{
              subscribers: Subscriber<BaseData, BaseData>[];
              snapshots: Snapshots<BaseData>;
            }> {
              throw new Error("Function not implemented.");
            },
            notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
              throw new Error("Function not implemented.");
            },
            notifySubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            subscribe: function (): void {
              throw new Error("Function not implemented.");
            },
            unsubscribe: function (): void {
              throw new Error("Function not implemented.");
            },
            fetchSnapshot: function (snapshotId: string, category: string | CategoryProperties | undefined, timestamp: Date, snapshot: Snapshot<BaseData>, data: BaseData, delegate: SnapshotStoreConfig<BaseData, BaseData>[]): Promise<{
              id: any;
              category: string | CategoryProperties | undefined;
              timestamp: any;
              snapshot: Snapshot<BaseData, BaseData>;
              data: BaseData;
              getItem?: (snapshot: Snapshot<BaseData, BaseData>) => Snapshot<BaseData, BaseData> | undefined;
            }> {
              throw new Error("Function not implemented.");
            },
            fetchSnapshotSuccess: function (
              snapshotData: (
                subscribers: Subscriber<BaseData, BaseData>[], 
                snapshot: Snapshot<BaseData, BaseData>) => void): void {
              throw new Error("Function not implemented.");
            },
            fetchSnapshotFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
              throw new Error("Function not implemented.");
            },
            generateId: function (): string {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshots: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[]) => Promise<{
              subscribers: Subscriber<BaseData, BaseData>[];
              snapshots: Snapshots<BaseData>;
            }>): void {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            batchTakeSnapshot: function (snapshotStore: SnapshotStore<BaseData, BaseData>, snapshots: Snapshots<BaseData>): Promise<{ snapshots: Snapshots<BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            handleSnapshotSuccess: function (
              snapshot: Snapshot<Data, Data> | null,
              snapshotId: string): void {
              throw new Error("Function not implemented.");
            },
            // Implementing [Symbol.iterator] method
            [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            }
          },
          {
            // Another example SnapshotStore object
            id: "2",
            title: "Sample Data 2",
            description: "This is a sample description 2",
            timestamp: new Date(),
            category: "Sample Category 2",
            timestamp: new Date(),
            // Add other required properties here
            data: new Map<string, Snapshot<BaseData>>(),
            key: "",
            topic: "",
            date: undefined,
            config: undefined,
            message: undefined,
            createdBy: "",
            type: undefined,
            subscribers: [],
            store: null,
            stores: null,
            snapshots: [],
            snapshotStoreConfig: [],
            meta: null,
            getSnapshotItems: function (): (Snapshot<T, K> | SnapshotStoreConfig<T, K>)[] {
              throw new Error("Function not implemented.");
            },
            dataStore: undefined,
            initialState: undefined,
            snapshotItems: [],
            nestedStores: [],
            dataStoreMethods: undefined,
            delegate: [],
            subscriberId: "",
            length: 0,
            content: "",
            value: 0,
            todoSnapshotId: "",
            events: undefined,
            snapshotStore: null,
            dataItems: [],
            newData: undefined,
            getData: function (): Promise<DataStore<SnapshotWithCriteria<BaseData, BaseData>[], BaseData>> {
              throw new Error("Function not implemented.");
            },
            addSnapshotItem: function (item: SnapshotStoreConfig<BaseData, BaseData> | Snapshot<any, any>): void {
              throw new Error("Function not implemented.");
            },
            addNestedStore: function (store: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, BaseData> | null, snapshot?: Snapshot<BaseData, BaseData> | null): void {
              throw new Error("Function not implemented.");
            },
            subscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, BaseData> | null, snapshot?: Snapshot<BaseData, BaseData> | null): void {
              throw new Error("Function not implemented.");
            },
            transformSubscriber: function (sub: Subscriber<BaseData, BaseData>): Subscriber<BaseData, BaseData> {
              throw new Error("Function not implemented.");
            },
            transformDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            initializedState: undefined,
            transformedDelegate: [],
            getAllKeys: function (): Promise<string[]> {
              throw new Error("Function not implemented.");
            },
            getAllItems: function (): Promise<BaseData[]> {
              throw new Error("Function not implemented.");
            },
            addData: function (data: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            addDataStatus: function (id: number, status: "pending" | "inProgress" | "completed"): void {
              throw new Error("Function not implemented.");
            },
            removeData: function (id: number): void {
              throw new Error("Function not implemented.");
            },
            updateData: function (id: number, newData: BaseData): void {
              throw new Error("Function not implemented.");
            },
            updateDataTitle: function (id: number, title: string): void {
              throw new Error("Function not implemented.");
            },
            updateDataDescription: function (id: number, description: string): void {
              throw new Error("Function not implemented.");
            },
            updateDataStatus: function (id: number, status: "pending" | "inProgress" | "completed"): void {
              throw new Error("Function not implemented.");
            },
            addDataSuccess: function (payload: { data: BaseData[]; }): void {
              throw new Error("Function not implemented.");
            },
            getDataVersions: function (id: number): Promise<BaseData[] | undefined> {
              throw new Error("Function not implemented.");
            },
            updateDataVersions: function (id: number, versions: BaseData[]): void {
              throw new Error("Function not implemented.");
            },
            getBackendVersion: function (): Promise<string | undefined> {
              throw new Error("Function not implemented.");
            },
            getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
              throw new Error("Function not implemented.");
            },
            fetchData: function (id: number): Promise<SnapshotStore<BaseData, BaseData>[]> {
              throw new Error("Function not implemented.");
            },
            defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): string {
              throw new Error("Function not implemented.");
            },
            handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            snapshot: undefined,
            removeItem: function (key: string): Promise<void> {
              throw new Error("Function not implemented.");
            },
            getSnapshot: function (snapshot: (id: string) => Promise<{
              category: any;
              timestamp: any;
              id: any;
              snapshot: Snapshot<BaseData, BaseData>;
              snapshotStore: SnapshotStore<BaseData, BaseData>;
              data: BaseData;
            }> | undefined): Promise<Snapshot<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            },
            getSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): Promise<SnapshotStore<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            },
            getSnapshotId: function (key: SnapshotData): Promise<string | undefined> {
              throw new Error("Function not implemented.");
            },
            getItem: function (key: string): Promise<Snapshot<BaseData, BaseData> | undefined> {
              throw new Error("Function not implemented.");
            },
            setItem: function (key: string, value: BaseData): Promise<void> {
              throw new Error("Function not implemented.");
            },
            addSnapshotFailure: function (
              date: Date, 
              snapshotManager: SnapshotManager<T, K>,
              snapshot: Snapshot<BaseData, BaseData>, 
              payload: { error: Error; }
            ): void {
              throw new Error("Function not implemented.");
            },
            getDataStore: function (): Map<string, DataStore<BaseData, BaseData>[]> {
              throw new Error("Function not implemented.");
            },
            addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<BaseData, BaseData>[]): void {
              throw new Error("Function not implemented.");
            },
            compareSnapshotState: function (stateA: Snapshot<BaseData, BaseData> | Snapshot<BaseData, BaseData>[] | null | undefined, stateB: Snapshot<BaseData, BaseData> | null | undefined): boolean {
              throw new Error("Function not implemented.");
            },
            deepCompare: function (objA: any, objB: any): boolean {
              throw new Error("Function not implemented.");
            },
            shallowCompare: function (objA: any, objB: any): boolean {
              throw new Error("Function not implemented.");
            },
            getDataStoreMethods: function (): DataStoreMethods<BaseData, BaseData> {
              throw new Error("Function not implemented.");
            },
            getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<BaseData, BaseData>[]): SnapshotStoreConfig<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            determineCategory: function (snapshot: Snapshot<BaseData, BaseData> | null | undefined): string {
              throw new Error("Function not implemented.");
            },
            determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
              throw new Error("Function not implemented.");
            },
            updateSnapshot: function (snapshotId: string, data: Map<string, BaseData>, events: Record<string, CalendarManagerStoreClass[]>, snapshotStore: SnapshotStore<BaseData, BaseData>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, BaseData>, payload: UpdateSnapshotPayload<BaseData>, store: SnapshotStore<any, BaseData>): Promise<{ snapshot: SnapshotStore<BaseData, BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            updateSnapshotSuccess: function (): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotFailure: function ({
              snapshotManager,
              snapshot,
              payload
            }): void {
              // Extract the error message from the payload
              const { error } = payload;

              // Log the error to the console or a logging service
              console.error("Snapshot update failed:", error);

              // Notify the user about the failure
              notify(
                "updateSnapshotFailure", // Notification type or title
                `Failed to update snapshot: ${error}`, // Message to display
                "", // Optionally, you could include additional details or a link
                new Date(), // Timestamp of the error
                NotificationTypeEnum.Error, // Type of notification (error, success, etc.)
                NotificationPosition.TopRight // Position of the notification on the screen
              );

              // If you need to update application state or take other actions, do so here
              // For example:
              // updateApplicationState({ status: "error", message: error });
            },
            removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            clearSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            addSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<void> {
              throw new Error("Function not implemented.");
            },
            createInitSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, BaseData>, category: string): Snapshot<Data> {
              throw new Error("Function not implemented.");
            },
            createSnapshotSuccess: function (snapshot: Snapshot<Data>): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotSuccess: function (snapshotData: SnapshotStore<BaseData, BaseData>, subscribers: ((data: Subscriber<BaseData, BaseData>) => void)[]): void {
              throw new Error("Function not implemented.");
            },
            setSnapshotFailure: function (error: Error): void {
              throw new Error("Function not implemented.");
            },
            createSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData>, error: Error): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[], snapshot: Snapshots<BaseData>) => void): void {
              throw new Error("Function not implemented.");
            },
            updateSnapshotsFailure: function (error: Payload): void {
              throw new Error("Function not implemented.");
            },
            initSnapshot: function (snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            takeSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
              throw new Error("Function not implemented.");
            },
            configureSnapshotStore: function (snapshot: SnapshotStore<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<BaseData, BaseData>[]) => U): U extends (infer I)[] ? I[] : U[] {
              throw new Error("Function not implemented.");
            },
            setData: function (data: BaseData): void {
              throw new Error("Function not implemented.");
            },
            getState: function () {
              throw new Error("Function not implemented.");
            },
            setState: function (state: any): void {
              throw new Error("Function not implemented.");
            },
            validateSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): boolean {
              throw new Error("Function not implemented.");
            },
            handleSnapshot: function (snapshot: Snapshot<BaseData, BaseData> | null, snapshotId: string): void {
              throw new Error("Function not implemented.");
            },
            handleActions: function (action: (selectedText: string) => void): void {
              throw new Error("Function not implemented.");
            },
            setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
              throw new Error("Function not implemented.");
            },
            transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
              throw new Error("Function not implemented.");
            },
            setSnapshotData: function <T extends Data, K extends Data>(
              data: Map<string, Snapshot<T, K>>,
              subscribers: Subscriber<any, any>[],
              snapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>>
            ): void {

            },
            setSnapshots: function (snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            clearSnapshot: function (): void {
              throw new Error("Function not implemented.");
            },
            mergeSnapshots: function (snapshots: Snapshots<BaseData>, category: string): void {
              throw new Error("Function not implemented.");
            },
            reduceSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            sortSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            filterSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            mapSnapshots: function (): void {
              throw new Error("Function not implemented.");
            },
            findSnapshot: function (): void {
              throw new Error("Function not implemented.");
            },
            getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{
              subscribers: Subscriber<BaseData, BaseData>[];
              snapshots: Snapshots<BaseData>;
            }> {
              throw new Error("Function not implemented.");
            },
            notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
              throw new Error("Function not implemented.");
            },
            notifySubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, BaseData>[] {
              throw new Error("Function not implemented.");
            },
            subscribe: function (): void {
              throw new Error("Function not implemented.");
            },
            unsubscribe: function (): void {
              throw new Error("Function not implemented.");
            },
            fetchSnapshot: function (snapshotId: string, category: string | CategoryProperties | undefined, timestamp: Date, snapshot: Snapshot<BaseData, BaseData>, data: BaseData, delegate: SnapshotStoreConfig<BaseData, BaseData>[]): Promise<{
              id: any;
              category: string | CategoryProperties | undefined;
              timestamp: any;
              snapshot: Snapshot<BaseData, BaseData>;
              data: BaseData;
              getItem?: (snapshot: Snapshot<BaseData, BaseData>) => Snapshot<BaseData, BaseData> | undefined;
            }> {
              throw new Error("Function not implemented.");
            },
            fetchSnapshotSuccess: function (
              snapshotData: (
                snapshotManager: SnapshotManager<T, K>, 
                subscribers: Subscriber<T, K>[],
                snapshot: Snapshot<T, K>) => void
            ): void {
              throw new Error("Function not implemented.");
            },
            fetchSnapshotFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
              throw new Error("Function not implemented.");
            },
            generateId: function (): string {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshots: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[]) => Promise<{
              subscribers: Subscriber<BaseData, BaseData>[];
              snapshots: Snapshots<BaseData>;
            }>): void {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
              throw new Error("Function not implemented.");
            },
            batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
              throw new Error("Function not implemented.");
            },
            batchTakeSnapshot: function (snapshotStore: SnapshotStore<BaseData, BaseData>, snapshots: Snapshots<BaseData>): Promise<{ snapshots: Snapshots<BaseData>; }> {
              throw new Error("Function not implemented.");
            },
            handleSnapshotSuccess: function (snapshot: Snapshot<Data, Data> | null, snapshotId: string): void {
              throw new Error("Function not implemented.");
            },
            // Implementing [Symbol.iterator] method
            [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData, BaseData>> {
              throw new Error("Function not implemented.");
            }
          },
        ];

        // Resolve the promise with the example data
        resolve(exampleData);
      } catch (error: any) {
        // Reject the promise in case of an error
        reject(new Error("Failed to fetch data: " + error.message));
      }
    });
  },
  addData: (data: Snapshot<BaseData, any>) => { },
  addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  updateData: (id: number, newData: Snapshot<BaseData>) => { },
  removeData: (id: number) => { },
  updateDataTitle: (id: number, title: string) => { },
  updateDataDescription: (id: number, description: string) => { },
  updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
  getItem: async (key: string) => undefined,
  setItem: async (id: string, item: Snapshot<BaseData>) => { },
  removeItem: async (key: string) => { },
  getAllKeys: async () => [],
  getAllItems: async () => [],
  getDataVersions: async (id: number): Promise<Snapshot<BaseData>[] | undefined> => {
    return undefined;
  },
  // addDataSuccess: async (data: BaseData, subscribers: Subscriber<T, K>[]) => { },
  updateDataVersions: async (id: number, newData: Snapshot<BaseData>[]) => { },
  getBackendVersion: async (): Promise<string > => {
    return "0.0.0";
  },
  getFrontendVersion: async (): Promise<string> => {
      return "0.0.0";
  },
  getDelegate: async ({ useSimulatedDataSource, simulatedDataSource }) => {
    if (useSimulatedDataSource) {
      return simulatedDataSource;
    }
    return defaultDelegate;
  },
  addDataSuccess: async (payload: { data: Snapshot<BaseData>[] }) => { },
  fetchData: async (): Promise<SnapshotStore<BaseData, K>[]> => {
    return [];
  },
  snapshotMethods: []
};

interface SnapshotStoreSubset<T extends BaseData, K extends BaseData> {
  snapshotId: string;
  taskIdToAssign: Snapshot<T, K> | undefined;
  addSnapshot: (snapshot: Omit<Snapshot<Data>, "id">, subscribers: Subscriber<T, K>[]) => void;
  onSnapshot: (snapshot: Snapshot<T, K>, config: SnapshotStoreConfig<BaseData, Data>[]) => void;
  addSnapshotSuccess: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => void;
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T, K>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Data,
    payload: UpdateSnapshotPayload<T>
  ) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;
  createInitSnapshot: (snapshotData: SnapshotStore<T, K> | Snapshot<BaseData> | null | undefined) => void;
  createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  createSnapshotFailure: (snapshot: Snapshot<T, K>, error: any) => Promise<void>;
  updateSnapshots: (snapshots: Snapshots<T>) => Promise<any>;
  updateSnapshotSuccess: (snapshot: Snapshot<Data>) => Promise<{
    id: string; data: {
      createdAt: Date; updatedAt: Date; category?: string | CategoryProperties | undefined;
      getData?: (id: number) => Promise<T | undefined>;
    }; timestamp: Date; category: string; length: number; content: undefined;
  } | undefined>;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: (snapshotStore: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: Snapshot<BaseData>) => void;
  takeSnapshot: (updatedSnapshots: Snapshot<T, K>) => Promise<BaseData[] | null>;
  takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, Data>) => void;
  getData: () => Data | null;
  setData: (data: Data) => void;
  getState: () => any;
  setState: (state: any) => void;
  validateSnapshot: (snapshot: Snapshot<Data>) => boolean;
  handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  handleActions: (action: any) => void;
  setSnapshot: (snapshot: Snapshot<T, K>) => void;
  setSnapshots: (snapshots: Snapshot<T, K>[]) => void;
  clearSnapshot: (snapshotId: string) => void;
  mergeSnapshots: (snapshots: Snapshots<T>) => void;
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<any, any>) => U, initialValue: U) => U;
  sortSnapshots: (compareFn: (a: Snapshot<any, any>, b: Snapshot<any, any>) => number) => void;
  filterSnapshots: (predicate: (snapshot: Snapshot<any, any>) => boolean) => Snapshot<any, any>[];
  mapSnapshots: <U>(callback: (snapshot: Snapshot<any, any>) => U) => U[];
  findSnapshot: (predicate: (snapshot: Snapshot<any, any>) => boolean) => Snapshot<any, any> | undefined;
  getSubscribers: (subscribers: Subscriber<T, K>[], snapshots: Snapshot<T, K>) => void;
  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
  notifySubscribers: (subscribers: Subscriber<T, K>[], data: CustomSnapshotData | Snapshot<BaseData>) => Promise<T>;
  subscribe: () => void;
  unsubscribe: () => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, any>>; // assuming fetchSnapshot needs an id parameter and returns a Promise
  fetchSnapshotSuccess: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  fetchSnapshotFailure: () => void;
  getSnapshot(id: string): Snapshot<T, K> | undefined;
  getSnapshots: (category?: string, filter?: (snapshot: Snapshot<T, any>) => boolean) => Promise<Snapshots<T>>;
  getAllSnapshots: (filter?: (snapshot: Snapshot<T, any>) => boolean) => Promise<Snapshots<T>>;
  generateId: () => void;
  batchFetchSnapshots: () => void;
  batchTakeSnapshotsRequest: () => void;
  batchUpdateSnapshotsRequest: () => void;
  batchFetchSnapshotsSuccess: () => void;
  batchFetchSnapshotsFailure: () => void;
  batchUpdateSnapshotsSuccess: () => void;
  batchUpdateSnapshotsFailure: () => void;
  batchTakeSnapshot: () => void;
}

interface SnapshotData<T extends BaseData, K extends BaseData> {
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive" | "archived";
  category: string;
  snapshotStore: SnapshotStore<BaseData, any>;
  data: BaseData;
}

class SnapshotStore<T extends BaseData, K extends BaseData = T> implements DataStore<T, K>,
  SnapshotWithCriteria<T, K> {
  id: string | number = '';
  snapshotId?: string | number = '';
  key: string = '';
  topic: string = '';
  date: string | number | Date | undefined;
  configOption?: string | SnapshotStoreConfig<T, K> | null = null;
  config: SnapshotStoreConfig<T, K>[] | null | undefined = undefined;
  title: string = '';
  subscription?: Subscription<T, K> | null = null;
  description?: string | undefined = '';
  category: string | CategoryProperties | undefined;
  message: string | undefined;
  timestamp: string | number | Date | undefined;
  createdBy: string
  eventRecords: Record<string, CalendarEvent[]> | null = null;
  type: string | undefined | null = '';
  subscribers: Subscriber<T, K>[] & Record<string, Subscriber<T, K>>
  set?: (data: T | Map<string, Snapshot<T, K>>, type: string, event: Event) => void | null
  setStore?: (data: T | Map<string, SnapshotStore<T, K>>, type: string, event: Event) => void | null
  data?: T | Map<string, Snapshot<T, K>> | null = null;
  state?: Snapshot<T, K>[] | null = null; // Adjusted to match Snapshot<T, K> structure
  store: SnapshotStore<T, K> | null = null;
  stores: SnapshotStore<T, K>[] | null = null;
  snapshots: Snapshots<T> = [];
  snapshotStoreConfig: SnapshotStoreConfig<T, K>[] = [];
  expirationDate?: Date;
  priority?: PriorityTypeEnum | undefined;
  tags?: ((string[] | Tag[]) & TagsRecord) | undefined
  metadata?: StructuredMetadata
  meta: Map<string, Snapshot<T, K>> | undefined = undefined;
  status?: StatusType
  isCompressed?: boolean;
  snapshotMethods: SnapshotStoreMethod<T, K>[] | undefined;

  getSnapshotsBySubscriber: any;
  getSnapshotsBySubscriberSuccess: any;
  getSnapshotsByTopic: any;
  getSnapshotsByTopicSuccess: any;
  getSnapshotsByCategory: any;
  getSnapshotsByCategorySuccess: any;
  getSnapshotsByKey: any;
  getSnapshotsByKeySuccess: any;
  getSnapshotsByPriority: any;
  getSnapshotsByPrioritySuccess: any;
  getStoreData: any;
  updateStoreData: any;
  updateDelegate: any;
  getSnapshotContainer: any;
  getSnapshotVersions: any;
  
  // Getter for snapshotItems
  public getSnapshotItems(): (Snapshot<any, any> | SnapshotStoreConfig<T, K>)[] {
    return this.snapshotItems;
  }

  // public data: Map<string, T> = new Map();
  public dataStore: T | Map<string, SnapshotStore<T, K>> | undefined = new Map();

  public initialState: Snapshot<T, K> | null | undefined;

  private snapshotItems: (Snapshot<any, any> | SnapshotStoreConfig<T, K>)[] = [];
  
  // Use this property if you need to manage nested SnapshotStores
  private nestedStores: SnapshotStore<T, K>[] = [];

  private snapshotIds: string[] = [];
  private dataStoreMethods: DataStoreWithSnapshotMethods<T, K> | undefined = undefined

  private delegate: SnapshotStoreConfig<T, K>[] = [];

  private events: Record<string, CalendarEvent[]> & CombinedEvents<T, K> | undefined = {
    eventIds: [],
    eventRecords: {},
    callbacks: [],
    subscribers: []
  };

  subscriberId: string = ''; // Added missing property
  length: number = 0; // Added missing property
  content: string = ''; // Added missing property
  value: number = 0; // Added missing property
  todoSnapshotId: string = ''; // Added missing property
 
  snapshotStore: SnapshotStore<T, K> | null = null;
  dataItems: RealtimeDataItem[] = []
  newData: Snapshot<T, K> | undefined = {
    id: '',
    name: '',
    title: '',
    description: '',
    status: '',
    category: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {} as T | Map<string, Snapshot<T, K>>,
    meta: {} as Map<string, any>,
    set: () => { },
    snapshotItems: [],
    configOption: [],
  }

  

  constructor(options: SnapshotStoreOptions<T, K>, config: SnapshotStoreConfig<T, K>) {
    Object.assign(this, options.data); // Initialize properties from options.data if provided
    this.timestamp = new Date(); // Initialize timestamp
    const prefix = this.determinePrefix(options.snapshotConfig, options.category?.toString() ?? "");
    this.id = UniqueIDGenerator.generateID(
      prefix,
      (options.snapshotId || options.configOption?.id || options.configOption?.name || options.configOption?.title || options.configOption?.description || "").toString(),
      NotificationTypeEnum.GeneratedID
    );

    this.initialState = config.initialState;

    if (config.initialState instanceof SnapshotStore) {
      this.dataStore = convertSnapshotStoreToMap(options.initialState);
    } else if (isSnapshot(options.initialState)) {
      this.dataStore = options.initialState.data as Map<string, Snapshot<T, K>>;
    } else {
      this.dataStore = new Map<string, Snapshot<T, K>>();
    }

    this.category = options.category;
    this.date = options.date;
    this.type = options.type;
    this.snapshotStoreConfig = options.snapshotStoreConfig;
    this.subscribeToSnapshots = options.subscribeToSnapshots ? options.subscribeToSnapshots : this.subscribeToSnapshots;
    this.subscribeToSnapshot = options.subscribeToSnapshot;
    this.delegate = options.delegate;
    this.dataStoreMethods = options.dataStoreMethods;

    this.data = new Map<string, Snapshot<T, K>>();
    this.key = "";
    this.topic = "";
 
    this.config = null;
    this.configOption = null;
    this.subscription = null;
    this.category = options.category;
    this.createdBy = "";
    this.timestamp = new Date();
    this.set = undefined;
    this.snapshots = [];
    this.state = null;
    this.subscribers = [];
    this.subscriberId = '';
    this.length = 0;
    this.content = '';
    this.value = 0;
    this.todoSnapshotId = '';
  }

  
  getData(id: number): Promise<SnapshotWithCriteria<T, K> | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const event = this.events[id];
        if (!event) {
          resolve(undefined);
          return;
        }

        const data: SnapshotWithCriteria<T, K> = {
          id: event.id,
          getSnapshotId: (parameter: string) => event.id,
          eventRecords: {},
          analysisType: undefined,
          events: undefined,
          subscribers: undefined,
          tags: undefined,
          timestamp: new Date(),
        };

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }


  getDataStore(): Promise<DataStore<T, K>[]> {
    return new Promise((resolve, reject) => {
      try {
        // Your logic to retrieve data goes here
        const data: SnapshotStore<T, K>[] = [
          {
            description: "This is a sample event",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-06-05"),
            status: "scheduled",
            priority: "high",
            assignedUser: "John Doe",
            todoStatus: "completed",
            taskStatus: "in progress",
            teamStatus: "active",
            dataStatus: "processed",
            calendarStatus: "approved",
            notificationStatus: "read",
            bookmarkStatus: "saved",
            priorityType: "urgent",
            projectPhase: "planning",
            developmentPhase: "coding",
            subscriberType: "premium",
            subscriptionType: "monthly",
            analysisType: AnalysisTypeEnum.STATISTICAL,
            documentType: "pdf",
            fileType: "document",
            tenantType: "tenantA",
            ideaCreationPhaseType: "ideation",
            securityFeatureType: "encryption",
            feedbackPhaseType: "review",
            contentManagementType: "content",
            taskPhaseType: "execution",
            animationType: "2d",
            languageType: "english",
            codingLanguageType: "javascript",
            formatType: "json",
            privacySettingsType: "public",
            messageType: "email",
            id: "event1",
            title: "Sample Event",
            content: "This is a sample event content",
            topics: [],
            highlights: [],
            files: [],
            rsvpStatus: "yes",
            then: function <T extends Data, K extends Data>(callback: (newData: Snapshot<T, K>) => void): Snapshot<Data, Data> | undefined {
              // Implement the then function here
              callback({
                description: "This is a sample event",
                startDate: new Date("2024-06-01"),
                endDate: new Date("2024-06-05"),
                status: "scheduled",
                priority: "high",
                assignedUser: "John Doe",
                todoStatus: "completed",
                taskStatus: "in progress",
                teamStatus: "active",
                dataStatus: "processed",
                calendarStatus: "approved",
                notificationStatus: "read",
                bookmarkStatus: "saved",
                priorityType: "urgent",
                projectPhase: "planning",
                developmentPhase: "coding",
                subscriberType: "premium",
                subscriptionType: "monthly",
                analysisType: AnalysisTypeEnum.STATISTICAL,
                documentType: "pdf",
                fileType: "document",
                tenantType: "tenantA",
                ideaCreationPhaseType: "ideation",
                securityFeatureType: "encryption",
                feedbackPhaseType: "review",
                contentManagementType: "content",
                taskPhaseType: "execution",
                animationType: "2d",
                languageType: "english",
                codingLanguageType: "javascript",
                formatType: "json",
                privacySettingsType: "public",
                messageType: "email",
                id: "event1",
                title: "Sample Event",
                content: "This is a sample event content",
                topics: [],
                highlights: [],
                files: [],
                rsvpStatus: "yes",
              });
              return undefined;
            }
          }
        ]; // Example data, replace with actual logic

        // Resolve the promise with the data
        resolve(data);
      } catch (error) {
        // In case of an error, you can call reject with an error message
        reject(new Error("Something went wrong"));
      }
    });
  }

  

  // Method to handle snapshots and configurations
  addSnapshotItem(item: Snapshot<any, any> | SnapshotStoreConfig<T, K>): void {
    this.snapshotItems.push(item);
  }

  // Method to handle nested stores
  addNestedStore(store: SnapshotStore<T, K>): void {
    this.nestedStores.push(store);
  }

  defaultSubscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K> | null = null
  ): void {
    console.warn('Default subscription to snapshots is being used.');
  
    // Dummy implementation of subscribing to snapshots
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  
    // Simulate receiving a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{ id: "1", name: "Important", color: "red" }],
      };
  
      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
        unsubscribe: function (callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<T, any>) => void): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (snapshotId: string, snapshot: Snapshot<T, any> | null, type: string, event: Event): void {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: undefined
      };
  
      callback([snapshot]);
    }, 1000); // Simulate a delay before receiving the update
  }

  defaultCreateSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[],
  ): SnapshotStore<T, K>[] | null {
    console.warn('Default create snapshot stores is being used.');
    // Dummy implementation of creating snapshot stores
    console.log(`Created snapshot stores with ID: ${id}`);
    // use snapshotApi to receive a snapshot update
    setTimeout(() => {
      const data: BaseData = {
        id: "data1", // Ensure this matches the expected structure of BaseData
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
        startDate: new Date(),
        endDate: new Date(),
        scheduled: true,
        status: "Pending",
        isActive: true,
        tags: [{
          id: "1", name: "Important", color: "red",
          description: "This is a sample description",
          enabled: true,
          type: "tag",
          tags: []
        }],

      }
   

      const snapshot: Snapshot<T, any> = {
        id: snapshotId,
        data: data as T,
        timestamp: new Date(),
        unsubscribe: function (callback: Callback<Snapshot<T, any>>): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<T, any>) => void): void {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (snapshotId: string, snapshot: Snapshot<T, any> | null, type: string, event: Event): void {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        meta: undefined,
        category: category,
        snapshotDataConfig: snapshotDataConfig || [
          {
            id: "data1",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data2",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
          },
          {
            id: "data3",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            startDate: new Date(),
            endDate: new Date(),
            scheduled: true,
            status: "Pending",
            isActive: true,
            tags: [{ id: "1", name: "Important", color: "red" }],
                

          }]
      }
    })
    return null;
  }

  createSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotManager: SnapshotManager<T, K>,
    payload: CreateSnapshotStoresPayload<T, K>,
    callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
    snapshotStoreData?: SnapshotStore<T, K>[],
    category?: string | CategoryProperties,
    snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
  ) {
    if (this.createSnapshotStores) {
      this.createSnapshotStores(id, snapshotId, snapshot, snapshotStore, snapshotManager, payload, callback, snapshotStoreData, category, snapshotDataConfig);
    } else {
      console.warn('createSnapshotStores method is not defined.');
      this.defaultCreateSnapshotStores(id, snapshotId, snapshot, snapshotStore, snapshotManager, payload, callback, snapshotStoreData, category, snapshotDataConfig);
    }

  }

  subscribeToSnapshots(
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
    snapshot: Snapshot<T, K> | null = null
  ) {
    if (this.subscribeToSnapshots) {
      this.subscribeToSnapshots(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshots method is not defined.');
      this.defaultSubscribeToSnapshots(snapshotId, callback, snapshot);
    }
  }

  subscribeToSnapshot?(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ) {
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshot method is not defined.');
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }


  private transformSubscriber(sub: Subscriber<T, K>): Subscriber<BaseData, K> {
    return {
      ...sub,
      data: sub.getData ? sub.getData()!.data : undefined,
    };
  }


private isSnapshotStoreConfig(item: any): item is SnapshotStoreConfig<T, K> {
  // Add checks for required properties of SnapshotStoreConfig
  return (
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'title' in item &&
    // Add more property checks as needed
    true
  );
}


private transformDelegate(): SnapshotStoreConfig<T, K>[] {
  return this.delegate.map(config => ({
    ...config,
    data: config.data,
    subscribers: config.subscribers.map(sub => this.transformSubscriber(sub)) as Subscriber<BaseData, K>[],
    configOption: config.configOption && typeof config.configOption !== 'string' ? {
      ...config.configOption,
      data: config.configOption.data,
      subscribers: config.configOption.subscribers.map(sub => this.transformSubscriber(sub)) as Subscriber<BaseData, K>[]
    } : config.configOption
  }));
}

  get initializedState(): SnapshotStore<T, K> | Map<string, Snapshot<T, K>> | Snapshot<T, K> | null | undefined {
    return this.initialState;
  }

  get transformedDelegate(): SnapshotStoreConfig<T, K>[] {
    return this.transformDelegate();
  }

  get getSnapshotIds(): SnapshotStoreConfig<T, K>[] {
    if (
      this.transformedDelegate &&
      Array.isArray(this.transformedDelegate) &&
      this.transformedDelegate.every(item => item instanceof SnapshotStoreConfig)
    ) {
      return this.transformedDelegate;
    }
    return [];
  }
  

  getAllKeys(): Promise<string[]> | undefined {
    return this.dataStoreMethods?.getAllKeys();
  }


  mapSnapshot(
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    type: string,
    event: Event
  ): SnapshotStore<T, K> | undefined {
    // Ensure type safety here
    if (this.dataStoreMethods === undefined) {
      return undefined;
    }
    if (this.dataStoreMethods) {
      return this.dataStoreMethods.mapSnapshot(snapshotId, snapshot, type, event);
    }
    return undefined

  }

  getAllItems(): Promise<Snapshot<T, K>[]> | undefined {
    if (this.dataStoreMethods === undefined) {
      return undefined;
    }
    if (this.dataStoreMethods) {
      return this.dataStoreMethods.getAllItems();
    }
    return undefined
  }
  
  addData(data: Snapshot<T, K>): void {
    this.dataStoreMethods?.addData(data); // Ensure type safety here
    this.dataStoreMethods?.addDataStatus(data.id ? data.id : 0
      , "pending");
  }

  addDataStatus(id: number, status: "pending" | "inProgress" | "completed"): void {
    this.dataStoreMethods?.addDataStatus(id, status);
  }

  removeData(id: number): void {
    this.dataStoreMethods?.removeData(id);
  }

  updateData(id: number, newData: T): void {
    this.dataStoreMethods?.updateData(id, newData);
  }

  updateDataTitle(id: number, title: string): void {
    this.dataStoreMethods?.updateDataTitle(id, title);
  }

  updateDataDescription(id: number, description: string): void {
    this.dataStoreMethods?.updateDataDescription(id, description);
  }

  updateDataStatus(id: number, status: "pending" | "inProgress" | "completed"): void {
    this.dataStoreMethods?.updateDataStatus(id, status);
  }

  addDataSuccess(payload: { data: Snapshot<T, K>[] }): void {
    this.dataStoreMethods?.addDataSuccess(payload);
  }

  getDataVersions(id: number): Promise<Snapshot<T, K>[] | undefined> {
    return this.dataStoreMethods?.getDataVersions(id);
  }

  updateDataVersions(id: number, versions: Snapshot<T, K>[]): void {
    this.dataStoreMethods?.updateDataVersions(id, versions);
  }

  getBackendVersion(): Promise<string | undefined> {
    return this.dataStoreMethods?.getBackendVersion();
  }

  getFrontendVersion(): Promise<string | IHydrateResult<number>> {
    return this.dataStoreMethods?.getFrontendVersion();
  }

  fetchData(id: number): Promise<SnapshotStore<T, K>[]> {
    return this.dataStoreMethods?.fetchData(id);
  }

  defaultSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, K>>,
    snapshot: Snapshot<T, K>
  ): string {
    // Add the subscriber to the subscribers array
    this.subscribers.push({
      id: snapshotId,
      _id: this.subscriberId,
      handleCallback: callback,
      snapshotCallback: snapshot
    });
    // Call the callback with the snapshot
    callback(snapshot);
    // Return the subscriberId
    return this.subscriberId;
  }


  // Method to handle the subscription
  handleSubscribeToSnapshot(
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ): void {
    // Check if subscribeToSnapshot is defined
    if (this.subscribeToSnapshot) {
      this.subscribeToSnapshot(snapshotId, callback, snapshot);
    } else {
      console.warn('subscribeToSnapshot method is not defined.');
      // Optionally, you can provide a default behavior here
      this.defaultSubscribeToSnapshot(snapshotId, callback, snapshot);
    }
  }

  // Implement the snapshot method as expected by SnapshotStoreConfig
  snapshot = async (
    id: string,
    snapshotData: SnapshotStoreConfig<any, K>[],
    category: string | CategoryProperties,
    dataStoreMethods: DataStore<T, K>
  ): Promise<{ snapshot: SnapshotStore<T, K> }> => {

    // Convert the Map to the appropriate format
    if (this.data === undefined) {
      this.data = new Map<string, Snapshot<T, K>>();
    }

    if (this.data !== undefined) {
      const convertedData = mapToSnapshotStore(this.data) as Partial<SnapshotStore<T, K>>;
    
      // Logic to generate and return the snapshot
      const newSnapshot: SnapshotStore<T, K> = new SnapshotStore<T, K>({
        initialState: this,
        category: category,
        snapshotId: this.snapshotId,
        data: convertedData,
        date: new Date(),
        type: "snapshot",
        snapshotConfig: snapshotData,
        subscribeToSnapshots: this.subscribeToSnapshots,
        subscribeToSnapshot: this.subscribeToSnapshot,
        delegate: this.transformedDelegate,
        dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
        getDelegate: this.getDelegate,
        getDataStoreMethods: this.getDataStoreMethods,
        snapshotMethods: snapshotMethods,
        handleSnapshotOperation: handleSnapshotOperation

      })
      return { snapshot: newSnapshot }
    }
    return Promise.reject("Snapshot is not available");
  };
  
  removeItem(key: string): Promise<void> {
    return this.dataStoreMethods?.removeItem(key);
  }

  getSnapshot(
    snapshot: (
      id: string
    ) => Promise<{
      category: any;
      timestamp: any;
      id: any;
      snapshot: Snapshot<T, K>;
      snapshotStore: SnapshotStore<T, K>;
      data: T;
    }> | undefined
  ): Promise<Snapshot<T, K>> {
    return this.delegate[0].getSnapshot(snapshot);
  }


  getSnapshotSuccess(
    snapshot: Snapshot<T, K>
  ): Promise<SnapshotStore<T, K>> {
    const delegateConfig = this.delegate[0]; // Assuming you want to call the first delegate's method
    if (delegateConfig) {
      return delegateConfig.getSnapshotSuccess(snapshot);
    } else {
      throw new Error("Delegate config is not available");
    }
  }

  getSnapshotId(key: SnapshotData): Promise<string | undefined> {
    return Promise.resolve(this.delegate[0].getSnapshotId(key))
  }


  getItem(key: string): Promise<Snapshot<T, K> | undefined> {
    if (this.dataStore) {
      const item = this.dataStore.get(key);
      return Promise.resolve(item)
    }
  
    const snapshotId = await this.getSnapshotId({
      key,
      createdAt: undefined,
      updatedAt: undefined,
      id: "",
      title: "",
      description: "",
      status: "active",
      category: "",
      timestamp: undefined
    });

    if (typeof snapshotId !== 'string') {
      return Promise.resolve(undefined);
    }
  
    try {
      const transformedDelegate = this.transformDelegate();
      const snapshot = await this.fetchSnapshot(
        snapshotId,
        this.category,
        new Date(),
        {} as Snapshot<BaseData>,
        {} as T,
        transformedDelegate
      );

      if (snapshot) {
        const item = snapshot.getItem ? snapshot.getItem(key) : snapshot.data?.get(key);
        return item;
      }
    } catch (error) {
      console.error('Error fetching snapshot:', error);
    }
    return Promise.resolve(undefined);
  }
  
  

  setItem(key: string, value: T): Promise<void> {
    this.dataStore.set(key, value)
    return Promise.resolve();
  }
 
  addSnapshotFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ): void {
    notify(
      `${error.message}`,
      `Snapshot added failed fully.`,
      "Error",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }

  getDataStore(): Map<string, T> {
    return this.dataStore;
  }

  addSnapshotSuccess(
    snapshot: T,
    subscribers: Subscriber<T, K>[]
  ): void {
    const index = this.delegate.findIndex(
      (snapshotStore) =>
        snapshotStore.id === snapshot.id &&
        snapshotStore.category === snapshot.category &&
        snapshotStore.key === snapshot.key &&
        snapshotStore.topic === snapshot.topic &&
        snapshotStore.priority === snapshot.priority &&
        snapshotStore.tags === snapshot.tags &&
        snapshotStore.metadata === snapshot.metadata &&
        snapshotStore.status === snapshot.status &&
        snapshotStore.isCompressed === snapshot.isCompressed &&
        snapshotStore.expirationDate === snapshot.expirationDate &&
        snapshotStore.timestamp === snapshot.timestamp &&
        snapshotStore.data === snapshot.data &&
        this.compareSnapshotState(
          snapshotStore.state as Snapshot<T, K> | null,
          snapshot.state
        )
    );

    if (index !== -1) {
      this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

      notify(
        `${snapshot.id}`,
        `Snapshot ${snapshot.id} added successfully.`,
        "Success",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      // Handle case where snapshotStore matching snapshot is not found
      console.error(`SnapshotStore matching ${snapshot.id} not found.`);
    }
  }

  compareSnapshotState(
    stateA: Snapshot<T, K> | Snapshot<T, K>[] | null | undefined,
    stateB: Snapshot<T, K> | null | undefined
  ): boolean {
    if (!stateA && !stateB) {
      return true; // Both are null or undefined
    }

    if (!stateA || !stateB) {
      return false; // One is null or undefined while the other is not
    }

    // Helper function to compare snapshot objects
    const compareSnapshot = (
      snapshotA: Snapshot<T, K>,
      snapshotB: Snapshot<T, K>
    ): boolean => {
      if (!snapshotA && !snapshotB) {
        return true; // Both are null or undefined
      }

      if (!snapshotA || !snapshotB) {
        return false; // One is null or undefined while the other is not
      }

      // Compare based on available properties
      if (snapshotA._id !== undefined && snapshotB._id !== undefined) {
        return snapshotA._id === snapshotB._id;
      }

      return (
        snapshotA.id === snapshotB.id &&
        snapshotA.data === snapshotB.data &&
        snapshotA.name === snapshotB.name &&
        snapshotA.timestamp === snapshotB.timestamp &&
        snapshotA.title === snapshotB.title &&
        snapshotA.createdBy === snapshotB.createdBy &&
        snapshotA.description === snapshotB.description &&
        snapshotA.tags === snapshotB.tags &&
        snapshotA.subscriberId === snapshotB.subscriberId &&
        snapshotA.store === snapshotB.store &&
        this.compareSnapshotState(snapshotA.state, snapshotB.state) &&
        snapshotA.todoSnapshotId === snapshotB.todoSnapshotId &&
        snapshotA.initialState === snapshotB.initialState
        // Add more properties as needed
      );
    };

    // Compare stateA and stateB appropriately based on your application logic
    if (Array.isArray(stateA) !== Array.isArray(stateB)) {
      return false; // One is an array and the other is not
    }

    if (Array.isArray(stateA)) {
      const arrA = stateA as Snapshot<T, K>[];
      const arrB = stateB as unknown as Snapshot<T, K>[];

      if (arrA.length !== arrB.length) {
        return false; // Arrays have different lengths
      }

      for (let i = 0; i < arrA.length; i++) {
        if (!compareSnapshot(arrA[i], arrB[i])) {
          return false; // Arrays differ at index i
        }
      }

      return true; // Arrays are deeply equal
    } else {
      return compareSnapshot(stateA as Snapshot<T, K>, stateB as Snapshot<T, K>);
    }
  }

  deepCompare(objA: any, objB: any): boolean {
    // Basic deep comparison for objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false; // Different number of keys
    }

    for (let key of keysA) {
      if (objA[key] !== objB[key]) {
        return false; // Different value for key
      }
    }

    return true; // Objects are deeply equal
  }

  shallowCompare(objA: any, objB: any): boolean {
    // Basic shallow comparison for objects
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  getDataStoreMethods(): DataStoreMethods<T, K> {
    return {
      addData: this.addData.bind(this),
      getItem: this.getItem.bind(this),
      removeData: this.removeData.bind(this),
      category: this.category.bind(this),
      dataStoreMethods: this.dataStoreMethods?.bind(this),
      initialState: this.initialState.bind(this),
      updateData: this.updateData.bind(this),
      updateDataTitle: this.updateDataTitle.bind(this),
      updateDataDescription: this.updateDataDescription.bind(this),
      addDataStatus: this.addDataStatus.bind(this),
      updateDataStatus: this.updateDataStatus.bind(this),
      addDataSuccess: this.addDataSuccess.bind(this),
      getDataVersions: this.getDataVersions.bind(this),
      updateDataVersions: this.updateDataVersions.bind(this),
      getBackendVersion: this.getBackendVersion.bind(this),
      getFrontendVersion: this.getFrontendVersion.bind(this),
      getAllKeys: this.getAllKeys.bind(this),
      fetchData: this.fetchData.bind(this),
      setItem: this.setItem.bind(this),
      removeItem: this.removeItem.bind(this),
      getAllItems: this.getAllItems.bind(this),
      getData: this.getData.bind(this),
      addSnapshot: this.addSnapshot.bind(this),
      addSnapshotSuccess: this.addSnapshotSuccess.bind(this),
      getSnapshot: this.getSnapshot.bind(this),
      getSnapshotSuccess: this.getSnapshotSuccess.bind(this),
      getSnapshotsBySubscriber: this.getSnapshotsBySubscriber.bind(this),
      getSnapshotsBySubscriberSuccess: this.getSnapshotsBySubscriberSuccess.bind(
        this
      ),
      getSnapshotsByTopic: this.getSnapshotsByTopic.bind(this),
      getSnapshotsByTopicSuccess: this.getSnapshotsByTopicSuccess.bind(this),
      getSnapshotsByCategory: this.getSnapshotsByCategory.bind(this),
      getSnapshotsByCategorySuccess: this.getSnapshotsByCategorySuccess.bind(
        this
      ),
      getSnapshotsByKey: this.getSnapshotsByKey.bind(this),
      getSnapshotsByKeySuccess: this.getSnapshotsByKeySuccess.bind(this),
      getSnapshotsByPriority: this.getSnapshotsByPriority.bind(this),
      getSnapshotsByPrioritySuccess: this.getSnapshotsByPrioritySuccess.bind(
        this
      ),
      snapshotMethods: this.snapshotMethods,
      getDelegate: this.getDelegate,
      getStoreData: this.getStoreData.bind(this),

      updateStoreData: this.updateStoreData.bind(this),
      updateDelegate: this.updateDelegate.bind(this),
      getSnapshotContainer: this.getSnapshotContainer.bind(this),
      getSnapshotVersions: this.getSnapshotVersions.bind(this),
    } as DataStoreMethods<T, K>;
  }


  getDelegate(
    snapshotStoreConfig: SnapshotStoreConfig<T, K>[]
  ): SnapshotStoreConfig<T, K>[] {
    return snapshotStoreConfig;
  }


  

  determineCategory(snapshot: Snapshot<T, K> | null | undefined): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

  determinePrefix<T extends Data>(
    snapshot: T | null | undefined,
    category: string
  ): string {
    if (category === "user") {
      return "USR";
    } else if (category === "team") {
      return "TM";
    } else if (category === "project") {
      return "PRJ";
    } else if (category === "task") {
      return "TSK";
    } else if (category === "event") {
      return "EVT";
    } else if (category === "file") {
      return "FIL";
    } else if (category === "document") {
      return "DOC";
    } else if (category === "message") {
      return "MSG";
    } else if (category === "location") {
      return "LOC";
    } else if (category === "coupon") {
      return "CPN";
    } else if (category === "video") {
      return "VID";
    } else if (category === "survey") {
      return "SRV";
    } else if (category === "analytics") {
      return "ANL";
    } else if (category === "chat") {
      return "CHT";
    } else if (category === "thread") {
      return "THD";
    } else if (snapshot?.name) {
      // Ensure snapshot is not null or undefined
      return "SNAP";
    } else {
      return "GEN"; // Default prefix
    }
  }

  async updateSnapshot(
    snapshotId: string,
    data: Map<string, BaseData>,
    events: Record<string, CalendarManagerStoreClass[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ): Promise<{ snapshot: SnapshotStore<T, K>; }> {
    try {
      // Create updated snapshot data
      const updatedSnapshotData: Snapshot<T, K> = {
        id: snapshotId,
        data: {
          ...(snapshotStore.data || new Map<string, Snapshot<T, K>>()), // Ensure default empty map if data is undefined
          ...newData.data, // Merge with new data
        },
        timestamp: new Date(),
        category: "update",
        length: 0,
        content: undefined,
        initialState: null,
        // Ensure other required properties are included
      };
  
      // Update snapshotStore with the new data
      snapshotStore.data = new Map<string, Snapshot<T, K>>(); // Initialize if needed
      snapshotStore.data.set(snapshotId.toString(), updatedSnapshotData as unknown as T);
  
      console.log("Snapshot updated successfully:", snapshotStore);
  
      // Return the updated snapshot store
      return { snapshot: snapshotStore };
    } catch (error) {
      console.error("Error updating snapshot:", error);
      throw error;
    }
  }
  
  updateSnapshotSuccess(): void {
    notify(
      "updateSnapshotSuccess",
      "Snapshot updated successfully.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }


  updateSnapshotFailure({
    snapshotManager,
    snapshot,
    payload
  }: {
    snapshotManager: SnapshotManager<T, K>;
    snapshot: Snapshot<T, K>;
    payload: { error: string };
  }): void {
    notify(
      "updateSnapshotFailure",
      `Failed to update snapshot: ${payload.error}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
  }
  
  removeSnapshot(
    snapshotToRemove: SnapshotStore<T, K>
  ): void {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotToRemove.id);
    notify(
      "removeSnapshot",
      `Snapshot ${snapshotToRemove.id} removed successfully.`,
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  clearSnapshots(): void {
    this.snapshots = [];
    notify(
      "clearSnapshots",
      "All snapshots cleared.",
      "",
      new Date(),
      NotificationTypeEnum.Success,
      NotificationPosition.TopRight
    );
  }

  async addSnapshot(
  snapshot: Snapshot<T, K>, 
  subscribers: Subscriber<T, K>[]
): Promise<void> {
  const snapshotData: Snapshot<T, K> = {
    id: snapshot.id || "",
    data: snapshot?.data ?? ({} as T),
    timestamp: new Date(),
    category: snapshot.category || this.category,
    subscribers: subscribers || [],
    key: snapshot.key || this.key,
    topic: snapshot.topic || this.topic,
    state: snapshot.state || this.state,
    config: snapshot.config || this.config,
    delegate: snapshot.delegate || this.delegate,
    subscription: snapshot.subscription || this.subscription,
    length: snapshot.length || 0,
    metadata: snapshot.metadata || {},
    store: snapshot.store || null,
    getSnapshotId: snapshot.getSnapshotId || this.getSnapshotId,
    compareSnapshotState: snapshot.compareSnapshotState || this.compareSnapshotState,
    snapshot: snapshot.snapshot || null,
    snapshotStore: this.
      // snapshotConfig: this.snapshotConfig,
      // set: this.set,
      // snapshots: this.snapshots,
      // configOption: this.configOption,
      // determinePrefix: this.determinePrefix,
      // updateSnapshot: this.updateSnapshot,
      // updateSnapshotSuccess: this.updateSnapshotSuccess,
      // updateSnapshotFailure: this.updateSnapshotFailure,
      // removeSnapshot: this.removeSnapshot,
      // clearSnapshots: this.clearSnapshots,
      // addSnapshot: this.addSnapshot,
      // addSnapshotSuccess: this.addSnapshotSuccess,
      // addSnapshotFailure: this.addSnapshotFailure,
      // notifySubscribers: this.notifySubscribers,
      // createInitSnapshot: this.createInitSnapshot,
      // createSnapshotSuccess: this.createSnapshotSuccess,
      // createSnapshotFailure: this.createSnapshotFailure,
      // updateSnapshots: this.updateSnapshots,
      // updateSnapshotsSuccess: this.updateSnapshotsSuccess,
      // updateSnapshotsFailure: this.updateSnapshotsFailure,
      // initSnapshot: this.initSnapshot,
      // takeSnapshot: this.takeSnapshot,
      // takeSnapshotsSuccess: this.takeSnapshotsSuccess,
      // configureSnapshotStore: this.configureSnapshotStore,
      // getData: this.getData,
      // takeSnapshotSuccess: this.takeSnapshotSuccess,
      // flatMap: this.flatMap,
      // setData: this.setData,
      // getState: this.getState,
      // setState: this.setState,
      // validateSnapshot: this.validateSnapshot,
      // handleSnapshot: this.handleSnapshot,
      // handleActions: this.handleActions,
      // setSnapshot: this.setSnapshot,
      // setSnapshots: this.setSnapshots,
      // clearSnapshot: this.clearSnapshot,
      // mergeSnapshots: this.mergeSnapshots,
      // reduceSnapshots: this.reduceSnapshots,
      // sortSnapshots: this.sortSnapshots,
      // filterSnapshots: this.filterSnapshots,
      // mapSnapshots: this.mapSnapshots,
      // findSnapshot: this.findSnapshot,
      // getSubscribers: this.getSubscribers,
      // notify: this.notify,
      // subscribe: this.subscribe,
      // unsubscribe: this.unsubscribe,
      // fetchSnapshot: this.fetchSnapshot,
      // fetchSnapshotSuccess: this.fetchSnapshotSuccess,
      // fetchSnapshotFailure: this.fetchSnapshotFailure,
      // getSnapshot: this.getSnapshot,
      // getSnapshots: this.getSnapshots,
      // getAllSnapshots: this.getAllSnapshots,
      // generateId: this.generateId,
      // batchFetchSnapshots: this.batchFetchSnapshots,
      // batchTakeSnapshotsRequest: this.batchTakeSnapshotsRequest,
      // batchUpdateSnapshotsRequest: this.batchUpdateSnapshotsRequest,
      // batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
      // batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
      // batchUpdateSnapshotsSuccess: this.batchUpdateSnapshotsSuccess,
      // batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
      // batchTakeSnapshot: this.batchTakeSnapshot,
      // handleSnapshotSuccess: this.handleSnapshotSuccess,
      // [Symbol.iterator]: this[Symbol.iterator],
      // [Symbol.asyncIterator]: this[Symbol.asyncIterator],
    };

    const prefix = this.determinePrefix(
      snapshot,
      this.category!.toString()
    );
    const id = `${prefix}_${this.generateId()}`;
    snapshotData.id = id;

    const snapshotStoreData: SnapshotStore<T, K> = {
      id: snapshotData.id,
      snapshots: [
        {
          data: snapshotData.data as Map<string, Snapshot<T, K>>,
          id: snapshotData.id,
          timestamp: snapshotData.timestamp as Date,
          category: snapshotData.category,
          key: "",
          topic: "",
          date: undefined,
          configOption: null,
          config: undefined,
          subscription: null,
          initialState: null,
          set: undefined,
          state: null,
          snapshots: [],
          type: "",
          dataStore:  this.dataStore,
          // Implement getDataStore to return the expected type
          getDataStore: function () {
            return this.dataStore;
          },
          setSnapshotSuccess: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          subscribeToSnapshots: function (
            snapshotId: string,
            callback: (snapshots: Snapshots<T>) => void
          ): void {
            if (this.subscription) {
              this.subscription.unsubscribe(
                userId!.toString(),
                snapshotId,
                unsubscribeType,
                unsubscribeDate,
                unsubscribeReason,
                unsubscribeData
              );
            }
            this.subscription = this.subscribe(
              snapshotId,
              callback,
              this.snapshots
            );
            this.subscription.subscribe();
            return;
          },
          subscribers: [],
          snapshotConfig: [],
          delegate: {} as SnapshotStoreConfig<BaseData, BaseData>[],

          
         
          async getItem(key: string | SnapshotData): Promise<T | undefined> {
            if (this.snapshots.length === 0) {
              return undefined;
            }


          
            try {
              const snapshotId = await this.getSnapshotId(key).toString();
              const snapshot = await this.fetchSnapshot(snapshotId, category, timestamp, snapshot as SnapshotStore<BaseData>, data, delegate);
          
              if (snapshot) {
                const item = snapshot.getItem(key);
                return item as T | undefined;
              } else {
                return undefined;
              }
            } catch (error) {
              console.error('Error fetching snapshot:', error);
              return undefined;
            }
          },
          

          removeItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          compareSnapshotState: function () {
            defaultImplementation();
            return false;
          },
          setItem: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          deepCompare: function () {
            defaultImplementation();
            return false;
          },
          shallowCompare: function () {
            defaultImplementation();
            return false;
          },
          getDelegate: function () {
            defaultImplementation();
            return [];
          },
          addSnapshotFailure: function (date: Date, error: Error) {
            notify(
              `${error.message}`,
              `Snapshot added failed fully.`,
              "Error",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            )
          },

          addSnapshotSuccess(
            snapshot: BaseData,
            subscribers: Subscriber<T, K>[]
          ): void {
            const index = this.delegate?.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshot.id &&
                snapshotStore.snapshotCategory === snapshot.category &&
                snapshotStore.key === snapshot.key &&
                snapshotStore.topic === snapshot.topic &&
                snapshotStore.priority === snapshot.priority &&
                snapshotStore.tags === snapshot.tags &&
                snapshotStore.metadata === snapshot.metadata &&
                snapshotStore.status === snapshot.status &&
                snapshotStore.isCompressed === snapshot.isCompressed &&
                snapshotStore.expirationDate === snapshot.expirationDate &&
                snapshotStore.timestamp === snapshot.timestamp &&
                snapshotStore.data === snapshot.data &&
                this.compareSnapshotState(
                  snapshotStore.state as Snapshot<BaseData> | null,
                  snapshot.state
                )
            );

            if (index !== -1) {
              this.delegate[index].addSnapshotSuccess(snapshot, subscribers);

              notify(
                `${snapshot.id}`,
                `Snapshot ${snapshot.id} added successfully.`,
                "Success",
                new Date(),
                NotificationTypeEnum.Success,
                NotificationPosition.TopRight
              );
            } else {
              // Handle case where snapshotStore matching snapshot is not found
              console.error(`SnapshotStore matching ${snapshot.id} not found.`);
            }
          },
            determinePrefix: function <T extends Data>(
              snapshot: T | null | undefined,
              category: string
            ): string {
              defaultImplementation();
              return "";
            },
          updateSnapshot: function (
            snapshotId: string,
            data: Map<string, BaseData>,
            events: Record<string, CalendarEvent[]>,
            snapshotStore: SnapshotStore<BaseData>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<BaseData>
          ): Promise<{ snapshot: SnapshotStore<BaseData> }> {
            const snapshot = this.snapshots.find(
              (snapshot) => snapshot.id === snapshotId
            );
            if (snapshot) {
              snapshot.data = data;
              snapshot.events = events;
              snapshot.snapshotStore = snapshotStore;
              snapshot.dataItems = dataItems;
              snapshot.newData = newData;
              return Promise.resolve({ snapshot: snapshot });
            } else {
              return Promise.reject(
                new Error(`Snapshot ${snapshotId} not found.`)
              );
            }
          },
          updateSnapshotSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotFailure: function ({error: Payload}) {
            defaultImplementation();
          },
          removeSnapshot: function (
            snapshotToRemove: SnapshotStore<T,K>,
          ) {
            //compare state to find snapshot
           const index = this.delegate.findIndex(
              (snapshotStore) =>
                snapshotStore.id === snapshotToRemove.id &&
                snapshotStore.snapshotCategory === snapshotToRemove.category &&
                snapshotStore.key === snapshotToRemove.key &&
                snapshotStore.topic === snapshotToRemove.topic &&
                snapshotStore.priority === snapshotToRemove.priority &&
                snapshotStore.tags === snapshotToRemove.tags &&
                snapshotStore.metadata === snapshotToRemove.metadata &&
                snapshotStore.status === snapshotToRemove.status &&
                snapshotStore.isCompressed === snapshotToRemove.isCompressed &&
                snapshotStore.expirationDate === snapshotToRemove.expirationDate &&
                snapshotStore.timestamp === snapshotToRemove.timestamp &&
                snapshotStore.data === snapshotToRemove.data &&
                this.compareSnapshotState(
                  snapshotStore.state as Snapshot<BaseData> | null,
                  snapshotToRemove.state
                )
           );
            if (index!== -1) {
              this.delegate.splice(index, 1);
            }
            notify(
              `${snapshotToRemove.id}`,
              `Snapshot ${snapshotToRemove.id} removed successfully.`,
              "Success",
              new Date(),
              NotificationTypeEnum.Success,
              NotificationPosition.TopRight
            );
          },
          clearSnapshots: function () {
            defaultImplementation();
          },
          addSnapshot: async function (
            snapshot: SnapshotStore<any, K>,
            subscribers: Subscriber<BaseData, K>[]
          ) {
            snapshotStore.addSnapshot(snapshot, subscribers)
            return new Promise((resolve, reject) => {
              resolve(snapshotStore.getSnapshot(snapshot.id));
            });

          },
          createInitSnapshot: function (
            id: string,
            snapshotData: SnapshotStoreConfig<any, BaseData>,
            category: string
          ): Snapshot<Data> {
            defaultImplementation();
            return {} as Snapshot<Data>;
          },
          createSnapshotSuccess: function (snapshot: Snapshot<Data>) {
            defaultImplementation();
          },
          createSnapshotFailure: async function (
            snapshotManager: SnapshotManager<T, T>,
            snapshot: Snapshot<BaseData>,
            error: Error): Promise<void> {
            notify(
              "createSnapshotFailure",
              `Error creating snapshot: ${error.message}`,
              "",
              new Date(),
              NotificationTypeEnum.Error,
              NotificationPosition.TopRight
            );

            // Assuming this.delegate[0].createSnapshotFailure expects a snapshot and error
            await this.delegate[0].createSnapshotFailure(snapshotManager, snapshot, error);
          },
          updateSnapshots: function () {
            defaultImplementation();
          },
          updateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          updateSnapshotsFailure: function (error: Payload) {
            defaultImplementation();
          },
          initSnapshot: function (
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            snapshotData: SnapshotStore<T, K>
          ) {
            defaultImplementation();
          },
         
          takeSnapshot: function (
            snapshot: Snapshot<T, BaseData>
          ): Promise<{
            snapshot: Snapshot<BaseData>
          }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          takeSnapshotSuccess: function (
            snapshot: SnapshotStore<BaseData>
          ) {
            defaultImplementation();
          },
          takeSnapshotsSuccess: function (
            snapshots: Snapshot<BaseData>[]
          ) {
            defaultImplementation();
          },
          configureSnapshotStore: function () {
            defaultImplementation();
          },
          getData: function () {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          flatMap: function () {
            defaultImplementation();
          },
          setData: function (data: Data) {
            defaultImplementation();
          },
          getState: function () {
            defaultImplementation();
          },
          setState: function (state: any) {
            defaultImplementation();
          },
          validateSnapshot: function (snapshot: Snapshot<Data>): boolean {
            defaultImplementation();
            return false;
          },
          handleSnapshot: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          handleActions: function () {
            defaultImplementation();
          },
          setSnapshot: function (
            snapshot: SnapshotStore<T, K>
          ) {
            const snapshotStore = snapshot;
           
          },
          setSnapshots: function (
            snapshots: SnapshotStore<T, K>[]
          ) {
            // set snapshots
            const snapshotStore = snapshots;

          },

          clearSnapshot: function ( ) {
            defaultImplementation();
          },
          mergeSnapshots: function (
            snapshots: T[]
          ) {
          
          },
          reduceSnapshots: function () {
            defaultImplementation();
          },
          sortSnapshots: function () {
            defaultImplementation();
          },
          filterSnapshots: function () {
            defaultImplementation();
          },
          mapSnapshots: function () {
            defaultImplementation();
          },
          findSnapshot: function () {
            defaultImplementation();
          },
          getSubscribers(
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T>
          ): Promise<{
            subscribers: Subscriber<T, K>[];
            snapshots: Snapshots<T>
          }> {
            return this.delegate[0].getSubscribers(subscribers, snapshots);
          },
          notify: function () {
            defaultImplementation();
          },
          notifySubscribers(
            subscribers: Subscriber<T, K>[],
            data: Snapshot<BaseData>
          ): Subscriber<T, K>[] {
            // Notify each subscriber with the provided data
            const notifiedSubscribers = subscribers.map(subscriber =>
              subscriber.notify ? subscriber.notify(data) : subscriber
            );
            return notifiedSubscribers as Subscriber<T, K>[];
          },
          subscribe: function () {
            defaultImplementation();
          },
          unsubscribe: function () {
            defaultImplementation();
          },
          fetchSnapshot(
            id: any,
            category: string | CategoryProperties | undefined,
            timestamp: any,
            snapshot: Snapshot<BaseData, BaseData>,
            data: T,
            delegate: SnapshotStoreConfig<BaseData, T>[]
          ): Promise<{
            id: any;
            category: string | CategoryProperties | undefined;
            timestamp: any;
            snapshot:Snapshot<BaseData, BaseData>;
            data: T;
            delegate: SnapshotStoreConfig<BaseData, T>[]
          }> {
            return Promise.resolve({
              id,
              category,
              timestamp,
              snapshot: data as Snapshot<BaseData>,
              data: data,
              delegate: delegate
            });

          },
          fetchSnapshotSuccess: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[],
              snapshot: Snapshots<BaseData>) => void
          ) {
            return snapshotData;
          },
          fetchSnapshotFailure: function () {
            defaultImplementation();
          },
          getSnapshot: function () {
            defaultImplementation();
          },
          getSnapshots: function () {
            defaultImplementation();
          },
          getAllSnapshots: function () {
            defaultImplementation();
          },
          generateId: function () {
            defaultImplementation();
            return "";
          },
          batchFetchSnapshots: function () {
            defaultImplementation();
          },
          batchTakeSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsRequest: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchFetchSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsSuccess: function () {
            defaultImplementation();
          },
          batchUpdateSnapshotsFailure: function () {
            defaultImplementation();
          },
          batchTakeSnapshot: function (
            snapshot: SnapshotStore<T,K>,
            snapshots: Snapshots<T>
          ): Promise<{ snapshots: Snapshots<T> }> {
            defaultImplementation();
            return Promise.reject(new Error("Function not implemented."));
          },
          handleSnapshotSuccess: function (
            snapshot: Snapshot<Data> | null,
            snapshotId: string
          ) {
            defaultImplementation();
          },
          [Symbol.iterator]: function (): IterableIterator<
            Snapshot<T, T>
          > {
             return {} as IterableIterator<Snapshot<T, T>>;
          },
          [Symbol.asyncIterator]: function (): AsyncIterableIterator<
            Snapshot<BaseData>> {
            defaultImplementation();
            return {} as AsyncIterableIterator<Snapshot<BaseData>>;
          },

        },
      ],
    }

    this.snapshots.push(snapshotStoreData);
    this.addSnapshotSuccess(snapshotData, subscribers);
    this.notifySubscribers(snapshotData, subscribers);
    this.delegate[0].addSnapshot(snapshotData, subscribers);
    this.delegate[0].notifySubscribers(snapshotData, subscribers);
  }


  createInitSnapshot(
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string,
  ): Snapshot<Data> {
    if (!snapshotData) {
      throw new Error("snapshotData is null or undefined");
    }

    let data: Data;
    if ("data" in snapshotData && snapshotData.data) {
      data = snapshotData.data;
    } else if (snapshotData.data && "data" in snapshotData.data) {
      data = snapshotData.data.data;
    } else {
      throw new Error("snapshotData does not have a valid 'data' property");
    }

    id =
      typeof data.id === "string"
        ? data.id
        : String(
            UniqueIDGenerator.generateID(
              "SNAP",
              "defaultID",
              NotificationTypeEnum.GeneratedID
            )
          );

    const snapshot: Snapshot<Data, Data> = {
      id,
      data,
      timestamp: snapshotData.timestamp || new Date(),
      category: this.category,
      topic: this.topic,
      unsubscribe: function (callback: Callback<Snapshot<Data, Data>>): void {
        throw new Error("Function not implemented.");
      },
      fetchSnapshot: function (snapshotId: string, callback: (snapshot: Snapshot<Data, Data>) => void): void {
        throw new Error("Function not implemented.");
      },
      handleSnapshot: function (snapshotId: string, snapshot: Snapshot<Data, Data> | null, type: string, event: Event): void {
        throw new Error("Function not implemented.");
      },
      events: undefined,
      meta: undefined
    };

    this.snapshots.push(snapshot);
    this.delegate[0].createSnapshotSuccess(snapshot);

    return snapshot;
  }

  createSnapshotSuccess(snapshot: Snapshot<Data>): void {
    if (snapshot.id !== undefined) {
      notify(
        String(snapshot.id), // Ensure snapshot.id is treated as a string
        `Snapshot ${snapshot.id} created successfully.`,
        "",
        new Date(),
        NotificationTypeEnum.Success,
        NotificationPosition.TopRight
      );
    } else {
      console.error("Snapshot id is undefined.");
      // Optionally handle the case where snapshot.id is undefined
    }
  }

  setSnapshotSuccess(
    snapshotData: SnapshotStore<T, K>,
    subscribers: ((data: Subscriber<T, T>) => void)[]
  ): void { 
    this.delegate[0].setSnapshotSuccess(snapshotData, subscribers);
  }

  setSnapshotFailure(error: Error): void {
    this.delegate[0].setSnapshotFailure(error);
  }

  createSnapshotFailure(
    snapshotId: string, 
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
    ): Promise<void> {
    notify(
      "createSnapshotFailure",
      `Error creating snapshot: ${payload.error.message}`,
      "",
      new Date(),
      NotificationTypeEnum.Error,
      NotificationPosition.TopRight
    );
    this.delegate[0].createSnapshotFailure(snapshotId, snapshotManager, snapshot, payload);
    return Promise.reject(payload.error);
  }

   // Example method similar to updateSnapshots
  updateSnapshots(): void {
    this.delegate[0].updateSnapshots();
  }

  // Example method similar to updateSnapshotsSuccess
  updateSnapshotsSuccess(
    snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T>)=>void ): void {
    if (this.delegate.length > 0 && typeof this.delegate[0].updateSnapshotsSuccess === 'function') {
      this.delegate[0].updateSnapshotsSuccess(snapshotData);
    }
  }

  updateSnapshotsFailure(error: Payload): void {
    this.delegate[0].updateSnapshotsFailure(error);
  }

  initSnapshot(snapshotConfig: SnapshotStoreConfig<T, K>, snapshotData: SnapshotStore<T, K>): void {
    return this.delegate[0].initSnapshot(snapshotConfig, snapshotData);
  }

  

  async takeSnapshot(
    snapshot: Snapshot<T, K>,
    subscribers: Subscriber<T,K>[]
  ): Promise<{ snapshot: Snapshot<T, K> }> {
    try {
      // Perform snapshot logic here
      const result = await this.delegate[0].takeSnapshot(snapshot); // Assuming this.delegate[0] handles the snapshot logic
  
      // Assuming result is an array and you want the first element
      if (result !== null && Array.isArray(result)) {
        const snapshotWrapper: Snapshot<T, K> = {
          ...result[0],
          data: result[0].data as BaseData,
          timestamp: result[0].timestamp,
          type: result[0].type,
          id: result[0].id,
          key: result[0].key,
        };
  
        return {
          snapshot: snapshotWrapper,
        };
      }
  
      throw new Error("Failed to take snapshot");
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
      throw error;
    }
  }
  

  takeSnapshotSuccess(snapshot: Snapshot<T, K>): void {
    this.delegate[0].takeSnapshotSuccess(snapshot);
  }

  takeSnapshotsSuccess(snapshots: T[]): void {
    this.delegate[0].takeSnapshotsSuccess(snapshots);
  }

  configureSnapshotStore(
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarEvent[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: ConfigureSnapshotStorePayload<T>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ): void {
    this.delegate[0].configureSnapshotStore(
      snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback
    );
  }

  // New flatMap method
public flatMap<U extends Iterable<any>>(
  callback: (
    value: SnapshotStoreConfig<T, K>,
    index: number,
    array: SnapshotStoreConfig<T, K>[]) => U
): U extends (infer I)[] ? I[] : U[] {
  // Explicitly cast the empty array to the appropriate type
  const result = [] as unknown as U extends (infer I)[] ? I[] : U[];
  this.snapshotStoreConfig?.forEach((delegateItem, i, arr) => {
    const mappedValues = callback(delegateItem, i, arr);
    result.push(...(mappedValues as unknown as (U extends (infer I)[] ? I : U)[]));
  });
  return result;
}

  setData(data: K): void {
    this.delegate[0].setData(data);
  }

  getState(): any {
    return this.delegate[0].getState();
  }

  setState(state: any): void {
    this.delegate[0].setState(state);
  }

  validateSnapshot(snapshot: Snapshot<T, K>): boolean {
    return this.delegate[0].validateSnapshot(snapshot);
  }

  handleSnapshot(
    snapshotId: string,
    snapshot: Snapshot<T, K> | null,
    snapshots: Snapshots<T>,
    type: string,
    event: Event
  ): void {
    this.delegate[0].handleSnapshot(snapshotId, snapshot, snapshots, type, event);
  }

  handleActions(action:  (selectedText: string) => void): void {
    this.delegate[0].handleActions(action);
  }

  setSnapshot(snapshot: Snapshot<T, K>): void {
    if (this.delegate[0]) {
      this.delegate[0].setSnapshot?(snapshot) : null;
    }
  }
  
  
  transformSnapshotConfig<T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
    const { initialState, configOption, ...rest } = config;
  
    const transformedConfigOption = configOption
      ? {
          ...configOption,
          initialState: configOption.initialState ? new Map([...configOption.initialState.entries()]) as Map<string, Snapshot<T, any>> : null,
        }
      : undefined;
  
    // Handle initialState based on its type
    let transformedInitialState: SnapshotStore<BaseData, T> | Snapshot<BaseData, T> | Map<string, Snapshot<BaseData, T>> | null;
    if (isSnapshotStore(initialState) || isSnapshot(initialState) || initialState === null) {
      transformedInitialState = initialState;
    } else {
      transformedInitialState = null; // or handle default case as necessary
    }
  
    return {
      ...rest,
      initialState: transformedInitialState,
      configOption: transformedConfigOption ? transformedConfigOption : undefined,
    };
  }
  

    // Combined method
  setSnapshotData(
      data: Map<string, Snapshot<T, K>>,
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<T, K>>
    ): void {
      // Handle updating the config
      if (this.config) {
        this.config = this.config.map(configItem => ({
          ...configItem,
          ...snapshotData,
        }));
      } else {
        this.config = [{ ...snapshotData }];
      }
  
      // Handle updating the delegate
      if (this.delegate.length > 0) {
        const currentSnapshot = this.delegate[0];
        const updatedSnapshot: SnapshotStoreConfig<BaseData, K> = {
          ...currentSnapshot,
          ...snapshotData,
          state: currentSnapshot.state
            ? currentSnapshot.state.filter((snapshot: Snapshot<T, K>) => (
              !this.validateSnapshot(snapshot)
            )) as Map<string, Snapshot<T, K>> : null,
            
        };
  
        // Transform the updated snapshot to ensure type compatibility
        const transformedSnapshot = this.transformSnapshotConfig(updatedSnapshot);
  
        this.delegate[0] = transformedSnapshot;
  
        // Notify subscribers or trigger updates if necessary
        this.notifySubscribers(subscribers, snapshotData);
      }
    }
  
  
  setSnapshots(snapshots: Snapshots<T>): void {
    this.delegate[0].setSnapshots(snapshots);
  }

  clearSnapshot(): void {
    this.delegate[0].clearSnapshot();
  }

  mergeSnapshots(snapshots: Snapshots<T>, category: string): void {
    this.delegate[0].mergeSnapshots(snapshots, category);
  }

  reduceSnapshots(): void {
    this.delegate[0].reduceSnapshots();
  }

  sortSnapshots(): void {
    this.delegate[0].sortSnapshots();
  }

  filterSnapshots(): void {
    this.delegate[0].filterSnapshots();
  }

  mapSnapshots(): void {
    this.delegate[0].mapSnapshots();
  }

  findSnapshot(): void {
    this.delegate[0].findSnapshot();
  }

  getSubscribers(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): Promise<{
    subscribers: Subscriber<T, K>[];
    snapshots: Snapshots<T>
  }> {
   return this.delegate[0].getSubscribers(subscribers, snapshots);
  }

  notify(
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition | undefined
  ):
  void {
    this.delegate[0].notify(
      id,
      message,
      content,
      new Date(),
      type
    );
  }

  notifySubscribers(
    subscribers: Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<BaseData, any>>
  ): Subscriber<BaseData, K>[] {
    // Example implementation
    return this.delegate[0].notifySubscribers(subscribers, data);
  }

  subscribe(): void {
    this.delegate[0].subscribe();
  }

  unsubscribe(): void {
    this.delegate[0].unsubscribe();
  }

 
  async fetchSnapshot(
    snapshotId: string,
    category: string | CategoryProperties | undefined,
    timestamp: Date,
    snapshot: Snapshot<BaseData, K>,
    data: T,
    delegate: SnapshotStoreConfig<BaseData, K>[]
  ): Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any;
    snapshot: Snapshot<BaseData, K>;
    data: T;
    getItem?: (snapshot: Snapshot<T, K>) => Snapshot<T, K> | undefined;
  }> {
    const fetchedSnapshot = await delegate[0].fetchSnapshot(
      snapshotId,
      category,
      timestamp,
      snapshot,
      data,
      delegate
    );

    return {
      id: fetchedSnapshot.id,
      category: fetchedSnapshot.category,
      timestamp: fetchedSnapshot.timestamp,
      snapshot: fetchedSnapshot.snapshot,
      data: fetchedSnapshot.data as T,
    };
  }
  
  fetchSnapshotSuccess(
    snapshotData: (
      snapshotManager: SnapshotManager<T, K>, 
      subscribers: Subscriber<T, K>[],
      snapshot: Snapshot<T, K>) => void
  ): void {
    this.delegate[0].fetchSnapshotSuccess(snapshotData);
  }

  fetchSnapshotFailure(payload: { error: Error }): void {
    this.delegate[0].fetchSnapshotFailure(payload);
  }

  getSnapshots(
    category: string,
    data: Snapshots<T>
  ): void {
    this.delegate[0].getSnapshots(category, data);
  }

  getAllSnapshots(
    data: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ): void {
    this.delegate[0].getAllSnapshots(data);
  }
  generateId(): string {
    const delegateWithGenerateId = this.delegate.find((d) => d.generateId);
    const generatedId = delegateWithGenerateId?.generateId();
    return typeof generatedId === "string" ? generatedId : "";
  }

  batchFetchSnapshots(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshots(subscribers, snapshots);
  }

  batchTakeSnapshotsRequest(
    snapshotData: SnapshotData
  ): void {
    this.delegate[0].batchTakeSnapshotsRequest(snapshotData);
  }
  
  batchUpdateSnapshotsRequest(
    snapshotData: (
      subscribers: Subscriber<T, K>[]
    ) => Promise<{
      subscribers: Subscriber<T, K>[];
      snapshots: Snapshots<T>;
    }>
  ): void {
  snapshotData(this.subscribers).then(({ snapshots }) => {
      this.delegate[0].batchUpdateSnapshotsRequest(async (subscribers) => {
  const { snapshots } = await snapshotData(subscribers);
  return { subscribers, snapshots };
      });
    });
  }

  batchFetchSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    this.delegate[0].batchFetchSnapshotsSuccess(subscribers, snapshots);
  }

  batchFetchSnapshotsFailure(payload: { error: Error }): void {
    this.delegate[0].batchFetchSnapshotsFailure(payload);
  }

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ): void {
    const delegate = this.delegate[0];
    if (delegate && delegate.batchUpdateSnapshotsSuccess) {
      delegate.batchUpdateSnapshotsSuccess(subscribers, snapshots);
    } else {
      // Handle the case where delegate or batchUpdateSnapshotsSuccess is undefined, if needed
      console.error('Delegate or batchUpdateSnapshotsSuccess is undefined. Cannot perform batch update.');
      // Or handle the error in a way that fits your application's error handling strategy
    }
  }
  

  batchUpdateSnapshotsFailure(
   payload: { error: Error }
  ): void {
    this.delegate[0].batchUpdateSnapshotsFailure(payload);
  }

  batchTakeSnapshot(
    snapshotStore: SnapshotStore<T,K>,
    snapshots: Snapshots<T>
  ): Promise<{ snapshots: Snapshots<T> }> {
    return new Promise((resolve) => {
      const result = this.delegate[0].batchTakeSnapshot(snapshotStore, snapshots);
      resolve(result);
    });
  }

  handleSnapshotSuccess(
    snapshot: Snapshot<Data, Data> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
     SnapshotActions.handleTaskSnapshotSuccess({ snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  }

   // Implementing [Symbol.iterator] method
   [Symbol.iterator](): IterableIterator<Snapshot<T, K>> {
    const snapshotIterator = this.snapshots.values();

    // Create a custom iterator that maps each item to Snapshot<T, K>
    const iterator: IterableIterator<Snapshot<T, K>> = {
      [Symbol.iterator]: function() { return this; },
      next: function() {
        const next = snapshotIterator.next();
        if (next.done) {
          return { done: true, value: undefined as any };
        }

        // Handle the conversion to Snapshot<BaseData, BaseData> if necessary
        let snapshot: Snapshot<T, K>;
        if (next.value instanceof SnapshotStore) {
          snapshot = convertSnapshotStoreToSnapshot(next.value);
        } else {
          snapshot = next.value
        }

        // Convert Snapshot<BaseData> to Snapshot<T, K> using snapshotType function
        const value: Snapshot<T, K> = snapshotType(snapshot);
        return { done: false, value };
      }
    };

    return iterator;
  }


  isExpired?(): boolean {
    return !!this.expirationDate && new Date() > this.expirationDate;
  }

  compress?(): void {
    // Implementation here
  }
  isEncrypted?: boolean;
  encrypt?(): void {
    // Implementation here
  }
  decrypt?(): void {
    // Implementation here
  }
  ownerId?: string;
  getOwner?(): string {
    return this.ownerId || "";
  }
  version?: string;
  previousVersionId?: string;
  nextVersionId?: string;
  auditTrail?: AuditRecord[];
  addAuditRecord?(record: AuditRecord): void {
    // Implementation here
  }
  retentionPolicy?: RetentionPolicy;
  dependencies?: string[];
}

// Example usage of the Snapshot interface
const takeSnapshot = async () => {
  const snapshotData = await fetchInitialSnapshotData();
  const { takeSnapshot } = useSnapshotStore(addToSnapshotList);
  const snapshot = await takeSnapshot(snapshotData);
  console.log(snapshot);
};

// Example functions for adding snapshots to the UI and displaying toast messages
// Function to add snapshot to the list
// Function to add snapshot to the list
const addToSnapshotList = async <T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>,
  subscribers: Subscriber<T, K>[]
) => {
  // Logic to handle adding snapshot to the list in your UI
  console.log("SnapshotStore:", snapshotStore);
  console.log("Subscribers:", subscribers);

  // Assuming snapshotStore contains the snapshot data you need
  try {
    const snapshotResult = await snapshotStore.snapshot(
      "some-id", // Provide actual id
      [], // Provide actual SnapshotStoreConfig array
      "some-category", // Provide actual category
      {} // Provide actual DataStoreMethods
    );

    const snapshot = snapshotResult.snapshot as Snapshot<T, K>; // Type assertion

    console.log("Snapshot added to list:", snapshot);

    // Add the snapshot to the list in your UI
    // You can use a state management library like React Context or Redux to manage the list
    // For example, using React Context:
    const [snapshotList, setSnapshotList] = useState<Snapshot<T, K>[]>([]);

    setSnapshotList((prevList) => [...prevList, snapshot]);
    console.log("Snapshot added to list:", snapshotList);

    // Display a toast message
    displayToast("Snapshot added successfully!");
    console.log("Toast message:", "Snapshot added successfully!");

    // Implement additional logic here based on your application's needs
    // For example, updating internal state, notifying subscribers, etc.

    SnapshotActions.handleTaskSnapshotSuccess({ snapshot, snapshotId: snapshot.id });
    console.log(`Handling success for snapshot ID: ${snapshot.id}`);
    
    // Implement additional logic here based on your application's needs
  } catch (error) {
    console.error("Error adding snapshot to list:", error);
    // Handle the error appropriately
  }
};


const displayToast = (message: string) => {
  // Assuming you have a function to display toast messages in your UI
  console.log("Toast message:", message);
};

const handleSnapshotOperation = async (
  
  snapshot: Snapshot<any, any>,
  data: SnapshotStoreConfig<any, any>
  
  // snapshot: Snapshot<Data> | null,
  // snapshotId: string
) => {
  // Assuming you have a function to handle the snapshot operation in your UI
  console.log("Snapshot operation handled:", snapshot, snapshotId);
  // Implement additional logic here based on your application's needs
  // For example, updating internal state, notifying subscribers, etc.
  SnapshotActions.handleTaskSnapshotSuccess({ snapshot, snapshotId });
  // No return statement needed since the method should return void
};

const handleSnapshotStoreOperation = async (
  snapshotStore: SnapshotStore<any, any>,
  snapshot: Snapshot<any, any>,
  snapshotId: string
) => {
  // Assuming you have a function to handle the snapshot operation in your UI
  console.log("SnapshotStore operation handled:", snapshotStore, snapshot, snapshotId);
  // Implement additional logic here based on your application's needs
  // For example, updating internal state, notifying subscribers, etc.
  SnapshotActions.handleSnapshotStoreSuccess({ snapshotStore, snapshot, snapshotId });
  // No return statement needed since the method should return void
}

// Example functions for fetching initial snapshot data and current data
const fetchInitialSnapshotData = async (): Promise<Snapshot<Data>[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

  // Return initial snapshot data as an array of Snapshot<Data> objects
  return [
    {
      id: "1",
      data: new Map([
        ["exampleData", {
          // Include properties of Data type here
          /* exampleData properties */
        }]
      ]),
      timestamp: new Date(),
      category: "Initial Category 1",
      type: "",
      store: {} as SnapshotStore<BaseData>,
      initialState: null,
      snapshotItems: [],
      meta: {} as Data,
      events: {
        "1": {
          id: "1",
          data: new Map([
            ["exampleData", {
              // Include properties of Data type here
              /* exampleData properties */
            }]
          ]),
          timestamp: new Date(),
          category: "Initial Category 1",
          type: "",
        }
      },
    },
    {
      id: "2",
      data: new Map([
        ["exampleData", {
          // Include properties of Data type here
          /* exampleData properties */
        }]
      ]),
      timestamp: new Date(),
      category: "Initial Category 2",
      type: "",
      store: {} as SnapshotStore<BaseData>,
      initialState: null,
      snapshotItems: [],
      meta: {} as Data,
      events: {
      "1": {
          id: "1",
          data: new Map([
            ["exampleData", {
              // Include properties of Data type here
              /* exampleData properties */
            }]
          ]),
          timestamp: new Date(),
          category: "Initial Category 1",
          type: "",
          store: {} as SnapshotStore<BaseData>,
          initialState: null,
          snapshotItems: [],
          meta: {} as Data
        },
        "2": {
          id: "2",
          data: new Map([
            ["exampleData", {
              // Include properties of Data type here
              /* exampleData properties */
            }]
          ]),
          timestamp: new Date(),
          category: "Initial Category 2",
          type: "",
          store: {} as SnapshotStore<BaseData>,
          initialState: null,
          snapshotItems: [],
          meta: {} as Data
        }
      }
    },
  ];
}


const category = process.argv[3] as keyof CategoryProperties ?? "isHiddenInList"
const dataStoreMethods = {}


const snapshotStoreOptions: SnapshotStoreOptions<BaseData, K> = {
  initialState: this.initialState ?? {},
  snapshot,
  category,
  date: new Date(),
  type: snapshotType ?? 'defaultType',
  handleSnapshotOperation,
  displayToast,
  addToSnapshotList,
  dataStoreMethods: {} as DataStoreWithSnapshotMethods<BaseData, any>,
  delegate, // Uncomment and provide if needed
  fetchInitialSnapshotData, // Uncomment and provide if needed
  fetch, // Uncomment and provide if needed
};

const data = new SnapshotStore<T, K>(snapshotStoreOptions);






const events: Record<string, CalendarEvent[]> = {};
const snapshotStore = new SnapshotStore<BaseData, K>(snapshotStoreOptions);
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  timestamp: undefined
};


const snapshotId = (await getSnapshotId(snapshot)).toString();
const baseURL = "https://example.com";
const enabled = true;
const maxRetries = 3;
const retryDelay = 1000;
const maxAge = 1000;
const staleWhileRevalidate = 1000;
const cacheKey = await appTreeApiService.cacheKey
const payload: UpdateSnapshotPayload<Data> = {
  snapshotId: snapshotId, // Assign snapshotId here
  newData: newData,
  title: "",
  description: "",
  createdAt: undefined,
  updatedAt: undefined,
  status: "active",
  category: ""
};

// Example component update call
const component = <YourComponent
  apiConfig={{
    name: "exampleName",
    baseURL: baseURL,
    timeout: 1000,
    headers: headersConfig,
    retry: {
      enabled: enabled,
      maxRetries: maxRetries,
      retryDelay: retryDelay
    },
    cache: {
      enabled: enabled,
      maxAge: maxAge,
      staleWhileRevalidate: staleWhileRevalidate,
      cacheKey: cacheKey
    },
    responseType: "json",
    withCredentials: false
  }}
  children={[]}
/>;

component
  .updateSnapshot(
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload
  )
  .then(() => {
    console.log("Snapshot update completed.");
  })
  .catch((error: any) => {
    console.error("Error during snapshot update:", error);
  });

const snapshotStoreConfig: SnapshotStoreConfig<any, any> = {
  snapshotId: "exampleSnapshotId",
  category: "exampleCategory",
  initialState: {} as Map<string, any>,
  handleSnapshotOperation: handleSnapshotOperation,
  displayToast: displayToast,
  handleSnapshot: handleSnapshot,
  addToSnapshotList: addToSnapshotList,
  fetchInitialSnapshotData: fetchInitialSnapshotData,
  timestamp: undefined,
  state: null,
  snapshots: [],
  subscribers: [],
  getSnapshotId: getSnapshotId,
  snapshot: snapshot,
  createInitSnapshot: createInitSnapshot,
  configureSnapshotStore: configureSnapshotStore,
  createSnapshotSuccess: createSnapshotSuccess,
  createSnapshotFailure: createSnapshotFailure,
  batchTakeSnapshot: batchTakeSnapshot,
  onSnapshot: onSnapshot,
  onSnapshots: null,
  snapshotData: snapshotData,
  initSnapshot: initSnapshot,
  clearSnapshot: clearSnapshot,
  updateSnapshot: updateSnapshot,
  getSnapshots: getSnapshots,
  takeSnapshot: takeSnapshot,

  addSnapshotSuccess: addSnapshotSuccess,
  removeSnapshot: removeSnapshot,
  getSubscribers: getSubscribers,
  addSubscriber: addSubscriber,
  validateSnapshot: validateSnapshot,
  getSnapshot: getSnapshot,
  getAllSnapshots: getAllSnapshots,
  takeSnapshotSuccess: takeSnapshotSuccess,
  updateSnapshotFailure: updateSnapshotFailure,
  takeSnapshotsSuccess: takeSnapshotsSuccess,
  fetchSnapshot: fetchSnapshot,
  setSnapshotSuccess: setSnapshotSuccess,
  setSnapshotFailure: setSnapshotFailure,
  updateSnapshotSuccess: updateSnapshotSuccess,
  updateSnapshotsSuccess: updateSnapshotsSuccess,
  fetchSnapshotSuccess: fetchSnapshotSuccess,
  updateSnapshotForSubscriber: updateSnapshotForSubscriber,
  updateMainSnapshots: updateMainSnapshots,
  batchUpdateSnapshots: batchUpdateSnapshots,
  batchFetchSnapshotsRequest: batchFetchSnapshotsRequest,
  batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
  batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
  batchFetchSnapshots: batchFetchSnapshots,
  getData: getData,
  batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
  batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
  notifySubscribers: notifySubscribers,
  notify: notify,
  updateSnapshots: updateSnapshots,
  updateSnapshotsFailure: updateSnapshotsFailure,
  flatMap: flatMap,
  setData: setData,
  getState: getState,
  setState: setState,
  handleActions: handleActions,
  setSnapshots: setSnapshots,
  mergeSnapshots: mergeSnapshots,
  reduceSnapshots: reduceSnapshots,
  sortSnapshots: sortSnapshots,
  filterSnapshots: filterSnapshots,
  mapSnapshots: mapSnapshots,
  findSnapshot: findSnapshot,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  fetchSnapshotFailure: fetchSnapshotFailure,
  generateId: generateId,
  [Symbol.iterator]: function (): IterableIterator<any> {
    const snapshotStore = this;
    return snapshotStore[Symbol.iterator]();
  },
  [Symbol.asyncIterator]: function (): AsyncIterableIterator<any> {
    const snapshotStore = this;
    return snapshotStore[Symbol.asyncIterator]();
  }
};
export default SnapshotStore
export { handleSnapshotOperation, handleSnapshotStoreOperation, initialState, initializeData, snapshotStoreConfig };
export type { SnapshotData, SnapshotStoreSubset };

