import { fetchSnapshotById } from "@/app/api/SnapshotApi";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { endpoints } from "../../api/endpointConfigurations";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import  {SnapshotStoreOptions, MetaDataOptions,
  InitializedDelegate,
InitializedDelegateSearch,
 } from "../hooks/SnapshotStoreOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, EventRecord } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject } from "./LocalStorageSnapshotStore";

import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback, MultipleEventsCallbacks } from "./subscribeToSnapshotsImplementation";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { SnapshotData } from "./SnapshotData";
import { SnapshotConfig } from "./SnapshotConfig";
import { UnsubscribeDetails } from "../event/DynamicEventHandlerExample";




// createOptions.ts
function createOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data>(params: {
  id: string;
	storeId: number;
	baseURL: string;
	enabled: boolean;
	maxRetries: number;
	retryDelay: number;
	maxAge: number;
	staleWhileRevalidate: number;
	metadata: MetaDataOptions
	criteria: CriteriaType;
	cacheKey: string;
	callbacks: MultipleEventsCallbacks<Snapshot<T, Meta, K>>;
	
	initialState: SnapshotStore<T, Meta, K> | null;
	date: string | Date;
	snapshotId: string;
	category: CategoryProperties;
	dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, Meta, K>>;
	snapshotMethods?: SnapshotStoreMethod<T, Meta, K>[]; // Make this optional
	type?: string; // Optional, adjust as needed
	snapshotConfig?: any; // Optional, adjust as needed
	subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, Meta, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, Meta, K>,
    category: Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
		callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null,
		snapshots: SnapshotsArray<T, Meta>,
    unsubscribe?: UnsubscribeDetails, 
  ) => SnapshotsArray<T, Meta> | []
  
	subscribeToSnapshot: (
		snapshotId: string,
		callback: Callback<Snapshot<T, Meta, K>>,
		snapshot: Snapshot<T, Meta, K>
	) => Subscriber<T, Meta, K> | null;
	handleSnapshotStoreOperation: (
		snapshotId: string,
		snapshotStore: SnapshotStore<T, Meta, K>,
		snapshot: Snapshot<T, Meta, K>,
		operation: SnapshotOperation,
		operationType: SnapshotOperationType,
		callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
	) => Promise<void>;
	delegate: InitializedDelegate<T, Meta, K> | null 
	eventRecords: Record<string, EventRecord<T, Meta, K>[]> | null; // Store events and their callbacks
	getCategory: (
		snapshotId: string,
		snapshot: Snapshot<T, Meta, K>,
		type: string,
		event: Event
	) => CategoryProperties;
	useSimulatedDataSource: boolean;
	simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
	snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>;
	unsubscribeToSnapshots: (
		snapshotId: string,
		snapshot: Snapshot<T, Meta, K>,
		type: string,
		event: Event,
		callback: (snapshot: Snapshot<T, Meta, K>) => void
	) => void;
	unsubscribeToSnapshot: (
		snapshotId: string,
		snapshot: Snapshot<T, Meta, K>,
		type: string,
		event: Event,
		callback: (snapshot: Snapshot<T, Meta, K>) => void
	) => void;

	getSnapshotConfig: (
		snapshotId: string | null,
		snapshotContainer: SnapshotContainer<T, Meta, K>,
		criteria: CriteriaType,
		category: symbol | string | Category | undefined,
		categoryProperties: CategoryProperties | undefined,
		delegate: any,
		snapshotData: SnapshotData<T, Meta, K>,
		snapshot: (
			id: string,
			snapshotId: string | null,
			snapshotData: SnapshotData<T, Meta, K>,
			category: symbol | string | Category | undefined,
			callback: (snapshotStore: Snapshot<T, Meta, K>) => void,
			snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
			snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
		) => Promise<Snapshot<T, Meta, K>>,

		initSnapshot: (
			snapshot: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
			snapshotId: string | null,
			snapshotData: SnapshotData<T, Meta, K>,
			category: symbol | string | Category | undefined,
			snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
			callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void
		) => void,

		subscribeToSnapshots: (
			snapshot: SnapshotStore<T, Meta, K>,
			snapshotId: string,
			snapshotData: SnapshotData<T, Meta, K>,
			category: symbol | string | Category | undefined,
			snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
			callback: (snapshotStore: SnapshotStore<any, any>) => void
		) => void,

		createSnapshot: (
			id: string,
			snapshotData: SnapshotData<T, Meta, K>,
			category?: string | symbol | Category,
			callback?: (snapshot: Snapshot<T, Meta, K>) => void,
			SnapshotData?: SnapshotStore<T, Meta, K>,
			snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>
		) => Snapshot<T, Meta, K> | null,

		createSnapshotStore: (
			id: string,
			snapshotId: number,
			snapshotStoreData: Snapshots<T, Meta>,
			category?: string | symbol | Category,
			callback?: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
			snapshotDataConfig?: SnapshotStoreConfig<T, Meta, K>[]
		) => SnapshotStore<T, Meta, K> | null,

		configureSnapshot: (
			id: string,
			snapshotId: number,
			snapshotData: SnapshotData<T, Meta, K>,
			category?: string | symbol | Category,
			callback?: (snapshot: Snapshot<T, Meta, K>) => void,
			SnapshotData?: SnapshotStore<T, Meta, K>,
			snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K>
		) => SnapshotConfig<T, Meta, K> | undefined,
  ) => SnapshotConfig<T, Meta, K> 

	getDelegate: (
		context: {
			useSimulatedDataSource: boolean;
			simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
		}) => SnapshotStoreConfig<T, Meta, K>[];

	getDataStoreMethods: (
		snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>[],
		dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, Meta, K>>
	) => Partial<DataStoreWithSnapshotMethods<T, Meta, K>>;
}): Promise<SnapshotStoreOptions<T, Meta, K>> {
	return new Promise<SnapshotStoreOptions<T, Meta, K>>((resolve, reject) => {
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
		} = snapshotConfig || {};

		const options: SnapshotStoreOptions<T, Meta, K> = {
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
			unsubscribeToSnapshots,
			unsubscribeToSnapshot,
			getSnapshotConfig,
			getDelegate: (context: {
				useSimulatedDataSource: boolean;
				simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
			}
			) => {
				return getDelegate(context);
			},
			getDataStoreMethods,
			handleSnapshotOperation,
			handleSnapshotStoreOperation,
			displayToast,
			addToSnapshotList,
			eventRecords,
			getCategory
		};


		// Ensure default implementations for dataStoreMethods
		const defaultDataStoreMethods: DataStore<T, Meta, K> = {
			id: Math.floor(Math.random() * 100000000000000000).toString(), // Provide a default id
			metadata: {},
			data: new Map<string, Snapshot<T, Meta, K>>(),
			addData: async (
				data: Snapshot<T, Meta, K>,
				options?: {
					title?: string;
					description?: string;
					status?: StatusType | undefined;
				}
			) => {
				const newSnapshot: Snapshot<T, Meta, K> = {
					...data,
					id: Math.floor(Math.random() * 100000000000000000).toString(),
					title: options?.title || "",
					description: options?.description || "",
					status: options?.status || StatusType.Pending,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				// Store newSnapshot in dataStore
				defaultDataStoreMethods.data?.set(newSnapshot.id, newSnapshot);
			},
			getData: async (id: number) => {
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

			updateData: (id: number, data: Snapshot<T, Meta, K>) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (!snapshot) {
					throw new Error("Snapshot not found");
				}
				const updatedSnapshot: Snapshot<T, Meta, K> = {
					...snapshot,
					...data,
					updatedAt: new Date(),
				};
				defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				return updatedSnapshot;
      },
      
      updateStoreData: (data: Data, id: number, newData: SnapshotStore<T, Meta, K>) => {
        let snapshot: SnapshotStore<T, Meta, K> | null = null;
    
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
        const updatedSnapshotStore: SnapshotStore<T, Meta, K> = {
            ...snapshot,
            ...data,
            updatedAt: new Date(), // Assuming this field exists in SnapshotStore<T, Meta, K>
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
					const updatedSnapshot: Snapshot<T, Meta, K> = {
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
					const updatedSnapshot: Snapshot<T, Meta, K> = {
						...snapshot,
						status,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataTitle: async (id: number, title: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, Meta, K> = {
						...snapshot,
						title,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataDescription: async (id: number, description: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, Meta, K> = {
						...snapshot,
						description,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},

			getItem: async (key: T, id: number) => {
				return defaultDataStoreMethods.data?.get(key, id);
			},
			setItem: async (id: string, item: Snapshot<T, Meta, K>) => {
				defaultDataStoreMethods.data?.set(id, item);
			},
			removeItem: async (key: string) => {
				defaultDataStoreMethods.data?.delete(key);
			},
			getAllKeys: async () => Array.from(defaultDataStoreMethods.data?.keys() || []),
			getAllItems: async () => Array.from(defaultDataStoreMethods.data?.values() || []),
			getDataVersions: async (id: number) => undefined,
			updateDataVersions: async (id: number, versions: Snapshot<T, Meta, K>[]) => { },
			getBackendVersion: async () => "0.0.0",
			getFrontendVersion: async () => "0.0.0",
			addDataSuccess: async (payload: { data: Snapshot<T, Meta, K>[]; }) => { },
			getDelegate: async (context: {
				useSimulatedDataSource: boolean;
				simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[];
			}): Promise<SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[]> => {
				if (context.useSimulatedDataSource) {
					return context.simulatedDataSource;
				}
				try {
					const API_URL = endpoints.filtering.fetch;
					if (typeof API_URL !== "string") {
						throw new Error("Invalid API URL");
					}
					const response = await axiosInstance.get<SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[]>(
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
				delegate: SnapshotStoreConfig<T, Meta, K>[]) => {
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
					  snapshot: Snapshot<T, Meta, K>;
					  snapshotStore: SnapshotStore<T, Meta, K>;
					  data: T;
					  }>
					| undefined
			): Promise<Snapshot<T, Meta, K> | undefined> => {
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
			): Promise<SnapshotContainer<T, Meta, K> | undefined> => {
				return new Promise<SnapshotContainer<T, Meta, K> | undefined>((resolve, reject) => {
				  console.log("Fetching snapshot container for ID:", id);
			
				try {
					fetchSnapshotById<T, Meta, K>(id.toString()) // Call the API function
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
			): Promise<Snapshot<T, Meta, K> | null> => {
				return new Promise((resolve, reject) => {

					console.log("Mapping snapshot for ID:", id);
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<Snapshot<T, Meta, K> | undefined>((resolve) => {
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
				snapshot: Snapshot<T, Meta, K>,
				timestamp: string | number | Date | undefined,
				type: string,
				event: Event,
				id: number,
				snapshotStore: SnapshotStore<T, Meta, K>,
				data: T,
				callback: (
					storeIds: number[],
					snapshotId: string,
					category: symbol | string | Category | undefined,
					categoryProperties: CategoryProperties | undefined,
					snapshot: Snapshot<T, Meta, K>,
					timestamp: string | number | Date | undefined,
					type: string,
					event: Event,
					id: number,
					snapshotStore: SnapshotStore<T, Meta, K>,
					data: K,
					index: number
				) => SnapshotsObject<T, Meta, K>
			): Promise<SnapshotsArray<T, Meta>> => {
				console.log("Mapping snapshots with category:", category, "timestamp:", timestamp, "ID:", id);

				// Create a promise that will resolve with the mapped snapshots
				return new Promise((resolve, reject) => {
					const snapshotsResult: SnapshotsObject<T, Meta, K> = {};
			
					try {
						// Use Promise.all to handle multiple asynchronous callbacks if necessary
						const promises = storeIds.map((storeId, index) => {
							return new Promise<SnapshotsObject<T, Meta, K>>((innerResolve) => {
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
									data,
									index // Use the current index from the loop
								);
			
								// Store the result for this storeId
								snapshotsResult[storeId] = snapshots; // Assuming storeId is the key
								innerResolve(snapshots);
							});
						});
			
						// Wait for all promises to resolve
						Promise.all(promises)
							.then(() => {
								// Return the result from the mapping
								resolve(snapshotsResult); // Resolve the outer promise with the result
							})
							.catch((error) => {
								console.error("Error in mapping snapshots:", error);
								reject(error); // Reject the promise with the error
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
				snapshot: Snapshot<T, Meta, K>, 
				snapshotStore: SnapshotStore<T, Meta, K>, data: T
			): Promise<Snapshot<T, Meta, K>[] | undefined> => undefined,
			fetchData: async () => [],
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
			): Promise<SnapshotContainer<T, Meta, K> | undefined> {
				const API_URL = endpoints.snapshots.fetch;
				if (typeof API_URL !== "string") {
					throw new Error("Invalid API URL");
				}
				return new Promise<SnapshotContainer<T, Meta, K> | undefined>((resolve) => {
					setTimeout(() => resolve(undefined), 1000);
				});
			},

			getSnapshotWithCriteria: (
				category: symbol | string | Category | undefined,
				timestamp: any,
				id: number,
				snapshot: Snapshot<T, Meta, K>,
				snapshotStore: SnapshotStore<T, Meta, K>,
				data: T
			): Promise<SnapshotWithCriteria<T, Meta, K> | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, Meta, K> | undefined>((resolve) => {
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
				snapshot: Snapshot<T, Meta, K>,
				snapshotStore: SnapshotStore<T, Meta, K>,
				data: T
			): Promise<SnapshotWithCriteria<T, Meta, K>[] | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, Meta, K> | undefined>((resolve) => {
							setTimeout(() => resolve(undefined), 1000);
						});
					} catch (error) {
						console.error("Error getting snapshot with criteria:", error);
						reject(error);
						throw error;
					}
				})
			},
		};

		resolve(options);
	});
}

export {createOptions}
