// createLatestVersion.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { K, T } from '@/app/models/data/dataStoreMethods';
import VersionImpl from "@/app/versions/Version";
import { AppStructureItem } from "@/app/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta, BaseDataRoot } from '@/app/config/BaseConfig';
import { VersionData, VersionHistory } from "./VersionData";
import { Version } from "@/app/versions/Version";
import { VersionEntity, VersionK,VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields } from '@/app/typings/entities/VersionEntity'

// ✅ Clean, type-safe default version generator
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

  // ✅ Define default version metadata (no recursion)
  const defaultLatestVersion = {
    id: "ver-0001",
    versionNumber: "1.0.0",
    timestamp: now.toISOString(),
    author: "system",
    schema: {
      // Provide actual SchemaField objects instead of string
      "field1": {
        schemaType: "string" as const,
        required: true,
        default: "",
        schemaProperties: undefined,
        items: undefined,
      },
      "field2": {
        schemaType: "number" as const,
        required: false,
        default: 0,
        schemaProperties: undefined,
        items: undefined,
      }
    },
  };
  
  function simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  // ✅ Define default VersionImpl (runtime behavior only)
  const defaultVersionImpl: VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    major: 1,
    minor: 0,
    patch: 0,
    appVersion: "1.0.0",
    checksum: "0000000000000000",
    currentHash: "0000000000000000",
    releaseDate: now.toISOString(),
    description: "Initial version",
    content: "Default content",
    name: "Default Version",
    url: "/versions/1.0.0",
    documentId: "doc-0001",
    draft: true,
    userId: "system",
    buildNumber: "1",
    id: 0,
    parentId: null,
    parentType: "root",
    parentVersion: "0.0.0",
    parentTitle: "Root Version",
    parentContent: "No parent content",
    parentName: "Root",
    parentUrl: "/versions/root",
    parentChecksum: "0000000000000000",
    parentAppVersion: "0.0.0",
    parentVersionNumber: "0.0.0",
    isLatest: true,
    isActive: true,
    isPublished: false,
    publishedAt: null,
    source: "system",
    status: "draft",
    workspaceId: "workspace-0001",
    workspaceName: "Default Workspace",
    workspaceType: "system",
    workspaceUrl: "/workspace/default",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    versionHistory: {} as VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    structureData: "{}",
    _structure: {},

    // --- Methods ---
    transformToStructureItems(data: any) {
      return (data ?? []).map((item: any) => ({
        id: item.id ?? "unknown",
        name: item.name ?? "Unnamed Item",
        children: item.children ? this.transformToStructureItems(item.children) : undefined,
      }));
    },

    getStructure() {
      return Promise.resolve({});
    },

    getVersionNumber() {
      return this.appVersion;
    },

    hash(input: string): string {
      return HashGenerator.generateHash(input, 'sha256');
    },

    calculateHash(): string {
      // Create a simple hash from version information
      const content = `${this.major}.${this.minor}.${this.patch}-${this.appVersion}-${Date.now()}`;
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    },

    updateStructureHash() {
      this.currentHash = this.calculateHash();
      return Promise.resolve();
    },

    setStructureData(newData: string) {
      this.structureData = newData;
    },

    hash(value: string) {
      return btoa(value).substring(0, 16);
    },


    
   
  bumpVersion(type: "major" | "minor" | "patch" = "patch", notes?: string) {
    switch (type) {
      case "major":
        this.major++;
        this.minor = 0;
        this.patch = 0;
        break;
      case "minor":
        this.minor++;
        this.patch = 0;
        break;
      default:
        this.patch++;
    }

    this.appVersion = `${this.major}.${this.minor}.${this.patch}`;
    this.checksum = this.hash(this.appVersion);
    this.currentHash = this.checksum;

    console.log(
      `Version bumped to ${this.appVersion} (${type})${notes ? " - " + notes : ""}`
    );

    return this; // Add this line to return the Version object
    },
    versionNotes: '',
      toData(): any {
      return {
        major: this.major,
        minor: this.minor,
        patch: this.patch,
        appVersion: this.appVersion,
        checksum: this.checksum,
        currentHash: this.currentHash,
        versionNotes: this.versionNotes
      };
    }
  }

  // ✅ Define default VersionData
  const defaultVersionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "ver-0001",
    name: "Default Version",
    url: "/default-version",
    versionNumber: "1.0.0",
    documentId: "default-doc",
    draft: true,
    userId: "system",
    content: "Default content",
    appPathWithVersion: "",
    author: "system",
    buildNumber: 1,
      schema: {
        "field1": {
        schemaType: "string",
        required: true,
        default: "",
        schemaProperties: undefined, // For nested objects
        items: undefined, // For arrays
      },
      "field2": {
        schemaType: "number",
        required: false,
        default: 0,
        schemaProperties: undefined,
        items: undefined,
      },
      // Example of nested object field
      "field3": {
        schemaType: "object",
        required: false,
        default: {},
        schemaProperties: {
          "nestedField": {
            schemaType: "string",
            required: true,
            default: "nested"
          }
        },
        items: undefined,
      },
      // Example of array field
      "field4": {
        schemaType: "array", 
        required: false,
        default: [],
        schemaProperties: undefined,
        items: [
          {
            schemaType: "string",
            required: true,
            default: "array item"
          }
        ],
      },
    },
    releaseDate: now.toISOString(),
    major: 1,
    minor: 0,
    patch: 0,
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
    source: "system",
    status: "draft",
    timestamp: now,
    user: "system",
    createdBy: "system",
    lastUpdated: now,
    workspaceId: "workspace-0001",
    workspaceName: "Default Workspace",
    workspaceType: "system",
    workspaceUrl: "/workspace/default",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    notes: [],
    changes: [],
    comments: [],
    history: [],
    frontendStructure: undefined,
    backendStructure: undefined,
    data: undefined,
    backend: undefined,
    frontend: undefined,

    // ✅ Embed version metadata
    metadata: {
      author: "system",
      timestamp: now,
      area: "default",
      metadataEntries: [{
        originalPath: '', 
        alternatePaths: [], 
        author: '', 
        timestamp: new Date(), 
        fileType, title, description, keywords,

      }],
      latestVersion: defaultLatestVersion, // no recursion here
      schema: {
        // Provide actual SchemaField objects
        "field1": {
          schemaType: "string",
          required: true,
          default: "",
          schemaProperties: undefined,
          items: undefined,
        },
        "field2": {
          schemaType: "number",
          required: false,
          default: 0,
          schemaProperties: undefined,
          items: undefined,
        },
        "nestedObject": {
          schemaType: "object",
          required: true,
          default: {},
          schemaProperties: {
            "nestedField": {
              schemaType: "string",
              required: true,
              default: "nested value",
              schemaProperties: undefined,
              items: undefined,
            }
          },
          items: undefined,
        },
        "stringArray": {
          schemaType: "array",
          required: false,
          default: [],
          schemaProperties: undefined,
          items: [
            {
              schemaType: "string",
              required: true,
              default: "array item",
              schemaProperties: undefined,
              items: undefined,
            }
          ],
        },
      },
    },
    // Optionally include runtime version implementation
    version: defaultVersionImpl as unknown as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  };

  // ✅ Return merged structure (caller can override anything)
  return { 
        ...defaultVersionData, 
        ...versionData, 
        createdAt: versionData.createdAt || now,
        updatedAt: now
   };
}



export function createLastUpdatedWithVersion<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  summary?: string
): VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const now = new Date();
  return {
    lastUpdated: now,
    timestamp: now,
    changeLogSummary: summary || "No changes recorded.",
    versionData: [], // Initialize as empty array or appropriate value
    latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      description, structureData, getVersionNumber, calculateHash,
      createdAt: now,
      createdBy: "system", // Example author
      version: {
        id, major, minor, patch, 

        transformToStructureItems: function (data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            children: item.children ? this.transformToStructureItems(item.children) : undefined,
          }));
        },
        getStructure: function (): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined> {
          return Promise.resolve({});
        },
        versionNotes: "",
        toData: "",
      } as VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

    }),
    history: []
  }
}

const versionHistory: VersionHistory<VersionEntity, VersionK,VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> = {
  versionData: [],
  history: [],
  latestVersion: createLatestVersion<VersionEntity, VersionK,VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>({
    id: "1",
    name: "Initial Release",
    versionNumber: "1.0.0",
    userId: "user123",
    content: "Initial version of the content.",
    description: '',
    structureData: '',
    getVersionNumber: '',
    calculateHash: '',
  

    metadata: {
      author: "Author Name",
      timestamp: new Date(),
      area: 'version history area',
      metadataEntries: {},
      latestVersion: createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(),
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
