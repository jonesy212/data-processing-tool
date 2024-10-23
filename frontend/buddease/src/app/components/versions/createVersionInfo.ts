import { Meta } from "@/app/components/models/data/dataStoreMethods";
import DocumentPermissions from "../documents/DocumentPermissions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { Snapshot, SnapshotContainer, SnapshotsArray, SnapshotStoreConfig, TagsRecord } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import { convertSnapshotContainerToStore } from "../typings/YourSpecificSnapshotType";
import Version, { VersionImpl } from "./Version";
import { VersionData, VersionHistory } from "./VersionData";

const createVersionInfo = (versionData: string | VersionData): Version => {
    const docPermissions = new DocumentPermissions(true, true);

    // If the versionData is a string, construct a default versionInfo object
  const defaultVersionInfo = {
    id: 0,


    source: "",
    status: "",
    buildNumber: "",
    workspaceId: "",
   
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceViewers: "",
   
    workspaceAdmins: "",
    workspaceMembers: "",
   

    versionNumber: typeof versionData === 'string' ? versionData : '0.0.0',
    appVersion: '1.0.0',
    description: 'Default version',
    content: '',
    checksum: '',
    versionData: [], // Default to an empty array
    data: [], // Default to an empty array
    name: 'Default Name',
    url: '',
    metadata: {
      author: 'System',
      timestamp: new Date(),
    },
    versions: null,
    versionHistory: {} as VersionHistory, // Default empty history
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
    tags: {} as TagsRecord, // Default empty tags
    categories: [],
    permissions: {} as DocumentPermissions, // Default permissions
    collaborators: [], // Default collaborators
    comments: [],
    reactions: [],
    changes: [],
    attachments: [],
  };
  if (typeof versionData !== 'string') {
    return new VersionImpl({
      ...defaultVersionInfo,
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
      archivedBy: null,
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
      workspaceMembers: []
    });
  }

  return new VersionImpl(defaultVersionInfo); // Return with defaults if only version string is provided
};

// Update handleSnapshot function
export const handleSnapshot = (
  id: string,
  snapshotId: string,
  snapshot: Data | null,
  snapshotData: Data,
  category: Category | undefined,
  callback: (snapshot: Data) => void,
  snapshots: SnapshotsArray<any, any>,
  type: string,
  event: Event,
  snapshotContainer?: SnapshotContainer<T, Meta, K>,
  snapshotStoreConfig?: SnapshotStoreConfig<Data, Meta, BaseData>
): Promise<Snapshot<Data, Meta, BaseData> | null> => {
  try {
    if (snapshot) {
      callback(snapshot);
    }

    let snapshotStore: SnapshotStore<Data, Meta, BaseData>;

    if (snapshotContainer) {
      // Convert the SnapshotContainer to SnapshotStore using the conversion function
      snapshotStore = convertSnapshotContainerToStore(snapshotContainer);
    } else if (snapshotStoreConfig) {
      // Construct the versionInfo using the utility function
      const versionInfo = createVersionInfo(snapshotStoreConfig.version || '0.0.0');

      // Create a new SnapshotStore with provided configuration
      snapshotStore = new SnapshotStore<Data, Meta, BaseData>(
        snapshotStoreConfig.storeId,
        snapshotStoreConfig.name || '',
        versionInfo,  // Use the constructed version object
        snapshotStoreConfig.schema,
        snapshotStoreConfig.options,
        snapshotStoreConfig.category,
        snapshotStoreConfig.config || undefined,
        snapshotStoreConfig.operation,
      );
    } else {
      // Fallback to a default or empty instance
      snapshotStore = {} as SnapshotStore<Data, Meta, BaseData>;
    }

    // Create an object that conforms to the Snapshot interface
    const processedSnapshot: Snapshot<Data, Meta, BaseData> = {
      id,
      category: category ?? undefined,
      timestamp: new Date(),
      snapshotStore,
      data: snapshotData,
      initialState: {}, // Populate based on your actual logic
      isCore: false, // Populate based on your logic
      initialConfig: {}, // Populate based on your actual logic
      removeSubscriber: () => {}, // Provide an appropriate method if needed
      onInitialize, onError, taskIdToAssign, schema, 
    };

    return Promise.resolve(processedSnapshot);
  } catch (error) {
    console.error("Error in handleSnapshot: ", error);
    return null;
  }
};


export { createVersionInfo };
