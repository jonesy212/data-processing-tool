import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { Data } from "../models/data/Data";
import { getCurrentAppInfo } from "./VersionGenerator";

interface VersionHistory {
  // Define the structure of the version history
  // Each element represents a version of the data
  versions: VersionData[];
}
interface ExtendedVersionData {
  name: string;
  url: string;
  versionNumber: string;
  documentId: string;
  draft: boolean;
  userId: string;
  content: string; // Include content here if needed
  metadata: {
    author: string;
    timestamp: Date | undefined;
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

// Example usage:
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
  versionNumber: versionNumber,
  documentId: "documentId",
  draft: false,
  userId: "userId",
  content: updatedContent,
  metadata: {
    author: author,
    timestamp: timestamp,
    revisionNotes: revisionNotes
  },
  versions: versions,
  checksum: calculateChecksum(updatedContent) // Function to calculate checksum
  ,
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
  workspaceId: "",
  workspaceName: "",
  workspaceType: "",
  workspaceUrl: "",
  workspaceViewers: [],
  workspaceAdmins: [],
  workspaceMembers: [],
  data: []
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

// Now, you can create a VersionHistory instance and add VersionData to it
export const versionHistory: VersionHistory = {
  versions: [versionData] // Add the VersionData to the versions array
};

export type { ExtendedVersionData, VersionData, VersionHistory };

