// createVersionInfo.ts
import { frontendStructure } from "@/core/config/appStructure/FrontendStructure";
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { useMeta } from "@/core/config/useMeta";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import DocumentPermissions from "@/core/documents/DocumentPermissions";
import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { Data } from '@/core/models/data/Data';
import type { TagsRecord } from '@/core/models/tracker/Tag';
import { fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { data } from "@/core/snapshots/SnapshotWithCriteria";
import type { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta } from '@/core/typings/entities/DataEntity';
import type { DefaultSnapshotTypes, SnapshotAttachment, SnapshotEntity, SnapshotExcludedFields, SnapshotIncludedFields, SnapshotK, SnapshotMeta } from '@/core/typings/entities/SnapshotEntity';
import type { VersionAttachment, VersionEntity, VersionExcludedFields, VersionIncludedFields, VersionK, VersionMeta } from '@/core/typings/entities/VersionEntity';
import { convertSnapshotContainerToStore } from "@/core/typings/YourSpecificSnapshotType";
import { createLatestVersion } from '@/core/versions/createLatestVersion';
import type { VersionData, VersionHistory } from "@/core/versions/VersionData";
import { default as Version, default as VersionImpl } from "./Version";

const { latestVersion = createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(), ...rest } = data;

// Default reusable data
const defaultData: Data<DataEntity, DataK, DataMeta, DataAttachment, DataIncludedFields, DataExcludedFields> = {
  id: 'default-id', // Replace with a unique identifier logic if needed
  category: 'default-category',
  subtasks: [],
  actions: [],
  latestVersion: latestVersion
  // Add other required fields as per your `Data` interface
};


const createVersionInfo = (
  versionData: string | VersionData<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>
): Version<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> => {
  const docPermissions = new DocumentPermissions(true, true);

  const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

  const currentMeta: StructuredMetadata<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> = useMeta<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(area)
  
    // If the versionData is a string, construct a default versionInfo object
  const defaultVersionInfo: Version<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> = {
    id: 0,

    major: 0,
    minor: 0,
    patch: 0,
    structureData: "",

    source: "",
    status: "",
    buildNumber: "",
    workspaceId: "",
   
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceViewers: [],
   
    workspaceAdmins: [],
    workspaceMembers: [],
   
    versionNumber: typeof versionData === 'string' ? versionData : '0.0.0',
    appVersion: '1.0.0',
    description: 'Default version',
    content: '',
    checksum: '',
    versionData: versionData,
    data: {} as Data<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>,
    name: 'Default Name',
    url: '',
    metadata: {
      author: 'System',
      area: area,
      currentMeta: currentMeta,
      metadataEntries: {},
      timestamp: new Date(),
      latestVersion: latestVersion,
      schema: {}
    },
    versions: null,
    versionHistory: {} as VersionHistory<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>, // Default empty history
    userId: 'system',
    documentId: '',
    parentId: null,
    parentType: '',
    parentVersion: '',
    parentTitle: '',
    parentContent: '',
    parentName: '',
    parentUrl: '',
    parentChecksum: '',
    parentMetadata: undefined,
    parentAppVersion: '',
    parentVersionNumber: '',
    createdAt: new Date(),
    updatedAt: undefined,
    deletedAt: undefined,
    draft: false,
    isLatest: true,
    isPublished: false,
    publishedAt: null,
    isDeleted: false,
    publishedBy: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    rootId: null,
    branchId: null,
    isLocked: false,
    lockedBy: null,
    lockedAt: null,
    isArchived: false,
    archivedBy: '',
    archivedAt: null,
    tags: {} as TagsRecord<VersionEntity>, // Default empty tags
    categories: [],
    permissions: {} as DocumentPermissions, // Default permissions
    collaborators: [], // Default collaborators
    comments: [],
    reactions: [],
    changes: [],
    attachments: [],
    buildVersions: {
      data: defaultData,
      backend: backendStructure,
      frontend: frontendStructure
    },
    isActive: true,
    releaseDate: undefined,
  };  if (typeof versionData !== 'string') {
    return new VersionImpl({
      ...defaultVersionInfo,
      ...defaultVersionData,
      versionData: [versionData], // Use the provided VersionData
      isDeleted: false,
      publishedBy: null,
      lastModifiedBy: null,
      lastModifiedAt: null,
      rootId: null,
      branchId: null,
      isLocked: false,
      lockedBy: null,
      lockedAt: null,
      isArchived: false,
      archivedBy: '',
      archivedAt: null,
      tags: {},
      categories: [],
      permissions: docPermissions,
      collaborators: [],
      comments: [],
      reactions: [],
      changes: [],
      attachments: [],
      source: '',
      status: '',
      buildNumber: '',
      workspaceId: '',
      workspaceName: '',
      workspaceType: '',
      workspaceUrl: '',
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      buildVersions: {
        data: {},
        backend: backendStructure,
        frontend: frontendStructure
      },
      isActive: false,
      releaseDate: new Date() || ""
    });
  }

  return new VersionImpl(defaultVersionInfo); // Return with defaults if only version string is provided
};

// Much cleaner function signature
export const handleSnapshot = <
  T extends BaseDataEntity = SnapshotEntity,
  K extends T = SnapshotK,
  Meta extends DefaultMeta<T, K> = SnapshotMeta,
  AttachmentType extends Attachment = SnapshotAttachment,
  ExcludedFields extends keyof T = SnapshotExcludedFields,
  IncludedFields extends keyof T = SnapshotIncludedFields
>(
  id: string,
  snapshotId: string,
  snapshot: DefaultSnapshotTypes['Snapshot'],
  snapshotData: DefaultSnapshotTypes['SnapshotData'],
  category?: Category,
  callback: (snapshot: DefaultSnapshotTypes['Snapshot']) => void,
  snapshots: DefaultSnapshotTypes['SnapshotsArray'],
  type: string,
  event: Event,
  storeProps: DefaultSnapshotTypes['SnapshotStoreProps'],
  snapshotContainer?: DefaultSnapshotTypes['SnapshotContainer'],
  snapshotStoreConfig?: DefaultSnapshotTypes['SnapshotStoreConfig']
): Promise<DefaultSnapshotTypes['Snapshot'] | null> => {
  // Implementation remains the same but much more maintainable
  const {
    storeId,
    name,
    version,
    schema,
    options,
    config,
    operation,
    expirationDate, 
    payload, 
    initialState,
      endpointCategory, findIndex
  } = storeProps;

  try {
    if (snapshot) {
      callback(snapshot);
    }

    let snapshotStore: SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;

    if (snapshotContainer) {
      // Convert the SnapshotContainer to SnapshotStore using the conversion function
      snapshotStore = convertSnapshotContainerToStore(snapshotContainer);
    } else if (snapshotStoreConfig) {
      // Construct the versionInfo using the utility function
      const versionInfo = createVersionInfo(snapshotStoreConfig.version || '0.0.0');

      // Create a new SnapshotStore with provided configuration
      snapshotStore = new SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>({
        storeId,
        name,
        version,
        initialState,
        schema,
        options,
        category,
        config,
        operation,
        expirationDate,
        payload, callback, storeProps, endpointCategory, findIndex
      });
    } else {
      // Fallback to a default or empty instance
      snapshotStore = {} as SnapshotStore<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>;
    }

    // Create an object that conforms to the Snapshot interface
    const processedSnapshot: Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> = {
      id,
      category: category ?? undefined,
      timestamp: new Date(),
      snapshotStore,
      data: snapshotData,
      initialState: {}, // Populate based on your actual logic
      isCore: false, // Populate based on your logic
      initialConfig: {}, // Populate based on your actual logic
      removeSubscriber: () => {}, // Provide an appropriate method if needed
      onInitialize: (callback: () => void) => {}, 
      onError: (error: Error) => {}, 
      taskIdToAssign: "", 
      schema: "", 
    };

    return Promise.resolve(processedSnapshot);
  } catch (error) {
    console.error("Error in handleSnapshot: ", error);
    return Promise.resolve(null);
  }
};


export { createVersionInfo };
