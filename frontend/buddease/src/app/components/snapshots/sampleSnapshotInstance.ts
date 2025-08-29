import { getDataVersions } from '@/app/api/ApiData';
import { Callback, CoreSnapshot, Result, Snapshot, SnapshotContainer, SnapshotData, SnapshotItem, Snapshots, SnapshotStoreConfig, SnapshotStoreProps, SnapshotUnion, SnapshotWithCriteria } from '@/app/components/snapshots';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { NotificationType } from '@/context/NotificationContext';
import { Payload } from '../../../server/database/Payload';
import { SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '../models/data/Data';
import { K, Meta, T } from '../models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from '../models/data/StatusType';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { Tag } from '../models/tracker/Tag';
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { subscriber, Subscriber } from "../users/Subscriber";
import { SubscriberCollection } from '../users/SubscriberCollection';
import { InitializedDataStore } from './SnapshotStoreOptions';


const sampleSnapshot: Snapshot<T, K, Meta<T>> = {
  timestamp: new Date().toISOString() ?? "",
  value: "42",
  category: "sample snapshot",
  snapshotStoreConfig: {} as SnapshotStoreConfig<T, K>,
  getSnapshotItems: function (): (SnapshotStoreConfig<T, K> | SnapshotItem<T, K>)[] {
    throw new Error("Function not implemented.");
  },
  defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<T, K> | null, snapshot?: Snapshot<T, K> | null | undefined): void {
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
  fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<T, K>[]> {
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
  getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K>; snapshotStore: SnapshotStore<T, K>; data: BaseData; }> | undefined): Promise<Snapshot<T, K>> {
    throw new Error("Function not implemented.");
  },
  getSnapshotSuccess: function (snapshot: Snapshot<T, K>): Promise<SnapshotStore<T, K>> {
    throw new Error("Function not implemented.");
  },
  setItem: function (key: T, value: BaseData): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getDataStore: (): Promise<InitializedDataStore<BaseData<any>>> => {
    throw new Error("Function not implemented.");
  },
  addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<T, K>[]): void {
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
    simulatedDataSource: SnapshotStoreConfig<T, K>[]
  }): Promise<DataStore<T, K>[]> {
    throw new Error("Function not implemented.");
  },
  determineCategory: function (snapshot: Snapshot<T, K> | null | undefined): string {
    throw new Error("Function not implemented.");
  },
  determinePrefix: function <T extends Data<T>>(snapshot: T | null | undefined, category: string): string {
    throw new Error("Function not implemented.");
  },
  removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K>): void {
    throw new Error("Function not implemented.");
  },
  addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<T, K>): void {
    throw new Error("Function not implemented.");
  },
  addNestedStore: function (store: SnapshotStore<T, K>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  addSnapshot: function (
    snapshot: Snapshot<T, K>,
    snapshotId: string,
    subscribers: Subscriber<T, K>[] 
      & Record<string, Subscriber<T, K>>
  ): Promise<Snapshot<T, K> | undefined> {
    throw new Error("Function not implemented.");
  },
  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K>,
    additionalData: any,
    category?:  Category,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K>
  ): Snapshot<T, K> | null => { 
    throw new Error("Function not implemented.");
  },

  createInitSnapshot: function (
    id: string,
    initialData: T,
    snapshotData: SnapshotData<any, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K>,
    category: Category | undefined,    additionalData: any
  ): Promise<Result<Snapshot<T, K, never>>> {
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
  updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<BaseData>) => void): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsFailure: function (error: Payload): void {
    throw new Error("Function not implemented.");
  },
  initSnapshot: function (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
      snapshotId: string | number | null,
      snapshotData: SnapshotData<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<T, K>,
      snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<any, K>,
      SnapshotWithCriteria<any, K>>
  ): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshot: function (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]): Promise<{ snapshot: Snapshot<T, K>; }> {
    throw new Error("Function not implemented.");
  },
  takeSnapshotSuccess: function (snapshot: Snapshot<T, K>): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
    throw new Error("Function not implemented.");
  },
  flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U): U extends (infer I)[] ? I[] : U[] {
    throw new Error("Function not implemented.");
  },
  getState: function () {
    throw new Error("Function not implemented.");
  },
  setState: function (state: any): void {
    throw new Error("Function not implemented.");
  },
  validateSnapshot: function (
    snapshotId: string,
    snapshot: Snapshot<BaseData<any, any, any>, any>
  ): boolean {
    throw new Error("Function not implemented.");
  },
  handleActions: function (action: (selectedText: string) => void): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<T, K>): void {
    throw new Error("Function not implemented.");
  },
  transformSnapshotConfig: function <T extends BaseDataEntity>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
    throw new Error("Function not implemented.");
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
  reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U): U | undefined {
    throw new Error("Function not implemented.");
  },
  sortSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  filterSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  findSnapshot: function (
    predicate: (snapshot: Snapshot<BaseData<any, any, any>, any>) => boolean
  ): Snapshot<BaseData<any, any, any>, any> | undefined {
    throw new Error("Function not implemented.");
  },
  getSubscribers: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<BaseData>; }> {
    throw new Error("Function not implemented.");
  },
  notify: function (
    id: string,
    message: string,
    content: any, 
    data: any, 
    date: Date,
    type: NotificationType,
    notificationPosition?: NotificationPosition
  ): void {
    throw new Error("Function not implemented.");
  },

  notifySubscribers: function (
    message: string,
    subscribers: Subscriber<T, K>[],
    callback: (data: Snapshot<T, K>) => Subscriber<T, K>[],
    data: Partial<SnapshotStoreConfig<T, K>>
  ): Promise<Subscriber<T, K, StructuredMetadata<T, K>>[]> {
    throw new Error("Function not implemented.");
  },
  getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>,
    data: T,
    filter?: (snapshot: Snapshot<T, K>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K>
    ) => Promise<SnapshotUnion<T, K, Meta>[]>
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
    snapshotData: (subscribers: SubscriberCollection<T, K>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K>;
      snapshots: Snapshots<T, K>
    }>,
    snapshotManager: SnapshotManager<T, K>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K>  => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByCategory:(category: Category): Snapshots<T, K> => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByTag:  (tag: Tag<T, K>): Snapshots<T, K> => {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess:function (
      subscribers: SubscriberCollection<T, K>[],
      snapshots: Snapshots<T, K>
  ): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function ( date: Date,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (
    subscribers: SubscriberCollection<T, K>, 
    snapshots: Snapshots<T, K>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K>,
    snapshot: Snapshot<T, K>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (
    id: number,
    snapshotId: string,
    snapshot: Snapshot<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshots: Snapshots<T, K>,
  ): Promise<{ snapshots: Snapshots<T, K> }> {
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
    key: string  | T,
    snapshot: SnapshotData<T, K, StructuredMetadata<T, K>, never>
  ): string {
    throw new Error("Function not implemented.");
  },
  compareSnapshotState: function (snapshot1: Snapshot<T, K> | null, state: Snapshot<T, K> ): boolean {
    throw new Error("Function not implemented.");
  },
  eventRecords: null,
  snapshotStore: null,
  getParentId: function (
    id: string, 
    snapshot: Snapshot<T, K>
  ): string | null {
    throw new Error("Function not implemented.");
  },
  getChildIds: function (id: string, childSnapshot: Snapshot<T, K>): (string | number | undefined)[] {
    throw new Error("Function not implemented.");
  },
  addChild: function (
    parentId: string, 
    childId: string, 
    childSnapshot: CoreSnapshot<T, K, never>
  ): void {
    throw new Error("Function not implemented.");
  },
  removeChild: function (
    childId: string, parentId: string,
    parentSnapshot: CoreSnapshot<T, K, never>, 
    childSnapshot: CoreSnapshot<T, K, never>
  ): void {
    throw new Error("Function not implemented.");
  },
  getChildren: function (
    id: string,
    childSnapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>
  ): CoreSnapshot<T, K, never>[] {
    throw new Error("Function not implemented.");
  },
  hasChildren: function (): boolean {
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
  dataItems: (): RealtimeDataItem[] | null => { 
    throw new Error("Function not implemented.");
  },
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
  getStores: function (): Map<number, SnapshotStore<Data<T>, any>>[] {
    throw new Error("Function not implemented.");
  },
  getData: function (): BaseData | Map<string, Snapshot<T, K>> | null | undefined {
    throw new Error("Function not implemented.");
  },
  setData: function (id: string, data: Map<string, Snapshot<T, K>>): void {
    throw new Error("Function not implemented.");
  },
  addData: function (id: string, data: Partial<Snapshot<T, K>>): void {
    throw new Error("Function not implemented.");
  },
  stores: (
    storeProps: SnapshotStoreProps<T, K>
  ): SnapshotStore<T, K>[]=> {
    throw new Error("Function not implemented.");
  },
  getStore: function (    storeId: number,
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
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ): Promise<string | undefined> | Snapshot<T, K> | null {
    if (isAsync) {
      // Asynchronous behavior
      return (async () => {
        try {
          const result = await someAsyncOperation(snapshotId, criteria); // Example async task
          if (result) {
            const mappedData = mapFn(snapshot.data); // Assuming `snapshot` has a `data` field
            const newSnapshot = { ...snapshot, data: mappedData };
            callback(newSnapshot);
            return result; // Return string or undefined
          }
          return null; // Mapping failed
        } catch (error) {
          console.error(error);
          return null;
        }
      })();
    } else {
      // Synchronous behavior
         return mapSnapshotCore(snapshot, mapFn, callback);

    }
  },

  mapSnapshots: async function <U, V>(
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
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
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: V,
      index: number,
      versionedData: Snapshot<T, K> | undefined // Pass versioned data to callback
    ) => Promise<U> | U
  ): Promise<U[]> {
    const results: (U | Promise<U>)[] = storeIds.map(async (_, index) => {
      // Fetch versioned data if needed (e.g., using `getDataVersions` for versioned snapshots)
      const versionedData = await getDataVersions(id);
  
      return callback(
        storeIds,
        snapshotId,
        category,
        categoryProperties,
        snapshot,
        timestamp,
        type,
        event,
        id,
        snapshotStore,
        data as V,
        index,
        versionedData?.[index] // Pass a specific versioned snapshot if available
      );
    });
  
    if (results.some((result) => result instanceof Promise)) {
      // If any callback result is async, resolve them all
      return Promise.all(results);
    }
    return results as U[];
  },
  
  
  removeStore: function (storeId: number, store: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (
    unsubscribeDetails: {
    userId: string; 
    snapshotId: string;
    unsubscribeType: string; 
    unsubscribeDate: Date; 
    unsubscribeReason: string; 
    unsubscribeData: any;
  },
  callback: Callback<Snapshot<T, K>>
  ): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (
    snapshotId: string, 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<T> | undefined,
      snapshotStore: SnapshotStore<T, K>,
      payloadData: T |  BaseData<any>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K>[]
    ) => Snapshot<T, K>
  ): Promise<{
    id: string; 
    category: Category; 
    categoryProperties: CategoryProperties; 
    timestamp: Date; 
    snapshot: Snapshot<T, K>;
    data: BaseData;
    delegate: SnapshotWithCriteria<T, K>[]; 
  }> {
    throw new Error("Function not implemented.");
  },
  addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K>, snapshotId: string, data: Map<string, Snapshot<T, K>>, events: Record<string, CalendarEvent<T, K>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<T, K>) => void): void | null {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): Promise<void> {
    throw new Error("Function not implemented.");
  },
  createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<T, K>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotsPayload<T, K>, callback: (snapshots: Snapshot<T, K>[]) => void | null, snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined, category?: string | symbol | Category): Snapshot<T, K>[] | null {
    throw new Error("Function not implemented.");
  },
  onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event, callback: (snapshot: Snapshot<T, K>) => void): void {
    throw new Error("Function not implemented.");
  },
  onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: Event, callback: (snapshots: Snapshots<BaseData>) => void): void {
    throw new Error("Function not implemented.");
  },
  label: undefined,
  events: undefined,
  handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, K> | undefined): Promise<Snapshot<T, K> | null> {
    throw new Error("Function not implemented.");
  },
  meta: undefined
};

subscriber.receiveSnapshot({
  ...sampleSnapshot,
  timestamp: new Date().toISOString(),
  value: typeof sampleSnapshot.value === 'string' ? sampleSnapshot.value : 0,
  tags: sampleSnapshot.tags ? Object.fromEntries(sampleSnapshot.tags.map(tag => [tag.name, tag.value])) : undefined
});