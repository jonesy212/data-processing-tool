// createSnapshotOptions.ts

import { SnapshotData, SnapshotWithCriteria } from ".";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Category, getOrSetCategoryForSnapshot } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { getCurrentSnapshotConfigOptions } from "./getCurrentSnapshotConfigOptions";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import { Snapshot } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";

interface SimulatedDataSource {
    // Define the properties of the simulated data source
    data: SnapshotStoreConfig<any, any>;
    fetchData: () => Promise<SnapshotStoreConfig<any, any>>;
    // You can add more properties if needed
}

function createSnapshotOptions<T extends BaseData, K extends BaseData>(
    snapshotObj: Snapshot<T, K>,
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: Snapshot<T, K>,
      category: symbol | string | Category | undefined,
      callback: (snapshot: Snapshot<T, K>) => void,
    //   snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Promise<SnapshotData<T, K>>,
    simulatedDataSource?: SimulatedDataSource // Optional parameter for SimulatedDataSource

): SnapshotStoreOptions<T, K> {
    const dataMap = new Map<string, Snapshot<T, K>>();
    // Assuming `snapshot` has a unique identifier or key to be added to the Map
    const snapshotId = snapshotObj.id ? snapshotObj.id.toString() : '';
    dataMap.set(snapshotId, snapshotObj);

    const snapshotStoreConfig = useDataStore().snapshotStoreConfig as SnapshotStoreConfig<any, any>

    const defaultSimulatedDataSource: SimulatedDataSource = {
        data: snapshotStoreConfig,
        fetchData: async (): Promise<SnapshotStoreConfig<any, any>> => {
            return snapshotStoreConfig;
        },
    };

    return {
        data: dataMap,
        initialState: snapshotObj.initialState || null,
        snapshotId: snapshotObj.id ? snapshotObj.id.toString() : "",
        category: {
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
        snapshotStoreConfig: [], // Added snapshotDelegate
        handleSnapshotStoreOperation: handleSnapshotStoreOperation, // Added handleSnapshotStoreOperation
        simulatedDataSource: simulatedDataSource || defaultSimulatedDataSource, // Use provided or default
        getCategory: getOrSetCategoryForSnapshot,
        getSnapshotConfig: getCurrentSnapshotConfigOptions,
    };
}
export default createSnapshotOptions;
export type { SimulatedDataSource };
