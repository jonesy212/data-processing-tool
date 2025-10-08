import { SharedIdentifiers, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Content } from '@/app/components/models/content/AddContent';
import { FileType } from "@/app/documents/attachment/attachment";
import { createBaseData } from "@/app/hooks/useSnapshotManager";
import { K, T } from "@/app/models/data/dataStoreMethods";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { InitializedData } from "@/app/snapshots/SnapshotStoreOptions";
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import { HistoryEntry } from '@/app/state/stores/HistoryStore';
import MobXEntityStore from '@/app/state/stores/MobXEntityStore';
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import getAppPath from '@/config//appStructure/appPath';
import { AppStructureItem, AppStructurePermissions } from "@/config/appStructure/AppStructure";
import FrontendStructure, { frontendStructure } from "@/config/appStructure/FrontendStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { DataVersions } from "@/configs/DataVersionsConfig";
import { Comment } from '@/models/data/Comments';
import BackendStructure from '@/server/database/BackendStructure';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { CustomComment } from '@/state/redux/slices/BlogSlice';
import { BuildVersion, Version, version } from "./Version";
import { getCurrentAppInfo } from "./VersionGenerator";

const { snapshotData } = storeProps

const baseData: BaseDataEntity = createBaseData({ ...snapshotData });

interface SharedAuditInfo {
  createdBy?: string;
  updatedBy?: string;
  author?: string;
  user?: string;
}

interface SharedVersioning {
  major: number;
  minor: number;
  patch: number;
  versionNumber?: string;
  buildNumber: string | number;
}

interface SharedContent {
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  description?: string;
  notes: string[];
  changes: string[];
}

interface CoreDataItem<
  T extends BaseDataEntity,
  K extends T = T,
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedTimestamps {
  id?: string | number;
  name?: string;

  type?: SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['type'] | Promise<FileType>;
  path?: string;
  draft?: boolean;
  permissions?: AppStructurePermissions;
}

interface SharedUpdateHistory<T extends BaseDataEntity = BaseDataEntity,
  K extends T = T> {
  lastUpdated?: Date | VersionHistory<T, K>;
  changeLogSummary?: string;
}

export interface LastUpdated<T extends BaseDataEntity = BaseDataEntity,
  K extends T = T>
  extends SharedUpdateHistory<T, K>, SharedTimestamps, SharedAuditInfo {
}

interface VersionHistory<T extends BaseDataEntity, K extends T = T>
  extends SharedUpdateHistory {
  versionData: string | VersionData<T, K> | null | {};
  latestVersion?: MinimalVersion<T, K>;
  history?: HistoryEntry[];
  versions: Version<T, K>[];
  currentVersionIndex: number;
}

interface VersionedDataItem<
  T extends BaseDataEntity,
  K extends T = T
>
  extends CoreDataItem<T, K> {
  versions?: DataVersions;
  versionData?: VersionData<T, K> | null;
  items?: Record<string, VersionedDataItem<T, K>>;
}


interface AppStructureDataItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends CoreDataItem<T, K>,
  SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versions?: DataVersions;
  versionData?: VersionData<BaseDataEntity, BaseDataEntity> | null;
  items?: Record<string, AppStructureDataItem<T, K, Meta, ExcludedFields>>;
}

interface ExtendedVersionData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends VersionedDataItem<T, K>,
  SharedVersioning,
  SharedAuditInfo,
  SharedTimestamps {

  // Version-specific properties
  url?: string;
  appVersion?: string;
  documentId?: string;
  userId?: string;
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  comments?: (Comment<T, K, StructuredMetadata<T, K>> | CustomComment)[];
  versionHistory: VersionHistory<T, K>;
  releaseDate?: string | Date;
  lastUpdated?: Date | VersionHistory<T, K>;
  buildVersions?: BuildVersion;
  currentHash: string;

  // Publication info
  published?: boolean;
  checksum: string;
  appPathWithVersion?: string;
}


interface SharedVersionData {
  major?: number,
  minor?: number,
  patch?: number,
}

interface SharedUpdateHistory<T extends BaseDataEntity = BaseDataEntity, K extends T = T> {
  lastUpdated?: Date | VersionHistory<T, K>;  // Match the broader type
  timestamp: string | number | Date | undefined;
  changeLogSummary?: string;
}

export function createLastUpdated<T extends BaseDataEntity = BaseDataEntity>(
  summary?: string,
): LastUpdated<T> {
  const now = new Date();
  return {
    lastUpdated: now,
    timestamp: now,
    updatedBy: "system",
    changeLogSummary: summary || "No changes recorded.",
  };
}


// A minimal version slice (use Pick to set the baseline)
type MinimalVersion<T extends BaseDataEntity, K extends T = T> =
  Partial<
    Pick<VersionData<T, K>, "versionNumber" | "timestamp" | "author" | "schema">> & {
  };

interface VersionData<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends SharedVersioning,
  ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  Omit<SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "permissions"> {

  // Identity and core
  id: string | number;
  author?: string;
  type?: string;
  // Relationships
  parentId: string | null;
  parentAppVersion?: string;
  parentVersionNumber?: string;
  parentType?: string | null;
  parentVersion?: string;
  parentTitle?: string;
  parentContent?: string;
  parentName?: string;
  parentUrl?: string;
  parentChecksum?: string;
  parentMetadata?: {};

  // Status
  isLatest: boolean;
  isActive: boolean;
  isPublished: boolean;
  publishedAt?: Date | null;
  status?: string;

  // Workspace
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];

  // Services
  setServices?: (services: Record<string, any>) => void;
  services?: Record<string, any>;

  // App structure
  _structure?: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  frontendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  backendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  // Backend/Frontend
  backend?: BackendStructure | undefined;
  frontend?: FrontendStructure<T, K> | undefined;

  // Data
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Remove the duplicate 'user' since we have author/updatedBy/createdBy
}

// Example usage and data
const updatedContent = "Updated file content here...";
const author = "John Doe";
const timestamp = new Date();
const revisionNotes = "Added new section and fixed typos.";



const transformToStructureItems = (data: Record<string, AppStructureDataItem<T, K, DefaultMeta<T, K>,
  DefaultExcludedFields<T>>>): {
    [key: string]: AppStructureDataItem<T, K, DefaultMeta<T, K>,
      DefaultExcludedFields<T>>
  } => {
  // Validate input data
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input data. Expected an object.");
  }

  // Transform the data into AppStructureItem objects
  const structureItems: { [key: string]: AppStructureItem } = {};

  for (const [key, value] of Object.entries(data)) {
    // Ensure the value is an object
    if (typeof value !== "object" || value === null) {
      throw new Error(`Invalid data for key "${key}". Expected an object.`);
    }

    // Create an AppStructureItem object
    structureItems[key] = {
      id: value.id || key, // Use the key as the ID if no ID is provided
      name: value.name || `Unnamed Item (${key})`, // Provide a default name if none is given
      type: value.type || "unknown", // Default type if none is provided
      path: value.path || `/${key}`, // Default path if none is provided
      content: value.content || "", // Default content if none is provided
      draft: value.draft || false, // Default draft status if none is provided
      permissions: value.permissions || undefined, // Use provided permissions or undefined
      versions: value.versions || undefined, // Use provided versions or undefined
      versionData: value.versionData || null, // Use provided versionData or null
      items: value.items ? transformToStructureItems(value.items) : undefined, // Recursively transform nested items
    };
  }

  return structureItems;
};



const createDefaultVersionData = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
>(
  overrides?: Partial<VersionData<T, K>>
): VersionData<T, K> => {
  const now = new Date();

  // Create a complete base version with ALL required properties in one object
  const baseVersion: VersionData<T, K> = {
    // Required properties from VersionData and ExtendedVersionData
    id: 0,
    parentId: null,
    isLatest: false,
    isActive: false,
    isPublished: false,
    metadata: {
      area: "createDefaultVersionData",
      metadataEntries: {},
      latestVersion: undefined, // will set later
      schema: {},
    },
    currentHash: "default-hash",
    checksum: "default-checksum",
    versionHistory: {
      versionData: null,
      latestVersion: undefined, // will set later
      history: [],
      timestamp: now,
      versions: [],
      currentVersionIndex: 0
    },

    // Other properties from your original version
    releaseDate: now.toISOString(),
    author: "jack johnson",
    buildNumber: "0",
    structureData: "default-structure",
    major: 0,
    minor: 0,
    patch: 0,
    name: "Default Version Name",
    user: "System",
    url: "/default-version",
    versionNumber: "0.0.0",
    documentId: "default-doc",
    draft: false,
    userId: "default-user",
    content: "Default content",
    description: "Default description",
    versions: undefined,
    appVersion: "1.0.0",
    parentType: "none",
    parentVersion: "0.0.0",
    parentTitle: "Default Parent Title",
    parentContent: "Default Parent Content",
    parentName: "Default Parent Name",
    parentUrl: "/default-parent-url",
    parentChecksum: "default-parent-checksum",
    parentAppVersion: "0.0.0",
    parentVersionNumber: "0.0.0",
    publishedAt: null,
    source: "System",
    status: "Draft",
    workspaceId: "default-workspace",
    workspaceName: "Default Workspace",
    workspaceType: "Default",
    workspaceUrl: "/default-workspace",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    setServices: () => { },
    notes: [],
    changes: [],
    latestVersion: undefined,
    data: undefined,
    _structure: {},
    transformToStructureItems: (data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] =>
      Object.values(transformToStructureItems(data)),
    getVersionNumber: () => "0.0.0",
    updateStructureHash: async () => { },
    setStructureData: () => { },
    hash: (value: string) => value,
    calculateHash: () => "hash",
    getStructure: async () => {
      throw new Error("getStructure not implemented");
    },
    comments: [],
    backend: undefined,
    frontend: undefined,
    timestamp: now.toISOString(),
  };

  // Step 2: safely assign latestVersion references
  baseVersion.latestVersion = baseVersion;
  baseVersion.metadata.latestVersion = baseVersion;
  baseVersion.versionHistory.latestVersion = baseVersion;

  // Step 3: return with overrides
  return {
    ...baseVersion,
    ...overrides,
  };
};

const versions: VersionHistory<BaseDataEntity, BaseDataEntity> = {
  history: [],
  latestVersion: createDefaultVersionData({ id: "1", isLatest: true }),
  lastUpdated: new Date("2024-01-01T00:00:00Z"),
  versions: [],
  currentVersionIndex: 0,
  timestamp: new Date("2024-11-24T12:00:00Z"),
  versionData: [
    {
      name: "Version 1",
      url: "https://example.com/version1",
      versionNumber: "1.0.0",
      appVersion: "1.0.0",
      documentId: "documentId",
      draft: false,
      userId: "userId",
      content: updatedContent,
      metadata: {
        author: author,
        timestamp: timestamp,
        revisionNotes: revisionNotes
      },
      changes: [],
      versionData: [],
      checksum: calculateChecksum(updatedContent),
      id: 1,
      parentId: "root",
      parentType: "application",
      parentVersion: "0.9.0",
      parentTitle: "Production Release v0.9",
      parentContent: "Previous stable production version",
      parentName: "Production v0.9",
      parentUrl: "https://example.com/version0.9",
      parentChecksum: "a1b2c3d4e5f67890",
      parentAppVersion: "0.9.0",
      parentVersionNumber: "0.9.0",
      isLatest: true,
      isPublished: true,
      publishedAt: new Date("2024-01-15T10:30:00Z"),
      source: "CI/CD Pipeline",
      status: "published",
      timestamp: new Date("2024-01-15T10:00:00Z"),
      user: "devops-system",
      comments: [
        {
          id: "comment-1",
          author: "code-reviewer",
          text: "Looks good to merge",
          timestamp: new Date("2024-01-14T16:45:00Z")
        }
      ],
      workspaceId: "workspace-prod-001",
      workspaceName: "Production Workspace",
      workspaceType: "production",
      workspaceUrl: "https://workspace.example.com/prod",
      workspaceViewers: ["viewer-1", "viewer-2"],
      workspaceAdmins: ["admin-1", "admin-2"],
      workspaceMembers: ["member-1", "member-2", "member-3"],
      data: {
        entities: [],
        metadata: {}
      },
      backend: {
        apiEndpoints: ["/api/v1/users", "/api/v1/data"],
        database: "postgresql",
        server: "node-express"
      },
      frontend: {
        framework: "react",
        components: ["Header", "Footer", "MainContent"],
        styles: "css-modules"
      },
      version: {
        id: 1,
        name: "Version 1.0.0",
        description: "Initial production release"
      },
    }
  ]
};



const mobXEntityStore = new MobXEntityStore();
const { globalState } = mobXEntityStore
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure = new BackendStructure(projectPath, globalState);

const versionHistory: VersionHistory<BaseDataEntity, BaseDataEntity> = {
  history: [],
  versionData: [],
  latestVersion: undefined,
  versions: [],
  currentVersionIndex: 0,
  timestamp: new Date(),
  // Add other required properties from VersionHistory interface
  changeLogSummary: "Initial version history",
};


const versionData: Promise<VersionData<BaseDataEntity<any>>> = (async () => {
  let databaseSchema: Record<string, any> | undefined;
  let services: Record<string, any> | undefined;
  const area = fetchUserAreaDimensions().toString()

  // Generate appVersion and versionNumber using the provided generators
  const { versionNumber, appVersion } = getCurrentAppInfo();

  // Use getAppPath to get the app path with version information
  const appPathWithVersion = getAppPath(versionNumber, appVersion);

  // Simulate the structure for demonstration purposes
  const getStructure = async (): Promise<Record<string, AppStructureItem> | undefined> => {
    return undefined; // Simulate structure or return an actual structure
  };

  // Call getStructure and await its result
  let structure: Record<string, AppStructureItem> | undefined;
  try {
    structure = await getStructure();
  } catch (error) {
    console.error("Error fetching structure:", error);
    structure = undefined; // Fallback to undefined in case of error
  }

  if (!version) {
    throw new Error("Not able to find version")
  }


  // Then create mockVersion and other dependencies
  const mockVersion: Version<BaseDataEntity<any>, BaseDataEntity<any>, StructuredMetadata<BaseDataEntity<any>, BaseDataEntity<any>>> = {
    id: 0,
    major: 1,
    minor: 0,
    patch: 0,
    name: "Initial Version",
    // ... all other required properties
  } as Version<BaseDataEntity<any>, BaseDataEntity<any>, StructuredMetadata<BaseDataEntity<any>, BaseDataEntity<any>>>;


  const latestVersionData = createLatestVersion();
  const lastUpdatedData = createLastUpdated("Version history initialized.");

  // Now update versionHistory with the actual data
  Object.assign(versionHistory, {
    ...latestVersionData,
    ...lastUpdatedData,
    versions: [
      ...(latestVersionData && 'versions' in latestVersionData && Array.isArray(latestVersionData.versions) ? latestVersionData.versions : []),
      ...(lastUpdatedData && 'versions' in lastUpdatedData && Array.isArray(lastUpdatedData.versions) ? lastUpdatedData.versions : []),
      mockVersion
    ],
  });

  // Define the resolved VersionData object
  const resolvedVersionData: VersionData<BaseDataEntity<any>> = {
    id: "version-1",
    name: "Initial Version",
    lastUpdated: new Date(),
    appPathWithVersion,
    version: null,
    author: "system", // Default system author
    buildNumber: 1, // Start with build 1
    versionHistory: versionHistory,
    schema: {},
    currentHash: 'Initial hash',
    url: "/versions/version-1", // Meaningful URL
    timestamp: new Date(),
    versionNumber,
    notes: ["Initial version created"],
    history: [],
    documentId: "doc-version-1", // Meaningful document ID
    isActive: true,
    releaseDate: new Date().toISOString(),
    draft: false,
    userId: "system-user", // Default system user
    content: "Initial version content", // Default content
    checksum: generateChecksum("Initial version content"), // Calculate checksum
    metadata: {
      author: "system", // Consistent author
      timestamp: new Date(),
      area: area,
      metadataEntries: {},
      schema: {}
    },
    versionData: undefined,
    major: 1, // Start with major version 1
    minor: 0,
    patch: 0,
    data: [],
    user: "system", // Consistent user
    comments: [],
    backend: backendStructure,
    frontend: frontendStructure,
    changes: ["Initial version created"],
    buildVersions: {
      data: [],
      backend: backendStructure,
      frontend: frontendStructure,
      baseData: baseData
    },
    parentId: "none", // No parent initially
    parentType: "none",
    parentVersion: "0.0.0",
    parentTitle: "No Parent",
    parentContent: "No parent content",
    parentName: "No Parent",
    parentUrl: "/",
    parentChecksum: "none",
    parentAppVersion: "0.0.0",
    parentVersionNumber: "0.0.0",
    isLatest: true, // This is the latest version initially
    isPublished: false,
    publishedAt: null,
    source: "system-generated", // Source information
    status: "draft",
    workspaceId: "default-workspace",
    workspaceName: "Default Workspace",
    workspaceType: "development",
    workspaceUrl: "/workspaces/default",
    workspaceViewers: [],
    workspaceAdmins: ["system-admin"],
    workspaceMembers: ["system-user"],
    _structure: {},

    services, // Initialize services as undefined or with default values
    setServices: (newServices: Record<string, any>) => {
      // Validate the input
      if (!newServices || typeof newServices !== "object") {
        throw new Error("Invalid services input. Expected a record (key-value pairs).");
      }

      // Update the services property
      resolvedVersionData.services = newServices;

      // Optionally, perform additional logic after updating services
      console.log("Services updated successfully:", newServices);
    },
  };

  return resolvedVersionData;
})();

// Helper function for checksum generation
function generateChecksum(content: string): string {
  // Simple checksum implementation - replace with your actual checksum logic
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

// Usage: Await the Promise to get the resolved VersionData object
versionData.then((data) => {
  console.log("Resolved VersionData:", data);

  // Example: Call setServices
  if (data.setServices) {
    data.setServices({
      authService: {
        endpoint: "https://api.example.com/auth",
        apiKey: "your-api-key",
      },
      services: {}
    });
  } else {
    console.warn("setServices method is not available on this VersionData object");
  }
}).catch((error) => {
  console.error("Error creating version data:", error);
});


const latestVersionData = createLatestVersion();
const lastUpdatedData = createLastUpdated("Version history initialized.");







// Define a sample services object
const newServices = {
  authService: {
    endpoint: "https://api.example.com/auth",
    apiKey: "your-api-key",
  },
  dataService: {
    endpoint: "https://api.example.com/data",
    apiKey: "your-api-key",
  },
};

async function updateServices() {
  try {
    const versionData = await createDefaultVersionData(); // Await the promise

    // Add null check before calling setServices
    if (versionData.setServices) {
      versionData.setServices(newServices); // Now you can call methods safely
      console.log("Updated services:", versionData.services);
    } else {
      console.warn("setServices method is not available on this VersionData object");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}


// Function to calculate checksum (example implementation)
function calculateChecksum(content: string): string {
  let checksum = 0;

  for (let i = 0; i < content.length; i++) {
    // Convert each character to its Unicode code point and add it to the checksum
    checksum += content.charCodeAt(i);
  }

  // Convert the checksum to a hexadecimal string representation
  const hexChecksum = checksum.toString(16);

  return hexChecksum;
}

export { createDefaultVersionData, versionHistory };
export type { CoreDataItem, ExtendedVersionData, MinimalVersion, SharedVersionData, VersionData, VersionHistory };

