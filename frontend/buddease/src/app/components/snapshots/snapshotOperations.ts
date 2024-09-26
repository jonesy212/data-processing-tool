// snapshotOperations.ts
// import { getSnapshot } from "@/app/api/SnapshotApi"
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder"

import { Data } from "../models/data/Data"
import { SnapshotContainer, SnapshotOperation, SubscriberCollection } from "."
import { SnapshotManager } from "../hooks/useSnapshotManager"
import { Category } from "../libraries/categories/generateCategoryProperties"
import { BaseData } from "../models/data/Data"
import { RealtimeDataItem } from "../models/realtime/RealtimeData"
import CalendarManagerStoreClass from "../state/stores/CalendarEvent"
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore"
import { SnapshotItem } from "./SnapshotList"
import SnapshotStore from "./SnapshotStore"
import { SnapshotStoreConfig } from "./SnapshotStoreConfig"
import { Subscriber } from "../users/Subscriber"
import { CriteriaType } from "@/app/pages/searchs/CriteriaType"
import Version from "../versions/Version"
import { convertSnapshotContainerToStore } from "../typings/YourSpecificSnapshotType"
import { createVersionInfo } from "../versions/createVersionInfo"
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore"



export const getParentId = (snapshot: Snapshot<Data, BaseData>): string | null => {
    return snapshot.parentId || null;
};
export const getChildIds = (childSnapshot: Snapshot<Data, BaseData>): string[] => {
    return childSnapshot.childIds || [];
};

export const clearSnapshotFailure = (): unknown => {
    return { success: true };
};

export const mapSnapshots = async (
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<Data, BaseData>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<Data, BaseData>,
    data: Data,
    callback: (
        storeIds: number[],
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<Data, BaseData>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<Data, BaseData>,
        data: Data,
        index: number
    ) => SnapshotUnion<Data>
): Promise<SnapshotsArray<Data>> => {
    const snapshotsArray: SnapshotsArray<Data> = [];

    for (let i = 0; i < storeIds.length; i++) {
        const snapshotObject = callback(
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
            data,
            i
        );
        snapshotsArray.push(snapshotObject);
    }

    return snapshotsArray;
};


export const getSnapshotById = (
    fetchSnapshot: (id: string) => Promise<{
        category: Category;
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshotStore: SnapshotStore<Data, BaseData>;
        data: Data;
    } | undefined>,
    id: string,
    snapshotProvider: (data: {
        id: string | number | undefined;
        category: Category;
        timestamp: string | number | Date | undefined;
        snapshotStore: SnapshotStore<Data, BaseData>;
        data: Data;
    }) => Snapshot<Data, BaseData> // This provider generates Snapshot instances
): Promise<Snapshot<Data, BaseData> | null> => {
    // Ensure fetchSnapshot is defined
    if (!fetchSnapshot) {
        console.error("fetchSnapshot is undefined");
        return Promise.resolve(null); // Return null immediately
    }

    return fetchSnapshot(id)
        .then(snapshotData => {
            // Check if snapshotData is defined and properly typed
            if (!snapshotData) return null;

            // Check that snapshotProvider is a valid function
            if (typeof snapshotProvider !== 'function') {
                console.error("snapshotProvider is not a function");
                return null;
            }

            // Use the snapshotProvider to create a Snapshot instance
            return snapshotProvider({
                id: snapshotData.id,
                category: snapshotData.category,
                timestamp: snapshotData.timestamp,
                snapshotStore: snapshotData.snapshotStore,
                data: snapshotData.data,
            });
        })
        .catch(error => {
            console.error("Error fetching snapshot:", error);
            return null;
        });
};


export const handleSnapshot = (
    id: string,
    snapshotId: string,
    snapshot: Data | null,
    snapshotData: Data,
    category: Category | undefined,
    callback: (snapshot: Data) => void,
    snapshots: SnapshotsArray<any>,
    type: string,
    event: Event,
    snapshotContainer?: SnapshotContainer<Data, BaseData> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<Data, BaseData> | null
): Promise<Snapshot<Data, BaseData> | null> => {

    try {
        if (snapshot) {
            callback(snapshot);
        }

        // Ensure snapshotStore is a SnapshotStore<Data, BaseData>
        let snapshotStore: SnapshotStore<Data, BaseData>;

        if (snapshotContainer) {
            // Ensure snapshotContainer is of the correct type, otherwise use a default instance
            snapshotStore = convertSnapshotContainerToStore(snapshotContainer);

        } else if (snapshotStoreConfig && snapshotStoreConfig.config !== null) {
            const versionInfo = createVersionInfo(snapshotStoreConfig.version || '0.0.0');

            // Create a new SnapshotStore with provided configuration
            snapshotStore = new SnapshotStore<Data, BaseData>(
                snapshotStoreConfig.storeId,
                snapshotStoreConfig.name || '',
                versionInfo,
                snapshotStoreConfig.schema,
                snapshotStoreConfig.options,
                snapshotStoreConfig.category,
                snapshotStoreConfig.config,
                snapshotStoreConfig.operation
            );
        } else {
            // Fallback to a default or empty instance
            snapshotStore = new SnapshotStore<Data, BaseData>(
                0,
                '',
                createVersionInfo('0.0.0'),
                {},
                {},
                undefined,
                {} as SnapshotStoreConfig<Data, BaseData>,
                {} as SnapshotOperation
            );
        }

        // Create an object that conforms to the Snapshot interface
        const processedSnapshot: Snapshot<Data, BaseData> = {
            id,
            category: category ?? undefined,
            timestamp: new Date(),
            snapshotStore,
            data: snapshotData,
            initialState: snapshotData,
            isCore: false,
            initialConfig: "",
            removeSubscriber: () => {},
            onInitialize: () => {},
            onError: () => {},
            taskIdToAssign: "",
            schema: {},
            currentCategory: "",
            mappedSnapshotData: new Map(),
            applyStoreConfig: () => {},
            generateId: () => "",
            snapshotData: (id: string, snapshotData: Data,
                category: Category | undefined, categoryProperties: CategoryProperties | undefined,
                dataStoreMethods: DataStore<Data, BaseData>
            ): Promise<SnapshotStore<Data, BaseData>> => { 
                return Promise.resolve(snapshotStore);
            },
            getSnapshotItems: () => [],

            snapshot: (
                id, 
                snapshotId, 
                snapshotData, 
                category, 
                categoryProperties, 
                callback, 
                dataStoreMethods,
                snapshotStoreConfigData, 
                snapshotContainer
            ) => {
                // Check if all required parameters are provided
                if (!id || !snapshotId || !snapshotData || !category) {
                    throw new Error('Required parameters missing');
                }
        
                // Process the snapshot data, this could include fetching data from the store
                const snapshot = {
                    id: id.toString(),
                    snapshotId: snapshotId,
                    data: snapshotData,
                    category,
                    properties: categoryProperties || {}, // Use default empty object if properties are undefined
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
        
                // Store the snapshot using the callback method (or do something else with the snapshot)
                if (callback) {
                    callback({ 
                        snapshot: snapshot, 
                        dataStoreMethods, 
                        snapshotStoreConfigData 
                    });
                }
        
                // Return the newly created snapshot
                return Promise.resolve({
                    snapshot: snapshot
                });
            },
            setCategory: (category: Category) => {
                if (!category) {
                    throw new Error('Category is required to set');
                }
        
                // Logic to update the category
                processedSnapshot.category = category;
        
                // Update any other references related to the category if needed
                console.log('Category set to:', category);
        
                // Optionally, trigger some update or callback after setting the category
            },

        };

        return Promise.resolve(processedSnapshot);
    } catch (error) {
        return Promise.resolve(null);
    }
}


export const validateSnapshot = (snapshot: Snapshot<Data, BaseData>): boolean => {
    return snapshot.id !== undefined && snapshot.data !== undefined;
}



export const getSnapshot = (snapshot: (id: string) => Promise<{
    category: any; timestamp: any;
    id: any; snapshot: Snapshot<Data, BaseData>;
    data: Data;
}> | undefined
): Promise<Snapshot<Data, BaseData>> => {
    throw new Error("Function not implemented.");
},


export const takeSnapshot = async (
    snapshot: Snapshot<Data, BaseData>,
    subscribers: Subscriber<Data, BaseData>[]
): Promise<{ snapshot: Snapshot<Data, BaseData>; }> => {
    subscribers.forEach(subscriber => {
        subscriber.update(snapshot);
    });

    return { snapshot };
};
export const removeSnapshot = (snapshotToRemove: SnapshotStore<Data, BaseData>): void => {
    snapshotToRemove.clearSnapshot();
};

export const updateSnapshot = (
    snapshotId: string,
    data: Map<string, Snapshot<Data, BaseData>>,
    events: Record<string, CalendarManagerStoreClass<Data, BaseData>[]>,
    snapshotStore: SnapshotStore<Data, BaseData>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<Data, BaseData>,
    payload: UpdateSnapshotPayload<Data>,
    store: SnapshotStore<any, BaseData> // Ensure the correct type here
): Promise<{ snapshot: Snapshot<any, Data>; }> => {
    return store.updateSnapshot(
        snapshotId,
        data,
        events,
        snapshotStore,
        dataItems,
        newData,
        payload,
        store
    );
};

export const getSnapshots = (category: string, data: Snapshots<Data>): Snapshots<Data> => {
    return Array.isArray(data) ? data.filter(snapshot => snapshot.category === category) : [];
};

export const getSnapshotItems = async (
    category: symbol | string | Category | undefined,
    snapshots: SnapshotsArray<Data>
): Promise<{ snapshots: SnapshotItem<Data, BaseData>[]; }> => {
    const snapshotItems = snapshots.filter(snapshot => snapshot.category === category);
    return { snapshots: snapshotItems };
};




export const getSnapshotContainer = <T extends Data, K extends BaseData>(
    id: string | number,
    snapshotFetcher: (id: string | number) => Promise<{
        category: string;
        timestamp: string;
        id: string;
        snapshotStore: SnapshotStore<T, K>;
        snapshot: Snapshot<T, K>;
        snapshots: Snapshots<Data>;
        subscribers: Subscriber<T, K>[];
        data: Data;
        newData: Data;
        unsubscribe: () => void;
        addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
        createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
        createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
        updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
        batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
        batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
        batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data>) => void;
        createSnapshots: (snapshots: Snapshots<Data>) => void;
        batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
        batchTakeSnapshotsRequest: (snapshots: Snapshots<Data>) => void;
        deleteSnapshot: (id: string) => void;
        batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data>>;
        batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
        batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
        filterSnapshotsByStatus: (status: string) => Snapshots<Data>;
        getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
        removeSnapshot: (id: string) => void;
        removeSnapshots: (ids: string[]) => void;
        removeSnapshotsSuccess: (ids: string[]) => void;
        removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
        resetSnapshotData: () => void;
        // New Methods
        mapSnapshot: (snapshot: Snapshot<T, K>) => any;
        mapSnapshotWithDetails: (snapshot: Snapshot<T, K>) => any;
        removeStore: (id: string) => void;
        fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
        fetchSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
        updateSnapshotFailure: (snapshot: Snapshot<T, K>, error: Error) => void;
        fetchSnapshotFailure: (id: string, error: Error) => void;
        configureSnapshotStore: (options: any) => void;
        onSnapshot: (snapshot: Snapshot<T, K>) => void;
        onSnapshots: (snapshots: Snapshots<Data>) => void;
        getSnapshotStore: (storeId: number,
            snapshotContainer: SnapshotContainer<T, K>,
            criteria: CriteriaType
        ) => Promise<SnapshotStore<T, K>>
        events: any[];
        parentId: string;
        childIds: string[];
        getParentId: () => string;
        getChildIds: () => string[];
        addChild: (id: string) => void;
        removeChild: (id: string) => void;
        getChildren: () => string[];
        hasChildren: (id: string) => boolean;
        isDescendantOf: (id: string) => boolean;
        getSnapshotById: (id: string) => Snapshot<T, K> | undefined;
        mappedSnapshotData: any;
        snapshotData: any;
        currentCategory: string;
        setSnapshotCategory: (category: string) => void;
        getSnapshotCategory: () => string;
        config: any;
        getSnapshotData: () => Data;
        isCore: boolean;
        notify: () => void;
        notifySubscribers: () => void;
        getSnapshots: () => Snapshots<Data>;
        getAllSnapshots: () => Snapshots<Data>;
        generateId: () => string;
        compareSnapshots: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => number;
        compareSnapshotItems: (item1: any, item2: any) => number;
        filterSnapshotsByCategory: (category: string) => Snapshots<Data>;
        filterSnapshotsByTag: (tag: string) => Snapshots<Data>;
        handleSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
        getSnapshotId: (snapshot: Snapshot<T, K>) => string;
        compareSnapshotState: (state1: any, state2: any) => number;
        payload: any;
        dataItems: any[];
        getInitialState: () => any;
        getConfigOption: (option: string) => any;
        getTimestamp: () => string;
        getStores: () => any[];
        getData: () => Data;
        setData: (data: Data) => void;
        addData: (data: Data) => void;
        stores: any[];
        getStore: (id: string) => any | undefined;
        addStore: (storId: number) => SnapshotStore<T, K>
    }>
): Promise<{
    category: string;
    timestamp: string;
    id: string;
    snapshotStore: SnapshotStore<T, K>;
    snapshot: Snapshot<T, K>;
    snapshots: Snapshots<Data>;
    subscribers: Subscriber<T, K>[];
    data: Data;
    newData: Data;

    unsubscribe: () => void;
    addSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    createSnapshotFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    updateSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
    batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data>) => void;
    createSnapshots: (snapshots: Snapshots<Data>) => void;
    batchTakeSnapshot: (snapshot: Snapshot<T, K>) => void;
    batchTakeSnapshotsRequest: (snapshots: Snapshots<Data>) => void;
    deleteSnapshot: (id: string) => void;
    batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data>>;
    batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data>) => void;
    batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    filterSnapshotsByStatus: (status: string) => Snapshots<Data>;
    getSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    removeSnapshot: (id: string) => void;
    removeSnapshots: (ids: string[]) => void;
    removeSnapshotsSuccess: (ids: string[]) => void;
    removeSnapshotsFailure: (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error }) => void;
    resetSnapshotData: () => void;
    // New Methods
    mapSnapshot: (snapshot: Snapshot<T, K>) => any;
    mapSnapshotWithDetails: (snapshot: Snapshot<T, K>) => any;
    removeStore: (id: string) => void;
    fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
    fetchSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    updateSnapshotFailure: (snapshot: Snapshot<T, K>, error: Error) => void;
    fetchSnapshotFailure: (id: string, error: Error) => void;
    configureSnapshotStore: (options: any) => void;
    onSnapshot: (snapshot: Snapshot<T, K>) => void;
    onSnapshots: (snapshots: Snapshots<Data>) => void;
    events: any[];
    parentId: string;
    childIds: string[];
    getParentId: () => string;
    getChildIds: () => string[];
    addChild: (id: string) => void;
    removeChild: (id: string) => void;
    getChildren: () => string[];
    hasChildren: (id: string) => boolean;
    isDescendantOf: (id: string) => boolean;
    getSnapshotById: (id: string) => Snapshot<T, K> | undefined;
    mappedSnapshotData: any;
    snapshotData: any;
    currentCategory: string;
    setSnapshotCategory: (category: string) => void;
    getSnapshotCategory: () => string;
    config: any;
    getSnapshotData: () => Data;
    isCore: boolean;
    notify: () => void;
    notifySubscribers: () => void;
    getSnapshots: () => Snapshots<Data>;
    getAllSnapshots: () => Snapshots<Data>;
    generateId: () => string;
    compareSnapshots: (snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>) => number;
    compareSnapshotItems: (item1: any, item2: any) => number;
    filterSnapshotsByCategory: (category: string) => Snapshots<Data>;
    filterSnapshotsByTag: (tag: string) => Snapshots<Data>;
    handleSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;
    getSnapshotId: (snapshot: Snapshot<T, K>) => string;
    compareSnapshotState: (state1: any, state2: any) => number;
    payload: any;
    dataItems: any[];
    getInitialState: () => any;
    getConfigOption: (option: string) => any;
    getTimestamp: () => string;
    getStores: () => any[];
    getData: () => Data;
    setData: (data: Data) => void;
    addData: (data: Data) => void;
    stores: any[];
    getStore: (id: string) => any | undefined;
    addStore: (storeId: number) => SnapshotStore<T, K>
}> => {
    // Your implementation here
    return snapshotFetcher(id).then(snapshotContainer => {
        return {

            // Snapshot Management
            mapSnapshot: snapshotContainer.mapSnapshot,
            mapSnapshotWithDetails: snapshotContainer.mapSnapshotWithDetails,
            fetchSnapshot: snapshotContainer.fetchSnapshot,
            fetchSnapshotSuccess: snapshotContainer.fetchSnapshotSuccess,
            updateSnapshotFailure: snapshotContainer.updateSnapshotFailure,
            fetchSnapshotFailure: snapshotContainer.fetchSnapshotFailure,
            configureSnapshotStore: snapshotContainer.configureSnapshotStore,
            createSnapshotSuccess: snapshotContainer.createSnapshotSuccess,
            createSnapshotFailure: snapshotContainer.createSnapshotFailure,
            updateSnapshotSuccess: snapshotContainer.updateSnapshotSuccess,
            batchUpdateSnapshotsSuccess: snapshotContainer.batchUpdateSnapshotsSuccess,
            batchUpdateSnapshotsFailure: snapshotContainer.batchUpdateSnapshotsFailure,
            batchUpdateSnapshotsRequest: snapshotContainer.batchUpdateSnapshotsRequest,
            createSnapshots: snapshotContainer.createSnapshots,
            batchTakeSnapshot: snapshotContainer.batchTakeSnapshot,
            batchTakeSnapshotsRequest: snapshotContainer.batchTakeSnapshotsRequest,
            deleteSnapshot: snapshotContainer.deleteSnapshot,
            batchFetchSnapshots: snapshotContainer.batchFetchSnapshots,
            batchFetchSnapshotsSuccess: snapshotContainer.batchFetchSnapshotsSuccess,
            batchFetchSnapshotsFailure: snapshotContainer.batchFetchSnapshotsFailure,
            removeSnapshot: snapshotContainer.removeSnapshot,
            removeSnapshots: snapshotContainer.removeSnapshots,
            removeSnapshotsSuccess: snapshotContainer.removeSnapshotsSuccess,
            removeSnapshotsFailure: snapshotContainer.removeSnapshotsFailure,
            resetSnapshotData: snapshotContainer.resetSnapshotData,
            getSnapshotSuccess: snapshotContainer.getSnapshotSuccess,
            addSnapshotFailure: snapshotContainer.addSnapshotFailure,
            getSnapshotId: snapshotContainer.getSnapshotId,
            getSnapshotById: snapshotContainer.getSnapshotById,
            getSnapshots: snapshotContainer.getSnapshots,
            getAllSnapshots: snapshotContainer.getAllSnapshots,
            generateId: snapshotContainer.generateId,
            handleSnapshotSuccess: snapshotContainer.handleSnapshotSuccess,

            // Snapshot Filtering and Comparison
            compareSnapshots: snapshotContainer.compareSnapshots,
            compareSnapshotItems: snapshotContainer.compareSnapshotItems,
            filterSnapshotsByCategory: snapshotContainer.filterSnapshotsByCategory,
            filterSnapshotsByTag: snapshotContainer.filterSnapshotsByTag,
            filterSnapshotsByStatus: snapshotContainer.filterSnapshotsByStatus,
            compareSnapshotState: snapshotContainer.compareSnapshotState,

            // Data Management
            getData: snapshotContainer.getData,
            setData: snapshotContainer.setData,
            addData: snapshotContainer.addData,
            getSnapshotData: snapshotContainer.getSnapshotData,
            payload: snapshotContainer.payload,
            dataItems: snapshotContainer.dataItems,
            getInitialState: snapshotContainer.getInitialState,
            getConfigOption: snapshotContainer.getConfigOption,
            getTimestamp: snapshotContainer.getTimestamp,


            // Store Management
            getStores: snapshotContainer.getStores,
            getStore: snapshotContainer.getStore,
            addStore: snapshotContainer.addStore,
            removeStore: snapshotContainer.removeStore,
            stores: snapshotContainer.stores,


            //  Snapshot Container Info
            id: snapshotContainer.id,
            category: snapshotContainer.category,
            snapshotStore: snapshotContainer.snapshotStore,
            data: snapshotContainer.data,
            newData: snapshotContainer.newData,
            snapshot: snapshotContainer.snapshot,
            snapshots: snapshotContainer.snapshots,
            timestamp: snapshotContainer.timestamp,
            subscribers: snapshotContainer.subscribers,
            unsubscribe: snapshotContainer.unsubscribe,
            events: snapshotContainer.events,
            parentId: snapshotContainer.parentId,
            childIds: snapshotContainer.childIds,
            getParentId: snapshotContainer.getParentId,
            getChildIds: snapshotContainer.getChildIds,
            addChild: snapshotContainer.addChild,
            removeChild: snapshotContainer.removeChild,
            getChildren: snapshotContainer.getChildren,
            hasChildren: snapshotContainer.hasChildren,
            isDescendantOf: snapshotContainer.isDescendantOf,
            mappedSnapshotData: snapshotContainer.mappedSnapshotData,
            snapshotData: snapshotContainer.snapshotData,
            currentCategory: snapshotContainer.currentCategory,
            setSnapshotCategory: snapshotContainer.setSnapshotCategory,
            getSnapshotCategory: snapshotContainer.getSnapshotCategory,
            config: snapshotContainer.config,
            isCore: snapshotContainer.isCore,
            notify: snapshotContainer.notify,
            notifySubscribers: snapshotContainer.notifySubscribers,
            onSnapshot: snapshotContainer.onSnapshot,
            onSnapshots: snapshotContainer.onSnapshots,
            getSnapshotStore: snapshotContainer.getSnapshotStore,
        };
    }).catch(error => {
        console.error("Error fetching snapshot container:", error);
        throw error; // Optionally handle or rethrow the error
    });
};

export const configureSnapshot = <T extends Data, K extends BaseData>(
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: ((snapshot: Snapshot<T, K>) => void) | undefined,
    snapshotDataStore?: SnapshotStore<T, K> | undefined,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K> | undefined,
    subscribers?: SubscriberCollection<T, K> | undefined // Added this as an argument
): Snapshot<T, K> | null => {
    // Validate required parameters
    if (!id || !snapshotData) {
        console.error("Invalid ID or SnapshotData");
        return null;
    }

    // Step 1: Handle category assignment
    if (category) {
        if (typeof category === "string") {
            snapshotData.category = category;
        } else if (typeof category === "object") {
            snapshotData.category = category.name; // Assuming category object has a name property
        }
    }

    // Step 2: Configure snapshot store if provided
    if (snapshotDataStore && snapshotStoreConfig) {
        try {
            // Add snapshot to the store with snapshotId and subscribers
            snapshotDataStore.addSnapshot(snapshotData, id, subscribers);
        } catch (error) {
            console.error("Failed to add snapshot to store:", error);
            return null;
        }
    }

    // Step 3: Execute callback if provided
    if (callback) {
        try {
            callback(snapshotData);
        } catch (error) {
            console.error("Callback execution failed:", error);
        }
    }

    // Step 4: Return the configured snapshot
    return snapshotData;
};
