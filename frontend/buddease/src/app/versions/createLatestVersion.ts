import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseData } from '@/app/models/data/Data';
import { data } from '@/app/snapshots/SnapshotWithCriteria';
import VersionImpl, { version } from "@/app/versions/Version";
import { AppStructureItem } from "@/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { VersionData, VersionHistory } from "./VersionData";

// Define a default latestVersion generator
export function createLatestVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
  versionData: Partial<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {}
): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const now = new Date();
  const { latestVersion = createLatestVersion<T, K>(), ...rest } = data;
  const defaultVersionImpl: VersionImpl<T, K> = {
    major: 1,
    minor: 0,
    patch: 0,
    appVersion: "1.0.0",
    checksum: '0000000000000000',
    bumpVersion(type: "major" | "minor" | "patch" = "patch", notes?: string): void {
      switch (type) {
        case "major":
          this.major += 1;
          this.minor = 0;
          this.patch = 0;
          break;
        case "minor":
          this.minor += 1;
          this.patch = 0;
          break;
        case "patch":
        default:
          this.patch += 1;
          break;
      }
  
      // rebuild version string
      this.appVersion = `${this.major}.${this.minor}.${this.patch}`;
  
      // recalculate checksum + currentHash
      this.checksum = this.hash(this.appVersion);
      this.currentHash = this.checksum;
  
      if (notes) {
        console.log(`Version bumped to ${this.appVersion} (${type}) - Notes: ${notes}`);
      } else {
        console.log(`Version bumped to ${this.appVersion} (${type})`);
      }
    },
  
    releaseDate: new Date().toISOString(),
    description: 'Initial version',
    content: 'Default content',
    name: 'Default Version',
    url: '/versions/1.0.0',
    versionNumber: '1.0.0',
    documentId: 'doc-0001',
    draft: true,
    userId: 'system',
    buildNumber: '1',
    versions: version,
    id: 0,
    parentId: null,
    parentType: 'root',
    parentVersion: '0.0.0',
    parentTitle: 'Root Version',
    parentContent: 'No parent content',
    parentName: 'Root',
    parentUrl: '/versions/root',
    parentChecksum: '0000000000000000',
    parentAppVersion: '0.0.0',
    parentVersionNumber: '0.0.0',
    isLatest: true,
    isActive: true,
    isPublished: false,
    publishedAt: null,
    source: 'system',
    status: 'draft',
    workspaceId: 'workspace-0001',
    workspaceName: 'Default Workspace',
    workspaceType: 'system',
    workspaceUrl: '/workspace/default',
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: undefined,
    _structure: {},
  
    versionHistory: {} as VersionHistory,
    currentHash: '0000000000000000',
    structureData: '{}',
  
    transformToStructureItems: function (data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
      return data.map((item: any) => ({
        id: item.id ?? 'unknown',
        name: item.name ?? 'Unnamed Item',
        children: item.children ? this.transformToStructureItems(item.children) : undefined,
      }));
    },
  
    getStructure: function (): Promise<Record<string, AppStructureItem> | undefined> {
      return Promise.resolve({});
    },
  
    getVersionNumber: function (): string {
      return this.appVersion;
    },
  
    calculateHash: function (): string {
      // hash the version string consistently
      return this.hash(this.appVersion);
    },
  
    updateStructureHash: function (): Promise<void> {
      this.currentHash = this.calculateHash();
      return Promise.resolve();
    },
  
    setStructureData: function (newData: string): void {
      this.structureData = newData;
    },
  
    hash: function (value: string): string {
      // simple hash function (base64 of version string, truncated)
      return btoa(value).substring(0, 16);
    }
  };
  
  const defaultVersion: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: '0',
    name: "Default Version",
    url: "/default-version",
    versionNumber: "0.0.1",
    documentId: "default-doc",
    draft: true,
    userId: "default-user",
    content: "Default content",
    notes: [],
    appPathWithVersion: "",
    author: "",
    buildNumber: 0,
    schema: {},
    metadata: {
      author: "System",
      timestamp: new Date(),
      area: "version area",
      metadataEntries: {},
      latestVersion,
      schema: {}
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
    version: defaultVersionImpl, // Use the valid VersionImpl object

    // Cast to VersionImpl to ensure type safety
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
    _structure: undefined,
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



export function createLastUpdatedWithVersion<T extends BaseData<any>, K extends T = T>(
  summary?: string
): VersionHistory {
  const now = new Date();
  return {
    lastUpdated: now,
    timestamp: now,
    changeLogSummary: summary || "No changes recorded.",
    versionData: [], // Initialize as empty array or appropriate value
    latestVersion: createLatestVersion<T, K>({
      version: {
        transformToStructureItems: function (data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            children: item.children ? this.transformToStructureItems(item.children) : undefined,
          }));
        },
        getStructure: function (): Promise<Record<string, AppStructureItem> | undefined> {
          return Promise.resolve({});
        },
      } as VersionImpl<T, K>,
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
  latestVersion: createLatestVersion<T, K>({
    id: "1",
    name: "Initial Release",
    versionNumber: "1.0.0",
    userId: "user123",
    content: "Initial version of the content.",
    metadata: {
      author: "Author Name",
      timestamp: new Date(),
      area: 'version history area',
      metadataEntries: {},
      latestVersion: createLatestVersion<T, K>(),
      schema: {}
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
