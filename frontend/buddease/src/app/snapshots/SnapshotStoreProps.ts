// SnapshotStoreProps.ts
import { SnapshotEventBase } from '@/app/snapshots/SnapshpshotEvents';
import { BaseEntityProperties, SharedIdentifiers, SharedSnapshotProperties } from '@/app/components/documents/RelatedProps';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { BaseData } from '@/app/models/data/Data';
import { Meta } from '@/app/components/models/data/dataStoreMethods';
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import { Attachment } from '@/app/documents/Attachment/attachment';
import { useSecureUserId } from '@/app/hooks/useSecureUserId';
import { createBaseData, useSnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Data } from '@/app/models/data/Data';
import { StatusType } from "@/app/models/data/StatusType";
import { K, T } from '@/app/models/data/dataStoreMethods';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { createDataStore, DataStore, InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { ExcludedFields } from '@/app/routing/Fields';
import { SnapshotConfig, SnapshotData } from '@/app/snapshots';
import {
  Snapshots,
  SnapshotsArray,
  SnapshotUnion
} from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotOperation, SnapshotOperationType } from "@/app/snapshots/SnapshotActions";
import { ConfigureSnapshotStorePayload } from "@/app/snapshots/SnapshotConfig";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { InitializedData, SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';
import { data } from '@/app/snapshots/SnapshotWithCriteria';
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { fetchSnapshotsForCategory } from '@/app/snapshots/fetchSnapshotsForCategory';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from '@/app/subscribers/Subscriber';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { addToSnapshotList, isSnapshot } from '@/app/utils/snapshotUtils';
import { Version } from "@/app/versions/Version";
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { BaseSnapshotProps } from '@/createBaseSnapshot';
import { displayToast } from '@/models/display/ShowToast';
import { Payload } from "@/server/database/Payload";
import { SchemaField } from "@/server/database/SchemaField";
import baseMeta from "@/server/database/baseMeta";
import { createSnapshotStoreConfig } from '@/snapshotStoreConfigInstance';
import { BrowserBehaviorConfig } from "@/state/BrowserBehaviorManager";
import { version } from "react";
import { snapshotStoreConfig } from '.';

// Base interface for all snapshot store properties

interface BaseSnapshotStoreProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntityProperties {
  // Core identifiers
  storeId: string | number;
  id?: string | number | undefined;
  name: string;
  description?: string | undefined;
  priority?: string | undefined;

  // Categorization
  category: Category | undefined;
  categoryProperties?: CategoryProperties;
  endpointCategory: string | number;
  criteria?: CriteriaType;

  // Timing
  timestamp?: string | number | Date | undefined;
  createdAt?: string | Date | undefined;
  expirationDate: Date;

  // Configuration
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>;
  options?: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  browserBehaviorConfig?: BrowserBehaviorConfig;
  dataStoreConfig?: Record<string, any>;

  // Schema and structure
  schema: Record<string, SchemaField>;

  // Data storage
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  additionalData?: CustomSnapshotData<T> | undefined;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotsArray?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  state?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
  existingConfigs?: Map<string, SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // State management
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Operations
  operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  payload: Payload | undefined;

  // Communication
  message?: string;

  // Storage
  localStorage?: Storage;

  // Callbacks
  callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Methods
  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): number;

  // Partial self-reference
  storeProps: Partial<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}

// Enhanced SnapshotStoreProps type that extends all interfaces
type SnapshotStoreProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = BaseSnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
  SharedSnapshotProperties<T, K, ExcludedFields> &
  SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
  SnapshotEventBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
  BaseSnapshotProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
    // Ensure these specific properties are properly typed
    version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotId?: string | number | null;
    snapshotContainer?: any;
    delegate?: any;
    snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  };

// Utility type to extract all properties for easy destructuring
type CompleteSnapshotStoreProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
> = Required<SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

// Example usage with proper destructuring
function useSnapshotStoreProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
>(props: CompleteSnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  // All properties from all interfaces are now accessible
  const {
    // From BaseSnapshotStoreProps
    storeId,
    category,
    name,
    criteria,
    timestamp,
    eventRecords,
    snapshotStoreConfig,
    schema,
    options,
    config,
    createdAt,
    initialState,
    operation,
    id,
    snapshots,
    snapshotsArray,
    data,
    message,
    state,
    existingConfigs,
    description,
    priority,
    version,
    additionalData,
    expirationDate,
    localStorage,
    payload,
    callback,
    storeProps,
    endpointCategory,
    browserBehaviorConfig,
    findIndex,

    // From SharedSnapshotProperties
    isCore,
    isActive,
    isArchived,
    isPublished,
    isDraft,
    previousVersionId,
    nextVersionId,
    ownerId,
    createdBy,
    updatedBy,
    permissions,
    visibility,
    accessControlList,
    relatedSnapshotIds,
    dependencyIds,
    referenceIds,
    viewCount,
    downloadCount,
    shareCount,
    confidenceScore,
    accuracyScore,
    completenessScore,
    sourceSystem,
    importId,
    externalReferences,
    publishedAt,
    archivedAt,
    lastAccessedAt,
    sizeInBytes,
    estimatedSize,
    checksum,
    validationStatus,
    lastValidatedAt,

    // From SharedIdentifiers
    _id,
    title,
    label,
    key,
    value,
    categoryProperties,
    snapshotId,

    // From SnapshotEventBase
    target,
    snapshotData,
    dataItems,

    // From BaseSnapshotProps
    baseId,
    baseConfig,
    meta,
    convertKeyToT,
    initializeState,
    snapshotMethods,
    subscribers,

    // Additional missing properties
    snapshotContainer,
    delegate
  } = props;

  // Now all properties are accessible with proper typing
  return {
    // Use the properties as needed
    storeId, snapshotId, category, name, criteria, snapshotData
  };
}

// Helper function to create normalized props
function createSnapshotStoreProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
>(props: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    // Default values for required properties
    storeId: props.storeId,
    name: props.name,
    category: props.category,
    expirationDate: props.expirationDate,
    schema: props.schema,
    initialState: props.initialState,
    operation: props.operation,
    payload: props.payload,
    callback: props.callback,
    storeProps: props.storeProps,
    endpointCategory: props.endpointCategory,
    config: props.config,
    // Spread all other properties
    ...props
  };
}

// Type guard for complete props validation
function isCompleteSnapshotStoreProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = keyof T,
  IncludedFields extends keyof T = keyof T
>(props: any): props is CompleteSnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    props.storeId !== undefined &&
    props.name !== undefined &&
    props.category !== undefined &&
    props.expirationDate !== undefined &&
    props.schema !== undefined &&
    props.initialState !== undefined &&
    props.operation !== undefined &&
    props.payload !== undefined &&
    props.callback !== undefined &&
    props.storeProps !== undefined &&
    props.endpointCategory !== undefined &&
    props.config !== undefined
  );
}


const { latestVersion = createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), ...rest } = (data as Record<string, any>) || {};

type ExampleEntity = BaseDataEntity & { name: string };

// Initialize storeProps with meaningful values
const storeProps: SnapshotStoreProps<ExampleEntity,
  ExampleEntity,
  DefaultMeta<ExampleEntity, ExampleEntity>,
  DefaultExcludedFields<ExampleEntity>
> = {
  category: "storeProp-category",  // Assuming category can be a string
  initialState: "",
  callback: (snapshotStore: SnapshotStore<ExampleEntity,
    ExampleEntity,
    DefaultMeta<ExampleEntity, ExampleEntity>,
    DefaultExcludedFields<ExampleEntity>
  >) => { },
  storeProps: [],
  endpointCategory: "",
  expirationDate: new Date(),

  payload: {
    error: undefined,  // Provide a valid error value (e.g., `null` or an error object)
    meta: {
      name: "Sample Notification",
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO, // Replace with the appropriate enum value
      startDate: new Date(),
      endDate: new Date(),
      status: StatusType.ACTIVE, // Replace with the appropriate status
      id: "unique-notification-id",
      isSticky: false,
      isDismissable: true,
      isClickable: true,
      isClosable: true,
      isAutoDismiss: true,
      isAutoDismissable: true,
      isAutoDismissOnNavigation: false,
      isAutoDismissOnAction: false,
      isAutoDismissOnTimeout: true,
      isAutoDismissOnTap: false,
      optionalData: null, // Adjust if needed
      data: {}
    }
  },

  storeId: "yourStoreId",
  name: "MySnapshotStore", // Provide a valid name
  version: {

    isActive: true,
    releaseDate: "2023-07-20",
    updateStructureHash: async () => { },
    setStructureData: (newData: string) => { },

    hash: (value: string) => "",
    currentHash: "",
    structureData: "",
    calculateHash: () => "",


    id: 1,
    versionNumber: '1.0.0',
    major: 1,
    minor: 0,
    patch: 0,
    appVersion: '1.0.0',
    name: 'Initial version',
    url: '/versions/1',
    documentId: 'doc123',
    draft: false,
    userId: 'user1',
    content: 'Version content',
    metadata: {
      author: 'Author Name',
      area: 'snapshot store area',
      metadataEntries: {},
      schema: {},
      timestamp: new Date(),
      latestVersion
    },
    versions: null,
    checksum: 'abc123',
    isLatest: true,
    isPublished: true,
    publishedAt: new Date(),
    source: 'initial',
    status: 'active',
    workspaceId: 'workspace1',
    workspaceName: 'Main Workspace',
    workspaceType: 'document',
    workspaceUrl: '/workspace/1',
    workspaceViewers: ['viewer1', 'viewer2'],
    workspaceAdmins: ['admin1'],
    workspaceMembers: ['member1', 'member2'],
    data: [],
    versionHistory: {
      versionData: {},
      latestVersion: latestVersion,
      history: [],
      timestamp: new Date()
    },
    _structure: {}, // Structure of the version
    versionData: {
      id: "1", // Required property
      name: "Version Name", // Add required property
      url: "/version-url", // Add required property
      versionNumber: "1.0.0", // Add required property
      documentId: "document1", // Add required property
      draft: false, // Add required property
      userId: "user1", // Add required property

      content: "Version content goes here.", // Add required property

      major: 1, // Add required property
      minor: 0, // Add required property
      patch: 0, // Add required property
      checksum: "checksum123", // Add required property
      parentId: null, // or provide a valid ID
      parentType: "document", // or whatever type it should be
      parentVersion: "1.0.0", // Required property
      parentTitle: "Parent Document Title", // Required property
      parentContent: "Content of the parent document.", // Required property
      parentName: "Parent Document", // Required property
      parentUrl: "/parent-document", // Required property
      parentChecksum: "abc123", // Required property
      parentAppVersion: "1.0.0", // Required property
      parentVersionNumber: "1.0.0", // Required property
      isLatest: true, // Required property
      isPublished: false, // Required property
      publishedAt: null, // or a valid Date
      source: "initial", // Required property
      status: "active", // Required property
      version: version, // Required property
      timestamp: new Date(), // Required property
      user: "user1", // Required property
      changes: [], // Required property
      comments: [], // Required property
      workspaceId: "workspace1", // Required property
      workspaceName: "Main Workspace", // Required property
      workspaceType: "document", // Required property
      workspaceUrl: "/workspace/1", // Required property
      workspaceViewers: ["viewer1", "viewer2"], // Required property
      workspaceAdmins: ["admin1"], // Required property
      workspaceMembers: ["member1", "member2"], // Required property
      createdAt: new Date(), // Optional property
      updatedAt: new Date(), // Optional property
      _structure: {}, // Optional property, adjust as needed
      frontendStructure: Promise.resolve([]), // Optional property, adjust as needed
      backendStructure: Promise.resolve([]), // Optional property, adjust as needed
      data: undefined, // Adjust as per actual usage
      backend: undefined, // Adjust as per actual usage
      frontend: undefined, // Adjust as per actual usage
      isActive: true, // Optional property
      releaseDate: "2023-01-01", // Optional property
      setServices: (services: Record<string, any>) => {

      },
      notes: [],
      latestVersion,
      schema: {},
      metadata: {
        author: "Author Name", // Provide a valid author name
        timestamp: new Date(), // Provide a valid timestamp; can be Date, string, or number
        revisionNotes: "Initial version created.", // Optional property
        area: 'storeProps area',
        metadataEntries: {},
        latestVersion,
        schema: {}
      }, // Add required property
    },
    description: "Version description", // Description of the version
    buildNumber: "1", // Build number
    parentId: null, // Parent ID of the version
    parentType: "document", // Type of the parent document
    parentVersion: "1.0.0", // Parent version number
    parentTitle: "Parent Document Title", // Title of the parent version
    parentContent: "Content of the parent document.", // Content of the parent version
    parentName: "Parent Document", // Name of the parent
    parentUrl: "/parent-document", // URL of the parent
    parentChecksum: "parent-checksum", // Checksum of the parent
    parentAppVersion: "1.0.0", // App version of the parent
    parentVersionNumber: "1.0.0", // Version number of the parent
    getVersionNumber: () => ""
  },
  // Example version
  schema: {}, // Provide a valid schema or mock
  options: {
    id: 0,
    storeId: 0,
    baseURL: "https://example.com",
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    maxAge: 0,
    staleWhileRevalidate: 1000,
    cacheKey: "exampleCacheKey",

    initialState: {},
    eventRecords: {},
    records: [],
    category: "",

    date: new Date(),
    type: "",
    snapshotId: "",
    snapshotStoreConfig: undefined,
    criteria: {},
    callbacks: {},
    subscribeToSnapshots: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshots: SnapshotsArray<ExampleEntity,
          ExampleEntity,
          DefaultMeta<ExampleEntity, ExampleEntity>,
          DefaultExcludedFields<ExampleEntity>
        >
      ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshots: SnapshotsArray<ExampleEntity,
        ExampleEntity,
        DefaultMeta<ExampleEntity, ExampleEntity>,
        DefaultExcludedFields<ExampleEntity>
      >,
      unsubscribe?: UnsubscribeDetails,
    ): SnapshotsArray<ExampleEntity, ExampleEntity, DefaultMeta<ExampleEntity, ExampleEntity>, DefaultExcludedFields<ExampleEntity>> | [] => {
      // Implement your logic here
      return snapshots; // or modify the snapshots as needed
    },
    
    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
      // Implement your logic here
      return null; // or return a Subscriber if necessary
    },
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => {
      // Implement your logic here
    },
    unsubscribeToSnapshot: (snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ) => {
      // Implement your logic here
    },
    delegate: null,
    getDelegate: async (context) => {
      const { useSimulatedDataSource, simulatedDataSource } = context;

      if (useSimulatedDataSource) {
        const stores = simulatedDataSource.map(() => {
          const { store } = createDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
          return store;
        });

        return stores;
      }

      return [];
    },
    getCategory: async <T extends BaseDataEntity, K extends T = T>(
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      additionalHeaders?: Record<string, string>
    ): Promise<{
      categoryProperties: CategoryProperties;
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    }> => {

      // Type guard with proper typing
      const isCategoryProperties = (cat: unknown): cat is CategoryProperties => {
        return typeof cat === 'object' && cat !== null && 'name' in cat;
      };

      // Default properties with complete typing
      const defaultProperties: CategoryProperties = {
        id: snapshotId,
        type: type || 'default',
        name: 'Unnamed Category',
        description: '',
        icon: 'default-icon',
        color: '#000000',
        iconColor: '#FFFFFF',
        isActive: true,
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
        brandName: '',
        brandLogo: '',
        brandColor: '',
        brandMessage: '',
        chartType: 'bar',
        dataProperties: [],
        formFields: [],
        componentDescription: undefined
      };

      // Fetch snapshots with proper error handling
      let snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
      try {
        snapshots = await fetchSnapshotsForCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          snapshotId,
          type,
          category
        );
      } catch (error) {
        console.error('Failed to fetch snapshots:', error);
        // Return empty array but you could also throw or handle differently
      }

      // Process category properties
      const categoryProperties: CategoryProperties = (() => {
        if (!category) return defaultProperties;

        if (isCategoryProperties(category)) {
          return { ...defaultProperties, ...category };
        }

        // Handle string/symbol case
        return {
          ...defaultProperties,
          name: typeof category === 'symbol' ?
            category.description || 'Symbol Category' :
            category,
          id: category.toString()
        };
      })();

      return {
        categoryProperties,
        snapshots
      };
    },

    configureSnap: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties?: CategoryProperties,
      callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>
    ): SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {

      const config: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        id,
        storeId,
        snapshotId,
        snapshotData, // pass it directly
        dataStoreMethods,
        category,
        categoryProperties: categoryProperties || {
          id: snapshotId,
          type: 'default',
          name: typeof category === 'object' ? category.name : String(category),
          description: '',
          icon: 'default',
          color: '#000000',
          iconColor: '#FFFFFF',
          isActive: true,
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
          brandName: '',
          brandLogo: '',
          brandColor: '#000000',
          brandMessage: '',
          chartType: 'bar',
          dataProperties: [],
          formFields: [],
        },
        callback,
        snapshotStore,
        metadata: snapshotStoreConfig?.metadata,
      };

      if (callback && isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotData)) {
        callback(snapshotData);
      }

      return config;
    },
    initSnapshot: (
      snapshot,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback
    ) => {
      // Implement your logic here
    },
    createSnapshot: (
      id,
      snapshotData,
      category,
      categoryProperties,
      callback,
      snapshotStore,
      snapshotStoreConfig
    ) => {
      // Implement your logic here
      return null; // or return the created Snapshot
    },
    createSnapshotStore: async (
      id,
      storeId,
      snapshotId,
      snapshotStoreData,
      category,
      categoryProperties,
      callback,
      snapshotDataConfig
    ) => {
      // Implement your logic here
      return Promise.resolve(null); // or return the created SnapshotStore
    },

    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties?: CategoryProperties,
      callback?: (snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
      const baseData: BaseData = createBaseData({ ...snapshotData });

      // ✅ Pass the snapshotData instead of transformedSnapshot
      const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = createSnapshot(
        baseData, 
        baseMeta, 
        snapshotId, 
        snapshotData, // Use the original data
        category, 
        snapshotStore, 
        snapshotStoreConfig
      );

      callback?.(newSnapshot);
      return Promise.resolve(newSnapshot);
    },

    configureSnapshotStore: (
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: Record<string, any>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback?: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ): Promise<{
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      updatedStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    }> => {
      // Step 1: Update the snapshot data
      if (snapshotId && newData) {
        // Update or add new snapshot data to the store
        data.set(snapshotId, newData);
      }

      // Step 2: Handle events (optional)
      // If events need to trigger some changes in the snapshotStore or data processing, handle them here
      if (events) {
        // For example, you could update metadata or trigger some event-specific logic
        for (const eventKey in events) {
          // Perform some action based on the event key and its data
          const eventData = events[eventKey];
          console.log(`Handling event: ${eventKey}`, eventData);
        }
      }

      // Step 3: Process dataItems if necessary
      if (dataItems && dataItems.length > 0) {
        // Example: Update snapshotStore based on the real-time data items
        dataItems.forEach((item) => {
          // Logic to update snapshotStore or snapshot data based on real-time data item
          console.log(`Processing data item: ${item.id}`, item);
        });
      }

      // Step 4: Optionally, call the callback if provided
      if (callback) {
        callback(snapshotStore);
      }

      // Step 6: Return the updated snapshotStore and the new storeConfig
      return Promise.resolve({
        snapshotStore,
        storeConfig,
      });
    },
    getDataStoreMethods: (
      snapshotStoreConfig,
      dataStoreMethods
    ) => {
      // Implement your logic here
      return {}; // or the appropriate Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    },
    // Array of SnapshotStoreMethod<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    snapshotMethods: [],
    handleSnapshotOperation: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      mappedData: Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Ensure you use this in your logic
      operationType: SnapshotOperationType
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
      return new Promise((resolve) => {

        // Use useSecureUserId to get the current user's ID and ensure the user is authenticated
        const { userId, error: userError } = useSecureUserId();

        if (userError || !userId) {
          console.error("User validation failed:", userError);
          resolve(null);
          return;
        }

        // Check if data is valid
        if (!data || !data.records) {
          resolve(null); // Resolve with null if data is invalid
          return; // Exit the function early
        }
        // Use the isSnapshot type guard to validate the snapshot
        const isValidSnapshot = isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot);

        if (!isValidSnapshot) {
          resolve(null); // Resolve with null if the snapshot is invalid
          return;
        }
        // Check if a snapshot with the requested properties exists
        const existingSnapshot = data.records.find(
          (record: CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => record.id === snapshot.id
        );
        if (!existingSnapshot) {
          console.warn("No matching snapshot found for the provided properties.");
          resolve(null);
          return;
        }

        const { snapshotManager, snapshotStore } = useSnapshotManager<T, K, Meta, ExcludedFields>(Number(storeId), storeProps);


        // If all conditions are met, create a new snapshot instance using createSnapshotInstance
        const newSnapshot = createSnapshot<Data<BaseData<any>>, Data<BaseData<any>>>(
          snapshot.baseData,
          snapshot.baseMeta,
          snapshot.id,
          snapshot.category,
          snapshotStore || null,
          snapshotManager || null,
          snapshotStoreConfig || null,
        );

        resolve(newSnapshot);
      });
    },

    handleSnapshotStoreOperation: async (
      snapshotId: string | number,
      snapshotStore: SnapshotStore<ExampleEntity,
        ExampleEntity,
        DefaultMeta<ExampleEntity, ExampleEntity>,
        DefaultExcludedFields<ExampleEntity>
      >,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      operationType: SnapshotOperationType,
      callback?: (result: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void
    ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
      try {
        // Validate inputs
        if (!snapshotId || !snapshotStore || !operation) {
          throw new Error('Missing required parameters for snapshot operation');
        }

        // Log the operation for debugging
        console.log(`Handling snapshot operation: ${operationType} for snapshot ID: ${snapshotId}`);

        let result: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;

        // Handle different operation types
        switch (operationType) {
          case 'createSnapshot':
            result = await handleCreateOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          case 'updateSnapshot':
            result = await handleUpdateOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          case 'deleteSnapshot':
            result = await handleDeleteOperation(snapshotId, snapshotStore, operation);
            break;

          case 'readSnapshot':
            result = await handleReadOperation(snapshotId, snapshotStore, operation);
            break;

          case 'validateSnapshot':
            result = await handleValidateOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          case 'publishSnapshot':
            result = await handlePublishOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          case 'archiveSnapshot':
            result = await handleArchiveOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          case 'restoreSnapshot':
            result = await handleRestoreOperation(snapshotId, snapshotStore, snapshot, operation);
            break;

          default:
            throw new Error(`Unsupported operation type: ${operationType}`);
        }

        // Execute callback if provided
        if (callback) {
          callback(result);
        }

        return result;

      } catch (error) {
        console.error('Error handling snapshot store operation:', error);

        // Execute callback with error result if provided
        if (callback) {
          callback(null);
        }

        throw error; // Re-throw for upstream handling
      }
    },
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    isAutoDismiss: false,
    isAutoDismissable: false,
    isAutoDismissOnNavigation: false,
    isAutoDismissOnAction: false,
    isAutoDismissOnTimeout: false,
    isAutoDismissOnTap: false,
    isClickable: true,
    isClosable: true,
    optionalData: {},
    useSimulatedDataSource: false,
    simulatedDataSource: {},
    // Update as per your requirements

  },

  config: Promise.resolve(null), // Set a valid config or null
  operation: {
    operationType: SnapshotOperationType.CreateSnapshot
  }, // Example operation
  id: "someId",
  snapshots: [], // Optional snapshots array
  timestamp: new Date(), // Optional timestamp
  message: "Some message", // Optional message
  state: null, // Optional state
  eventRecords: null, // Optional event records


    // Use async IIFE to handle the async operation
  storeConfig: (async () => {
    return await createSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  })()
};

export { storeProps };
export type { SnapshotStoreProps };

