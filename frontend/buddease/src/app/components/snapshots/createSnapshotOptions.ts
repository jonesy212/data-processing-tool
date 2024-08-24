// createSnapshotOptions.ts

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { BaseData } from "../models/data/Data";
import { displayToast } from "../models/display/ShowToast";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { addToSnapshotList } from "../utils/snapshotUtils";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { Snapshot, SnapshotUnion } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { snapshotStoreConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { subscribeToSnapshotsImpl, subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import snapshotDelegate from "./snapshotDelegate";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import { getCurrentSnapshotConfigOptions } from "./getCurrentSnapshotConfigOptions";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Category, getOrSetCategoryForSnapshot } from "../libraries/categories/generateCategoryProperties";

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
      category: Category,
      callback: (snapshot: Snapshot<T, K>) => void,
      snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotUnion<T>, K>,
      snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
    ) => Promise<Snapshot<T, K>>,
    simulatedDataSource?: SimulatedDataSource // Optional parameter for SimulatedDataSource

): SnapshotStoreOptions<T, K> {
    const dataMap = new Map<string, Snapshot<T, K>>();
    // Assuming `snapshot` has a unique identifier or key to be added to the Map
    const snapshotId = snapshotObj.id ? snapshotObj.id.toString() : '';
    dataMap.set(snapshotId, snapshotObj);


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
export type { SimulatedDataSource } 