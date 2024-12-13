// defaultSubscribeToSnapshots.ts
import { SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { CoreSnapshot } from "@/app/components/snapshots/CoreSnapshot";
import { version } from '@/app/components/versions/Version';
import { CreateSnapshotsPayload } from '@/app/components/database/Payload';
import CalendarManagerStoreClass from '@/app/components/state/stores/CalendarManagerStore';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotConfig, SnapshotContainer } from '@/app/components/snapshots';
import { FetchSnapshotPayload } from '@/app/components/snapshots/FetchSnapshotPayload';
import { StatusType } from '@/app/components/models/data/StatusType';
import { Payload, UpdateSnapshotPayload } from "@/app/components/database/Payload";
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { IHydrateResult } from "mobx-persist";
import { Data } from "ws";
import * as snapshotApi from '../../api/SnapshotApi';
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { BaseData } from "../models/data/Data";
import { NotificationPosition } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Snapshot, Snapshots } from "./LocalStorageSnapshotStore";
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";
import { SnapshotData } from "./SnapshotData";
import { SnapshotItem } from "./SnapshotList";
import { getSnapshotDifference } from './getSnapshotDifference'
import SnapshotStore, { SnapshotStoreReference } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

export const defaultSubscribeToSnapshots =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    snapshotId: string,
    callback: (snapshots: Snapshot<T, K>[]) => Subscriber<BaseData, T> | null,
    snapshot: Snapshot<T, K> | null = null
) => {
    return new Promise(async (resolve, reject) => { 

    console.warn('Default subscription to snapshots is being used.');
  
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  
    const snapshotStoreData= await snapshotApi.fetchSnapshotStoreData(snapshotId)
    // Simulate receiving a snapshot update
    setTimeout(() => {
      const snapshot: Snapshot<T, K> = {
        data: new Map<string, Snapshot<T, K, StructuredMetadata<T, K>, never>>().set("data1", {
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
                content: "Event 1 content",
                topics: ["topic1"],
                highlights: ["highlight1"],
                date: new Date(),
                files: [],
                rsvpStatus: "yes",
                participants: [],
                teamMemberId: "team1",
                getSnapshotStoreData: (): Promise<SnapshotStore<
                  SnapshotWithCriteria<BaseData, BaseData>,
                  SnapshotWithCriteria<BaseData, BaseData>>[]> => {
                  throw new Error("Function not implemented.");
                },
                getData: (): Promise<Snapshot<T, K>> => {
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
                content: "Event 2 content",
                topics: ["topic2"],
                highlights: ["highlight2"],
                date: new Date(),
                files: [],
                rsvpStatus: "no",
                participants: [],
                teamMemberId: "team2",
                meta: undefined,
                getSnapshotStoreData: (): Promise<SnapshotStore<
                  SnapshotWithCriteria <T, K>,
                  SnapshotWithCriteria<BaseData, K>>[]> => {
                  throw new Error("Function not implemented.");
                },
                getData: (): Promise<Snapshot<T,
                  SnapshotWithCriteria<T, K>>> => {
                  throw new Error("Function not implemented.");
                },
                timestamp: undefined
              }]
            },
            callbacks: {} as Record<string, ((snapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>) => void)[]>
          },
          meta: {
            id: "data1",
            title: "Sample Data",
            description: "Sample description",
            timestamp: new Date(),
            category: "Sample category",
            metadataEntries, keywords, version, config,

          } as K,
          store: null,
          configOption: null
        }
        ),
         
        meta: new Map<string, Snapshot<T, K>>().set("meta1", {

          metadataEntries: [],
          keywords: [],
          version: version,
          isActive: true,
          

          id: snapshotId,
          title: `Snapshot ${snapshotId}`,
          description: "Snapshot description",
          timestamp: new Date(),
          category: "Snapshot category",
          snapshotStoreConfig: null,
          getSnapshotItems: function (): (SnapshotStoreConfig<T, K> | SnapshotItem<T, K>)[] {
            throw new Error("Function not implemented.");
          },
          defaultSubscribeToSnapshots: function (
            snapshotId: string, 
            callback: (snapshots: Snapshots<T, K>
            ) => Subscriber<T, K> | null,
            snapshot: Snapshot<T, K> | null = null
          ): void {
            throw new Error("Function not implemented.");
          },
          versionInfo: null,
          transformSubscriber: function (subscriberId: string, sub: Subscriber<T, K>): Subscriber<T, K> {
            throw new Error("Function not implemented.");
          },
          transformDelegate: function (): Promise<SnapshotStoreConfig<T, K>[]> {
            throw new Error("Function not implemented.");
          },
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> | undefined {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<Snapshot<T, K>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          updateDataTitle: function (id: number, title: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataDescription: function (id: number, description: string): void {
            throw new Error("Function not implemented.");
          },
          updateDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          addDataSuccess: function (payload: { data: Snapshot<T, K>[]; }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (id: number): Promise<Snapshot<T, K>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (id: number, versions: Snapshot<T, K>[]): void {
            throw new Error("Function not implemented.");
          },
          getBackendVersion: function (): Promise<string | number | undefined> {
            throw new Error("Function not implemented.");
          },
          getFrontendVersion: function (): Promise<string | number | undefined> {
            throw new Error("Function not implemented.");
          },
          fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<T, K>> {
            throw new Error("Function not implemented.");
          },
          defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): string {
            throw new Error("Function not implemented.");
          },
          handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          removeItem: function (key: string | number): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K>; snapshotStore: SnapshotStore<T, K>; data: T; }> | undefined): Promise<Snapshot<T, K>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: function (snapshot: Snapshot<T, K>): Promise<SnapshotStore<T, K>> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: T, value: T): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getDataStore: (): Promise<InitializedDataStore> => {},
          addSnapshotSuccess: function (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]): void {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function (): DataStoreMethods<T, K> {
            throw new Error("Function not implemented.");
          },
          getDelegate: function (context: {
            useSimulatedDataSource: boolean; 
            simulatedDataSource: SnapshotStoreConfig<T, K>[]; 
          }): Promise<DataStore<T, K>[]> {
            throw new Error("Function not implemented.");
          },
          determineCategory: function (snapshot: Snapshot<T, K> | null | undefined): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K>): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotItem: function (item: SnapshotStoreConfig<T, K> | Snapshot<any, any>): void {
            throw new Error("Function not implemented.");
          },
          addNestedStore: function (store: SnapshotStore<T, K>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          addSnapshot: function (snapshot: Snapshot<T, K>, snapshotId: string, subscribers: SubscriberCollection<T, K>): Promise<Snapshot<T, K> | undefined> {
            throw new Error("Function not implemented.");
          },
          createSnapshot: null,
          createInitSnapshot: function (
            id: string, 
            initialData: T, 
            snapshotData: SnapshotData<any, K, never>, 
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            category: string): Snapshot<T, K> {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (snapshotData: SnapshotData<T, K>, subscribers: ((data: Subscriber<T, K>) => void)[]): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T, K>) => void): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
            snapshotId: string | number | null,
            snapshotData: SnapshotData<T, K>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            snapshotConfig: SnapshotStoreConfig<T, K>,
            callback: (snapshotStore: SnapshotStore<any, any>) => void,
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            snapshotStoreConfigSearch: SnapshotStoreConfig<
            SnapshotWithCriteria<any, K>,
            SnapshotWithCriteria<any, K>>): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]): Promise<{ snapshot: Snapshot<T, K>; }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: T[]): void {
            throw new Error("Function not implemented.");
          },
          flatMap: function <R extends Iterable<any>>(callback: (value: SnapshotStoreConfig<R, any>, index: number, array: SnapshotStoreConfig<R, any>[]) => U): U extends (infer I)[] ? I[] : U[] {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K>): boolean {
            throw new Error("Function not implemented.");
          },
          handleActions: function (action: (selectedText: string) => void): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          transformSnapshotConfig: function <U extends BaseData>(config: SnapshotStoreConfig<U, K>): SnapshotStoreConfig<U, K> {
            throw new Error("Function not implemented.");
          },
          setSnapshots: function (snapshots: Snapshots<T, K>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshot: function (): void {
            throw new Error("Function not implemented.");
          },
          mergeSnapshots: function (snapshots: Snapshots<T, K>, category: string): void {
            throw new Error("Function not implemented.");
          },
          reduceSnapshots: function <U extends BaseData>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U): U | undefined {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (
            predicate: (snapshot: Snapshot<T, K>) => boolean
          ): Snapshot<T, K> | undefined {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T, K>; }> {
            throw new Error("Function not implemented.");
          },
          notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
            throw new Error("Function not implemented.");
          },
          notifySubscribers: function (
            message: string,
            subscribers: Subscriber<T, K>[],
            callback: (data: Snapshot<T, K>) => Subscriber<T, K>[],
            data: Partial<SnapshotStoreConfig<T, K>>
          ): Subscriber<BaseData, K>[] {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (category: string, data: Snapshots<T, K>): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (
            storeId: number,
            snapshotId: string,
            snapshotData: T,
            timestamp: string,
            type: string,
            event: Event,
            id: number,
            snapshotStore: SnapshotStore<T, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            dataStoreMethods: DataStore<T, K>,
            data: T,
            filter?: (snapshot: Snapshot<T, K>) => boolean,
            dataCallback?: (
                subscribers: Subscriber<T, K>[],
                snapshots: Snapshots<T, K>
            ) => Promise<SnapshotUnion<T, K>[]>
          ): Promise<Snapshot<T, K>[]> {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              subscribers: SubscriberCollection<T, K>,
              snapshots: Snapshots<T, K>
            ) => Promise<{
              subscribers: SubscriberCollection<T, K>;
              snapshots: Snapshots<T, K>; // Include snapshots here for consistency
            }>
          ): Promise<Snapshots<T, K>> {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              snapshots: Snapshots<T, K>,
              subscribers: Subscriber<T, K>[]
            ) => Promise<{
              subscribers: Subscriber<T, K>[]
            }>
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsRequest: function (
            snapshotData: (
              subscribers: Subscriber<T, K>[]) => Promise<{ 
              subscribers: Subscriber<T, K>[]; 
              snapshots: Snapshots<T, K>; 
              }>,
              snapshotManager: SnapshotManager<T, K>

              ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K> {},
          filterSnapshotsByCategory: (category: Category): Snapshots<T, K> => {},
          filterSnapshotsByTag: (tag: Tag<T, K>): Snapshots<T, K> => {},
          batchFetchSnapshotsSuccess: function (
            subscribers: SubscriberCollection<T, K>[],
            snapshots: Snapshots<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsFailure: function (
            date: Date,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsSuccess: function (
            subscribers: SubscriberCollection<T, K>,
            snapshots: Snapshots<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsFailure: function (
            date: Date,
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshot: function (
            id: number, 
            snapshotId: string, snapshot: Snapshot<T, K>, 
            snapshotStore: SnapshotStore<T, K>, 
            snapshots: Snapshots<T, K>
          ): Promise<{ snapshots: Snapshots<T, K>; }> {
            throw new Error("Function not implemented.");
          },
          handleSnapshotSuccess: function (
            message: string,
            snapshot: Snapshot<T, K> | null,
            snapshotId: string
          ): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotId: function (
            key: string | T, 
            snapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>
          ): string {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (snapshot1: Snapshot<T, K> | null, snapshot2: Snapshot<T, K>): boolean {
            // Basic boolean check: return true if snapshots are both not null and have identical states
            const areStatesEqual = snapshot1 && snapshot2 && snapshot1.state === snapshot2.state;
          
            if (areStatesEqual) {
              // Additional check with the utility function
              const difference = getSnapshotDifference(snapshot1, snapshot2);
              console.log(`Snapshot difference: ${difference}`);
            }
          
            return !!areStatesEqual;  // Return the boolean result for state equality
          },
          eventRecords: null,
          snapshotStore: null,
          getParentId: function (id: string,snapshot: Snapshot<T, K>): string | null {
            throw new Error("Function not implemented.");
          },
          getChildIds: function (id: string, childSnapshot: CoreSnapshot<T, K>): (string | number | undefined)[] {
            throw new Error("Function not implemented.");
          },
          addChild: function (parentId: string, childId: string, childSnapshot: CoreSnapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          removeChild: function (
            childId: string,
            parentId: string,
            parentSnapshot: Snapshot<T, K>,
            childSnapshot: CoreSnapshot<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          getChildren: function (id: string, childSnapshot: Snapshot<T, K>): CoreSnapshot<T, K>[] {
            throw new Error("Function not implemented.");
          },
          hasChildren: function (id: string): boolean {
            throw new Error("Function not implemented.");
          },
          isDescendantOf: function (
            childId: string, 
            parentId: string, 
            parentSnapshot: Snapshot<T, K>, 
            snapshot: Snapshot<T, K>, 
            childSnapshot: Snapshot<T, K>
          ): boolean {
            throw new Error("Function not implemented.");
          },
          dataItems: (): RealtimeDataItem[] | null =>   {},
          newData: null,
          data: undefined,
          getInitialState: function (): Snapshot<T, K> | null {
            throw new Error("Function not implemented.");
          },
          getConfigOption: function (): SnapshotStoreConfig<T, K> | null {
            throw new Error("Function not implemented.");
          },
          getTimestamp: function (): Date | undefined {
            throw new Error("Function not implemented.");
          },
          getStores: function (
            storeId: number,
            snapshotId: string,
            snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
            snapshotStores?: SnapshotStoreReference<T, K>[],
          
          ): Map<T, K>[] {
            throw new Error("Function not implemented.");
          },
          getData: function (): T | Map<string, Snapshot<T, K>> | null | undefined {
            throw new Error("Function not implemented.");
          },
          setData: function (id: string, data: Map<string, Snapshot<T, K>>): void {
            throw new Error("Function not implemented.");
          },
          addData: function (id: string, data: Partial<Snapshot<T, K>>): void {
            throw new Error("Function not implemented.");
          },
          stores: (): SnapshotStore<T, K>[]  => [],
          getStore: function (
            storeId: number,
            snapshotStore: SnapshotStore<T, K>,
            snapshotId: string | null,
            snapshot: Snapshot<T, K>, 
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            type: string,
            event: Event
          ): SnapshotStore<T, K> | null {
            throw new Error("Function not implemented.");
          },
          addStore: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshot: function (
            id: number,
            storeId: string | number,
            snapshotStore: SnapshotStore<T, K>,
            snapshotContainer: SnapshotContainer<T, K>,
            snapshotId: string,
            criteria: CriteriaType,
            snapshot: Snapshot<T, K>,
            type: string,
            event: Event,
            callback: (snapshot: Snapshot<T, K>) => void,
            mapFn: (item: T) => T
          ): Snapshot<T, K> | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function (
            storeIds: number[],
            snapshotId: string,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            snapshot: Snapshot<T, K>,
            timestamp: string | number | Date | undefined,
            type: string,
            event: Event,
            id: number,
            snapshotStore: SnapshotStore<T, K>,
            data: K,
            callback: (
              storeIds: number[],
              snapshotId: string,
              category: symbol | string | Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              snapshot: Snapshot<T, K>,
              timestamp: string | number | Date | undefined,
              type: string,
              event: Event,
              id: number,
              snapshotStore: SnapshotStore<T, K>,
              data: K, // Use V for the callback data type
              index: number
            ) => T // Return type of the callback
            ): T[] {
            throw new Error("Function not implemented.");
          },
          removeStore: function (storeId: number, store: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (unsubscribeDetails: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; unsubscribeReason: string; unsubscribeData: any; }, callback: Callback<Snapshot<T, K>> | null): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: function (
            snapshotId: string, 
            callback: (
              snapshotId: string, 
              payload: FetchSnapshotPayload<K> | undefined, 
              snapshotStore: SnapshotStore<T, K>, 
              payloadData: T | BaseData<any>, 
              category: symbol | string | Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              timestamp: Date, 
              data: T, 
              delegate: SnapshotWithCriteria<T, K>[]
            ) => Snapshot<T, K>): Promise<{
              id: string; 
              category: Category; 
              categoryProperties: CategoryProperties | undefined; 
              timestamp: Date; 
              snapshot: Snapshot<T, K>;
              data: BaseData;
              delegate: SnapshotWithCriteria<T, K>[]; 
            }> {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (
            date: Date, 
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
             payload: { error: Error; }
            ): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (
            snapshotStore: SnapshotStore<T, K>,
            storeId: number,
            snapshotId: string,
            data: Map<string, Snapshot<T, K>>,
            events: Record<string, CalendarManagerStoreClass<T, K>[]>,
            dataItems: RealtimeDataItem[],
            newData: Snapshot<T, K>,
            payload: ConfigureSnapshotStorePayload<T, K>,
            store: SnapshotStore<any, K>,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
            config: SnapshotStoreConfig<T, K>
          ): void | null {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (snapshotId: string,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload?: { data?: Error }
          ): void | null {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (
            date: Date,
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (
            snapshotId: string | number | null,
             snapshotManager: SnapshotManager<T, K>, 
             snapshot: Snapshot<T, K>, 
             payload?: { data?: any }
          ): void | null {
            throw new Error("Function not implemented.");
          },
          createSnapshots: function (
            id: string,
            snapshotId: string | number | null,
            snapshots: Snapshot<T, K>[], // Use Snapshot<T, K>[] here
            snapshotManager: SnapshotManager<T, K>, 
            payload: CreateSnapshotsPayload<T, K>, 
            callback: (snapshots: Snapshot<T, K>[]) => void | null, 
            snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined, 
            category?: string | symbol | Category | undefined,
            categoryProperties?: string | CategoryProperties
          ): Snapshot<T, K>[] | null {
            throw new Error("Function not implemented.");
          },
          onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event, callback: (snapshot: Snapshot<T, K>) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshots: function (snapshotId: string, snapshots: Snapshots<T, K>, type: string, event: Event, callback: (snapshots: Snapshots<T, K>) => void): void {
            throw new Error("Function not implemented.");
          },
          label: undefined,
          events: {
            callbacks: function (snapshot: Snapshots<T, K>): void {
              throw new Error("Function not implemented.");
            },
            eventRecords: null
          },
          handleSnapshot: function (
            id: string, 
            snapshotId: string | number | null, 
            snapshot: T extends SnapshotData<T, K> ? Snapshot<T, K, Meta> : null,
            snapshotData: T, 
            category: symbol | string | Category | undefined, 
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshot: T) => void, 
            snapshots: SnapshotsArray<T, K>,
            type: string, 
            event: Event, 
            snapshotContainer?: T | undefined, 
            snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined
          ): Promise<Snapshot<T, K> | null> {
            throw new Error("Function not implemented.");
          },
          meta: {
            metadataEntries: "",
            keywords: "",
            version: "",
            isActive,
            config: "",
            permissions: "",
            customFields: "",
            versionData,
            latestVersion: "",
            id: "",
            apiEndpoint: "",
            apiKey: "",
            

          }
        }),
        store: null,
        configOption: null,
        events: {
          eventRecords: {
            "snapshotEvent1": [{
              records: [{
                id: "snapshotEvent1",
                title: "Snapshot Event 1",
                content: "Snapshot Event 1 content",
                topics: ["topic1"],
                highlights: ["highlight1"],
                date: new Date(),
                files: [],
                rsvpStatus: "yes",
                participants: [],
                teamMemberId: "team1",
                meta: undefined,
                getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>>[] {
                  throw new Error("Function not implemented.");
                },
                getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
                  const result: Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[] = [];
                  result.push(snapshot);
                  return Promise.resolve(result);
                },
                timestamp: undefined
              }]
            }]
          },
          callbacks: {}
        }
      };
    
      const snapshots: Snapshot<T, K>[] = [snapshot];
      callback(snapshots);
    }, 1000)// Simulate a delay before receiving the update
    })
  };
  