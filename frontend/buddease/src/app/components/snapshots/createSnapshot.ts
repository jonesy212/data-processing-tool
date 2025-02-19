import { BaseData } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { Snapshot, Result } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { InitializedData, InitializedDataStore, SnapshotStoreOptions } from "./SnapshotStoreOptions";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";

function createSnapshot<
  T extends BaseData<any>,
  K extends T = T
>(data: Partial<Snapshot<T, K>>): Snapshot<T, K> {
  return {
    id: data.id || Math.floor(Math.random() * 100000000000000000).toString(),
    title: data.title || "",
    description: data.description || "",
    status: data.status || StatusType.Pending,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    dataStores: data.dataStores || [],
    getConfig: data.getConfig || (() => null),
    get: data.get || (() => undefined), // or return a specific value of CoreSnapshot if needed
    // Assuming 'type' is a part of Snapshot interface
    type: data.type || "default", // Example default value, adjust accordingly.
    category: data.category || "", // Example default value, adjust accordingly.
    subCategory: data.subCategory || "", // Example default value, adjust accordingly.
    tags: data.tags || [], // Example default value, adjust accordingly.
    priority: data.priority || 0, // Example default value, adjust accordingly.
    createdBy: data.createdBy || "unknown", // Example default value, adjust accordingly.
    updatedBy: data.updatedBy || "unknown", // Example default value, adjust accordingly.
    archived: data.archived || false, // Example default value, adjust accordingly.
    version: data.version || "1.0", // Example default value, adjust accordingly.
    isActive: data.isActive || true, // Example default value, adjust accordingly.
    lastAccessed: data.lastAccessed || new Date(), // Example default value, adjust accordingly.
    permissions: data.permissions || [], // Example default value, adjust accordingly.
    dataObject: data.dataObject ?? null,
    deleted: data.deleted ?? false,
    initialState: data.initialState ?? {},
    isCore: data.isCore ?? false,
    initialConfig: data.initialConfig ?? {},
    properties: data.properties ?? undefined,
    snapshotsArray: data.snapshotsArray ?? [],
    snapshotsObject: data.snapshotsObject ?? {},
    recentActivity: data.recentActivity ?? [],
    onInitialize: data.onInitialize ?? (() => {}),
    onError: data.onError ?? null,
    categories: data.categories ?? [],
    taskIdToAssign: data.taskIdToAssign ?? undefined,
    schema: data.schema ?? {},
    currentCategory: data.currentCategory ?? { /* default category */ },
    mappedSnapshotData: data.mappedSnapshotData ?? new Map(),
    storeId: data.storeId ?? 0,
    versionInfo: data.versionInfo ?? null,
    initializedState: data.initializedState ?? {},
    criteria: data.criteria ?? undefined,
    relationships: data.relationships ?? new Map(),
    storeConfig: data.storeConfig ?? undefined,
    additionalData: data.additionalData ?? {},
    snapshot: data.snapshot ?? (() => null),
    setCategory: data.setCategory ?? (() => {}),
    applyStoreConfig: data.applyStoreConfig ?? (() => {}),
    generateId: data.generateId ?? (() => ''),
    snapshotData: data.snapshotData ?? (() => Promise.resolve({} as SnapshotDataType<T, K>)),
    snapshotStoreConfig: data.snapshotStoreConfig ?? undefined,
    snapshotStoreConfigSearch: data.snapshotStoreConfigSearch ?? null,
    snapshotContainer: data.snapshotContainer ?? null,
    getSnapshotItems: data.getSnapshotItems ?? (() => []),
    defaultSubscribeToSnapshots: data.defaultSubscribeToSnapshots ?? (() => {}),
    getAllSnapshots: data.getAllSnapshots ?? (() => Promise.resolve([])),
    transformDelegate: data.transformDelegate ?? undefined,
    getAllKeys: data.getAllKeys ?? (() => Promise.resolve([])),
    getAllValues: data.getAllValues ?? (() => []),
    getAllItems: data.getAllItems ?? (() => Promise.resolve([])),
    getSnapshotEntries: data.getSnapshotEntries ?? (() => new Map()),
    getAllSnapshotEntries: data.getAllSnapshotEntries ?? (() => []),
    addDataStatus: data.addDataStatus ?? (() => {}),
    removeData: data.removeData ?? (() => {}),
    updateData: data.updateData ?? (() => {}),
    updateDataTitle: data.updateDataTitle ?? (() => {}),
    updateDataDescription: data.updateDataDescription ?? (() => {}),
    updateDataStatus: data.updateDataStatus ?? (() => {}),
    addDataSuccess: data.addDataSuccess ?? (() => {}),
    getDataVersions: data.getDataVersions ?? (() => Promise.resolve([])),
    updateDataVersions: data.updateDataVersions ?? (() => {}),
    getBackendVersion: data.getBackendVersion ?? (() => Promise.resolve('')),
    getFrontendVersion: data.getFrontendVersion ?? (() => Promise.resolve(undefined)),
    fetchStoreData: data.fetchStoreData ?? (() => Promise.resolve([])),
    fetchData: data.fetchData ?? ((endpoint: string, id: number) => Promise.resolve({} as SnapshotStore<T, K, StructuredMetadata<T, K>, never>>)),
    defaultSubscribeToSnapshot: data.defaultSubscribeToSnapshot ?? (() => ''),
    handleSubscribeToSnapshot: data.handleSubscribeToSnapshot ?? (() => {}),
    removeItem: data.removeItem ?? (() => Promise.resolve()),
    getSnapshot: data.getSnapshot ?? (() => Promise.resolve(undefined)),
    getSnapshotSuccess: data.getSnapshotSuccess ?? (() => Promise.resolve({} as SnapshotStore<T, K, StructuredMetadata<T, K>, never>)),
    setItem: data.setItem ?? (() => Promise.resolve()),
    getItem: data.getItem ?? (() => Promise.resolve(undefined)),
    getDataStore: data.getDataStore ?? (() => Promise.resolve({} as InitializedDataStore<T>)),
    getDataStoreMap: data.getDataStoreMap ?? (() => Promise.resolve(new Map())),
    addSnapshotSuccess: data.addSnapshotSuccess ?? (() => {}),
    deepCompare: data.deepCompare ?? (() => false),
    shallowCompare: data.shallowCompare ?? (() => false),
    getDataStoreMethods: data.getDataStoreMethods ?? (() =>Promise.resolve({} as DataStoreMethods<T, K, StructuredMetadata<T, K>>)),
    getDelegate: data.getDelegate ?? (() => Promise.resolve([])),
    determineCategory: data.determineCategory ?? (() => ''),
    determinePrefix: data.determinePrefix ?? (() => ''),
    removeSnapshot: data.removeSnapshot ?? (() => {}),
    addSnapshotItem: data.addSnapshotItem ?? (() => {}),
    addNestedStore: data.addNestedStore ?? (() => {}),
    clearSnapshots: data.clearSnapshots ?? (() => {}),
    addSnapshot: data.addSnapshot ?? (() => Promise.resolve(undefined)),
    emit: data.emit ?? (() => {}),
    createSnapshot: data.createSnapshot ?? (() => null),
    createInitSnapshot: data.createInitSnapshot ?? (() => Promise.resolve({} as Result<Snapshot<T, K, never, never>>)),
    addStoreConfig: data.addStoreConfig ?? (() => {}),
    handleSnapshotConfig: data.handleSnapshotConfig ?? (() => {}),
    getSnapshotConfig: data.getSnapshotConfig ?? (() => {}),



    getSnapshotListByCriteria: data.getSnapshotListByCriteria ?? (() => {}),
    setSnapshotSuccess: data.setSnapshotSuccess ?? (() => {}),
    setSnapshotFailure: data.setSnapshotFailure ?? (() => {}),
    updateSnapshots: data.updateSnapshots ?? (() => {}),
   

  } as Snapshot<T, K>;
}

  
  
  export { createSnapshot }