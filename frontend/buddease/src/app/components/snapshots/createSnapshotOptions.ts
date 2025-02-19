// createSnapshotOptions.ts

import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { snapshotStoreConfigInstance } from './snapshotStoreConfigInstance';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { SnapshotData, SnapshotWithCriteria } from ".";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Category, getOrSetCategoryForSnapshot } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { InitializedState, initializeState, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { getCurrentSnapshotConfigOptions } from "./getCurrentSnapshotConfigOptions";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import { Snapshot } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SnapshotInstanceProps } from '@/app/components/snapshots/SnapshotStoreOptions'

interface SimulatedDataSource<
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends SnapshotInstanceProps<T, K, Meta>{
    // Define the properties of the simulated data source
    data: SnapshotStoreConfig<T, K>;
    fetchData: () => Promise<SnapshotStoreConfig<T, K>>;
    // You can add more properties if needed
}

function getDefaultInitializedState <
    T extends  BaseData<any>, 
    K extends T = T, 
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(): InitializedState<T, K> {
    // Create a valid default state that fits InitializedState<T, K>
    // This can be an empty snapshot store, map, or another valid state based on your app's requirements.
    return {} as InitializedState<T, K>; // Adjust this to match your app's logic for default state
  }

function createSnapshotOptions<
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
    ExcludedFields extends keyof T = never
    >(
    snapshotObj: Snapshot<T, K>,
    snapshot: (
        id: string | number | undefined,
        snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
        category: symbol | string | Category | undefined,
        callback: (snapshot: SnapshotStore<T, K>) => void,
        criteria: CriteriaType,
        //   snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
        snapshotId: string | null,
        snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<T, K>, K, Meta>,
        snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Promise<SnapshotData<T, K>>,
    simulatedDataSource?: SimulatedDataSource<T, K, Meta> // Optional parameter for SimulatedDataSource

): SnapshotStoreOptions<T, K> {
    const dataMap = new Map<string, Snapshot<T, K>>();
    // Assuming `snapshot` has a unique identifier or key to be added to the Map
    const snapshotId = snapshotObj.id ? snapshotObj.id.toString() : '';
    dataMap.set(snapshotId, snapshotObj);

    const snapshotStoreConfig = useDataStore<T, K>().snapshotStoreConfig

    const config = snapshotStoreConfig ?? getDefaultSnapshotStoreConfig();
    if (!config) {
    throw new Error('snapshotStoreConfig and getDefaultSnapshotStoreConfig() cannot both be undefined');
    }

    const defaultSimulatedDataSource: SimulatedDataSource<T, K, Meta> = {
        data: config,
        fetchData: async (): Promise<SnapshotStoreConfig<T, K>> => {
            return snapshotStoreConfig;
        },
    };

    let initialState: InitializedState<T, K, Meta>;

    // Check if snapshotObj.initialState is valid
    if (snapshotObj.initialState) {
      initialState = initializeState(snapshotObj.initialState) ?? ({} as InitializedState<T, K, Meta>); // Use the existing `initializeState` function
    } else {
      // Handle the case when initialState is null or undefined by providing a valid InitializedState
      initialState = getDefaultInitializedState<T, K>(); // Return a valid default for InitializedState
    }
  

    return {
        data: dataMap ? ({} as InitializedData<T, K>),
        initialState: snapshotObj.initialState ? initializeState(snapshotObj.initialState) : {} as InitializedState<T, K>,
        snapshotId: snapshotObj.id ? snapshotObj.id.toString() : "",
        category: {
            id: "",
            type: "",
            chartType: "",
            dataProperties: [],
            formFields: [],
           
            name:
                typeof snapshotObj.category === "string"
                    ? snapshotObj.category
                    : "default-category",
            description: "",
            icon: "",
            color: "",
            iconColor: "",
            isActive: false,
            isPublic: false,
            isSystem: false,
            isDefault: false,
            isHidden: false,
            isHiddenInList: false,
            UserInterface: [],
            DataVisualization: [],
            Forms: undefined,
            Analysis: [],
            Communication: [],
            TaskManagement: [],
            Crypto: [],
            brandName: "",
            brandLogo: "",
            brandColor: "",
            brandMessage: "",
        },
        date: new Date(),
        type: "default-type",
        snapshotConfig: [], // Adjust as needed
        subscribeToSnapshots: snapshotObj.subscribeToSnapshots,
        subscribeToSnapshot: subscribeToSnapshotImpl,
        delegate: () => Promise.resolve([]), // Changed to a function returning a Promise
        getDelegate: snapshotObj.getDelegate,
        dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>, // Provide actual data store methods
        getDataStoreMethods: () => ({} as DataStoreWithSnapshotMethods<T, K>),
        snapshotMethods: [], // Provide appropriate default or derived snapshotMethods
        configOption: null, // Provide default or derived configOption

        handleSnapshotOperation: handleSnapshotOperation, // Added handleSnapshotOperation
        displayToast: displayToast, // Added displayToast
        addToSnapshotList: addToSnapshotList, // Added addToSnapshotList
        eventRecords: {}, // Changed to an empty object to match Record<string, CalendarEvent<T, K>[]>
        snapshotStoreConfig: snapshotStoreConfigInstance, // Added snapshotDelegate
        handleSnapshotStoreOperation: handleSnapshotStoreOperation, // Added handleSnapshotStoreOperation
        simulatedDataSource: simulatedDataSource || defaultSimulatedDataSource, // Use provided or default
        getCategory: getOrSetCategoryForSnapshot,
        getSnapshotConfig: getCurrentSnapshotConfigOptions,
    };

}export default createSnapshotOptions;
export type { SimulatedDataSource };
