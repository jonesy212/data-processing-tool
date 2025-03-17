import { createLatestVersion } from '@/app/components/versions/createLatestVersion';
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure, { backend } from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, { frontendStructure } from "@/app/configs/appStructure/FrontendStructure";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import getAppPath from 'appPath';
import { Comment } from '../models/data/Comments';
import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { CustomComment } from '../state/redux/slices/BlogSlice';
import { HistoryEntry } from '../state/stores/HistoryStore';
import MobXEntityStore from '../state/stores/MobXEntityStore';
import Version, { BuildVersion, version } from "./Version";
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
  versionData: string | VersionData<T, K> | null | {} | null;
  latestVersion: VersionData<T, K>; // A reference to the most recent version
  history: HistoryEntry[] | undefined;
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


interface ExtendedVersionData {
  name?: string;
  url?: string;
  versionNumber?: string | undefined;
  appVersion?: string;
  documentId?: string;
  draft: boolean;
  userId: string;
  content: string; // Include content here if needed
  metadata: {
    author: string;
    timestamp: string | number | Date | undefined;
    revisionNotes?: string;
    // Add other metadata fields as needed
  };
  comments: (Comment<T, K<T>, StructuredMetadata<T, K<T>>> | CustomComment)[] | undefined;
  releaseDate?: string;
  lastUpdated: Date | VersionHistory;
  buildVersions?: BuildVersion | undefined;
  versionData?: string | VersionData<T, K<T>> | null;
  major: number;
  minor: number;
  patch: number;
  published?: boolean;
  checksum: string;
  appPathWithVersion: string;
}

interface VersionData<T extends BaseData<any>, K extends T = T> 
  extends ExtendedVersionData {
  // Add more specific properties if needed
  id: string;
  parentId: string | null;
  parentType: string | null;
  parentVersion: string;
  parentTitle: string;
  parentContent: string;
  parentName: string;
  parentUrl: string;
  notes: string[]
  parentChecksum: string;
  parentMetadata?: {}; // Adjust as per actual type
  parentAppVersion: string;
  parentVersionNumber: string;
  isLatest: boolean;
  isActive: boolean;
  description?: string;
  isPublished: boolean;
  publishedAt: Date | null;
  source: string;
  status: string;
  version: Version<T, K>;
  timestamp: number | string | Date | undefined
  user: string;
  changes: string[];
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
  createdAt?: string | Date | undefined;
  createdBy?: string ,
  updatedAt?: string | Date | undefined;
  history: HistoryEntry[] | undefined
  _structure?: any; // Adjust as per actual type
  frontendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  backendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  data: Data<BaseData<any>> | undefined;
  backend: BackendStructure | undefined;
  frontend: FrontendStructure | undefined;
}


// Example usage and data
const updatedContent = "Updated file content here...";
const author = "John Doe";
const timestamp = new Date();
const revisionNotes = "Added new section and fixed typos.";

const createDefaultVersionData = <T extends BaseData<any> = BaseData<any>, K extends T = T>(
  overrides?: Partial<VersionData<T, K>>
): VersionData<T, K> => ({
  version: {
    id: 0,
    isActive: false,
    releaseDate: '',
    major: 0,
    minor: 0,
    patch: 0,
    name: '',
    url: '',
    versionNumber: '',
    documentId: '',
    draft: false,
    userId: '',
    content: '',
    description: '',
    buildNumber: '',
    versions: null,
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
    data: undefined,
    _structure: {},
    versionHistory: {
      versionData: null,
      latestVersion: createLatestVersion(),
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
  },
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

  history: [{ id: "string", 
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


const versionData: VersionData<BaseData<any>> = (() => {
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
  
   // Ensure transformToStructureItems is defined
   const transformToStructureItems = backend.transformToStructureItems ?? ((data: any) => []);


  return {
    ...backend,
    ...backendStructure,

    id: "0",
    name: "Version 1",
    lastUpdated: new Date(),
    appPathWithVersion,
    url: "https://example.com/version1",
    timestamp: new Date("2022-03-27T12:00:00Z"),
    versionNumber: versionNumber,
    notes: [],
    documentId: "documentId",
    isActive: true,
    releaseDate: "2022-03-27",
    draft: false,
    userId: "userId",
    content: updatedContent,
    metadata: {
      author: "John Doe",
      timestamp: new Date(),
      revisionNotes: "Initial release with updates"
    },
    versionData: [],
    checksum: calculateChecksum(updatedContent),
    parentId: "12345",
    parentType: "document",
    parentVersion: "v1.0.0",
    parentTitle: "Initial Release",
    parentContent: "This is the content of the parent document.",
    parentName: "Parent Document",
    parentUrl: "https://example.com/parent-document",
    parentChecksum: "abc123",
    parentAppVersion: "1.0.0",
    parentVersionNumber: "1",
    isLatest: false,
    isPublished: false,
    publishedAt: null,
    source: "internal system",
    status: "active",
    workspaceId: "workspace123",
    workspaceName: "Development Workspace",
    workspaceType: "development",
    workspaceUrl: "https://example.com/workspace123",
    workspaceViewers: ["viewer1@example.com", "viewer2@example.com"],
    workspaceAdmins: ["admin1@example.com", "admin2@example.com"],
    workspaceMembers: ["member1@example.com", "member2@example.com"],
    data: versions,
    version: version,
    user: "user@example.com",
    comments: [],
    backend: backendStructure,
    frontend: frontendStructure,
    changes: [],
    buildVersions: {
      data: {
        major: 1,
        minor: 0,
        patch: 0
      },
      backend: backendStructure,
      frontend: frontendStructure,
    },
    major: 1,
    minor: 1,
    patch: 1,
    history: [],
    setStructureHash: "",
    updateStructureHash: "",
    getStructureHashAndUpdateIfNeeded: "",
    backendVersions: "",
    databaseSchema, // Include databaseSchema
    services, // Include services
    transformToStructureItems,
    structure 
  };
})();


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

// Create a VersionHistory instance and add VersionData to it
export const versionHistory: VersionHistory = {
  versionData: versionData ? [versionData] : [], // Use empty array instead of null
  latestVersion: versionData || {
    id: 0,
    name: "Initial Version",
    timestamp: new Date(),
  }, 
  ...createLatestVersion(),
  ...createLastUpdated("Version history initialized."),
};


export { createDefaultVersionData };
export type { ExtendedVersionData, SharedVersionData, VersionData, VersionHistory };

