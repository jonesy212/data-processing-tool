// sampleSnapshotInstance.ts
import { getDataVersions } from '@/core/api/ApiData';
import { SnapshotManager } from "@/core/hooks/useSnapshotManager";
import { CreateSnapshotsPayload } from '@/core/interfaces/payload/payloadTypes';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import type { BaseData, Data } from '@/core/models/data/Data';
import type { NotificationPosition, StatusType } from "@/core/models/data/StatusType";
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import type { CriteriaType } from '@/core/pages/searches/CriteriaType';
import type { DataStoreMethods } from '@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { CustomSnapshotData } from '@/core/snapshots/SnapshotData';
import type { DataStore } from '@/core/state/stores/DataStore';
import type { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from "@/core/typings/entities/AppEntity";
import { SnapshotEvent } from '@/core/typings/snapshotTypes';

import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Tag } from '@/core/models/tracker/Tag';
import { CoreSnapshot } from '@/core/snapshots/CoreSnapshot';
import { Snapshots, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import { SnapshotItem } from '@/core/snapshots/SnapshotList';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { InitializedDataStore } from '@/core/snapshots/SnapshotStoreOptions';
import type { SnapshotStoreProps } from '@/core/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import type { NotificationType } from '@/core/state/context/NotificationContext';
import { subscriber, Subscriber } from "@/core/subscribers/Subscriber";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { Callback } from '@/core/subscribers/subscribeToSnapshotsImplementation';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

const sampleSnapshot: Snapshot<
  AppEntity,                // T — base entity
  AppK,                     // K — potentially derived or extended entity
  AppMeta,                  // Meta — matches T and K
  AppAttachment,             // AttachmentType
  AppExcludedFields,        // ExcludedFields
  AppIncludedFields         // IncludedFields
> = {
  timestamp: new Date().toISOString() ?? "",
  value: "42",
  category: "sample snapshot",
  snapshotStoreConfig: {} as SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
  getSnapshotItems: function (): (
    SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | SnapshotItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>

  )[] {
    throw new Error("Function not implemented.");
  },
  defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => Subscriber<AppEntity,
AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null, 
snapshot?: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null | undefined): void {
    throw new Error("Function not implemented.");
  },
  versionInfo: null,
  transformSubscriber: function (subscriberId: string, sub: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> {
    throw new Error("Function not implemented.");
  },
  transformDelegate: function (): Promise<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  initializedState: undefined,
  getAllKeys: function (): Promise<string[]> | undefined {
    throw new Error("Function not implemented.");
  },
  getAllItems: function (): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | undefined> {
    throw new Error("Function not implemented.");
  },
  addDataStatus: function (id: number, status: StatusType | undefined): void {
    throw new Error("Function not implemented.");
  },
  removeData: function (id: number): void {
    throw new Error("Function not implemented.");
  },
  updateData: function (id: number, newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
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
  addDataSuccess: function (payload: { data: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]; }): void {
    throw new Error("Function not implemented.");
  },
  getDataVersions: function (id: number): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | undefined> {
    throw new Error("Function not implemented.");
  },
  updateDataVersions: function (id: number, versions: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]): void {
    throw new Error("Function not implemented.");
  },
  getBackendVersion: function (): Promise<string | number | undefined> {
    throw new Error("Function not implemented.");
  },
  getFrontendVersion: function (): Promise<string | number | undefined> {
    throw new Error("Function not implemented.");
  },
  fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
    throw new Error("Function not implemented.");
  },
  defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): string {
    throw new Error("Function not implemented.");
  },
  handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  removeItem: function (key: string | number): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getSnapshot: function (snapshot: (id: string) => Promise<{ category: Category; timestamp: any; id: any; snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; data: BaseData; }> | undefined): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
    throw new Error("Function not implemented.");
  },
  getSnapshotSuccess: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Promise<SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
    throw new Error("Function not implemented.");
  },
  setItem: function (key: T, value: BaseData): Promise<void> {
    throw new Error("Function not implemented.");
  },
  getDataStore: (): Promise<InitializedDataStore<BaseData<any>>> => {
    throw new Error("Function not implemented.");
  },
  addSnapshotSuccess: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]): void {
    throw new Error("Function not implemented.");
  },
  deepCompare: function (objA: any, objB: any): boolean {
    throw new Error("Function not implemented.");
  },
  shallowCompare: function (objA: any, objB: any): boolean {
    throw new Error("Function not implemented.");
  },
  getDataStoreMethods: function (): DataStoreMethods<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> {
    throw new Error("Function not implemented.");
  },
  getDelegate: function (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
  }): Promise<DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  determineCategory: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null | undefined): string {
    throw new Error("Function not implemented.");
  },
  determinePrefix: function <T extends Data<T>>(snapshot: T | null | undefined, category: string): string {
    throw new Error("Function not implemented.");
  },
  removeSnapshot: function (snapshotToRemove: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  addSnapshotItem: function (item: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>| SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  addNestedStore: function (store: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  addSnapshot: function (
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotId: string,
    subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] 
      & Record<string, Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
  ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined> {
    throw new Error("Function not implemented.");
  },
  createSnapshot: (
    id: string,
    additionalData: CustomSnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    category?:  Category,
    callback?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
    snapshotData?: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null => { 
    throw new Error("Function not implemented.");
  },

  createInitSnapshot: function (
    id: string,
    initialData: T,
    snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    category?: Category,    
    additionalData?: CustomSnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
  ): Promise<Result<Snapshot<T, K, never>>> {
    throw new Error("Function not implemented.");
  },
  setSnapshotSuccess: function (snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    subscribers: ((data: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void)[]): void {
    throw new Error("Function not implemented.");
  },
  setSnapshotFailure: function (error: Error): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshots: function (): Promise<number> {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[], snapshot: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void): void {
    throw new Error("Function not implemented.");
  },
  updateSnapshotsFailure: function (error: Payload): void {
    throw new Error("Function not implemented.");
  },
  initSnapshot: function (
    snapshot: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
      snapshotId: string | number | null,
      snapshotData: SnapshotData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>,
      category?: Category,
  ): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshot: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]): Promise<{ snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; }> {
    throw new Error("Function not implemented.");
  },
  takeSnapshotSuccess: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
    throw new Error("Function not implemented.");
  },
  flatMap: function <U extends Iterable<any>>(
    callback: (value: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    index: number, 
    array: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]) => U): U extends (infer I)[] ? I[] : U[] {
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
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): boolean {
    throw new Error("Function not implemented.");
  },
  handleActions: function (action: (selectedText: string) => void): void {
    throw new Error("Function not implemented.");
  },
  setSnapshot: function (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  transformSnapshotConfig: function (
    config: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
   {
    throw new Error("Function not implemented.");
  },
  setSnapshots: function (snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  clearSnapshot: function (): void {
    throw new Error("Function not implemented.");
  },
  mergeSnapshots: function (snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, category: string): void {
    throw new Error("Function not implemented.");
  },
  reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => U, initialValue: U): U | undefined {
    throw new Error("Function not implemented.");
  },
  sortSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  filterSnapshots: function (): void {
    throw new Error("Function not implemented.");
  },
  findSnapshot: function (
    predicate: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => boolean
  ): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined {
    throw new Error("Function not implemented.");
  },
  getSubscribers: function (subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[], snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Promise<{ subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]; snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; }> {
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
    subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
    callback: (data: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
    data: Partial<SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
  ): Promise<Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  getSnapshots: function (category: string, data: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  getAllSnapshots: function (storeId: number,
    snapshotId: string,
    snapshotData: T,
    timestamp: string,
    type: string,
    event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    data: T,
    category?: Category,    
    filter?: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => boolean,
    dataCallback?: (
      subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => Promise<SnapshotUnion<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>
  ): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]> {
    throw new Error("Function not implemented.");
  },
  generateId: function (): string {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>; // Include snapshots here for consistency
    }>
  ): Promise<Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshotsRequest: function (
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
    ) => Promise<{
      subscribers: Subscriber<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
    }>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsRequest: function (
    snapshotData: (subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
    }>,
    snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByStatus: (status: StatusType): Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>  => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByCategory:(category: Category): Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> => {
    throw new Error("Function not implemented.");
  },
  filterSnapshotsByTag:  (tag: Tag<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> => {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsSuccess:function (
      subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[],
      snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): void {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshotsFailure: function ( date: Date,
    snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsSuccess: function (
    subscribers: SubscriberCollection<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): void {
    throw new Error("Function not implemented.");
  },
  batchUpdateSnapshotsFailure: function (date: Date,
    snapshotId: string | number | null,
    snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    payload: { error: Error; }
  ): void {
    throw new Error("Function not implemented.");
  },
  batchTakeSnapshot: function (
    id: number,
    snapshotId: string,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
  ): Promise<{ snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> }> {
    throw new Error("Function not implemented.");
  },
  handleSnapshotSuccess: function (
    message: string,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null,
    snapshotId: string
  ): void {
    throw new Error("Function not implemented.");
  },
  getSnapshotId: function (
    key: string  | T,
    snapshot: SnapshotData<T, K, StructuredMetadata<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, never>
  ): string {
    throw new Error("Function not implemented.");
  },
  compareSnapshotState: function (snapshot1: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null, state: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> ): boolean {
    throw new Error("Function not implemented.");
  },
  eventRecords: null,
  snapshotStore: null,
  getParentId: function (
    id: string, 
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): string | null {
    throw new Error("Function not implemented.");
  },
  getChildIds: function (id: string, childSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>): (string | number | undefined)[] {
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
    childSnapshot: Snapshot<T, K, StructuredMetadata<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, never>
  ): CoreSnapshot<T, K, never>[] {
    throw new Error("Function not implemented.");
  },
  hasChildren: function (): boolean {
    throw new Error("Function not implemented.");
  },
  isDescendantOf: function (
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    childSnapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): boolean {
    throw new Error("Function not implemented.");
  },
  dataItems: (): RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | null => { 
    throw new Error("Function not implemented.");
  },
  newData: null,
  data: undefined,
  getInitialState: function (): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null {
    throw new Error("Function not implemented.");
  },
  getConfigOption: function (): SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null {
    throw new Error("Function not implemented.");
  },
  getTimestamp: function (): Date | undefined {
    throw new Error("Function not implemented.");
  },
  getStores: function (): Map<number, SnapshotStore<Data<T>, any>>[] {
    throw new Error("Function not implemented.");
  },
  getData: function (): BaseData | Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> | null | undefined {
    throw new Error("Function not implemented.");
  },
  setData: function (id: string, data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>): void {
    throw new Error("Function not implemented.");
  },
  addData: function (id: string, data: Partial<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>): void {
    throw new Error("Function not implemented.");
  },
  stores: (
    storeProps: SnapshotStoreProps<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]=> {
    throw new Error("Function not implemented.");
  },
  getStore: function (    storeId: number,
    snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotId: string | null,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    type: string,
    event: Event
  ): SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null {
    throw new Error("Function not implemented.");
  },
  addStore: function (storeId: number, snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshotId: string, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, type: string, event: Event): void | null {
    throw new Error("Function not implemented.");
  },

  mapSnapshot: function (
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotContainer: SnapshotContainer<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    type: string,
    event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void,
    mapFn: (item: T) => T,
    isAsync?: boolean // Flag to determine behavior
  ): Promise<string | undefined> | Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null {
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
    category?: Category,    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
    data: K,
    callback: (
      storeIds: number[],
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      data: V,
      index: number,
      versionedData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined, // Pass versioned data to callback
      category?: Category,
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
  
  
  removeStore: function (
    storeId: number, 
    store: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    snapshotId: string, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, type: string, 
    event: Event
  ): void | null {
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
  callback: Callback<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>
  ): void {
    throw new Error("Function not implemented.");
  },
  fetchSnapshot: function (
    snapshotId: string, 
    callback: (
      snapshotId: string,
      payload: FetchSnapshotPayload<T> | undefined,
      snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>,
      payloadData: T |  BaseData<any>,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      timestamp: Date,
      data: T,
      delegate: SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]
    ) => Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  ): Promise<{
    id: string; 
    category: Category; 
    categoryProperties: CategoryProperties; 
    timestamp: Date; 
    snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
    data: BaseData;
    delegate: SnapshotWithCriteria<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]; 
  }> {
    throw new Error("Function not implemented.");
  },
  addSnapshotFailure: function (snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, 
    snapshotId: string, 
    data: Map<string, Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>>, events: Record<string, CalendarEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]>, dataItems: RealtimeDataItem<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[], newData: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: ConfigureSnapshotStorePayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void): void | null {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: { error: Error; }): Promise<void> {
    throw new Error("Function not implemented.");
  },
  createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: { error: Error; }): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshotManager: SnapshotManager<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, payload: CreateSnapshotsPayload<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, callback: (snapshots: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[]) => void | null, snapshotDataConfig?: SnapshotConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | undefined, category?: string | symbol | Category): Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>[] | null {
    throw new Error("Function not implemented.");
  },
  onSnapshot: function (snapshotId: string, snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, type: string, event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, callback: (snapshot: Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void): void {
    throw new Error("Function not implemented.");
  },
  onSnapshots: function (snapshotId: string, snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, type: string, event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, callback: (snapshots: Snapshots<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>) => void): void {
    throw new Error("Function not implemented.");
  },
  label: undefined,
  events: undefined,
  handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: SnapshotEvent<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | undefined): Promise<Snapshot<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> | null> {
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