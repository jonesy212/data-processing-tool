import { endpoints } from "../../api/endpointConfigurations";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { Subscriber } from "../users/Subscriber";
import SnapshotStoreOptions from "../hooks/SnapshotStoreOptions";
import { StatusType } from "../models/data/StatusType";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import axiosInstance from "../security/csrfToken";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { Snapshots, SnapshotsArray, Snapshot, SnapshotsObject } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./snapshot";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotContainer } from "./SnapshotContainer";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreMethod } from "./SnapshotStoreMethod";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { BaseData, Data } from "../models/data/Data";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { fetchSnapshotById } from "@/app/api/SnapshotApi";

// createOptions.ts
function createOptions<T extends Data, K extends Data>(params: {
	initialState: SnapshotStore<T, K> | null;
	date: string | Date;
	snapshotId: string;
	category: CategoryProperties;
	dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
	snapshotMethods?: SnapshotStoreMethod<T, K>[]; // Make this optional
	type?: string; // Optional, adjust as needed
	snapshotConfig?: any; // Optional, adjust as needed
	subscribeToSnapshots: (
		snapshotId: string,
		callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
		snapshots: SnapshotsArray<T>
	) => SnapshotsArray<T> | []
	subscribeToSnapshot: (
		snapshotId: string,
		callback: Callback<Snapshot<T, K>>,
		snapshot: Snapshot<T, K>
	) => Subscriber<T, K> | null;
	handleSnapshotStoreOperation: (
		snapshotId: string,
		snapshotStore: SnapshotStore<T, K>,
		snapshot: Snapshot<T, K>,
		operation: SnapshotOperation,
		operationType: SnapshotOperationType,
		callback: (snapshotStore: SnapshotStore<T, K>) => void,
	) => Promise<void>;
	delegate: () => Promise<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]> | []
	eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]>;
	getCategory: (
		snapshotId: string,
		snapshot: Snapshot<T, K>,
		type: string,
		event: Event
	) => CategoryProperties;
	useSimulatedDataSource: boolean;
	simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];
	snapshotStoreConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];
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
		category: Category,
		categoryProperties: CategoryProperties,
		delegate: any,
		snapshotData: SnapshotStore<T, K>,
		snapshot: (
			id: string,
			snapshotId: string | null,
			snapshotData: Snapshot<T, K>,
			category: string | CategoryProperties | undefined,
			callback: (snapshotStore: Snapshot<T, K>) => void,
			snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
			snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
		) => Promise<Snapshot<T, K>>,

		initSnapshot: (
			snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
			snapshotId: string | null,
			snapshotData: SnapshotStore<T, K>,
			category: string | CategoryProperties | undefined,
			snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
			callback: (snapshotStore: SnapshotStore<T, K>) => void
		) => void,

		subscribeToSnapshots: (
			snapshot: SnapshotStore<T, K>,
			snapshotId: string,
			snapshotData: SnapshotStore<T, K>,
			category: string | CategoryProperties | undefined,
			snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
			callback: (snapshotStore: SnapshotStore<any, any>) => void
		) => void,

		createSnapshot: (
			id: string,
			snapshotData: Snapshot<T, K>,
			category?: string | CategoryProperties,
			callback?: (snapshot: Snapshot<T, K>) => void,
			snapshotDataStore?: SnapshotStore<T, K>,
			snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
		) => Snapshot<T, K> | null,

		createSnapshotStore: (
			id: string,
			snapshotId: number,
			snapshotStoreData: Snapshots<T>,
			category?: string | CategoryProperties,
			callback?: (snapshotStore: SnapshotStore<T, K>) => void,
			snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
		) => SnapshotStore<T, K> | null,

		configureSnapshot: (
			id: string,
			snapshotId: number,
			snapshotData: Snapshot<T, K>,
			category?: string | CategoryProperties,
			callback?: (snapshot: Snapshot<T, K>) => void,
			snapshotDataStore?: SnapshotStore<T, K>,
			snapshotStoreConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
		) => SnapshotConfig<T, K> | undefined,
  ) => SnapshotConfig<SnapshotWithCriteria<any, BaseData>, K> 

	getDelegate: (
		context: {
			useSimulatedDataSource: boolean;
			simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];
		}) => SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];

	getDataStoreMethods: (
		snapshotStoreConfig: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[],
		dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
	) => Partial<DataStoreWithSnapshotMethods<T, K>>;
}): Promise<SnapshotStoreOptions<T, K>> {
	return new Promise<SnapshotStoreOptions<T, K>>((resolve, reject) => {
		const {
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

		const options: SnapshotStoreOptions<T, K> = {
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
				simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];
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
		const defaultDataStoreMethods: DataStore<T, K> = {
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
				const newSnapshot: Snapshot<T, K> = {
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
				// Default implementation
				return defaultDataStoreMethods.dataStore?.get(id.toString());
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

			updateStoreData: (data: Data, id: number, newData: SnapshotStore<T, K>) => {
				const snapshot = defaultDataStoreMethods.dataStore?.get(id.toString());
				if (!snapshot) {
					throw new Error("Snapshot not found");
				}
				const updatedSnapshotStore: SnapshotStore<T, K> = {
					...snapshot,
					...data,
					updatedAt: new Date(), // Assuming this field exists in SnapshotStore<T, K>
				};
				defaultDataStoreMethods.dataStore?.set(
					id.toString(),
					updatedSnapshotStore
				);
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

			getItem: async (key: string) => {
				return defaultDataStoreMethods.data?.get(key);
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
				simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[];
			}): Promise<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]> => {
				if (context.useSimulatedDataSource) {
					return context.simulatedDataSource;
				}
				try {
					const API_URL = endpoints.filtering.fetch;
					if (typeof API_URL !== "string") {
						throw new Error("Invalid API URL");
					}
					const response = await axiosInstance.get<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]>(
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
				delegate: SnapshotStoreConfig<BaseData, K>[]) => {
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
				category: any,
				timestamp: any,
				id: number
			): Promise<SnapshotContainer<T, K>> => {
				return new Promise<SnapshotContainer<T, K>>((resolve, reject) => {
				console.log("Fetching snapshot container for ID:", id);
			
				try {
					fetchSnapshotById(id)  // Call the API function
					.then((snapshot) => {
						if (snapshot) {
							resolve(snapshot as SnapshotContainer<T, K>);						} else {
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
				category: string | CategoryProperties | undefined,
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
					category: string | CategoryProperties | undefined,
					snapshot: Snapshot<T, K>,
					timestamp: string | number | Date | undefined,
					type: string,
					event: Event,
					id: number,
					snapshotStore: SnapshotStore<T, K>,
					data: T
				) => SnapshotsObject<T>
			): SnapshotsObject<T> => {
				console.log("Mapping snapshots with category:", category, "timestamp:", timestamp, "ID:", id);

				try {
					// Call the provided callback with the parameters
					const snapshots = callback(
						storeIds,
						snapshotId,
						category,
						snapshot,
						timestamp,
						type,
						event,
						id,
						snapshotStore,
						data
					);

					// Return the result from the callback
					return snapshots;
				} catch (error) {
					console.error("Error mapping snapshots:", error);
					// Handle the error according to your needs; this example just returns an empty object
					return {};
				}
			},

			getSnapshotVersions: async (id: number) => undefined,
			fetchData: async () => [],
			snapshotMethods: [],

			mapSnapshotStore: function (
				storeId: number,
				snapshotId: string,
				category: string | CategoryProperties | undefined,
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
				category: any,
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
				category: any,
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
		};

		resolve(options);
	});
}
