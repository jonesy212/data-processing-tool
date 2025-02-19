import { fetchSnapshotById } from "@/app/api/SnapshotApi";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { endpoints } from "../../api/endpointConfigurations";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { displayToast } from "../models/display/ShowToast";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, EventRecord, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { Subscription } from "../subscriptions/Subscription";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { convertSnapshotsObjectToArray } from './createSnapshotStoreOptions';
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { CustomSnapshotData, SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import {
	InitializedDelegate,
	MetaDataOptions,
	SnapshotStoreOptions
} from "./SnapshotStoreOptions";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback, MultipleEventsCallbacks } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreProps } from "./useSnapshotStore";




// createOptions.ts
function createOptions<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(params: {
  id: string;
	storeId: number;
	baseURL: string;
	enabled: boolean;
	maxRetries: number;
	retryDelay: number;
	maxAge: number;
	staleWhileRevalidate: number;
	metadata: MetaDataOptions<T>
	criteria: CriteriaType;
	cacheKey: string;
	callbacks: MultipleEventsCallbacks<Snapshot<T, K>>;
	
  delegate: InitializedDelegate<T, K> | null 
  eventRecords: Record<string, EventRecord<T, K>[]> | null; // Store events and their callbacks
	initialState: SnapshotStore<T, K> | null;
	date: string | Date;
	snapshotId: string;
	category: CategoryProperties;
	dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
	snapshotMethods?: SnapshotStoreMethod<T, K>[]; // Make this optional
	type?: string; // Optional, adjust as needed
	snapshotConfig?: any; // Optional, adjust as needed
	subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,    
    snapshotConfig: SnapshotStoreConfig<T, K>,
	callback: (
		snapshotStore: SnapshotStore<T, K>, 
		snapshots: SnapshotsArray<T, K>
	) => Subscriber<T, K> | null,
	snapshots: SnapshotsArray<T, K>,
    unsubscribe?: UnsubscribeDetails, 
  ) => SnapshotsArray<T, K> | []
  
	subscribeToSnapshot: (
		snapshotId: string,
		callback: Callback<Snapshot<T, K>>,
		snapshot: Snapshot<T, K>
  ) => Subscriber<T, K> | null;
  
	handleSnapshotStoreOperation: (
		snapshotId: string,
		snapshotStore: SnapshotStore<T, K>,
		snapshot: Snapshot<T, K>,
		operation: SnapshotOperation<T, K>,
		operationType: SnapshotOperationType,
		callback: (snapshotStore: SnapshotStore<T, K>) => void,
	) => Promise<SnapshotStoreConfig<T, K> | null>;
	
	getCategory: (
		snapshotId: string,
		snapshot: Snapshot<T, K>,
		type: string,
		event: Event,
		snapshotConfig: SnapshotConfig<T, K>,
		additionalHeaders?: Record<string, string>
	  ) => Promise<{ snapshots: Snapshot<T, K>[]; categoryProperties?: CategoryProperties }>;
	
	useSimulatedDataSource: boolean;
	simulatedDataSource: SnapshotStoreConfig<T, K>[];
	snapshotStoreConfig: SnapshotStoreConfig<T, K>;
	unsubscribeToSnapshots: (
		snapshotId: string,
		snapshot: Snapshot<T, K>,
		type: string,
		event: Event,
		callback: (snapshot: Snapshot<T, K>) => void
	) => void;
	unsubscribeToSnapshot: (
		snapshotId: string,
		snapshot: Snapshot<T, K>,
		type: string,
		event: Event,
		callback: (snapshot: Snapshot<T, K>) => void
	) => void;

	getSnapshotConfig: (
    	id: string | number,
		snapshotId: string | null,
		criteria: CriteriaType,
		category: symbol | string | Category | undefined,
		categoryProperties: CategoryProperties | undefined,
    	subscriberId: string | undefined,
		delegate: SnapshotWithCriteria<T, K>[],
		snapshotData: SnapshotData<T, K>,
		snapshot: (
			id: string | number | undefined,
			snapshotId: string | null,
			snapshotData: SnapshotData<T, K>,
			category: symbol | string | Category | undefined,
			categoryProperties: CategoryProperties,
			callback: (snapshotStore: SnapshotStore<T, K> | null) => void,
			dataStore: DataStore<T, K>,
			dataStoreMethods: DataStoreMethods<T, K>,
			// dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
			metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
			subscriberId: string, // Add subscriberId here
			endpointCategory: string | number,// Add endpointCategory here
			storeProps: SnapshotStoreProps<T, K>,
			snapshotConfigData: SnapshotConfig<T, K>,
			subscription: Subscription<T, K>,
			snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
			snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
		) => Promise<Snapshot<T, K>>,
		data: Map<string, Snapshot<T, K>>,
		events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
		dataItems: RealtimeDataItem[], // Added prop
		newData: Snapshot<T, K>, // Added prop
		payload: ConfigureSnapshotStorePayload<T, K>, // Added prop
		store: SnapshotStore<T, K>, // Added prop
		callback: (snapshot: SnapshotStore<T, K>) => void, // Added prop
		storeProps: SnapshotStoreProps<T, K>,
		endpointCategory: string | number,
		snapshotContainer: Promise<SnapshotContainer<T, K>>,
	) => SnapshotConfig<T, K> 
	
	initSnapshot: (
		snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
		snapshotId: string | null,
		snapshotData: SnapshotData<T, K>,
		category: symbol | string | Category | undefined,
		snapshotConfig: SnapshotStoreConfig<T, K>,
		callback: (snapshotStore: SnapshotStore<T, K>) => void
	) => void,


	createSnapshot: (
		id: string,
		snapshotData: SnapshotData<T, K>,
		category?: string | symbol | Category,
		callback?: (snapshot: Snapshot<T, K>) => void,
		snapshotData?: SnapshotStore<T, K>,
		snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> 
	) => Snapshot<T, K> | null,

	createSnapshotStore: (
		id: string,
		snapshotId: number,
		snapshotStoreData: Snapshots<T, K>,
		category?: string | symbol | Category,
		callback?: (snapshotStore: SnapshotStore<T, K>) => void,
		snapshotDataConfig?: SnapshotStoreConfig<T, K>[]
	) => SnapshotStore<T, K> | null,

	configureSnapshot: (
		id: string,
		storeId: number
		snapshotId: string,
		dataStoreMethods: DataStore<T, K>,
		category?: string | symbol | Category,
		categoryProperties?: CategoryProperties | undefined,
		callback?: (snapshot: Snapshot<T, K>) => void,
		snapshotData?: SnapshotStore<T, K>,
		snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> 
	) => SnapshotConfig<T, K> | undefined,

	getDelegate: (
		context: {
			useSimulatedDataSource: boolean;
			simulatedDataSource: SnapshotStoreConfig<T, K>[];
		}) => DataStore<T, K>[];

	getDataStoreMethods: (
		snapshotStoreConfig: SnapshotStoreConfig<T, K>[],
		dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
		) => Partial<DataStoreWithSnapshotMethods<T, K>>;
	}): Promise<SnapshotStoreOptions<T, K>> {
	return new Promise<SnapshotStoreOptions<T, K>>((resolve, reject) => {
		const {
			id,
			storeId,
			baseURL,
			enabled,
			maxRetries,
			retryDelay,
			maxAge,
			staleWhileRevalidate,
			metadata,
			criteria,
			callbacks,
			cacheKey,
			initialState,
			date,
			snapshotId,
			category,
			dataStoreMethods,
			snapshotMethods,
			type,
			snapshotConfig,
			subscribeToSnapshots,
			handleSnapshotStoreOperation,
			subscribeToSnapshot,
			delegate,
			eventRecords,
			getCategory,
			useSimulatedDataSource,
			simulatedDataSource,
			snapshotStoreConfig,
			unsubscribeToSnapshots,
			unsubscribeToSnapshot,
			getSnapshotConfig,
			getDelegate,
			getDataStoreMethods,
		} = params;

		const {
			isAutoDismiss,
			isAutoDismissable,
			isAutoDismissOnNavigation,
			isAutoDismissOnAction,
			isAutoDismissOnTimeout,
			isAutoDismissOnTap,
			isClickable,
			isClosable,
			optionalData,
     	data,
      configureSnap,
			records,
			initSnapshot,
			createSnapshot,
			createSnapshotStore,
			configureSnapshot,
			configureSnapshotStore
		} = snapshotConfig || {};

		const options: SnapshotStoreOptions<T, K> = {
			id,
			storeId,
			baseURL,
			enabled,
			maxRetries,
			retryDelay,
			maxAge,
			staleWhileRevalidate,
			metadata,
			criteria,
			callbacks,
			cacheKey,
			initialState,
			date,
			snapshotId,
			category,
			data,
			dataStoreMethods: dataStoreMethods || {}, // Ensure non-null value
			snapshotMethods,
			type,
			snapshotConfig,
			subscribeToSnapshots,
			subscribeToSnapshot,
			delegate,
			useSimulatedDataSource,
			simulatedDataSource,
			isAutoDismiss,
			isAutoDismissable,
			isAutoDismissOnNavigation,
			isAutoDismissOnAction,
			isAutoDismissOnTimeout,
			isAutoDismissOnTap,
			isClickable,
			isClosable,
			optionalData,
			snapshotStoreConfig,
      		configureSnap,
			unsubscribeToSnapshots,
			unsubscribeToSnapshot,
			getSnapshotConfig,
      getDelegate: (context: {
        useSimulatedDataSource: boolean;
        simulatedDataSource: SnapshotStoreConfig<T, K>[];
      }): Promise<DataStore<T, K, StructuredMetadata<T, K>>[]> => {
        return Promise.resolve(getDelegate(context));
      },
			getDataStoreMethods,
			handleSnapshotOperation,
			handleSnapshotStoreOperation,
			displayToast,
			addToSnapshotList,
			eventRecords,
			getCategory,
      records, initSnapshot, createSnapshot, createSnapshotStore,
      configureSnapshot, configureSnapshotStore
		};


    const dataStore = useDataStore()
		// Ensure default implementations for dataStoreMethods
    const defaultDataStoreMethods: DataStore<T, K> = {
      ...options, 
      ...params,
      ...dataStore,
			id: Math.floor(Math.random() * 100000000000000000).toString(), // Provide a default id
			metadata: {},
			data: new Map<string, Snapshot<T, K>>(),
			addData: async (
				data: Snapshot<T, K>,
				options?: {
					title?: string;
					description?: string;
					status?: StatusType | undefined;
				}
			) => {
        const newSnapshot: Snapshot<T, K> = createSnapshot({
          ...data,
          id: Math.floor(Math.random() * 100000000000000000).toString(),
          title: options?.title,
          description: options?.description,
          status: options?.status,
          createdAt: new Date(),
          updatedAt: new Date(),
          dataStores: options?.dataStores,
          getConfig: options?.getConfig,
          get: options?.get,
        });
        // Call initializeStores to properly set private #snapshotStores
        newSnapshot.initializeStores(options?.dataStores || []);

				// Store newSnapshot in dataStore
				defaultDataStoreMethods.data?.set(newSnapshot.id, newSnapshot);
			},
			getData: async (
				id: number,
				data: Snapshot<T, K> | Snapshot<T, CustomSnapshotData<T, K, Meta> & T>
			) => {
				// Default implementation
				return defaultDataStoreMethods.data?.get(id.toString());
			},
			getStoreData: async (id: number) => {
        // Check if dataStore is a Map
        if (defaultDataStoreMethods.dataStore instanceof Map) {
            // If it is a Map, return the value for the given id
            return defaultDataStoreMethods.dataStore.get(id.toString()) || null; // Return null if the key doesn't exist
        } 
        // Check if dataStore is an array
        else if (Array.isArray(defaultDataStoreMethods.dataStore)) {
            // Handle array case, return the specific item based on the id
            return defaultDataStoreMethods.dataStore.find(item => item.id === id) || null; // Return null if no item found
        } 
        // If dataStore is neither a Map nor an array, throw an error or handle the situation
        throw new Error("dataStore is not a recognized type (Map or Array).");
      },
    
			removeData: async (id: number) => {
				// Default implementation
				defaultDataStoreMethods.data?.delete(id.toString());
			},

			updateData: (id: number, data: Snapshot<T, K>) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (!snapshot) {
					throw new Error("Snapshot not found");
				}
				const updatedSnapshot: Snapshot<T, K> = {
					...snapshot,
					...data,
					updatedAt: new Date(),
				};
				defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				return updatedSnapshot;
      },
      
      updateStoreData: (data: Data<T>, id: number, newData: SnapshotStore<T, K>) => {
        let snapshot: SnapshotStore<T, K> | null = null;
    
        // Check if dataStore is a Map
        if (defaultDataStoreMethods.dataStore instanceof Map) {
            snapshot = defaultDataStoreMethods.dataStore.get(id.toString()) || null; // Return null if the key doesn't exist
        } 
        // Check if dataStore is an array
        else if (Array.isArray(defaultDataStoreMethods.dataStore)) {
            snapshot = defaultDataStoreMethods.dataStore.find(item => item.id === id) || null; // Return null if no item found
        } 
        // If dataStore is neither a Map nor an array, throw an error
        else {
            throw new Error("dataStore is not a recognized type (Map or Array).");
        }
    
        // Check if the snapshot was found
        if (!snapshot) {
            throw new Error("Snapshot not found");
        }
    
        // Update the snapshot
        const updatedSnapshotStore: SnapshotStore<T, K> = {
          id: snapshot.id,
          title: snapshot.title,
          description: snapshot.description,
          // Add every property explicitly
          ...data, // This will override any properties in the snapshot
          updatedAt: new Date(),
          name: "",
          version: version,
           
          snapshotStores: snapshot.getSnapshotStores().snapshotStores // Use the getter to access the private field
        };
    
        // Update the dataStore with the new snapshot
        if (defaultDataStoreMethods.dataStore instanceof Map) {
            defaultDataStoreMethods.dataStore.set(id.toString(), updatedSnapshotStore);
        } else if (Array.isArray(defaultDataStoreMethods.dataStore)) {
            // For an array, find the index of the snapshot and update it
            const index = defaultDataStoreMethods.dataStore.findIndex(item => item.id === id);
            if (index !== -1) {
                defaultDataStoreMethods.dataStore[index] = updatedSnapshotStore; // Update the snapshot at the found index
            } else {
                throw new Error("Snapshot index not found in the array.");
            }
        }
    
        return updatedSnapshotStore;
    },

			updateDataStatus: async (
				id: number,
				status: StatusType | undefined
			) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K> = {
						...snapshot,
						status,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			addDataStatus: async (
				id: number,
				status: StatusType | undefined
			) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K> = {
						...snapshot,
						status,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataTitle: async (id: number, title: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K> = {
						...snapshot,
						title,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataDescription: async (id: number, description: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K> = {
						...snapshot,
						description,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},

			getItem: async (key: T, id: number) => {
				return defaultDataStoreMethods.data?.get(key, id);
			},
			setItem: async (id: string, item: Snapshot<T, K>) => {
				defaultDataStoreMethods.data?.set(id, item);
			},
			removeItem: async (key: string) => {
				defaultDataStoreMethods.data?.delete(key);
			},
			getAllKeys: async () => Array.from(defaultDataStoreMethods.data?.keys() || []),
			getAllItems: async () => Array.from(defaultDataStoreMethods.data?.values() || []),
			getDataVersions: async (id: number) => undefined,
			updateDataVersions: async (id: number, versions: Snapshot<T, K>[]) => { },
			getBackendVersion: async () => "0.0.0",
			getFrontendVersion: async () => "0.0.0",
			addDataSuccess: async (payload: { data: Snapshot<T, K>[]; }) => { },
			getDelegate: async (context: {
				useSimulatedDataSource: boolean;
				simulatedDataSource: SnapshotStoreConfig<T, K>[];
			}): Promise<SnapshotStoreConfig<T, K>[]> => {
				if (context.useSimulatedDataSource) {
					return context.simulatedDataSource;
				}
				try {
					const API_URL = endpoints.filtering.fetch;
					if (typeof API_URL !== "string") {
						throw new Error("Invalid API URL");
					}
					const response = await axiosInstance.get<SnapshotStoreConfig<T, K>[]>(
						API_URL
					);
					if (response.status === 200) {
						return response.data;
					} else {
						throw new Error(
							`Failed to fetch delegates: ${response.statusText}`
						);
					}
				} catch (error) {
					console.error("Error fetching delegates from API:", error);
					throw error;
				}
			},
			updateDelegate: async (
				delegate: SnapshotStoreConfig<T, K>[]) => {
				try {
					const updatedDelegates = await Promise.all(
						delegate.map(async (item) => {
							await new Promise<void>((res) => setTimeout(res, 100));
							return { ...item, updatedAt: new Date() };
						})
					);
					return updatedDelegates;
				} catch (error) {
					console.error("Error updating delegates:", error);
					throw error;
				}
			},
			getSnapshot: (
				snapshot: (id: string) =>
					| Promise<{
					  category: Category | undefined;
					  categoryProperties: CategoryProperties;
					  timestamp: string | number | Date | undefined;
					  id: string | number | undefined;
					  snapshot: Snapshot<T, K>;
					  snapshotStore: SnapshotStore<T, K>;
					  data: T;
					  }>
					| undefined
			): Promise<Snapshot<T, K> | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						// Your logic for retrieving the snapshot, if any
						resolve(snapshot); // Returning the provided snapshot as per current logic
					} catch (error) {
						console.error("Error fetching snapshot:", error);
						reject(error);
					}
				});
			},

			
			getSnapshotContainer: (
				category: symbol | string | Category | undefined,
				timestamp: any,
				id: number
			): Promise<SnapshotContainer<T, K> | undefined> => {
				return new Promise<SnapshotContainer<T, K> | undefined>((resolve, reject) => {
				  console.log("Fetching snapshot container for ID:", id);
			
				try {
					fetchSnapshotById<T, K>(id.toString()) // Call the API function
					.then((snapshot) => {
						if (snapshot) {
							resolve(snapshot);
					} else {
						resolve(undefined);
						}
					})
					.catch((error) => {
						console.error("Error fetching snapshot container:", error);
						reject(error);
					});
				} catch (error) {
					console.error("Error in getSnapshotContainer:", error);
					reject(error);
				}
				});
			},

			mapSnapshot: (
				id: number
			): Promise<Snapshot<T, K> | null> => {
				return new Promise((resolve, reject) => {

					console.log("Mapping snapshot for ID:", id);
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<Snapshot<T, K> | undefined>((resolve) => {
							setTimeout(() => resolve(undefined), 1000);
						});
					} catch (error) {
						console.error("Error mapping snapshot:", error);
						throw error;
					}

				})
			},

			mapSnapshots: (
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
				data: T,
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
					data: K,
					index: number
				) => SnapshotsObject<T, K>
			): Promise<SnapshotsArray<T, K>> => {
				console.log("Mapping snapshots with category:", category, "timestamp:", timestamp, "ID:", id);

				// Create a promise that will resolve with the mapped snapshots
				return new Promise((resolve, reject) => {
					const snapshotsResult: SnapshotsObject<T, K> = {};
			
					try {
						// Use Promise.all to handle multiple asynchronous callbacks if necessary
						const promises = storeIds.map((storeId, index) => {
							return new Promise<SnapshotsObject<T, K>>((innerResolve) => {
								// Call the provided callback with the parameters
								const snapshots = callback(
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
									data as K,
									index // Use the current index from the loop
								);
			
								// Store the result for this storeId
                snapshotsResult[storeId] = snapshots as SnapshotUnion<T, T>; // Cast as needed
                innerResolve(snapshots);
							});
						});
			
						// Wait for all promises to resolve
						Promise.all(promises)
              .then(() => {
                // Use the convertSnapshotsObjectToArray to ensure compatibility
                resolve(convertSnapshotsObjectToArray(snapshotsResult));
              })
              .catch((error) => {
                console.error("Error in mapping snapshots:", error);
                reject(error);
              });
			
					} catch (error) {
						console.error("Error mapping snapshots:", error);
						reject(error); // Reject the promise if there's an error in the try block
					}
				});
			},

			getSnapshotVersions: async (
				category: Category, 
				timestamp: any, 
				id: number,
				snapshot: Snapshot<T, K>, 
				snapshotStore: SnapshotStore<T, K>, data: T
			): Promise<Snapshot<T, K>[] | undefined> => undefined,
			
      fetchData: async (): Promise<SnapshotStore<T, K, StructuredMetadata<T, K>>> => {
				const API_URL = endpoints.snapshots.fetch;
				if (typeof API_URL !== "string") {
					throw new Error("Invalid API URL");
				}
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve(undefined), 1000);
        })
      },
        
			snapshotMethods: [],

			mapSnapshotStore: function (
				storeId: number,
				snapshotId: string,
				category: symbol | string | Category | undefined,
				categoryProperties: CategoryProperties | undefined,
				snapshot: Snapshot<any, any>,
				timestamp: string | number | Date | undefined,
				type: string,
				event: Event,
				id: number,
				snapshotStore: SnapshotStore<any, any>,
				data: any,
				// snapshotsArray: SnapshotsArray<any>,
				// snapshotsObject: SnapshotsObject<any>
			): Promise<SnapshotContainer<T, K> | undefined> {
				const API_URL = endpoints.snapshots.fetch;
				if (typeof API_URL !== "string") {
					throw new Error("Invalid API URL");
				}
				return new Promise<SnapshotContainer<T, K> | undefined>((resolve) => {
					setTimeout(() => resolve(undefined), 1000);
				});
			},

			getSnapshotWithCriteria: (
				category: symbol | string | Category | undefined,
				timestamp: any,
				id: number,
				snapshot: Snapshot<T, K>,
				snapshotStore: SnapshotStore<T, K>,
				data: T
			): Promise<SnapshotWithCriteria<T, K> | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, K> | undefined>((resolve) => {
							setTimeout(() => resolve(undefined), 1000);
						});
					} catch (error) {
						console.error("Error getting snapshot with criteria:", error);
						reject(error);
						throw error;
					}
				})
			},
			getSnapshotWithCriteriaVersions: (
				category: symbol | string | Category | undefined,
				timestamp: any,
				id: number,
				snapshot: Snapshot<T, K>,
				snapshotStore: SnapshotStore<T, K>,
				data: T
			): Promise<SnapshotWithCriteria<T, K>[] | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, K> | undefined>((resolve) => {
							setTimeout(() => resolve(undefined), 1000);
						});
					} catch (error) {
						console.error("Error getting snapshot with criteria:", error);
						reject(error);
						throw error;
					}
				})
			},
		}

		resolve(options);
	});
}

export { createOptions };

