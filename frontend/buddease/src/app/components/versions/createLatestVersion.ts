import { version } from '@/app/components/versions/Version';
import { createLastUpdated, VersionData, VersionHistory } from "./VersionData";

// Define a default latestVersion generator
export function createLatestVersion(versionData: Partial<VersionData> = {}): VersionData {
  const now = new Date();

  const defaultVersion: VersionData = {
    id: 0,
    name: "Default Version",
    url: "/default-version",
    versionNumber: "0.0.1",
    documentId: "default-doc",
    draft: true,
    userId: "default-user",
    content: "Default content",
    metadata: {
      author: "System",
      timestamp: new Date(),
    },
    releaseDate: new Date().toISOString(),
    major: 0,
    minor: 0,
    patch: 1,
    checksum: "default-checksum",
    parentId: null,
    parentType: null,
    parentVersion: "0.0.0",
    parentTitle: "Default Parent Title",
    parentContent: "Default Parent Content",
    parentName: "Default Parent Name",
    parentUrl: "/default-parent-url",
    parentChecksum: "default-parent-checksum",
    parentAppVersion: "0.0.0",
    parentVersionNumber: "0.0.0",
    isLatest: true,
    isActive: true,
    isPublished: false,
    publishedAt: null,
    source: "System Generated",
    status: "Draft",
    version: version,
    timestamp: new Date(),
    user: "System",
    changes: [],
    comments: [],
    workspaceId: "default-workspace",
    workspaceName: "Default Workspace",
    workspaceType: "Default",
    workspaceUrl: "/default-workspace",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    history: [],
    _structure: null,
    frontendStructure: undefined,
    backendStructure: undefined,
    data: undefined,
    backend: undefined,
    frontend: undefined,
    createdBy: "system",
    lastUpdated: now,
  };

  return { ...defaultVersion, ...versionData };
}



export function createLastUpdatedWithVersion(
    summary?: string
  ): VersionHistory {
    const now = new Date();
    return {
      lastUpdated: now,
      timestamp: now,
      changeLogSummary: summary || "No changes recorded.",
      versionData: [], // Initialize as empty array or appropriate value
      latestVersion: createLatestVersion({
        version: version, // Example default version
        description: "Initial version", // Example description
        createdAt: now,
        createdBy: "system", // Example author
      }),
      history: []
    }
  }
  
const versionHistory: VersionHistory = {
  versionData: [],
  history: [],
  latestVersion: createLatestVersion({
    id: 1,
    name: "Initial Release",
    versionNumber: "1.0.0",
    userId: "user123",
    content: "Initial version of the content.",
    metadata: {
      author: "Author Name",
      timestamp: new Date(),
    },
    releaseDate: "2024-11-24",
    major: 1,
    minor: 0,
    patch: 0,
    isPublished: true,
    publishedAt: new Date(),
    source: "Generated",
    status: "Active",
    comments: [{ id: "1", text: "First comment", timestamp: new Date() }], // Assuming a Comment type
    workspaceName: "Main Workspace",
  }),
  lastUpdated: new Date(),
  timestamp: new Date(), // Set the current timestamp or another appropriate value

};
