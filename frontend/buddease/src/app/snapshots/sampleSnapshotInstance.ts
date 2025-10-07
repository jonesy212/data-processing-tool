import { getDataVersions } from '@/app/api/ApiData';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '@/app/models/data/Data';
import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Callback, CoreSnapshot, Result, Snapshot, SnapshotContainer, SnapshotData, SnapshotItem, Snapshots, SnapshotStoreConfig, SnapshotStoreProps, SnapshotUnion, SnapshotWithCriteria } from '@/app/snapshots';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { subscriber, Subscriber } from "@/app/subscribers/Subscriber";
import { Tag } from '@/appp/models/tracker/Tag';
import { NotificationType } from '@/context/NotificationContext';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import { Payload } from '@/server/database/Payload';
import { InitializedDataStore } from '@/app/snapshots/SnapshpshotStoreOptions';
import { SubscriberCollection } from '@/users/SubscriberCollection';


const sampleSnapshot: Snapshot<T, K, Meta<T>> = {
  timestamp: new Date().toISOString() ?? "",
  value: "42",
  category: "sample snapshot",
  snapshotStoreConfig: {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  getSnapshotItems: function (): (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K, Meta, ExcludedFields>)[] {
    throw new Error("Function not implemented.");
  },
  defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<T, K, Meta, ExcludedFields> | null, snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined): void {
    throw new Error("Function not implemented.");
  },
  versionInfo: null,
  transformSubscriber: function (subscriberId: string, sub: Subscriber<T, K, Meta, ExcludedFields>): Subscriber<T, K, Meta, ExcludedFields> {
    throw new Error("Function not implemented.");
  },
  transformDelegate: function (): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  initializedState: undefined,
  getAllKeys: function (): Promise<string[]> | undefined {
    throw new Error("Function not implemented.");
  },
  getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
    throw new Error("Function not implemented.");
  },
  addDataStatus: function (id: number, status: StatusType | undefined): void {
    throw new Error("Function not implemented.");
  },
  removeData: function (id: number): void {
    throw new Error("Function not implemented.");
  },
  updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
  addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
    throw new Error("Function not implemented.");
  },
  getDataVersions: function (id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
    throw new Error("Function not implemented.");
  },
  updateDataVersions: function (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
    throw new Error("Function not implemented.");
  },
  getBackendVersion: function (): Promise<string | number | undefined> {
    throw new Error("Function not implemented.");
  },
  getFrontendVersion: function (): Promise<string | number | undefined> {
    throw new Error("Function not implemented.");
  },
  fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<T, K, Meta, ExcludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    throw new Error("Function not implemented.");
  },
  handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  removeItem: function (key: string | number): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>; data: BaseData; }> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    throw new Error("Function not implemented.");
  },
  getSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<SnapshotStore<T, K, Meta, ExcludedFields>> {
    throw new Error("Function not implemented.");
  },
  setItem: function (key: T, value: BaseData): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getDataStore: (): Promise<InitializedDataStore<BaseData<any>>> => {
    throw new Error("Function not implemented.");
  },
  addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<T, K, Meta, ExcludedFields>[]): void {
    throw new Error("Function not implemented.");
  },
  deepCompare: function (objA: any, objB: any): boolean {
    throw new Error("Function not implemented.");
  },
  shallowCompare: function (objA: any, objB: any): boolean {
    throw new Error("Function not implemented.");
  },
  getDataStoreMethods: function (): DataStoreMethods<T, K, Meta, ExcludedFields> {
    throw new Error("Function not implemented.");
  },
  getDelegate: function (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  }): Promise<DataStore<T, K, Meta, ExcludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  determineCategory: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined): string {
    throw new Error("Function not implemented.");
  },
  determinePrefix: function <T extends Data<T>>(snapshot: T | null | undefined, category: string): string {
    throw new Error("Function not implemented.");
  },
  removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K, Meta, ExcludedFields>): void {
    throw new Error("Function not implemented.");
  },
  addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  addNestedStore: function (store: SnapshotStore<T, K, Meta, ExcludedFields>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  addSnapshot: function (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[] 
      & Record<string, Subscriber<T, K, Meta, ExcludedFields>>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    throw new Error("Function not implemented.");
  },
  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    additionalData: any,
    category?:  Category,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotData?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => { 
    throw new Error("Function not implemented.");
  },

  createInitSnapshot: function (
    id: string,
    initialData: T,
    snapshotData: SnapshotData<any, K>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,    additionalData: any
  ): Promise<Result<Snapshot<T, K, never>>> {
    throw new Error("Function not implemented.");
  },
  setSnapshotSuccess: function (snapshotData: SnapshotData<T, K, Meta, ExcludedFields>, subscribers: ((data: Subscriber<T, K, Meta, ExcludedFields>) => void)[]): void {
    throw new Error("Function not implemented.");
  },
  setSnapshotFailure: function (error: Error): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K, Meta, ExcludedFields>[], snapshot: Snapshots<BaseData>) => void): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsFailure: function (error: Payload): void {
    throw new Error("Function not implemented.");
  },
  initSnapshot: function (
    snapshot: SnapshotStore<T, K, Meta, ExcludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshotId: string | number | null,
      snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<any, K>,
      SnapshotWithCriteria<any, K>>
  ): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, ExcludedFields>[]): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
    throw new Error("Function not implemented.");
  },
  takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
    throw new Error("Function not implemented.");
  },
  flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => U): U extends (infer I)[] ? I[] : U[] {
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
  setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
  reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U): U | undefined {
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
  getSubscribers: function (subscribers: Subscriber<T, K, Meta, ExcludedFields>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<T, K, Meta, ExcludedFields>[]; snapshots: Snapshots<BaseData>; }> {
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
    subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
    callback: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, ExcludedFields>[],
    data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>,
    data: T,
    filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotUnion<T, K, Meta>[]>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>; // Include snapshots here for consistency
    }>
  ): Promise<Snapshots<T, K, Meta, ExcludedFields>> {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>,
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
    ) => Promise<{
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[]
    }>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (
    snapshotData: (subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    }>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K, Meta, ExcludedFields>  => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByCategory:(category: Category): Snapshots<T, K, Meta, ExcludedFields> => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByTag:  (tag: Tag<T, K, Meta, ExcludedFields>): Snapshots<T, K, Meta, ExcludedFields> => {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess:function (
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>[],
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
  ): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function ( date: Date,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>, 
    snapshots: Snapshots<T, K, Meta, ExcludedFields>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (
    id: number,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>,
  ): Promise<{ snapshots: Snapshots<T, K, Meta, ExcludedFields> }> {
    throw new Error("Function not implemented.");
  },
  handleSnapshotSuccess: function (
    message: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
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
  compareSnapshotState: function (snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ): boolean {
    throw new Error("Function not implemented.");
  },
  eventRecords: null,
  snapshotStore: null,
  getParentId: function (
    id: string, 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): string | null {
    throw new Error("Function not implemented.");
  },
  getChildIds: function (id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): (string | number | undefined)[] {
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
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    throw new Error("Function not implemented.");
  },
  dataItems: (): RealtimeDataItem<T, K, Meta, ExcludedFields>[] | null => { 
    throw new Error("Function not implemented.");
  },
  newData: null,
  data: undefined,
  getInitialState: function (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    throw new Error("Function not implemented.");
  },
  getConfigOption: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    throw new Error("Function not implemented.");
  },
  getTimestamp: function (): Date | undefined {
    throw new Error("Function not implemented.");
  },
  getStores: function (): Map<number, SnapshotStore<Data<T>, any>>[] {
    throw new Error("Function not implemented.");
  },
  getData: function (): BaseData | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined {
    throw new Error("Function not implemented.");
  },
  setData: function (id: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    throw new Error("Function not implemented.");
  },
  addData: function (id: string, data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
    throw new Error("Function not implemented.");
  },
  stores: (
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>
  ): SnapshotStore<T, K, Meta, ExcludedFields>[]=> {
    throw new Error("Function not implemented.");
  },
  getStore: function (    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ): SnapshotStore<T, K, Meta, ExcludedFields> | null {
    throw new Error("Function not implemented.");
  },
  addStore: function (storeId: number, snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
    throw new Error("Function not implemented.");
  },

  mapSnapshot: function (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ): Promise<string | undefined> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
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
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    data: K,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
      data: V,
      index: number,
      versionedData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined // Pass versioned data to callback
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
  
  
  removeStore: function (storeId: number, store: SnapshotStore<T, K, Meta, ExcludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
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
  callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (
    snapshotId: string, 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<T> | undefined,
      snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
      payloadData: T |  BaseData<any>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[]
    ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<{
    id: string; 
    category: Category; 
    categoryProperties: CategoryProperties; 
    timestamp: Date; 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    data: BaseData;
    delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[]; 
  }> {
    throw new Error("Function not implemented.");
  },
  addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, snapshotId: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void): void | null {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): Promise<void> {
    throw new Error("Function not implemented.");
  },
  createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>, payload: CreateSnapshotsPayload<T, K, Meta, ExcludedFields>, callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotDataConfig?: SnapshotConfig<T, K, Meta, ExcludedFields>[] | undefined, category?: string | symbol | Category): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
    throw new Error("Function not implemented.");
  },
  onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: SnapshotEvent<T, K, Meta, ExcludedFields>, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
    throw new Error("Function not implemented.");
  },
  onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: SnapshotEvent<T, K, Meta, ExcludedFields>, callback: (snapshots: Snapshots<BaseData>) => void): void {
    throw new Error("Function not implemented.");
  },
  label: undefined,
  events: undefined,
  handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: SnapshotEvent<T, K, Meta, ExcludedFields>, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
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