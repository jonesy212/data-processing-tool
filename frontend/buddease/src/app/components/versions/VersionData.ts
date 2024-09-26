import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { Comment, Data } from "../models/data/Data";
import { getCurrentAppInfo } from "./VersionGenerator";

// Interfaces
interface VersionHistory {
  // Define the structure of the version history
  // Each element represents a version of the data
  versionData: VersionData[] | {}; 
}


interface ExtendedVersionData {
  name: string;
  url: string;
  versionNumber: string;
  appVersion?: string;
  documentId: string;
  draft: boolean;
  userId: string;
  content: string; // Include content here if needed
  metadata: {
    author: string;
    timestamp: string | number | Date | undefined;
    revisionNotes?: string;
    // Add other metadata fields as needed
  };
  versionData: VersionData[] | null;
  major: number;
  minor: number;
  patch: number;
  published?: boolean;
  checksum: string;
}

interface VersionData extends ExtendedVersionData {
  // Add more specific properties if needed
  id: number;
  parentId: string | null;
  parentType: string | null;
  parentVersion: string;
  parentTitle: string;
  parentContent: string;
  parentName: string;
  parentUrl: string;
  parentChecksum: string;
  parentMetadata?: {}; // Adjust as per actual type
  parentAppVersion: string;
  parentVersionNumber: string;
  isLatest: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  source: string;
  status: string;
  version: string;
  timestamp: string | Date | undefined
  user: string;
  changes: string[];
  comments: Comment[];
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  _structure?: any; // Adjust as per actual type
  frontendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  backendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  data: Data | undefined;
  backend: BackendStructure | undefined;
  frontend: FrontendStructure | undefined;
}
// Example usage and data
const updatedContent = "Updated file content here...";
const author = "John Doe";
const timestamp = new Date();
const revisionNotes = "Added new section and fixed typos.";

const versions: VersionHistory = {
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
      version: "",
      timestamp: "",
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
      frontend: undefined
    }
  ]
};

const { versionNumber } = getCurrentAppInfo();

const versionData: VersionData = {
  id: 0,
  name: "Version 1",
  url: "https://example.com/version1",
  timestamp: new Date("2022-03-27T12:00:00Z"),
  versionNumber: versionNumber,
  documentId: "documentId",
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
  version: "1.0.0",
  user: "user@example.com",
  comments: [],
  backend: {
    getStructure: async (): Promise<Record<string, AppStructureItem>> => {
      return {};
    },
    getStructureAsArray: () => [],
    traverseDirectoryPublic: async (dir: string, fs: typeof import("fs")): Promise<AppStructureItem[]> => {
      return [];
    },
    backendVersions: () => [versions]
  },
  frontend: {
    id: "0",
    name: "frontend",
    type: "directory",
    path: "workspace/frontend",
    draft: false,
    permissions: {
      read: true,
      write: false,
      delete: false,
      share: false,
      execute: false,
    },
    content: updatedContent,
    getStructure: async (): Promise<Record<string, AppStructureItem>> => {
      return {};
    },
    getStructureAsArray: async () => [],
    traverseDirectoryPublic: async (
      dir: string,
      fs: typeof import("fs")): Promise<AppStructureItem[]> => {
      return [];
    },
    frontendVersions: async () => [versions]
  },
  changes: []
};

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
  versionData: [versionData] // Add the VersionData to the versions array
};

export type { ExtendedVersionData, VersionData, VersionHistory };
