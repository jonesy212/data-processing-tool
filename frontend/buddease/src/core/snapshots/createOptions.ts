// createOptions.ts
import axiosInstance from '@/core/api/csrfToken';
import { endpoints } from "@/core/api/endpointConfigurations";
import fetchSnapshotById from "@/core/api/SnapshotApi";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { Data } from '@/core/models/data/Data';
import { StatusType } from "@/core/models/data/StatusType";
import { displayToast } from "@/core/models/display/ShowToast";
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import type { CriteriaType } from "@/core/pages/searches/CriteriaType";
import type { DataStoreMethods, DataStoreWithSnapshotMethods } from "@/core/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { convertSnapshotsObjectToArray } from '@/core/snapshots/createSnapshotStoreOptions';
import { handleSnapshotOperation } from "@/core/snapshots/handleSnapshotOperation";
import { Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";
import type { DataStore, EventRecord, useDataStore } from "@/core/state/stores/DataStore";
import { Subscriber } from "@/core/subscribers/Subscriber";
import { Subscription } from "@/core/subscriptions/Subscription";
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";

import type { SnapshotOperation, SnapshotOperationType } from "@/core/snapshots/index";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { ConfigureSnapshotStorePayload, SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import type { SnapshotContainer, SnapshotContainerType } from '@/core/snapshots/SnapshotContainer';
import { CustomSnapshotData, SnapshotData } from "@/core/snapshots/SnapshotData";
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotStoreMethods } from "@/core/snapshots/SnapshotStoreMethods";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import type { SnapshotStoreProps } from "@/core/snapshots/useSnapshotStore";
import { Callback, MultipleEventsCallbacks } from "@/core/subscribers/subscribeToSnapshotsImplementation";
import { addToSnapshotList } from "@/utils/snapshotUtils";
import SnapshotStore from "./SnapshotStore";
import {
    InitializedDelegate,
    MetaDataOptions,
    SnapshotStoreOptions
} from "./SnapshotStoreOptions";
;




function createOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
	multipleCallbacks: MultipleEventsCallbacks<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
	delegate: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null 
	eventRecords: Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null; // Store events and their callbacks
	initialState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
	date: string | Date;
	snapshotId: string;
	category: CategoryProperties;
	dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
	snapshotMethods?: SnapshotStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Make this optional
	type?: string; // Optional, adjust as needed
	snapshotConfig?: any; // Optional, adjust as needed
	subscribeToSnapshots: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: symbol | string | Category | undefined,    
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
	callback: (
		snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
		snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
	) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
	snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    unsubscribe?: UnsubscribeDetails, 
  ) => SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | []
  
	subscribeToSnapshot: (
		snapshotId: string,
		callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
		snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  
	handleSnapshotStoreOperation: (
		snapshotId: string,
		snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		operationType: SnapshotOperationType,
		callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
	) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
	
	getCategory: (
		snapshotId: string,
		snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		type: string,
		event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		additionalHeaders?: Record<string, string>
	  ) => Promise<{ snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; categoryProperties?: CategoryProperties }>;
	
	useSimulatedDataSource: boolean;
	simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
	snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
	unsubscribeToSnapshots: (
		snapshotId: string,
		snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		type: string,
		event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
	) => void;
	unsubscribeToSnapshot: (
		snapshotId: string,
		snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		type: string,
		event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
	) => void;

	getSnapshotConfig: (
    	id: string | number,
		snapshotId: string | null,
		criteria: CriteriaType,
		category: symbol | string | Category | undefined,
		categoryProperties: CategoryProperties | undefined,
    	subscriberId: string | undefined,
		delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
		snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		snapshot: (
			id: string | number | undefined,
			snapshotId: string | null,
			snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			category: symbol | string | Category | undefined,
			categoryProperties: CategoryProperties,
			callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
			dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			// dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			subscriberId: string, // Add subscriberId here
			endpointCategory: string | number,// Add endpointCategory here
			storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
			snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
		data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
		events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Added prop
		dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Added prop
		newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
		payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
		store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
		callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, // Added prop
		storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		endpointCategory: string | number,
		snapshotContainer: Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
	) => SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
	
	initSnapshot: (
		snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
		snapshotId: string | null,
		snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		category: symbol | string | Category | undefined,
		snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
	) => void,


	createSnapshot: (
		id: string,
		category?:  Category,
		callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
		snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
	) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,

	createSnapshotStore: (
		id: string,
		snapshotId: number,
		snapshotStoreData: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		category?:  Category,
		callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
		snapshotDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
	) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,

	configureSnapshot: (
		id: string,
		storeId: number,
		snapshotId: string,
		dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		category?:  Category,
		categoryProperties?: CategoryProperties | undefined,
		callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
		snapshotData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
		snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
	) => SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,

	getDelegate: (
		context: {
			useSimulatedDataSource: boolean;
			simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
		}) => DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

	getDataStoreMethods: (
		snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
		dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
		) => Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
	}): Promise<SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
	return new Promise<SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>((resolve, reject) => {
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

		const options: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
				simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
			}): Promise<DataStore<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]> => {
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
    const defaultDataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...options, 
      ...params,
      ...dataStore,
			id: Math.floor(Math.random() * 100000000000000000).toString(), // Provide a default id
			metadata: {},
			data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
			addData: async (
				data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				options?: {
					title?: string;
					description?: string;
					status?: StatusType | undefined;
				}
			) => {
        const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = createSnapshot({
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
				data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & T>
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

			updateData: (id: number, data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (!snapshot) {
					throw new Error("Snapshot not found");
				}
				const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
					...snapshot,
					...data,
					updatedAt: new Date(),
				};
				defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				return updatedSnapshot;
      },
      
      updateStoreData: (data: Data<T>, id: number, newData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        let snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
    
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
        const updatedSnapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
					const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
					const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
						...snapshot,
						status,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataTitle: async (id: number, title: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
						...snapshot,
						title,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},
			updateDataDescription: async (id: number, description: string) => {
				const snapshot = defaultDataStoreMethods.data?.get(id.toString());
				if (snapshot) {
					const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
						...snapshot,
						description,
					};
					defaultDataStoreMethods.data?.set(id.toString(), updatedSnapshot);
				}
			},

			getItem: async (key: T, id: number) => {
				return defaultDataStoreMethods.data?.get(key, id);
			},
			setItem: async (id: string, item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
				defaultDataStoreMethods.data?.set(id, item);
			},
			removeItem: async (key: string) => {
				defaultDataStoreMethods.data?.delete(key);
			},
			getAllKeys: async () => Array.from(defaultDataStoreMethods.data?.keys() || []),
			getAllItems: async () => Array.from(defaultDataStoreMethods.data?.values() || []),
			getDataVersions: async (id: number) => undefined,
			updateDataVersions: async (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => { },
			getBackendVersion: async () => "0.0.0",
			getFrontendVersion: async () => "0.0.0",
			addDataSuccess: async (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }) => { },
			getDelegate: async (context: {
				useSimulatedDataSource: boolean;
				simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
			}): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
				if (context.useSimulatedDataSource) {
					return context.simulatedDataSource;
				}
				try {
					const API_URL = endpoints.filtering.fetch;
					if (typeof API_URL !== "string") {
						throw new Error("Invalid API URL");
					}
					const response = await axiosInstance.get<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>(
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
				delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
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
					  category?: Category;
					  categoryProperties: CategoryProperties;
					  timestamp: string | number | Date | undefined;
					  id: string | number | undefined;
					  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
					  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
					  data: T;
					  }>
					| undefined
			): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
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
			): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
				return new Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve, reject) => {
				  console.log("Fetching snapshot container for ID:", id);
			
				try {
					fetchSnapshotById<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(id.toString()) // Call the API function
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
			): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
				return new Promise((resolve, reject) => {

					console.log("Mapping snapshot for ID:", id);
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve) => {
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
				snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				timestamp: string | number | Date | undefined,
				type: string,
				event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				id: number,
				snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				data: T,
				callback: (
					storeIds: number[],
					snapshotId: string,
					category: symbol | string | Category | undefined,
					categoryProperties: CategoryProperties | undefined,
					snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
					timestamp: string | number | Date | undefined,
					type: string,
					event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
					id: number,
					snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
					data: K,
					index: number
				) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
			): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
				console.log("Mapping snapshots with category:", category, "timestamp:", timestamp, "ID:", id);

				// Create a promise that will resolve with the mapped snapshots
				return new Promise((resolve, reject) => {
					const snapshotsResult: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {};
			
					try {
						// Use Promise.all to handle multiple asynchronous callbacks if necessary
						const promises = storeIds.map((storeId, index) => {
							return new Promise<SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>((innerResolve) => {
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
				snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
				snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, data: T
			): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => undefined,
			
      fetchData: async (): Promise<SnapshotStore<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> => {
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
				event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				id: number,
				snapshotStore: SnapshotStore<any, any>,
				data: any,
				// snapshotsArray: SnapshotsArray<any>,
				// snapshotsObject: SnapshotsObject<any>
			): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
				const API_URL = endpoints.snapshots.fetch;
				if (typeof API_URL !== "string") {
					throw new Error("Invalid API URL");
				}
				return new Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve) => {
					setTimeout(() => resolve(undefined), 1000);
				});
			},

			getSnapshotWithCriteria: (
				category: symbol | string | Category | undefined,
				timestamp: any,
				id: number,
				snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				data: T
			): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve) => {
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
				snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
				data: T
			): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {
				return new Promise((resolve, reject) => {
					try {
						const API_URL = endpoints.snapshots.fetch;
						if (typeof API_URL !== "string") {
							throw new Error("Invalid API URL");
						}
						return new Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>((resolve) => {
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

