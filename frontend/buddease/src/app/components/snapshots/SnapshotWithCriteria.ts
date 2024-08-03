import { IHydrateResult } from "mobx-persist";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { CombinedEvents, SnapshotManager } from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SearchCriteria } from "../routing/SearchCriteria";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotConfig";
import SnapshotStore, { SnapshotData } from "./SnapshotStore";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useDataContext } from "@/app/context/DataContext";
import { Tag } from "../models/tracker/Tag";
import { handleSnapshotSuccess } from "./snapshotHandlers";
// Define BaseData interface

type TagsRecord = Record<string, Tag>;

// Define SnapshotWithCriteria type
type SnapshotWithCriteria<T extends BaseData = BaseData, K extends BaseData = T
> = Snapshot<T, K> & Omit<SearchCriteria, 'analysisType'> & {
    analysisType?: AnalysisTypeEnum;
    events?: CombinedEvents<T, K>;  // Update as needed based on your schema
    subscribers?: Record<string, Subscriber<T, K>>;  // Update as needed based on your schema
    tags?: TagsRecord;  // Update as needed based on your schema
    timestamp: string | number | Date | undefined
};


// Example data to be added to the store
const exampleSnapshotWithCriteria: SnapshotWithCriteria<Data, Data> = {
    data: {
        id: "1",
        title: "Sample Data",
        description: "Sample description",
        timestamp: new Date(),
        category: "Sample category",
    },
    meta: {
        id: "2",
        title: "Sample Meta",
        description: "Sample meta description",
        timestamp: new Date(),
        category: "Sample meta category",
    },
    startDate: new Date(),
    endDate: new Date(),
    status: StatusType.Scheduled,
    analysisType: AnalysisTypeEnum.DEFAULT, // Adjust as needed
    configOption: "default config option",
    events: {
        eventRecords: {
            "1": {
                id: "1",
                title: "Sample Event",
                description: "Sample event description",
                timestamp: new Date(),
                category: "Sample event category",
                status: StatusType.Scheduled,
                tags: ["Sample", "Event"],
            },
        },
        eventIds: ["1"],
        callbacks: (snapshot: Snapshot<Data, Data>) => {  // Ensure compatibility
            return {
                onEventClick: (event: CalendarEvent) => {
                    console.log("onEventClick", event);
                },
                onEventDoubleClick: (event: CalendarEvent) => {
                    console.log("onEventDoubleClick", event);
                },
                onEventContextMenu: (event: CalendarEvent) => {
                    console.log("onEventContextMenu", event);
                },
                onEventDrop: (event: CalendarEvent) => {
                    console.log("onEventDrop", event);
                },
                onEventResize: (event: CalendarEvent) => {
                    console.log("onEventResize", event);
                },
                onEventSelect: (event: CalendarEvent) => {
                    console.log("onEventSelect", event);
                },
                onEventDeselect: (event: CalendarEvent) => {
                    console.log("onEventDeselect", event);
                },
                onEventCreate: (event: CalendarEvent) => {
                    console.log("onEventCreate", event);
                },
                onEventRemove: (event: CalendarEvent) => {
                    console.log("onEventRemove", event);
                },
                onEventReceive: (event: CalendarEvent) => {
                    console.log("onEventReceive", event);
                },
            };
        },
        subscribers: {
            "1": {
                id: "1",
                name: "Sample Subscriber",
                email: "<EMAIL>",
                enabled: true,
                tags: ["Sample", "Subscriber"],
            },
        },
        tags: {
            "1": {
                id: "1",
                name: "Sample Tag",
                color: "#000000",
                description: "Sample tag description",
                enabled: true,
                tags: ["Sample", "Tag"],
            },
        },
        tagIds: ["1"],
    },
},
    calendarEvents: {
        calendarEvents: {
            "1": {
                id: "1",
                title: "Sample Calendar Event",
                description: "Sample calendar event description",
                timestamp: new Date(),
                category: "Sample calendar event category",
                status,
                callbacks: (
                    snapshot: Snapshot<Data, Data>) => {
                    return {
    onEventAdded: (event: CalendarEvent) => {
        console.log("Event added: ", event);
    },
    onEventUpdated: (event: CalendarEvent) => {
        console.log("Event updated: ", event);
    },
    onEventDeleted: (event: CalendarEvent) => {
        console.log("Event deleted: ", event);
    },
    onEventMoved: (event: CalendarEvent) => {
        console.log("Event moved: ", event);
    }

}
                }
            }
        }
    }
}


// Handling type check for data
const data = exampleSnapshotWithCriteria.data;
if (data && typeof data !== 'object') {
    // Ensure `data` is `BaseData`
    const baseData: BaseData = data;
    console.log(baseData);
} else if (data instanceof Map) {
    // Handle the case where `data` is a Map
    console.log("Data is a Map and cannot be assigned directly to BaseData.");
} else {
    // Handle null or undefined cases
    console.log("Data is null or undefined.");
}

// Example of SnapshotStore with SnapshotWithCriteria
const exampleSnapshotStore: SnapshotStore<BaseData, BaseData> = {
    id: "store1",
    title: "Sample Store",
    description: "This is a sample snapshot store",
    data: new Map<string, Snapshot<BaseData, BaseData>>(),
    snapshotId: "snapshot1",
    key: "key1",
    topic: "Sample Topic",
    date: new Date(),
    configOption: null,
    config: undefined,
    message: undefined,
    createdBy: "",
    type: undefined,
    subscribers: [] as Subscriber<BaseData, BaseData>[],
    set: undefined,
    state: null,
    store: null,
    snapshots: [],
    snapshotConfig: [],
    dataStore: undefined,
    initialState: undefined,
    snapshotItems: [],
    nestedStores: [],
    dataStoreMethods: undefined,
    delegate: [],
    subscriberId: "",
    length: 0,
    content: "",
    value: 0,
    todoSnapshotId: "",
    events: undefined,
    snapshotStore: null,
    dataItems: [],
    newData: undefined,
    category: undefined,
    timestamp: undefined,
    async getData(): Promise<DataStore<SnapshotWithCriteria<Data, Data>[], K>> {
        const { dataStore } = useDataContext();
        return Promise.resolve([dataStore]);
    },
    addSnapshotItem: exampleSnapshotStore.addSnapshotItem,
    addNestedStore: exampleSnapshotStore.addNestedStore,
    defaultSubscribeToSnapshots: exampleSnapshotStore.defaultSubscribeToSnapshots,
    subscribeToSnapshots: exampleSnapshotStore.subscribeToSnapshots,
    transformSubscriber: exampleSnapshotStore.transformSubscriber,
    transformDelegate: exampleSnapshotStore.transformDelegate,
    initializedState: undefined,
    getAllKeys: exampleSnapshotStore.getAllKeys,
    getAllItems: exampleSnapshotStore.getAllItems,
    addData: exampleSnapshotStore.addData,
    addDataStatus: exampleSnapshotStore.addDataStatus,
    removeData: exampleSnapshotStore.removeData,
    updateData: function (id: number, newData: BaseData): void {
        throw new Error("Function not implemented.");
    },
    updateDataTitle: function (id: number, title: string): void {
        throw new Error("Function not implemented.");
    },
    updateDataDescription: function (id: number, description: string): void {
        throw new Error("Function not implemented.");
    },
    updateDataStatus: function (id: number, status: "pending" | "inProgress" | "completed"): void {
        throw new Error("Function not implemented.");
    },
    addDataSuccess: function (payload: { data: BaseData[]; }): void {
        throw new Error("Function not implemented.");
    },
    getDataVersions: function (id: number): Promise<BaseData[] | undefined> {
        throw new Error("Function not implemented.");
    },
    updateDataVersions: function (id: number, versions: BaseData[]): void {
        throw new Error("Function not implemented.");
    },
    getBackendVersion: function (): Promise<string | undefined> {
        throw new Error("Function not implemented.");
    },
    getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
        throw new Error("Function not implemented.");
    },
    fetchData: function (id: number): Promise<SnapshotStore<BaseData, BaseData>[]> {
        throw new Error("Function not implemented.");
    },
    defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    snapshot: undefined,
    removeItem: function (key: string): Promise<void> {
        throw new Error("Function not implemented.");
    },
    getSnapshot: function (
        snapshot: () => Promise<{
            category: any;
            timestamp: any;
            id: any;
            snapshotStore: SnapshotStore<BaseData, BaseData>;
            data?: BaseData;
        }> | undefined): Promise<SnapshotStore<BaseData, BaseData>> {
        throw new Error("Function not implemented.");
    },
    getSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): Promise<SnapshotStore<BaseData, BaseData>> {
        throw new Error("Function not implemented.");
    },
    getSnapshotId: function (key: SnapshotData): Promise<string | undefined> {
        throw new Error("Function not implemented.");
    },
    getItem: function (key: string): Promise<BaseData | undefined> {
        throw new Error("Function not implemented.");
    },
    setItem: function (key: string, value: BaseData): Promise<void> {
        throw new Error("Function not implemented.");
    },
    addSnapshotFailure: function (date: Date, error: Error): void {
        throw new Error("Function not implemented.");
    },
    getDataStore: function (): Map<string, BaseData> {
        throw new Error("Function not implemented.");
    },
    addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<BaseData, BaseData>[]): void {
        throw new Error("Function not implemented.");
    },
    compareSnapshotState: function (stateA: Snapshot<BaseData, BaseData> | Snapshot<BaseData, BaseData>[] | null | undefined, stateB: Snapshot<BaseData, BaseData> | null | undefined): boolean {
        throw new Error("Function not implemented.");
    },
    deepCompare: function (objA: any, objB: any): boolean {
        throw new Error("Function not implemented.");
    },
    shallowCompare: function (objA: any, objB: any): boolean {
        throw new Error("Function not implemented.");
    },
    getDataStoreMethods: function (): DataStoreMethods<BaseData, BaseData> {
        throw new Error("Function not implemented.");
    },
    getDelegate: function (): SnapshotStoreConfig<BaseData, BaseData>[] {
        throw new Error("Function not implemented.");
    },
    determineCategory: function (snapshot: Snapshot<BaseData, BaseData> | null | undefined): string {
        throw new Error("Function not implemented.");
    },
    determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
        throw new Error("Function not implemented.");
    },
    updateSnapshot: function (snapshotId: string, data: Map<string, BaseData>, events: Record<string, CalendarEvent[]>, snapshotStore: SnapshotStore<BaseData, BaseData>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, BaseData>, payload: UpdateSnapshotPayload<BaseData>, store: SnapshotStore<any, BaseData>): Promise<{ snapshot: SnapshotStore<BaseData, BaseData>; }> {
        throw new Error("Function not implemented.");
    },
    updateSnapshotSuccess: function (): void {
        throw new Error("Function not implemented.");
    },
    updateSnapshotFailure: function (payload: { error: string; }): void {
        throw new Error("Function not implemented.");
    },
    removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    clearSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    addSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<void> {
        throw new Error("Function not implemented.");
    },
    createSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, BaseData>, category: string): Snapshot<Data> {
        throw new Error("Function not implemented.");
    },
    createSnapshotSuccess: function (snapshot: Snapshot<Data>): void {
        throw new Error("Function not implemented.");
    },
    setSnapshotSuccess: function (snapshotData: SnapshotStore<BaseData, BaseData>, subscribers: ((data: Subscriber<BaseData, BaseData>) => void)[]): void {
        throw new Error("Function not implemented.");
    },
    setSnapshotFailure: function (error: Error): void {
        throw new Error("Function not implemented.");
    },
    createSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData>, error: Error): void {
        throw new Error("Function not implemented.");
    },
    updateSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[], snapshot: Snapshots<BaseData>) => void): void {
        throw new Error("Function not implemented.");
    },
    updateSnapshotsFailure: function (error: Payload): void {
        throw new Error("Function not implemented.");
    },
    initSnapshot: function (snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: SnapshotStore<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    takeSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
        throw new Error("Function not implemented.");
    },
    takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
        throw new Error("Function not implemented.");
    },
    configureSnapshotStore: function (snapshot: SnapshotStore<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    flatMap: function <U>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<Snapshot<BaseData, BaseData>, BaseData>[]) => U): U[] {
        throw new Error("Function not implemented.");
    },
    setData: function (data: BaseData): void {
        throw new Error("Function not implemented.");
    },
    getState: function () {
        throw new Error("Function not implemented.");
    },
    setState: function (state: any): void {
        throw new Error("Function not implemented.");
    },
    validateSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): boolean {
        throw new Error("Function not implemented.");
    },
    handleSnapshot: function (snapshot: Snapshot<BaseData> | null, snapshotId: string): void {
        throw new Error("Function not implemented.");
    },
    handleActions: function (): void {
        throw new Error("Function not implemented.");
    },
    setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
        throw new Error("Function not implemented.");
    },
    transformSnapshotConfig: function <T extends BaseData>(
        config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
        throw new Error("Function not implemented.");
    },
    transformSnapshotStoreConfig: function <T extends BaseData>(
        config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
        throw new Error("Function not implemented.");
    },
    setSnapshotData: function (
        subscribers: Subscriber<any, any>[],
        snapshotData: Partial<SnapshotStoreConfig<BaseData, BaseData>>): void {
        throw new Error("Function not implemented.");
    },
    setSnapshots: function (
        snapshots: Snapshots<Data>): void {
        throw new Error("Function not implemented.");
    },
    setSnapshotStoress: function (
        snapshots: SnapshotStore<BaseData, BaseData>[]): void {
        throw new Error("Function not implemented.");
    },
    clearSnapshot: function (): void {
        throw new Error("Function not implemented.");
    },
    mergeSnapshots: function (snapshots: Snapshots<BaseData>): void {
        throw new Error("Function not implemented.");
    },
    reduceSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    sortSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    filterSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    mapSnapshots: function (): void {
        throw new Error("Function not implemented.");
    },
    findSnapshot: function (): void {
        throw new Error("Function not implemented.");
    },
    getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }> {
        throw new Error("Function not implemented.");
    },
    notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
        throw new Error("Function not implemented.");
    },
    notifySubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, BaseData>[] {
        throw new Error("Function not implemented.");
    },
    subscribe: function (): void {
        throw new Error("Function not implemented.");
    },
    unsubscribe: function (): void {
        throw new Error("Function not implemented.");
    },
    fetchSnapshot: function (snapshotId: string, category: string | CategoryProperties | undefined, timestamp: Date, snapshot: Snapshot<BaseData>, data: BaseData, delegate: SnapshotStoreConfig<BaseData, BaseData>[]): Promise<{ id: any; category: string | CategoryProperties | undefined; timestamp: any; snapshot: Snapshot<BaseData>; data: BaseData; getItem?: (snapshot: Snapshot<BaseData>) => Snapshot<BaseData> | undefined; }> {
        throw new Error("Function not implemented.");
    },
    fetchSnapshotSuccess: function (snapshotData: (
        subscribers: Subscriber<BaseData, BaseData>[],
        snapshot: Snapshot<BaseData>) => void): void {
        throw new Error("Function not implemented.");
    },
    fetchSnapshotFailure: function (payload: { error: Error; }): void {
        throw new Error("Function not implemented.");
    },
    getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
        throw new Error("Function not implemented.");
    },
    getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
        throw new Error("Function not implemented.");
    },
    generateId: function (): string {
        throw new Error("Function not implemented.");
    },
    batchFetchSnapshots: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
        throw new Error("Function not implemented.");
    },
    batchTakeSnapshotsRequest: function (snapshotData: SnapshotData): void {
        throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[]) => Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }>): void {
        throw new Error("Function not implemented.");
    },
    batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
        throw new Error("Function not implemented.");
    },
    batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
        throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
        throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
        throw new Error("Function not implemented.");
    },
    batchTakeSnapshot: function (snapshotStore: SnapshotStore<BaseData, BaseData>, snapshots: Snapshots<BaseData>): Promise<{ snapshots: Snapshots<BaseData>; }> {
        throw new Error("Function not implemented.");
    },
    handleSnapshotSuccess: handleSnapshotSuccess,
    [Symbol.iterator]: function (): IterableIterator<Snapshot<BaseData,>> {
        // implement iterator
        const snapshots = Array.from(this.data?.values() ?? []);
        let index = 0;
        return {
            next: () => {
                if (index < snapshots.length) {
                    return {
                        value: snapshots[index++] as Snapshot<BaseData>,
                        done: false
                    };
                } else {
                    return {
                        value: undefined,
                        done: true
                    };
                }
            },
            [Symbol.iterator]: function() { return this; }
        };
    }
};

export type { SnapshotWithCriteria, TagsRecord };

// Add example data to the store

exampleSnapshotStore.data?.set("1", exampleSnapshotWithCriteria)

// Example usage
const baseData: BaseData = exampleSnapshotWithCriteria.data as BaseData;
console.log(baseData);

const newSnapshot: Snapshot<BaseData, BaseData> = {
    data: baseData,
    meta: exampleSnapshotWithCriteria.meta,
    events: exampleSnapshotWithCriteria.events,
    snapshotStore: exampleSnapshotWithCriteria.snapshotStore,
    snapshot: undefined,
    dataItems: [],
    newData: undefined,
    unsubscribe: exampleSnapshotWithCriteria.unsubscribe,
    fetchSnapshot: exampleSnapshotWithCriteria.fetchSnapshot,
    handleSnapshot: exampleSnapshotWithCriteria.handleSnapshot,
    getSnapshotId: exampleSnapshotWithCriteria.getSnapshotId,
    compareSnapshotState: exampleSnapshotWithCriteria.compareSnapshotState,
};
console.log(newSnapshot);
