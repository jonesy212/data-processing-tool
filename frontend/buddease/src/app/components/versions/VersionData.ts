import { FileType } from "@/app/components/documents/Attachment/attachment";
import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { AppStructureItem, AppStructurePermissions } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, { frontendStructure } from "@/app/configs/appStructure/FrontendStructure";
import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { SharedMetadata } from "@/app/configs/metadata/createMetadataState";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import getAppPath from 'appPath';
import { Comment } from '../models/data/Comments';
import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { CustomComment } from '../state/redux/slices/BlogSlice';
import { HistoryEntry } from '../state/stores/HistoryStore';
import MobXEntityStore from '../state/stores/MobXEntityStore';
import { BuildVersion, version } from "./Version";
import { getCurrentAppInfo } from "./VersionGenerator";

interface SharedVersionData { 
  major?: number,
  minor?: number,
  patch?: number,
}

interface SharedUpdateHistory extends SharedVersionData {
  lastUpdated?: Date | VersionHistory; // Added
  timestamp: Date;
  changeLogSummary?: string;
}

// Interfaces
interface VersionHistory extends SharedUpdateHistory{
  // Define the structure of the version history
  // Each element represents a version of the data
  versionData: string | VersionData<T, K<T>> | null | {} | null;
  latestVersion: VersionData<T, K<T>>; // A reference to the most recent version
  history?: HistoryEntry[] | undefined;
}


// Import necessary dependencies if needed
export interface LastUpdated {
  timestamp: Date;
  updatedBy: string;
  lastUpdated?: Date | VersionHistory;
  changeLogSummary: string | undefined
  // Define the structure of the last updated history
}



export function createLastUpdated(
  summary?: string,

): LastUpdated {
  const now = new Date();
  return {
    lastUpdated: now || {},
    timestamp: now,
    updatedBy: "system",
    changeLogSummary: summary || "No changes recorded.",
  };
}


interface CoreDataItem {
  id: string;
  name?: string;
  type?: string | Promise<FileType>;
  path?: string;
  draft?: boolean;
  permissions?: AppStructurePermissions;
}


interface VersionedDataItem<T extends BaseData, K extends T = T> extends CoreDataItem {
  versions?: DataVersions;
  versionData?: VersionData<T, K> | null;
  items?: Record<string, VersionedDataItem<T, K>>;
}


interface ExtendedVersionData<
  T extends BaseData,
  K extends T = T
  > extends VersionedDataItem<T, K> {
  // Version-specific properties
  url?: string;
  name?: string;
  versionNumber?: string;
  appVersion?: string;
  documentId?: string;
  userId: string;
  content: string;
  
  metadata: {
    author?: string;
    timestamp?: string | number | Date;
    revisionNotes?: string;
  };
  
  comments?: (Comment<T, K, StructuredMetadata<T, K>> | CustomComment)[];
  releaseDate?: string | Date;
  lastUpdated?: Date | VersionHistory;
  buildVersions?: BuildVersion;
  
  // Semantic versioning
  major: number;
  minor: number;
  patch: number;
  
  // Publication info
  published?: boolean;
  checksum: string;
  appPathWithVersion?: string;
}


interface VersionData<T extends BaseData<any>, K extends T = T> 
  extends ExtendedVersionData<T, K>, SharedMetadata<T, K> {
  // Add more specific properties if needed
  id: string;
  parentId: string | null;
  isLatest: boolean;
  isActive: boolean;
  isPublished: boolean;
  workspaceId: string;
  setServices: (services: Record<string, any>) => void; // Add setServices method
  
  parentAppVersion?: string;
  parentVersionNumber?: string;
  parentType?: string | null;
  parentVersion?: string;
  parentTitle?: string;
  parentContent?: string;
  parentName?: string;
  parentUrl?: string;
  parentChecksum?: string;
  parentMetadata?: {}; // Adjust as per actual type
  description?: string;
  publishedAt?: Date | null;
  source?: string;
  status?: string;
  timestamp?: number | string | Date | undefined
  user: string;
  
  notes: string[]
  changes: string[];
  
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
 
  createdAt?: string | Date | undefined;
  createdBy?: string ,
  updatedAt?: string | Date | undefined;
  _structure?: Record<string, AppStructureItem[]>; // Adjust as per actual type
  frontendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  backendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  
  history?: HistoryEntry[] | undefined
  data?: Data<BaseData<any>> | undefined;
  backend?: BackendStructure | undefined;
  frontend?: FrontendStructure<T, K> | undefined;
  services?: Record<string, any>;
}


// Example usage and data
const updatedContent = "Updated file content here...";
const author = "John Doe";
const timestamp = new Date();
const revisionNotes = "Added new section and fixed typos.";




const transformToStructureItems = (data: Record<string, CoreDataItem>): { [key: string]: AppStructureItem } => {
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
  T extends BaseData<any> = BaseData<any>,
  K extends T = T
>(
  overrides?: Partial<VersionData<T, K>>
): VersionData<T, K> => ({
  
  // Required properties
  id: "0",
  parentId: null,
  parentType: "",
  isLatest: false,
  isActive: false,
  isPublished: false,
  setServices: () => {},
  notes: [],
  version: {
    id: '0',
    isActive: false,
    releaseDate: '',
    buildNumber: "",
    versionHistory: "",
    currentHash: "",
    structureData: "",
    

    major: 0,
    minor: 0,
    patch: 0,
    name: '',
    user: '',
    url: '',
    versionNumber: '',
    documentId: '',
    draft: false,
    userId: '',
    content: '',
    description: '',
    buildNumber: '',
    versions: undefined,
    appVersion: '',
    checksum: '',
    parentId: null,
    parentType: '',
    parentVersion: '',
    parentTitle: '',
    parentContent: '',
    parentName: '',
    parentUrl: '',
    parentChecksum: '',
    parentAppVersion: '',
    parentVersionNumber: '',
    isLatest: false,
    isPublished: false,
    publishedAt: null,
    source: '',
    status: '',
    workspaceId: '',
    workspaceName: '',
    workspaceType: '',
    workspaceUrl: '',
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    setServices: () => { },
    notes: [],
    changes: [],
    schema: {},
    latestVersion: createLatestVersion<T, K>(),
    data: undefined,  
    metadata: {
      area: "createDefaultVersionData",
      metadataEntries: {},
      latestVersion: createLatestVersion<T, K>(),
      schema: {}
    },
    _structure: {},
    transformToStructureItems: (data: any): AppStructureItem[] => {
      const structureObject = transformToStructureItems(data); // Get the object
      return Object.values(structureObject); // Convert the object to an array
    },

    versionHistory: {
      versionData: null,
      latestVersion: createLatestVersion<T, K>(),
      history: [],
      timestamp: new Date(),
    },
    getVersionNumber: () => "",
    updateStructureHash: async () => {},
    setStructureData: (newData: string) => {},
    hash: (value: string) => value,
    currentHash: '',
    structureData: '',
    calculateHash: () => "hash",
    getStructure: async (): Promise<Record<string, AppStructureItem> | undefined> => {
      throw new Error("getStructure not implemented");
    },
  } as VersionData<T, K>,

  // Current version

  timestamp: new Date().toISOString(), // Example ISO timestamp
  user: "user123", // Example user identifier
  changes: ["Added introduction section", "Fixed typos"], // Example changes
  comments: [], // Empty array for comments
  workspaceId: "workspace456", // Example workspace identifier
  workspaceName: "TypeScript Workspace", // Workspace name
  workspaceType: "shared", // Workspace type, e.g., 'private' or 'shared'

  workspaceUrl: "https://example.com/workspace", // Example workspace URL
  workspaceViewers: ["viewer1", "viewer2"], // Example viewers
  workspaceAdmins: ["admin1"], // Example admin users
  workspaceMembers: ["member1", "member2"], // Example members

  data: {
    major: 1,
    minor: 0,
    patch: 0,
    childIds: ["doc1", "doc2"], // Example child document IDs
    relatedData: ["relatedDoc1", "relatedDoc2"], // Example related data
  },
  backend: backendStructure,
  frontend: frontendStructure,
  name: "Version 1", // Example name for the version
  url: "https://example.com/version1", // URL for this version
  documentId: "doc123", // Document ID
  draft: false, // Indicates if it's a draft
  userId: "user123", // User identifier

  content: "This is the content of the version.", // Example content
  metadata: {
    author: "John Doe", // Example author
    timestamp: new Date().toISOString(), // Example metadata timestamp
    revisionNotes: "Initial draft created.", // Example revision notes
  },
  major: 1, // Major version number
  minor: 0, // Minor version number

  patch: 0, // Patch version number
  checksum: "12345abcde", // Example checksum
  
  releaseDate: new Date().toISOString(), // Example release date

  history: [{
    versionId: "versionId", 
    description: "history description",
    releaseDate: new Date(),
    timestamp: new Date("2024-01-01T00:00:00Z").getTime(), 
    changes: ["Initial version"],
    data: {
      childIds: ["doc1", "doc2"],
      relatedData: ["relatedDoc1", "relatedDoc2"],
    },
  }],

  ...overrides, 
});

const versions: VersionHistory = {
  major: 1,
  minor: 1, 
  patch: 0,
  history: [],
  latestVersion: createDefaultVersionData({ id: "1", isLatest: true }),
  lastUpdated: new Date("2024-01-01T00:00:00Z"),

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
      id: 0,
      parentId: "",
      parentType: "",
      parentVersion: "",
      parentTitle: "",
      parentContent: "",
      parentName: "",
      parentUrl: "",
      parentChecksum: "",
      parentAppVersion: "",
      parentVersionNumber: "",
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      source: "",
      status: "",
      timestamp: new Date(),
      user: "",
      comments: [],
      workspaceId: "",
      workspaceName: "",
      workspaceType: "",
      workspaceUrl: "",
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      data: undefined,
      backend: undefined,
      frontend: undefined,
      version: {},
    }
  ]
};



const mobXEntityStore = new MobXEntityStore();
const { globalState } = mobXEntityStore
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const backendStructure = new BackendStructure(projectPath, globalState);


const versionData: Promise<VersionData<BaseData<any>>> = (async () => {
  let databaseSchema: Record<string, any> | undefined;
  let services: Record<string, any> | undefined;

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
    throw new Error("Not abe to find version")
  }
  // Define the resolved VersionData object
  const resolvedVersionData: VersionData<BaseData<any>> = {
    id: "0",
    name: "Version 1",
    lastUpdated: new Date(),
    appPathWithVersion,
    version,
    url: "", // Add a default URL or fetch it
    timestamp: new Date(),
    versionNumber,
    notes: [],
    history: [],
    documentId: "", // Add a default documentId or fetch it
    isActive: true,
    releaseDate: new Date().toISOString(),
    draft: false,
    userId: "", // Add a default userId or fetch it
    content: "", // Add default content or fetch it
    checksum: "", // Add a default checksum or calculate it
    metadata: {
      author: "", // Add a default author or fetch it
      timestamp: new Date(),
    },
    versionData: undefined,
    major: 0,
    minor: 0,
    patch: 0,
    data: [],
    user: "", // Add a default user or fetch it
    comments: [],
    backend: backendStructure,
    frontend: frontendStructure,
    changes: [],
    buildVersions: {
      data: [],
      backend: backendStructure,
      frontend: frontendStructure,
    },
    parentId: "", // Add a default parentId or fetch it
    parentType: "", // Add a default parentType or fetch it
    parentVersion: "", // Add a default parentVersion or fetch it
    parentTitle: "", // Add a default parentTitle or fetch it
    parentContent: "", // Add a default parentContent or fetch it
    parentName: "", // Add a default parentName or fetch it
    parentUrl: "", // Add a default parentUrl or fetch it
    parentChecksum: "", // Add a default parentChecksum or fetch it
    parentAppVersion: "", // Add a default parentAppVersion or fetch it
    parentVersionNumber: "", // Add a default parentVersionNumber or fetch it
    isLatest: false,
    isPublished: false,
    publishedAt: null,
    source: "", // Add a default source or fetch it
    status: "", // Add a default status or fetch it
    workspaceId: "", // Add a default workspaceId or fetch it
    workspaceName: "", // Add a default workspaceName or fetch it
    workspaceType: "", // Add a default workspaceType or fetch it
    workspaceUrl: "", // Add a default workspaceUrl or fetch it
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
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
    versionData.setServices(newServices); // Now you can call methods
    console.log("Updated services:", versionData.services);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Usage: Await the Promise to get the resolved VersionData object
versionData.then((data) => {
  console.log("Resolved VersionData:", data);

  // Example: Call setServices
  data.setServices({
    authService: {
      endpoint: "https://api.example.com/auth",
      apiKey: "your-api-key",
    },
    services: {}
  });
}).catch((error) => {
  console.error("Error creating version data:", error);
});


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

// Resolve the versionData Promise
const resolvedVersionData = await versionData;

export const versionHistory: VersionHistory = {
  history: [],
  versionData: versionData ? [versionData] : [], // Use empty array instead of null
  latestVersion: resolvedVersionData || {
    id: 0,
    name: "Initial Version",
    timestamp: new Date(),
  }, 
  ...createLatestVersion(),
  ...createLastUpdated("Version history initialized."),
};


export { createDefaultVersionData };
export type { ExtendedVersionData, SharedVersionData, VersionData, VersionHistory, CoreDataItem };

