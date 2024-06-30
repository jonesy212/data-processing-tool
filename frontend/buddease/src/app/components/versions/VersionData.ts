import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { Comment, Data } from "../models/data/Data";
import { getCurrentAppInfo } from "./VersionGenerator";

// Interfaces
interface VersionHistory {
  // Define the structure of the version history
  // Each element represents a version of the data
  versions: VersionData[];
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
    timestamp: string | Date | undefined;
    revisionNotes?: string;
    // Add other metadata fields as needed
  };
  versions: {
    data: Data | undefined;
    backend: BackendStructure | undefined;
    frontend: FrontendStructure | undefined;
  };
  published?: boolean;
  checksum: string;
}

interface VersionData extends ExtendedVersionData {
  // Add more specific properties if needed
  id: number;
  parentId: string;
  parentType: string;
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
  timestamp: string | Date;
  user: string;
  comments: Comment[];
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
  createdAt?: Date;
  updatedAt?: Date;
  _structure?: any; // Adjust as per actual type
  frontendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  backendStructure?: Promise<AppStructureItem[]>; // Adjust as per actual type
  data: Data[]; // Adjust as per actual type
}

// Example usage and data
const updatedContent = "Updated file content here...";
const author = "John Doe";
const timestamp = new Date();
const revisionNotes = "Added new section and fixed typos.";
const versions = {
  data: {
    frontend: {
      versionNumber: "1.0",
    },
    backend: {
      versionNumber: "1.0",
    },
  },
  backend: {
    structure: {},
    traverseDirectory: async () => [],
    getStructure: async () => ({
      sections: [
        {
          name: "Section 1",
          fields: [
            {
              name: "Field 1",
              type: "text",
              value: "Field 1 value",
            },
          ],
        },
      ],
    }),
  } as unknown as BackendStructure, // Cast to BackendStructure
  frontend: {
    getStructure: () => ({})
  } as unknown as FrontendStructure, // Adjust frontend structure if needed
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
  versions: {
    data: {} as VersionData,
    frontend: {} as FrontendStructure,
    backend: {} as BackendStructure,
  },
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
  data: [
    { id: 1, key: "exampleKey1", value: "exampleValue1" },
    { id: 2, key: "exampleKey2", value: "exampleValue2" },
  ],
  version: "1.0.0",
  user: "user@example.com",
  comments: []
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
  versions: [versionData] // Add the VersionData to the versions array
};

export type { ExtendedVersionData, VersionData, VersionHistory };
