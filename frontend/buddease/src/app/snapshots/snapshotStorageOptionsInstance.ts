// snapshotStorageOptionsInstance.ts
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Data } from '@/app/models/data/Data';
import { Payload } from '@/app/server/database/Payload';
import { Result } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { SnapshotStorageAttachment, SnapshotStorageEntity, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields, SnapshotStorageK, SnapshotStorageMeta } from '@/app/typings/entities/SnapshotStorageEntity';

import { SnapshotWithData } from "@/app/components/calendar/CalendarApp";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { UpdateSnapshotPayload } from '@/app/interfaces/payload';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Content } from '@/app/models/content/AddContent';
import { BaseData, DataDetails } from '@/app/models/data/Data';
import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import { NotificationPosition, PriorityTypeEnum, StatusType } from '@/app/models/data/StatusType';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { CreateSnapshotsPayload, CreateSnapshotStoresPayload, ExtendedBaseDataPayload } from "@/app/server/database/Payload";
import { CoreSnapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotContainer, SnapshotDataType } from "@/app/snapshots/SnapshotContainer";
import { CustomSnapshotData, SnapshotData } from "@/app/snapshots/SnapshotData";
import { SnapshotDataParams } from '@/app/snapshots/SnapshotDataParams';
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";
import SnapshotStoreSubset from '@/app/snapshots/SnapshotStoreSubset';
import { data, SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { DataStore } from "@/app/state/stores/DataStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Callback, MultipleEventsCallbacks } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { Subscription } from '@/app/subscriptions/Subscription';
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { VersionHistory } from "@/app/versions/VersionData";
import { NotificationType } from "@/context/NotificationContext";
import { SnapshotOperation, SnapshotOperationType } from "../actions/SnapshotActions";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { SnapshotActionType } from "./SnapshotActionType";
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";

// Define a specific set of options for snapshot storage
interface SnapshotStorageOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
 > {
	baseURL: string;
	enabled: boolean;
	maxRetries: number;
	retryDelay: number;
	maxAge: number;
	staleWhileRevalidate: number;
	cacheKey: string;
	// Changed the type from BaseData to T or adjusted as necessary
	initialState?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; // Allows T and K to be distinct types
	eventRecords?: Record<string, CalendarManagerStoreClass<T, T>[]> | null; 

	category: Category;
	date: Date;
	snapshotId?: string | number | null;
	metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
	criteria: CriteriaType;
	multipleCallbacks: MultipleEventsCallbacks<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
	snapshotConfig?: SnapshotConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[];
}


// Define a specific set of options for snapshot configuration
interface SnapshotConfigOptions<
	T extends BaseDataEntity,
	K extends T = T,
	Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
	AttachmentType extends Attachment = Attachment,
	ExcludedFields extends keyof T = DefaultExcludedFields<T>,
	IncludedFields extends keyof T = keyof T
> {
	id: string;
	snapshotId: number;
	snapshotStoreData: Snapshots<Data>;
	category?: string | Category;
	 categoryProperties?: CategoryProperties;
	callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
	snapshotDataConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[];
}


const snapshotStorageOptions: SnapshotStorageOptions<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> = {
	baseURL: "https://example.com/api",
	enabled: true,
	maxRetries: 3,
	retryDelay: 1000,
	maxAge: 3600,
	staleWhileRevalidate: 600,
	cacheKey: "snapshotCache",
	category: "defaultCategory",
	date: new Date(),
	metadata: {
		structuredMetadata: {
			metadataEntries: {},
			baseConfig: baseConfig, 
			sharedMetadata: "", 
			sharedBaseData: "", 
			taggable: "",
			keywords: "", 
			permissions: "", 
			versionData: "",
			timestamp: new Date(),
		},
		metadataEntries: {}
	},
	criteria: {
		startDate: new Date(),
		status: StatusType.Active,
		priority: PriorityTypeEnum.High,
		// Add other properties as needed, all matching the `CriteriaType`
	},
	callbacks: { /* Callback functions */ },
	snapshotConfig: [{
		id: "",
		category: "",
		data: {} as T,
		subscribers: [],
		storeConfig: undefined,
		additionalData: undefined,
		initialState: undefined,
		isCore: false,
		initialConfig: {} as InitializedConfig,
        removeSubscriber: removeSubscriber,
		onInitialize: (callback: () => void) => {
			throw new Error("Function not implemented.");
		},
		onError: undefined,
		taskIdToAssign: undefined,
		currentCategory: undefined,
		mappedSnapshotData: {} as Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>,
		snapshot: function (
			id: string | number | undefined,
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			category: symbol | string | Category | undefined,
			categoryProperties: CategoryProperties | undefined,
			callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void,
			dataStore: DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			dataStoreMethods: DataStoreMethods<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			metadata: UnifiedMetadata<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			subscriberId: string, // Add subscriberId here
			endpointCategory: string | number, // Add endpointCategory here
			storeProps: SnapshotStoreProps<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotConfigData: SnapshotConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			subscription: Subscription<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotId?: string | number | null,
			snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotContainer?: SnapshotContainerType<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>  
		): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		setCategory: function (category: symbol | string | Category | undefined): void {
			throw new Error("Function not implemented.");
		},
		applyStoreConfig: function (
			snapshotStoreConfig: SnapshotStoreConfig<Data, BaseData, StructuredMetadata<Data, BaseData<any>>> | undefined
		): void {
			throw new Error("Function not implemented.");
		},
		generateId: function (prefix: string, name: string, type: NotificationType, id?: string, title?: string, chatThreadName?: string, chatMessageId?: string, chatThreadId?: string, dataDetails?: DataDetails, generatorType?: string): string {
			throw new Error("Function not implemented.");
		},
		snapshotData: function (
			id: string | number | undefined,
			data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			mappedSnapshotData: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> | null | undefined,
			snapshotData: SnapshotData<SnapshotStorageEntity,
SnapshotStorageK,
SnapshotStorageMeta,
SnapshotStorageAttachment,
SnapshotStorageExcludedFields,
SnapshotStorageIncludedFields>,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			category?: Category,
			categoryProperties: CategoryProperties | undefined,
			dataStoreMethods: DataStoreMethods<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			storeProps: SnapshotStoreProps<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotId?: string | number | null
			): Promise<SnapshotDataType<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		getSnapshotItems: function (): (SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | SnapshotItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined)[] {
			throw new Error("Function not implemented.");
		},
		defaultSubscribeToSnapshots: function (
			snapshotId: string,
			callback: (snapshots: Snapshots<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null,
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null
		): void {
			throw new Error("Function not implemented.");
		},
		notify: function (
			id: string,
			message: string,
			content: Content<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			data: any,
			date: Date,
			type: NotificationType,
			notificationPosition?: NotificationPosition | undefined
		): void {
			throw new Error("Function not implemented.");
		},
		notifySubscribers: function (
			message: string, 
			subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
			data: Partial<SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>
		): Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		getAllSnapshots: function (snapshotId: string, snapshotData: Data, timestamp: string, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, id: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, dataStoreMethods: DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: Data, dataCallback?: ((subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshots: Snapshots<Data>) => Promise<Snapshots<Data>>) | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]> {
			throw new Error("Function not implemented.");
		},
		getSubscribers: function (subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshots: Snapshots<Data>): Promise<{ subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; snapshots: Snapshots<Data>; }> {
			throw new Error("Function not implemented.");
		},
		versionInfo: null,
		transformSubscriber: function (sub: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> {
			throw new Error("Function not implemented.");
		},
		transformDelegate: function (): SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		initializedState: undefined,
		getAllKeys: function (storeId: number,
			snapshotId: string,
			category: symbol | string | Category | undefined,
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			timestamp: string | number | Date | undefined,
			type: string,
			event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			id: number,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			data: Data): Promise<string[] | undefined> {
			throw new Error("Function not implemented.");
		},
		getAllValues: function (): SnapshotsArray<BaseData> {
			throw new Error("Function not implemented.");
		},
		getAllItems: function (): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined> {
			throw new Error("Function not implemented.");
		},
		getSnapshotEntries: function (snapshotId: string): Map<string, Data> | undefined {
			throw new Error("Function not implemented.");
		},
		getAllSnapshotEntries: function (): Map<string, Data>[] {
			throw new Error("Function not implemented.");
		},
		addDataStatus: function (id: number, status: StatusType | undefined): void {
			throw new Error("Function not implemented.");
		},
		removeData: function (id: number): void {
			throw new Error("Function not implemented.");
		},
		updateData: function (id: number, newData: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		updateDataTitle: function (id: number, title: string): void {
			throw new Error("Function not implemented.");
		},
		updateDataDescription: function (id: number, description: string): void {
			throw new Error("Function not implemented.");
		},
		updateDataStatus: function (id: number, status: StatusType | undefined): void {
			throw new Error("Function not implemented.");
		},
		addDataSuccess: function (payload: { data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; }): void {
			throw new Error("Function not implemented.");
		},
		getDataVersions: function (id: number): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined> {
			throw new Error("Function not implemented.");
		},
		updateDataVersions: function (id: number, versions: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): void {
			throw new Error("Function not implemented.");
		},
		getBackendVersion: function (): Promise<string | undefined> {
			throw new Error("Function not implemented.");
		},
		getFrontendVersion: function (): Promise<string | number | undefined> {
			throw new Error("Function not implemented.");
		},
		fetchData: function (id: number): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]> {
			throw new Error("Function not implemented.");
		},
		defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): string {
			throw new Error("Function not implemented.");
		},
		handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		removeItem: function (key: string): Promise<void> {
			throw new Error("Function not implemented.");
		},
		getSnapshot: function (snapshot: (id: string) => Promise<{ snapshotId: number; snapshotData: Data; category?: Category; categoryProperties: CategoryProperties; dataStoreMethods: DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; timestamp: string | number | Date | undefined; id: string | number | undefined; snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; data: Data; }> | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined> {
			throw new Error("Function not implemented.");
		},
		getSnapshotSuccess: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		setItem: function (key: Data, value: Data): Promise<void> {
			throw new Error("Function not implemented.");
		},
		getItem: function (key: Data): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined> {
			throw new Error("Function not implemented.");
		},
		getDataStore: function (): Promise<DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		getDataStoreMap: function (): Promise<Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>> {
			throw new Error("Function not implemented.");
		},
		addSnapshotSuccess: function (snapshot: Data, subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): void {
			throw new Error("Function not implemented.");
		},
		deepCompare: function (objA: any, objB: any): boolean {
			throw new Error("Function not implemented.");
		},
		shallowCompare: function (objA: any, objB: any): boolean {
			throw new Error("Function not implemented.");
		},
		getDataStoreMethods: function (): DataStoreMethods<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> {
			throw new Error("Function not implemented.");
		},
		getDelegate: function (
			context: { useSimulatedDataSource: boolean; 
			simulatedDataSource: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; }
		): DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		determineCategory: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null | undefined): string {
			throw new Error("Function not implemented.");
		},
		determinePrefix: function (snapshot: Data | null | undefined, category: string): string {
			throw new Error("Function not implemented.");
		},
		removeSnapshot: function (snapshotToRemove: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		addSnapshotItem: function (item: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		addNestedStore: function (store: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		clearSnapshots: function (): void {
			throw new Error("Function not implemented.");
		},
		addSnapshot: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: string, subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined> {
			throw new Error("Function not implemented.");
		},
		emit: function (
			event: string, 
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshotId: string, 
			subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			type: string,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			dataItems: RealtimeDataItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
			criteria: SnapshotWithCriteria<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			category: Category,
			snapshotData: SnapshotData<BaseData, BaseData>
		): void {
			throw new Error("Function not implemented.");
		},
		createSnapshot: undefined,
		createInitSnapshot: function (
			id: string, 
			initialData: Data, 
			snapshotData: SnapshotData<BaseData, BaseData>,
			snapshotStoreConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			category: symbol | string | Category | undefined,
			additionalData: any
		): Promise<Result<Snapshot<BaseData, BaseData, never>>> {
			throw new Error("Function not implemented.");
		},
		addStoreConfig: function (config: SnapshotStoreConfig<Data, any>): void {
			throw new Error("Function not implemented.");
		},
		handleSnapshotConfig: function (config: SnapshotStoreConfig<Data, any>): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotConfig: function (): SnapshotStoreConfig<Data, any>[] {
			throw new Error("Function not implemented.");
		},
		getSnapshotListByCriteria: function (criteria: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]> {
			throw new Error("Function not implemented.");
		},
		setSnapshotSuccess: function (snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		setSnapshotFailure: function (error: Error): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshots: function (): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshot: Snapshots<Data>) => void): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotsFailure: function (error: Payload): void {
			throw new Error("Function not implemented.");
		},
		initSnapshot: function (
			snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, 
			snapshotId: string | null, 
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			category: symbol | string | Category | undefined, 
			categoryProperties: CategoryProperties | undefined,
			snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			callback: (snapshotStore: SnapshotStore<any, any>) => void,
			snapshotStoreConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotStoreConfigSearch: SnapshotStoreConfig<
			  SnapshotWithCriteria<BaseData<any, any>, K>,
			  SnapshotWithCriteria<BaseData<any, any, StructuredMetadata<any, any>>, K>
			>		
		): void {
			throw new Error("Function not implemented.");
		},
		takeSnapshot: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		takeSnapshotSuccess: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		takeSnapshotsSuccess: function (snapshots: Data[]): void {
			throw new Error("Function not implemented.");
		},
		flatMap: function <U extends Iterable<any>>(
			callback: (
				value: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				 index: number, 
				 array: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]
				) => U
			): U extends (infer I)[] ? I[] : U[] {
			throw new Error("Function not implemented.");
		},
		getState: function () {
			throw new Error("Function not implemented.");
		},
		setState: function (state: any): void {
			throw new Error("Function not implemented.");
		},
		validateSnapshot: function (snapshotId: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): boolean {
			throw new Error("Function not implemented.");
		},
		handleActions: function (action: (selectedText: string) => void): void {
			throw new Error("Function not implemented.");
		},
		setSnapshot: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		transformSnapshotConfig: function <T extends BaseDataEntity>(config: SnapshotStoreConfig<T, T>): SnapshotStoreConfig<T, T> {
			throw new Error("Function not implemented.");
		},
		setSnapshots: function (snapshots: Snapshots<Data>): void {
			throw new Error("Function not implemented.");
		},
		clearSnapshot: function (): void {
			throw new Error("Function not implemented.");
		},
		mergeSnapshots: function (snapshots: Snapshots<Data>, category: string): void {
			throw new Error("Function not implemented.");
		},
		reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => U, initialValue: U): U | undefined {
			throw new Error("Function not implemented.");
		},
		sortSnapshots: function (): void {
			throw new Error("Function not implemented.");
		},
		filterSnapshots: function (): void {
			throw new Error("Function not implemented.");
		},
		findSnapshot: function (predicate: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => boolean): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined {
			throw new Error("Function not implemented.");
		},
		mapSnapshots: function <U>(storeIds: number[], snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, timestamp: string | number | Date | undefined, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, id: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: Data, callback: (storeIds: number[], snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, timestamp: string | number | Date | undefined, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, id: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: Data, index: number) => U): U[] {
			throw new Error("Function not implemented.");
		},
		takeLatestSnapshot: function (): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined {
			throw new Error("Function not implemented.");
		},
		updateSnapshot: function (
			snapshotId: string,
			data: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>,
			events: Record<string, CalendarManagerStoreClass<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]>,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			dataItems: RealtimeDataItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[],
			newData: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			payload: UpdateSnapshotPayload<T>,
			store: SnapshotStore<any, K>
		): void {
			throw new Error("Function not implemented.");
		},
		addSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		removeSnapshotSubscriber: function (snapshotId: string, subscriber: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotConfigItems: function (): SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		subscribeToSnapshots: function (snapshotId: number, unsubscribe: UnsubscribeDetails, callback: (snapshots: Snapshots<Data>) => Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null): [] | SnapshotsArray<Data, Meta> {
			throw new Error("Function not implemented.");
		},
		executeSnapshotAction: function (actionType: SnapshotActionType, actionData: any): Promise<void> {
			throw new Error("Function not implemented.");
		},
		subscribeToSnapshot: function (snapshotId: string,
			callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		unsubscribeFromSnapshot: function (snapshotId: string,
			callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		subscribeToSnapshotsSuccess: function (callback: (snapshots: Snapshots<Data>) => void): string {
			throw new Error("Function not implemented.");
		},
		unsubscribeFromSnapshots: function (callback: (snapshots: Snapshots<Data>) => void): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotItemsSuccess: function (): SnapshotItem<Data, any>[] | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotItemSuccess: function (): SnapshotItem<Data, any> | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotKeys: function (): string[] | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotIdSuccess: function (): string | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotValuesSuccess: function (): SnapshotItem<Data, any>[] | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotWithCriteria: function (criteria: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> {
			throw new Error("Function not implemented.");
		},
		reduceSnapshotItems: function (callback: (acc: any, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => any, initialValue: any) {
			throw new Error("Function not implemented.");
		},
		subscribeToSnapshotList: function (snapshotId: string, callback: (snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		config: null,
		timestamp: undefined,
		label: undefined,
		events: undefined,
		restoreSnapshot: function (id: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshotData: Data, category?: Category, callback: (snapshot: Data) => void, snapshots: SnapshotsArray<Data, Meta>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotContainer?: Data | undefined, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined): void {
			throw new Error("Function not implemented.");
		},
		handleSnapshot: function (id: string, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, snapshotData: Data, category?: Category, categoryProperties: CategoryProperties | undefined, callback: (snapshot: Data) => void, snapshots: SnapshotsArray<Data, Meta>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotContainer?: Data | undefined, snapshotStoreConfig?: SnapshotStoreConfig<Data, any> | null | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
			throw new Error("Function not implemented.");
		},
		subscribe: function (snapshotId: number, unsubscribe: UnsubscribeDetails, subscriber: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, data: Data, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: Callback<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, value: Data): [] | SnapshotsArray<Data, Meta> {
			throw new Error("Function not implemented.");
		},
		meta: {},
		snapshotStore: null,
		setSnapshotCategory: function (id: string, newCategory: Category): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotCategory: function (id: string): Category | undefined {
			throw new Error("Function not implemented.");
		},
		getSnapshotData(params: SnapshotDataParams<T, K, Meta>): SnapshotData<T, K, Meta> | undefined {
			throw new Error("Function not implemented.");
		},
		deleteSnapshot: function (id: string): void {
			throw new Error("Function not implemented.");
		},
		getSnapshots: function (category: string, data: Snapshots<Data>): void {
			throw new Error("Function not implemented.");
		},
		compareSnapshots: function (snap1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snap2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): { snapshot1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshot2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; differences: Record<string, { snapshot1: any; snapshot2: any; }>; versionHistory: { snapshot1Version: number; snapshot2Version: number; }; } | null {
			throw new Error("Function not implemented.");
		},
		compareSnapshotItems: function (snap1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snap2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, keys: string[]): { itemDifferences: Record<string, { snapshot1: any; snapshot2: any; differences: { [key: string]: { value1: any; value2: any; }; }; }>; } | null {
			throw new Error("Function not implemented.");
		},
		batchTakeSnapshot: function (snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshots: function (criteria: any): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]> {
			throw new Error("Function not implemented.");
		},
		batchTakeSnapshotsRequest: function (snapshotIds: string[], snapshots: Snapshots<Data>): Promise<void> {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshotsRequest: function (snapshots: Snapshots<Data>): Promise<void> {
			throw new Error("Function not implemented.");
		},
		filterSnapshotsByStatus: function (status: string): Snapshots<Data> {
			throw new Error("Function not implemented.");
		},
		filterSnapshotsByCategory: function (category: string): Snapshots<Data> {
			throw new Error("Function not implemented.");
		},
		filterSnapshotsByTag: function (tag: string): Snapshots<Data> {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshotsSuccess: function (snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): void {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshotsFailure: function (date: Date, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshotsSuccess: function (snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): void {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshotsFailure: function (date: Date, snapshotId: number, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		handleSnapshotSuccess: function (message: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotId: function (key: string | Data, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): unknown {
			throw new Error("Function not implemented.");
		},
		compareSnapshotState: function (snapshot1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | nuvl, snapshot2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): boolean {
			throw new Error("Function not implemented.");
		},
		payload: undefined,
		dataItems: null,
		newData: null,
		getInitialState: function (): Data {
			throw new Error("Function not implemented.");
		},
		getConfigOption: function (optionKey: string) {
			throw new Error("Function not implemented.");
		},
		getTimestamp: function (): Date {
			throw new Error("Function not implemented.");
		},
		getStores: function (storeId: number, snapshotStores: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshotStoreConfigs: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		getData: function (id: string): Data {
			throw new Error("Function not implemented.");
		},
		setData: function (id: string, data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		addData: function (id: string, data: Partial<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>): void {
			throw new Error("Function not implemented.");
		},
		stores: null,
		getStore: function (storeId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: Event) {
			throw new Error("Function not implemented.");
		},
		addStore: function (storeId: number, snapshotId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: Event): SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null {
			throw new Error("Function not implemented.");
		},
		mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void, mapFn: (item: Data) => Data): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null {
			throw new Error("Function not implemented.");
		},
		mapSnapshotWithDetails: function (storeId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): SnapshotWithData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null {
			throw new Error("Function not implemented.");
		},
		removeStore: function (storeId: number, store: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: Event): void {
			throw new Error("Function not implemented.");
		},
		unsubscribe: function (unsubscribeDetails: { userId: string; snapshotId: string; unsubscribeType: string; unsubscribeDate: Date; unsubscribeReason: string; unsubscribeData: any; }, callback: Callback<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> | null): void {
			throw new Error("Function not implemented.");
		},
		fetchSnapshot: function (callback: (snapshotId: number, payload: FetchSnapshotPayload<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payloadData: Data, category?: Category, categoryProperties: CategoryProperties | undefined, timestamp: Date, data: Data, delegate: SnapshotWithCriteria<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]) => Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined> {
			throw new Error("Function not implemented.");
		},
		fetchSnapshotSuccess: function (snapshotId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: FetchSnapshotPayload<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: Data, delegate: SnapshotWithCriteria<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotFailure: function (snapshotId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		fetchSnapshotFailure: function (snapshotId: number, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		addSnapshotFailure: function (date: Date, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		configureSnapshotStore: function (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, storeId: number, data: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, events: Record<string, CalendarManagerStoreClass<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]>, dataItems: RealtimeDataItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], newData: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: ConfigureSnapshotStorePayload<Data>, store: SnapshotStore<any, Data>, callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void, config: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotSuccess: function (snapshotId: number, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload?: { data?: any; }): void {
			throw new Error("Function not implemented.");
		},
		createSnapshotFailure: function (date: Date, snapshotId: number, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		createSnapshotSuccess: function (snapshotId: number, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload?: { data?: any; }): void {
			throw new Error("Function not implemented.");
		},
		createSnapshots: function (
			id: string,
			snapshotId: number,
			snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[],
			snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			payload: CreateSnapshotsPayload<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			callback: (snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]
		) => void | null,
		snapshotDataConfig?: SnapshotConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined,
		category?: string | Category,
		categoryProperties?: CategoryProperties): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | null {
		throw new Error("Function not implemented.");
		},
		onSnapshot: function (snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		onSnapshots: function (snapshotId: number, snapshots: Snapshots<Data>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshots: Snapshots<Data>) => void): void {
			throw new Error("Function not implemented.");
		},
		parentId: null,
		childIds: null,

		getParentId: function (id: string, snapshot: Snapshot <Data, Data>): string | null {
			return snapshot.parentId ? snapshot.parentId : null;
		},

		getChildIds: function (id: string, childSnapshot: Snapshot <Data, Data>): (string | number | undefined)[] {
			if (childSnapshot.children) {
				return childSnapshot.children.map(child => child.id);
			}
			return [];
		},

		addChild: function (parentId: string, childId: string, childSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			const parentSnapshot = this.getSnapshotById(parentId) as Snapshot <Data, Data>;
			if (!parentSnapshot.children) {
				parentSnapshot.children = [];
			}
			parentSnapshot.children.push(childSnapshot);
			childSnapshot.parentId = parentId;
			console.log(`Added child ${childId} to parent ${parentId}`);
		},

		removeChild: function (parentId: string, childId: string, childSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			const parentSnapshot = this.getSnapshotById(parentId) as Snapshot <Data, Data>;
			if (parentSnapshot.children) {
				parentSnapshot.children = parentSnapshot.children.filter(child => child.id !== childId);
				childSnapshot.parentId = undefined;
				console.log(`Removed child ${childId} from parent ${parentId}`);
			}
		},

		getChildren: function (id: string, childSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): CoreSnapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			const parentSnapshot = this.getSnapshotById(id) as Snapshot <Data, Data>;
			return parentSnapshot.children ? parentSnapshot.children : [];
		},

		hasChildren: function (id: string): boolean {
			const snapshot = this.getSnapshotById(id) as Snapshot <Data, Data>;
			return snapshot.children ? snapshot.children.length > 0 : false;
		},

		isDescendantOf: function (childId: string, parentId: string, parentSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, childSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): boolean {
			let currentParentId = childSnapshot.parentId;
			while (currentParentId) {
				if (currentParentId === parentId) {
					return true;
				}
				const parentSnapshot = this.getSnapshotById(currentParentId) as Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>;
				currentParentId = parentSnapshot.parentId;
			}
			return false;
		},

		getSnapshotById: function (
			id: string, 
			// snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>
		): Snapshot <Data, Data> | null {
			// Mock implementation for retrieving a snapshot by ID.
			// Replace with your actual logic to retrieve the snapshot.
			const mockSnapshotStore: Record<string, Snapshot <Data, Data>> = {
				"parent_1": {
					id: "parent_1",
					data: { id: "1", name: "Parent 1" },
					children: [{
						id: "child_1", data: { id: "2", content: "Child 1 Content" }, parentId: "parent_1",
						config: null,
						timestamp: undefined,
						label: undefined,
						events: undefined,
						restoreSnapshot: function (id: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: number, snapshotData: Data, category?: Category, callback: (snapshot: Data) => void, snapshots: SnapshotsArray<Data, Meta>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotContainer?: Data | undefined, snapshotStoreConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined): void {
							throw new Error("Function not implemented.");
						},
						handleSnapshot: function (id: string, snapshotId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, snapshotData: Data, category?: Category, categoryProperties: CategoryProperties | undefined, callback: (snapshot: Data) => void, snapshots: SnapshotsArray<Data, Meta>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotContainer?: Data | undefined, snapshotStoreConfig?: SnapshotStoreConfig<Data, any> | null | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
							throw new Error("Function not implemented.");
						},
						subscribe: function (snapshotId: number, unsubscribe: UnsubscribeDetails, subscriber: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, data: Data, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: Callback<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, value: Data): [] | SnapshotsArray<Data, Meta> {
							throw new Error("Function not implemented.");
						},
						subscribeToSnapshots: function (snapshotId: number, unsubscribe: UnsubscribeDetails, callback: (snapshots: Snapshots<Data>) => Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null): [] | SnapshotsArray<Data, Meta> {
							throw new Error("Function not implemented.");
						},
						getItem: function (key: Data): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined> {
							throw new Error("Function not implemented.");
						},
						meta: {}
					}],


				},
				"child_1": {
					id: "child_1",
					data: { id: "2", content: "Child 1 Content" },
					parentId: "parent_1",
				},
			};
			return mockSnapshotStore[id];
		},
	}]
  };


	function isPayload(data: any): data is Payload {
		return data.meta !== undefined;
	}
	
	// Example usage
	if (isPayload(data)) {
		// Handle as Payload
	} else {
		// Handle as BaseData
	}




const snapshotConfigOptions: SnapshotConfigOptions<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> = {
	id: "snapshot1",
	snapshotId: 1,
	snapshotStoreData: { /* Snapshots data */ },
	category: "defaultCategory",
	callback: (snapshotStore) => {
		// Callback logic
	},
	snapshotDataConfig: [{

		find: function (arg0: (snapshotId: string, 
			config: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>
		) => boolean): unknown {
			throw new Error("Function not implemented.");
		},
		initialState: undefined,
		id: null,
		data: null,
		timestamp: undefined,
		snapshotId: undefined,
		snapshotStore: {},
		category: undefined,
		criteria: {
			startDate: undefined,
			endDate: undefined,
			status: undefined,
			priority: undefined,
			assignedUser: undefined,
			notificationType: undefined,
			todoStatus: undefined,
			taskStatus: undefined,
			teamStatus: undefined,
			dataStatus: undefined,
			calendarStatus: undefined,
			notificationStatus: undefined,
			bookmarkStatus: undefined,
			priorityType: undefined,
			projectPhase: undefined,
			developmentPhase: undefined,
			subscriberType: undefined,
			subscriptionType: undefined,
			analysisType: undefined,
			documentType: undefined,
			fileType: undefined,
			tenantType: undefined,
			ideaCreationPhaseType: undefined,
			securityFeatureType: undefined,
			feedbackPhaseType: undefined,
			contentManagementType: undefined,
			taskPhaseType: undefined,
			animationType: undefined,
			languageType: undefined,
			codingLanguageType: undefined,
			formatType: undefined,
			privacySettingsType: undefined,
			messageType: undefined
		},
		content: undefined,
		snapshotCategory: undefined,
		snapshotSubscriberId: null,
		snapshotContent: undefined,
		snapshots: [],
		delegate: null,
		getParentId: function (id: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): string | null {
			throw new Error("Function not implemented.");
		},
		getChildIds: function (childSnapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): string[] {
			throw new Error("Function not implemented.");
		},
		clearSnapshotFailure: function (): unknown {
			throw new Error("Function not implemented.");
		},
		mapSnapshots: function (storeIds: number[], snapshotId: string,
			categoryProperties: CategoryProperties | undefined,
			category?: Category,
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, timestamp: string | number | Date | undefined,
			type: string,
			event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			id: number,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			data: Data,
			callback: (storeIds: number[],
				snapshotId: string, category: symbol | string | Category | undefined, categoryProperties: CategoryProperties | undefined, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				timestamp: string | number | Date | undefined,
				type: string,
				event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				id: number,
				snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				data: Data, index: number
			) => SnapshotsObject<Data>): Promise<
				SnapshotsArray<
					SnapshotStorageEntity, 
					SnapshotStorageK,
					SnapshotStorageMeta,
					SnapshotStorageAttachment,
					SnapshotStorageExcludedFields,
					SnapshotStorageIncludedFields>
				> {
				throw new Error("Function not implemented.");
			},
		state: undefined,
		getSnapshotById: function (
			snapshot: (id: string) => Promise<{ 
			category: Category; 
			timestamp: string | number | Date | undefined;
			id: string | number | undefined;
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>;
			data: Data;
		}> | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
			throw new Error("Function not implemented.");
		},
		handleSnapshot: function (
			id: string | number | undefined,
			snapshotId: string | null,
			snapshot: Data | null,
			snapshotData: Data,
			callback: (snapshot: Data) => void,
			snapshots: SnapshotsArray<any>, 
			type: string,
			event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			category?: Category,
			snapshotContainer?: Data | undefined,
			snapshotStoreConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null | undefined
		): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
			throw new Error("Function not implemented.");
		},
		subscribers: [],
		getSnapshotId: function (data: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<string> {
			throw new Error("Function not implemented.");
		},
		snapshot: function (
			id: string | number | undefined, 
			snapshotId: string | null,
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, // Change here
			category?: Category,
			categoryProperties: CategoryProperties | undefined,
			callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null) => void,
			dataStore: DataStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			dataStoreMethods: DataStoreMethods<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			// dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			metadata: UnifiedMetadata<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			subscriberId: string, // Add subscriberId here
			endpointCategory: string | number ,// Add endpointCategory here
			storeProps: SnapshotStoreProps<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotConfigData: SnapshotConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotContainer?: SnapshotContainer<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
		): Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, snapshotData: SnapshotData<SnapshotStorageEntity,
SnapshotStorageK,
SnapshotStorageMeta,
SnapshotStorageAttachment,
SnapshotStorageExcludedFields,
SnapshotStorageIncludedFields> }> {
			throw new Error("Function not implemented.");
		},
		createSnapshot: function (
			id: string, 
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null,
			category: symbol | string | Category | undefined, 
			categoryProperties: CategoryProperties | undefined, 
			callback?: ((snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotStoreConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null,
			snapshotStoreConfigSearch?: SnapshotStoreConfig<
				SnapshotWithCriteria<any, BaseData>,
				  Data
				>
			) => void) | undefined,
		): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null {
			throw new Error("Function not implemented.");
		},
		createSnapshotStore: function (id: string,
			storeId: number,
			snapshotId: string,
			snapshotStoreData: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
			category?: Category, 
			categoryProperties: CategoryProperties | undefined,
			callback?: ((snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void) | undefined,
			snapshotDataConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined
		): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
			throw new Error("Function not implemented.");
		},
		updateSnapshotStore: function (id: string, snapshotId: number, snapshotStoreData: Snapshots<Data>, category?:  Category, callback?: ((snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void) | undefined, snapshotDataConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null> {
			throw new Error("Function not implemented.");
		},
		configureSnapshot: function (
			id: string,
			storeId: number,
			snapshotId: string,
			category?:  Category,
			callback?: ((snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void) | undefined,
			snapshotData?: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined, 
			snapshotStoreConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined
		): { snapshot: Snapshot<T, BaseData>, config: SnapshotConfig<T, BaseData> } | null {
			throw new Error("Function not implemented.");
		},
		configureSnapshotStore: function (
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshotId: string, 
			data: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, 
			events: Record<string, CalendarManagerStoreClass<T, BaseData>[]>, 
			dataItems: RealtimeDataItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
			newData: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			payload: ConfigureSnapshotStorePayload<Data, ExtendedBaseDataPayload>,  // Updated to use ExtendedBaseDataPayload
			store: SnapshotStore<any, Data>,
			callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void
		): {
			snapshotStore: SnapshotStore<T, BaseData>, storeConfig: SnapshotStoreConfig<SnapshotStorageEntity,
SnapshotStorageK,
SnapshotStorageMeta,
SnapshotStorageAttachment,
SnapshotStorageExcludedFields,
SnapshotStorageIncludedFields>
		} {
			throw new Error("Function not implemented.");
		},
		createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): Promise<void> {
			throw new Error("Function not implemented.");
		},
		createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): Promise<void> {
			throw new Error("Function not implemented.");
		},
		batchTakeSnapshot: function (
			snapshotId: string,
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshots: Snapshots<Data>): Promise<{ snapshots: Snapshots<Data>; }> {
			throw new Error("Function not implemented.");
		},
		onSnapshot: function (snapshotId: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		onSnapshots: null,
		onSnapshotStore: function (snapshotId: string, snapshots: Snapshots<Data>, type: string, event: SnapshotEvent<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshots: Snapshots<Data>) => void): void | undefined {
			throw new Error("Function not implemented.");
		},
		snapshotData: function (snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): { snapshots: Snapshots<Data>; } {
			throw new Error("Function not implemented.");
		},
		mapSnapshot: function (snapshotId: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, type: string, event: Event): SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined {
			throw new Error("Function not implemented.");
		},
		createSnapshotStores: function (id: string, snapshotId: string, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: CreateSnapshotStoresPayload<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]) => void | null, snapshotStoreData?: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined, category?:  Category, snapshotDataConfig?: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | undefined): SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | null {
			throw new Error("Function not implemented.");
		},
		initSnapshot: function (snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, snapshotId: string | null, snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, category: symbol | string | Category | undefined, snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshotStore: SnapshotStore<any, any>) => void): void {
			throw new Error("Function not implemented.");
		},
		subscribeToSnapshots: function (
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshotId: string,
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
			snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			callback: (snapshotStore: SnapshotUnion<Data, Meta>[]
			) => void,
			category?: Category, 
			): [] | SnapshotsArray<Data, Meta> {
			throw new Error("Function not implemented.");
		},
		clearSnapshot: function (): void {
			throw new Error("Function not implemented.");
		},
		clearSnapshotSuccess: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; }): void {
			throw new Error("Function not implemented.");
		},
		handleSnapshotOperation: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, operation: SnapshotOperation<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, operationType: SnapshotOperationType): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> | null {
			throw new Error("Function not implemented.");
		},
		displayToast: function (message: string, type: string, duration: number, onClose: () => void): void | null {
			throw new Error("Function not implemented.");
		},
		addToSnapshotList: function (snapshots: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, subscribers: Subscriber<Data, CustomSnapshotData>[]): void | null {
			throw new Error("Function not implemented.");
		},
		addToSnapshotStoreList: function (snapshotStore: SnapshotStore<any, any>, subscribers: Subscriber<Data, CustomSnapshotData>[]): void | null {
			throw new Error("Function not implemented.");
		},
		fetchInitialSnapshotData: function (snapshotId: string, snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, category?: Category, snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		updateSnapshot: function (snapshotId: string, 
			data: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>,
			 events: Record<string, CalendarManagerStoreClass<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, 
			 snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			 dataItems: RealtimeDataItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
			 newData: Data, 
			 payload: UpdateSnapshotPayload<Data>, 
			store: SnapshotStore<any, any>,
			callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }>): Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		getSnapshots: function (category: symbol | string | Category | undefined, snapshots: SnapshotsArray<Data, Meta>): Promise<{ snapshots: SnapshotsArray<Data, Meta>; }> {
			throw new Error("Function not implemented.");
		},
		getSnapshotItems: function (category: symbol | string | Category | undefined, snapshots: SnapshotsArray<Data, Meta>): Promise<{ snapshots: SnapshotItem<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; }> {
			throw new Error("Function not implemented.");
		},
		takeSnapshot: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<{ snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		takeSnapshotStore: function (snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<{ snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		addSnapshot: function (snapshot: Data, subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		addSnapshotSuccess: function (snapshot: Data, subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		removeSnapshot: function (snapshotToRemove: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		getSubscribers: function (subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshots: Snapshots<Data>): Promise<{ subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshots: Snapshots<Data>; }> {
			throw new Error("Function not implemented.");
		},
		addSubscriber: function (
			subscriber: Subscriber <Data, Data>,
			data: Data,
			snapshotConfig: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, Data>[],
			delegate: SnapshotStoreSubset<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			sendNotification: (type: NotificationTypeEnum) => void
		): void {
			throw new Error("Function not implemented.");
		},
		validateSnapshot: function (data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): boolean {
			throw new Error("Function not implemented.");
		},
		getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; data: Data; }> | undefined): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		getSnapshotContainer: function (
			snapshotFetcher: (id: string | number

			) => Promise<{
			id: string;
			category: string; 
			timestamp: string;
			snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>;
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; 
			snapshots: Snapshots<Data>; 
			subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; 
			data: Data; 
			newData: Data; 
			unsubscribe: () => void; 
			addSnapshotFailure: (snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>,
				payload: { error: Error; }) => void; 
			deleteSnapshot: (id: string) => void; 
			createSnapshotSuccess: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void; 
			createSnapshotFailure: (snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }) => void; 
			updateSnapshotSuccess: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void; 
			
			batchUpdateSnapshotsSuccess: (snapshots: Snapshots<Data>) => void; 
			batchUpdateSnapshotsFailure: (snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }) => void; 
			batchUpdateSnapshotsRequest: (snapshots: Snapshots<Data>) => void; 
			
			createSnapshots: (snapshots: Snapshots<Data>) => void; 
			batchTakeSnapshot: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void; 
			batchTakeSnapshotsRequest: (snapshots: Snapshots<Data>) => void;
			batchFetchSnapshots: (criteria: any) => Promise<Snapshots<Data>>; 
			batchFetchSnapshotsSuccess: (snapshots: Snapshots<Data>) => void; 
			batchFetchSnapshotsFailure: (snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }) => void; 
			filterSnapshotsByStatus: (status: string) => Snapshots<Data>;
			
				filterSnapshotsByCategory: (category: string) => Snapshots<Data>;
			filterSnapshotsByTag: (tag: string) => Snapshots<Data>;
			fetchSnapshot: (id: string) => Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>;
			
			getSnapshotData: (id: string) => Data;
			setSnapshotCategory: (id: string, category: string) => void;
			getSnapshotCategory: (id: string) => string;
			getSnapshots: (criteria: any) => Snapshots<Data>;
			getAllSnapshots: () => Snapshots<Data>; 
			addData: (id: string, data: Data) => void; 
			setData: (id: string, data: Data) => void; 
			getData: (id: string) => Data; 
			
			dataItems: () => Data[]; 
			getStore: (id: string) => SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; 
			addStore: (store: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void; 
			removeStore: (id: string) => void; 
			stores: () => SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; 
			configureSnapshotStore: (config: any) => void; 
			
			onSnapshot: (callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void) => void; 
			onSnapshots: (callback: (snapshots: Snapshots<Data>) => void) => void; 
			events: any; notify: (message: string) => void; 
			
			notifySubscribers: (  message: string,
        subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], 
        data: Partial<SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>
      ) => Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] 
  
				parentId: string;
				childIds?: K[]; 
			
			getParentId: (id: string) => string; 
			getChildIds: (id: string) => string[]; 
				addChild: (parentId: string, childId: string) => void;
				removeChild: (parentId: string, childId: string) => void; getChildren: (id: string) => string[]; hasChildren: (id: string) => boolean; isDescendantOf: (childId: string, parentId: string) => boolean; generateId: () => string; 
			compareSnapshots: (snap1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snap2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => number; 
			compareSnapshotItems: (item1: Data, item2: Data) => number; 
			mapSnapshot: (snap: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			mapFn: (item: Data) => Data) => Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; 
			compareSnapshotState: (state1: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | null, state2: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => boolean 
			getConfigOption: (key: string) => any; 
			getTimestamp: () => string;
			getInitialState: () => any; 
			getStores: () => SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; 
			getSnapshotId: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => string;
			handleSnapshotSuccess: (message: string) => void;
		}> | undefined
		): Promise<SnapshotContainer<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		getSnapshotVersions: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: string, snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, versionHistory: VersionHistory): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> | null {
			throw new Error("Function not implemented.");
		},
		fetchData: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: string, snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		snapshotMethods: function (
			snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshotId: string, 
			snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			snapshotConfig: SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
			callback: (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>
			) => Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>, 
			versionHistory: VersionHistory
		): Promise<Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		getAllSnapshots: function (data: (subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshots: Snapshots<Data>) => Promise<Snapshots<Data>>): Promise<Snapshots<Data>> {
			throw new Error("Function not implemented.");
		},
		getSnapshotStoreData: function (snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotId: string, snapshotData: SnapshotData<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		takeSnapshotSuccess: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotFailure: function (payload: { error: string; }): void {
			throw new Error("Function not implemented.");
		},
		takeSnapshotsSuccess: function (snapshots: Data[]): void {
			throw new Error("Function not implemented.");
		},
		fetchSnapshot: function (id: string, category?: Category, timestamp: Date, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, data: Data, delegate: SnapshotWithCriteria<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | null): Promise<{ id: any; category: Category; timestamp: any; snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; data: Data; delegate: SnapshotWithCriteria<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] | null; }> {
			throw new Error("Function not implemented.");
		},
		addSnapshotToStore: function (storeId: number, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotStore: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshotStoreData: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, category?: Category, subscribers: Subscriber<Data, CustomSnapshotData>[]): void {
			throw new Error("Function not implemented.");
		},
		getSnapshotSuccess: function (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>): Promise<SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>> {
			throw new Error("Function not implemented.");
		},
		setSnapshotSuccess: function (snapshot: SnapshotStore<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, subscribers: ((data: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void)[]): void {
			throw new Error("Function not implemented.");
		},
		setSnapshotFailure: function (error: any): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, payload: { error: Error; }): void | null {
			throw new Error("Function not implemented.");
		},
		updateSnapshotsSuccess: function (snapshotData: (subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshot: Snapshots<Data>) => void): void {
			throw new Error("Function not implemented.");
		},
		fetchSnapshotSuccess: function (snapshotData: (snapshotManager: SnapshotManager<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotForSubscriber: function (subscriber: Subscriber <Data, Data>, snapshots: Snapshots<Data>): Promise<{ subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshots: Data[]; }> {
			throw new Error("Function not implemented.");
		},
		updateMainSnapshots: function (snapshots: Snapshots<Data>): Promise<Snapshots<Data>> {
			throw new Error("Function not implemented.");
		},
		batchProcessSnapshots: function (subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshots: Snapshots<Data>): Promise<{ snapshots: Snapshots<Data>; }[]> {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshots: function (subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshots: Snapshots<Data>): Promise<{ snapshots: Snapshots<Data>; }[]> {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshotsRequest: function (snapshotData: { subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshots: Snapshots<Data>; }): Promise<{ subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; snapshots: Snapshots<Data>; }> {
			throw new Error("Function not implemented.");
		},
		batchTakeSnapshotsRequest: function (snapshotData: any): Promise<{ snapshots: Snapshots<Data>; }> {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshotsRequest: function (
			snapshotData: (
				subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[],
			) => Promise<{
				subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[]; 
				snapshots: Snapshots<Data>;
			}>
		): { 
					subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; 
					snapshots: Snapshots<Data>; 
				} {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshots: function (
			criteria: CriteriaType,
			snapshotData: (
				snapshotIds: string[], 
				subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
				snapshots: Snapshots<Data>
			) => Promise<{
				subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, 
				snapshots: Snapshots<Data>
			}>
		): Promise<{ 
			subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; 
			snapshots: Snapshots<Data>; 
		}> {
			throw new Error("Function not implemented.");
		},
		getData: function (data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | Snapshot<CustomSnapshotData, CustomSnapshotData>): Promise<{ data: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>; }> {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshotsSuccess: function (subscribers: SubscriberCollection<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, snapshots: Snapshots<Data>): Snapshots<Data> {
			throw new Error("Function not implemented.");
		},
		batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		notifySubscribers: function (subscribers: Subscriber<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[], data: Partial<SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>): Subscriber <Data, Data>[] {
			throw new Error("Function not implemented.");
		},
		notify: function (id: string, message: string, content: any, date: Date, type: NotificationType): void {
			throw new Error("Function not implemented.");
		},
		getCategory: function (category: symbol | string | Category | undefined): CategoryProperties | undefined {
			throw new Error("Function not implemented.");
		},
		updateSnapshots: function (): void {
			throw new Error("Function not implemented.");
		},
		updateSnapshotsFailure: function (error: Payload): void {
			throw new Error("Function not implemented.");
		},
		flatMap: function <U>(callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, index: number, array: (Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | SnapshotStoreConfig<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>)[]) => U): void | U[] {
			throw new Error("Function not implemented.");
		},
		setData: function (data: Map<string, Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>>): void {
			throw new Error("Function not implemented.");
		},
		getState: function () {
			throw new Error("Function not implemented.");
		},
		setState: function (state: any): void {
			throw new Error("Function not implemented.");
		},
		handleActions: function (action: any): void {
			throw new Error("Function not implemented.");
		},
		setSnapshots: function (snapshots: Snapshots<Data>): void {
			throw new Error("Function not implemented.");
		},
		mergeSnapshots: function (snapshots: Snapshots<Data>, category: string): Promise<void> {
			throw new Error("Function not implemented.");
		},
		reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => U, initialValue: U): U {
			throw new Error("Function not implemented.");
		},
		sortSnapshots: function (compareFn: (a: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>, b: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => number): void {
			throw new Error("Function not implemented.");
		},
		filterSnapshots: function (predicate: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => boolean): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>[] {
			throw new Error("Function not implemented.");
		},
		findSnapshot: function (predicate: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => boolean): Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields> | undefined {
			throw new Error("Function not implemented.");
		},
		subscribe: function (callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		unsubscribe: function (callback: (snapshot: Snapshot<SnapshotStorageEntity, SnapshotStorageK, SnapshotStorageMeta, SnapshotStorageAttachment, SnapshotStorageExcludedFields, SnapshotStorageIncludedFields>) => void): void {
			throw new Error("Function not implemented.");
		},
		fetchSnapshotFailure: function (payload: { error: Error; }): void {
			throw new Error("Function not implemented.");
		},
		generateId: function (): string {
			throw new Error("Function not implemented.");
		},
		useSimulatedDataSource: false,
		simulatedDataSource: [],
		[Symbol.iterator]: function (): IterableIterator<Data> {
			throw new Error("Function not implemented.");
		},
		[Symbol.asyncIterator]: function (): AsyncIterableIterator<Data> {
			throw new Error("Function not implemented.");
		}
	}]
};

export {
	snapshotConfigOptions
};
};

