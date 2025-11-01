// Version.ts
import { IBackendStructure } from '@/app/config/appStructure/IBackendStructure';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import metadata from '@/app/layout';
import UserRoles from '@/app/models/UserRoles';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotStoreConfig } from '@/app/snapshots';
import { snapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { UserData } from "@/app/users/User";
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { useAuth } from "@/context/AuthContext";
      
import { AppStructureItem } from "@/app/config/appStructure/AppStructure";
import FrontendStructure, { frontendStructure } from "@/app/config/appStructure/FrontendStructure";
import { fetchUserAreaDimensions } from "@/app/config/MetaDataOptions";
import { SharedRelationshipData } from '@/app/models/data/Data';
import { EventManager } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { backendStructure } from '@/app/server/database/BackendStructure';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { sharedMetadata } from "@/config/metadata/MetadataStateManager";

import getAppPath from "@/app/config/appStructure/appPath";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { dataVersions } from "@/app/config/DocumentBuilderConfig";
import { MetadataEntriesType, StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from "@/app/documents/attachment/Attachment";
import DocumentPermissions from "@/app/documents/DocumentPermissions";
import { createBaseData } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Taggable } from '@/app/models/CommonData';
import { BaseData, Data } from '@/app/models/data/Data';
import { K, T } from "@/app/models/data/dataStoreMethods";
import { Member } from "@/app/models/teams/TeamMembers";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { data, TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { HistoryEntry } from '@/app/state/stores/HistoryStore';
import { User } from "@/app/users/User";
import { fluenceApiKey } from "@/app/utils/web3/dAppAdapter/DAppAdapterConfig";
import { BumpVersionOptions } from "./BumpVersionOptions";
import { VersionData, VersionHistory } from "./VersionData";

interface ExtendedVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name: string;
  url: string;
  versionNumber: string;
  documentId: string | number;
  draft: boolean;
  userId: string;
}

interface BuildVersion<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data: Data<T> | undefined,
  baseData: BaseData<T> | undefined,
  backend: IBackendStructure | undefined,
  frontend: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
}

export interface Version<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string | number;
  major: number;
  minor: number;
  patch: number;
  buildNumber: number | string;
  versionNumber: string | number;
  name: string;
  description: string;
  content: string;
  documentId: string | number;
  appVersion: string;
  draft: boolean;
  url: string;
  userId: string;
  isActive: boolean;
  isPublished: boolean;
  isLatest: boolean;
  publishedAt?: Date | null;
  releaseDate?: string | Date;
  status?: string;
  source?: string;

  // Metadata and relationships
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  parentId?: string | null;
  parentType?: string;
  parentVersion?: string;
  parentVersionNumber?: string;
  parentAppVersion?: string;
  parentName?: string;
  parentTitle?: string;
  parentContent?: string;
  parentUrl?: string;
  parentChecksum?: string;
  parentMetadata?: Record<string, any>;

  // Workspace
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: any[];
  workspaceAdmins: any[];
  workspaceMembers: any[];

  // Data + structure
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versionData?: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> | null;
  structureData: string;
  attachments?: AttachmentType[];
  excludedFields?: ExcludedFields[];
  includedFields?: IncludedFields[];

  // Methods
  getVersionNumber(): string;
  calculateHash(): string;
  generateChecksum(version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string;
  updateStructureHash(): Promise<void>;
  setStructureData(newData: string): void;
  hash(value: string): string;
  transformToStructureItems(data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getStructure?(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined>;
  bumpVersion(type: "major" | "minor" | "patch", notes?: string): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Version linking
  previousVersion?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  versions?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  versionNotes: string[];
  toData(): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

}

interface Versions<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  versionData?: string | number | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  backend?: IBackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  frontend?: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  history?: HistoryEntry[];
}

const area = fetchUserAreaDimensions().toString()

function createDefaultMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

const { latestVersion = createLatestVersion(), ...rest } = data;
  
  return {
    author: "",
    timestamp: 0,
    baseConfig: {
      id: "default-id",
      apiEndpoint: "",
      apiKey: undefined,
      timeout: 0,
      isActive: false,
      retryAttempts: 0,
      name: "Default Name",
      description: "Default Description",
      category: "Default Category",
      timestamp: new Date(),
      createdBy: "Unknown",
      metadata: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      initialState: {} as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Fixed
      meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Fixed
      mappedSnapshot: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), 
      events: {} as EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      latestVersion,
      schema: {}
    },
    keywords: [],
    isActive: true,
    permissions: [],
    customFields: {},
    latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    versionData: "",
    sharedMetadata: sharedMetadata,
    sharedBaseData: {} as SharedRelationshipData<any>,
    taggable: {} as Taggable<UserData<T, K, any>, any>,
    metadataEntries: {} as MetadataEntriesType<UserData<T, K, any>, any>,
  };
}

function createVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(overrides?: Partial<Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, previousVersion?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const now = new Date();

  // Helper function defined outside the version object
  const generateChecksum = (version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string => {
    const content = `${version.major}.${version.minor}.${version.patch}.${version.appVersion}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
  };
  
  // Default structure
  const defaultVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: 1,
    versionData: null,
    buildVersions: undefined,
    isActive: true,
    releaseDate: now,
    major: 1,
    minor: 0,
    patch: 0,
    name: "Initial Release",
    url: "https://example.com/version/1",
    versionNumber: "1.0.0",
    versionNotes: [],
    documentId: "doc123",
    draft: false,
    userId: "user456",
    content: "This is the content of the version.",
    description: "This is the initial release version.",
    buildNumber: "build_001",
    transformToStructureItems: (data: any) => [],
    bumpVersion: function (
      this: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      type: "major" | "minor" | "patch" = "patch", 
      notes?: string,
      options: BumpVersionOptions = {}
    ): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      // Create a new version object with updated version numbers
      const newVersionId = Math.floor(Math.random() * 1000000);
      
      
      const newVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        ...this,
        id: newVersionId,
        major: this.major,
        minor: this.minor,
        patch: this.patch,
        name: `Version ${newVersionId}`,
        url: `/version/${newVersionId}`,
        versionNumber: this.versionNumber,
        versionNotes: this.versionNotes,
        documentId: newVersionId.toString(),
        parentId: this.id.toString(),
        parentType: "version",
        parentVersion: this.versionNumber,
        previousVersion: this.previousVersion,
        parentTitle: this.name,
        parentContent: this.content,
        parentName: this.name,
        parentUrl: this.url,
        parentChecksum: this.checksum,
        parentAppVersion: this.appVersion,
        parentVersionNumber: this.versionNumber,
        parentMetadata: this.metadata,
        updatedAt: new Date(),
        isLatest: true,
        isPublished: false,
        publishedAt: null,
        versionHistory: {
          timestamp: new Date(),
          versions: previousVersion ? [previousVersion] : [],
          currentVersionIndex: 0,
          versionData: null, // Required by VersionHistory interface
        
        },
      };
      
      // Apply version bump based on type
      switch (type) {
        case "major":
          newVersion.major += 1;
          newVersion.minor = 0;
          newVersion.patch = 0;
          newVersion.appVersion = `${newVersion.major}.0.0`;
          break;
        case "minor":
          newVersion.minor += 1;
          newVersion.patch = 0;
          newVersion.appVersion = `${newVersion.major}.${newVersion.minor}.0`;
          break;
        case "patch":
        default:
          newVersion.patch += 1;
          newVersion.appVersion = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
          break;
      }

      // Handle version notes conditionally
      if (notes) {
        switch (options.notesStrategy || 'append') {
          case 'append':
            newVersion.versionNotes = [...this.versionNotes, notes];
            break;
          case 'prepend':
            newVersion.versionNotes = [notes, ...this.versionNotes];
            break;
          case 'replace':
            newVersion.versionNotes = [notes];
            break;
          case 'ignore':
            // Keep existing notes
            newVersion.versionNotes = this.versionNotes;
            break;
        }
      } else {
        newVersion.versionNotes = this.versionNotes;
      }

      // Optional: clear previous notes if specified
      if (options.clearPreviousNotes) {
        newVersion.versionNotes = notes ? [notes] : [];
      }

      // Optional: limit number of notes
      if (options.maxNotes && newVersion.versionNotes.length > options.maxNotes) {
        newVersion.versionNotes = newVersion.versionNotes.slice(-options.maxNotes);
      }  
      return newVersion
    },
    // Helper method for checksum generation (simplified)
    generateChecksum: function(version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
      // In a real implementation, you'd use a proper hash function
      const content = `${version.major}.${version.minor}.${version.patch}.${version.appVersion}`;
      return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
    },
    metadata: {
      area: area,
      currentMeta: createDefaultMeta<T, K>(), // Use the factory function
      metadataEntries: {},
      latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
      schema: {}
    },
    versions: null,
    appVersion: "1.0.0",
    checksum: "abc123",
    parentId: null,
    parentType: "document",
    parentVersion: "0.0.1",
    parentTitle: "Parent Document Title",
    parentContent: "Parent document content.",
    parentName: "Parent Name",
    parentUrl: "https://example.com/parent",
    parentChecksum: "def456",
    parentAppVersion: "0.0.1",
    parentVersionNumber: "0.0.1",
    parentMetadata: {},
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
    isLatest: true,
    isPublished: true,
    publishedAt: now,
    source: "web",
    status: "active",
    workspaceId: "workspace789",
    workspaceName: "Workspace Name",
    workspaceType: "standard",
    workspaceUrl: "https://example.com/workspace",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: {} as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    _structure: {},

    versionHistory: {
      versionData: {},
      latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(), 
      lastUpdated: new Date(),
      history: [], 
      timestamp: new Date(),
      versions: [],
      currentVersionIndex: 0
    },

    // Method to generate a version number string
    getVersionNumber: function () {
      return `${this.major}.${this.minor}.${this.patch}`;
    },

    // Method to update the hash of the structure
    updateStructureHash: async function () {
      this.currentHash = this.calculateHash();
      console.log(`Structure hash updated to: ${this.currentHash}`);
    },

    // Method to set the structure data
    setStructureData: function (newData: string) {
      this.structureData = newData;
      console.log("Structure data set to:", newData);
    },

    // Sample hash function, ideally use a secure hashing algorithm here
    hash: function (value: string): string {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString();
    },

    // Calculate hash based on structureData or other relevant fields
    calculateHash: function () {
      return this.hash(this.structureData || "");
    },

    currentHash: "", // Initialized to empty; will be set by `updateStructureHash`
    structureData: "", // Will be populated with actual data when needed
  };
   
  const isVersionDefined = <T>(value: T | undefined): value is T => value !== undefined;

  // Merge overrides (if any) with default values
  if (isVersionDefined(defaultVersion)) {
    return {
      ...defaultVersion,
      metadata: {
        ...defaultVersion.metadata,
        latestVersion: overrides?.metadata?.latestVersion ?? defaultVersion.metadata?.latestVersion ?? createLatestVersion(),
        currentMeta: overrides?.metadata?.currentMeta ?? defaultVersion.metadata?.currentMeta ?? createDefaultMeta<T, K>(), 
        metadataEntries: overrides?.metadata?.metadataEntries ?? defaultVersion.metadata?.metadataEntries ?? {}, // Provide default value
        area: overrides?.metadata?.area ? defaultVersion.metadata?.area : undefined,
        tags: overrides?.metadata?.tags ?? defaultVersion.metadata?.tags,
        childIds: overrides?.metadata?.childIds ?? defaultVersion.metadata?.childIds,
        relatedData: overrides?.metadata?.relatedData ?? defaultVersion.metadata?.relatedData,
        baseUrl: overrides?.metadata?.baseUrl ?? defaultVersion.metadata?.baseUrl,
      },
      versionHistory: {
        ...defaultVersion.versionHistory,
        ...(overrides?.versionHistory ?? {}),
      },
    };
  } else {
    throw new Error('defaultVersion is undefined');
  }
}


// DevVersion: Extends BaseVersion and adds development-specific properties
interface DevVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  buildDate: string;
  commitHash: string;
  commitDate: string;
  commitMessage: string;
  commitAuthor: string;
  commitAuthorEmail: string;
  commitCommitter: string;
  commitCommitterEmail: string;
  branch: string;
  tag: string;
  remoteOrigin: string;
  remoteOriginURL: string;
  isRelease: boolean;
  isBeta: boolean;
  isAlpha: boolean;
  isCandidate: boolean;
  isSnapshot: boolean;
  isPullRequest: boolean;
  pullRequestNumber: string;
  pullRequestUrl: string;
  pullRequestAuthor: string;
  pullRequestAuthorEmail: string;
  pullRequestCommit: string;
  pullRequestCommitUrl: string;
  pullRequestCommitMessage: string;
  pullRequestCommitDate: string;
  pullRequestCommitAuthor: string;
  pullRequestCommitAuthorEmail: string;
  pullRequestCommitCommitter: string;
  pullRequestCommitCommitterEmail: string;
  pullRequestBranch: string;
  pullRequestBaseBranch: string;
  pullRequestMergeBranch: string;
  pullRequestMergeCommit: string;
  pullRequestMergeCommitUrl: string;
  pullRequestMergeCommitMessage: string;
  pullRequestMergeCommitDate: string;
  pullRequestMergeCommitAuthor: string;
  pullRequestMergeCommitAuthorEmail: string;
  pullRequestMergeCommitCommitter: string;
  pullRequestMergeCommitCommitterEmail: string;
}

class VersionImpl<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
             VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
  id: number = 0;
  major: number = 0;
  minor: number = 0;
  patch: number = 0;
  name: string = "";
  appVersion: string = "1.0.0";
  draft: boolean = false
  buildNumber: number | string = 0;
  versionNumber: string = "";
  description: string = "";
  isPublished: boolean = false;
  publishedAt: Date | null = null;
  isActive: boolean = true;
  isLatest: boolean = true;
  checksum: string = "";
  releaseDate: string | Date | undefined = undefined;
  content: string = "";

  url: string = "";
  documentId: number = 0;
  userId: string = "";
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versions?: Versions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  
  // Add other properties as needed
  parentId: string | null;
  parentType: string;
  parentVersion: string;
  parentTitle: string;
  parentContent: string;
  parentName: string;
  parentUrl: string;
  parentChecksum: string;
  parentMetadata?: {};
  parentAppVersion: string;
  parentVersionNumber: string;
  source: string;
  status: string;
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
  versionData?: string | number | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  buildVersions?: BuildVersion | undefined;
  published?: boolean;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  deletedAt?: string | Date |  null;
  frontendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  backendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  getVersion?: () => Promise<string | null>;

  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {}; // Define private property _structure
  versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Add version history property

  currentHash: string;
  structureData: string; // Data to be hashed

  // Method to set structure (private)
  private setStructure?(structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>): void {
    this._structure = structure;
  }

  private mergeStructures?(
    baseStructure: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    additionalStructure: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    // Deep copy the base structure to avoid mutation
    const mergedStructure = JSON.parse(JSON.stringify(baseStructure));

    // Loop through the additional structure
    additionalStructure.forEach((item) => {
      // Find if the item exists in the base structure
      const existingItem = mergedStructure.find(
        (baseItem: any) => baseItem.id === item.id
      );

      if (existingItem) {
        // Merge properties from the additional structure item
        Object.assign(existingItem, item);
      } else {
        // If the item doesn't exist in the base structure, add it
        mergedStructure.push(item);
      }
    });

    return mergedStructure;
  }

  /**
   * Static method to create a Version instance.
   * @param versionInfo - Object containing version details.
   * @returns A new instance of VersionImpl.
  */
  /**
 * Static method to create a Version instance.
 * @param versionInfo - Object containing version details.
 * @returns A new instance of VersionImpl.
 */
  static createVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
    versionInfo: {
      id: number;
      major: number;
      minor: number;
      patch: number;
      versionNumber: string;
      structureData: string;
      buildVersions?: BuildVersion | undefined;
      appVersion: string;
      description: string;
      content: string;
      checksum: string;
      versionData?: string | number | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
      data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
      name: string;
      url: string;
      metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string | any;
      versions: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
      versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      userId: string;
      documentId: string | number;
      parentId: string | null;
      parentType: string;
      parentVersion: string;
      parentTitle: string;
      parentContent: string;
      parentName: string;
      parentUrl: string;
      parentChecksum: string;
      parentMetadata: {} | undefined;
      parentAppVersion: string;
      parentVersionNumber: string;
      createdAt: string | Date | undefined;
      updatedAt: string | Date | undefined;
      deletedAt: string | Date | undefined;
      draft: boolean;
      isActive: boolean;
      isLatest: boolean;
      isPublished: boolean;
      publishedAt: Date | null;
      releaseDate: string | Date;
      isDeleted: boolean;
      publishedBy: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['username'] | null;
      lastModifiedBy: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['username'] | null;
      lastModifiedAt: string | Date | null;
      rootId: string | null;
      branchId: string | null;
      isLocked: boolean;
      lockedBy: string | null;
      lockedAt: Date | null;
      isArchived: boolean;
      archivedBy: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['username'];
      archivedAt: Date | null;
      tags: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      categories: Category[];
      permissions: DocumentPermissions;
      collaborators: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      comments: Comment[];
      reactions: string[];
      changes: string[];
      attachments?: AttachmentType[];
      source: string;
      status: string;
      buildNumber: number | string;
      workspaceId: string;
      workspaceName: string;
      workspaceType: string;
      workspaceUrl: string;
      workspaceViewers: string[];
      workspaceAdmins: string[];
      workspaceMembers: string[];
      _structure?: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
      frontendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
      backendStructure?: Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    }
  ): VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  {
       // Convert documentId to string if it's a number
    const documentIdString = typeof versionInfo.documentId === 'number' 
      ? versionInfo.documentId.toString() 
      : versionInfo.documentId;

    // Convert number buildNumber to string if needed
    const processedInfo = {
      ...versionInfo,
      buildNumber: typeof versionInfo.buildNumber === 'number' 
        ? versionInfo.buildNumber.toString() 
        : versionInfo.buildNumber,
      // Ensure documentId is always string
      documentId: typeof versionInfo.documentId === 'number'
        ? versionInfo.documentId.toString()
        : versionInfo.documentId
    };
    const versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: `${versionInfo.id}`, // Convert to string if needed
      versionNumber: versionInfo.versionNumber,
      releaseDate: "2015-03-25",
      description: "Generated version",
      parentId: null,
      parentType: "document",
      parentVersion: "1.0.0",
      parentTitle: "Initial Release",
      parentContent: "This is the content of the parent document.",
      parentName: "Parent Document",
      parentUrl: "https://example.com/parent-document",
      parentChecksum: "abc123",
      parentAppVersion: "1.0.0",
      parentVersionNumber: "1",
      isLatest: true,
      isActive: true,
      isPublished: false,
      publishedAt: null,
      source: "internal system",
      status: "active",
      workspaceId: "workspace123",
      workspaceName: "Development Workspace",
      workspaceType: "development",
      workspaceUrl: "https://example.com/workspace123",
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
      data: undefined,
      backend: undefined,
      frontend: undefined,
      notes: [],
      user: "user@example.com",
      changes: [],
      timestamp: new Date(),
      _structure: {},
      frontendStructure: undefined,
      backendStructure: undefined,
      version: versionInfo.version,
  
      // Add the missing properties
      draft: versionInfo.draft ?? false,
      userId: versionInfo.userId ?? "unknown",
      content: versionInfo.content ?? "",

      documentId: documentIdString,
      isDeleted: versionInfo.isDeleted ?? false,
      publishedBy: versionInfo.publishedBy ?? null,
      lastModifiedBy: versionInfo.lastModifiedBy ?? null,
      lastModifiedAt: versionInfo.lastModifiedAt ?? null,
    };
  
    return new VersionImpl({
      ...versionInfo, // Spread all properties from versionInfo
      versionData, // Use the updated versionData object
    });
  }

  // ... all other properties with sensible defaults

  constructor(init?: Partial<VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) {
    if (init) {
      Object.assign(this, init);
    }

    // Handle computed properties and special logic
    this.versionNumber = `${this.major}.${this.minor}.${this.patch}`;
    this.currentHash = this.computeCurrentHash();
    
    // Initialize metadata with defaults if not provided
    if (!this.metadata) {
      this.metadata = {
        author: "",
        timestamp: undefined,
        revisionNotes: undefined, 
        area: "defaultMetadata", 
        metadataEntries: {}, 
        latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
        schema: {}
      };
    }

    // Initialize versionData with proper structure
    if (!this.versionData) {
      this.versionData = this.createDefaultVersionData();
    }

    // Initialize structures
    this.initializeStructures();
  }

  private computeCurrentHash(): string {
    const mergedStructure = this.getStructure?.();
    if (mergedStructure) {
      return crypto
        .createHash("sha256")
        .update(JSON.stringify(mergedStructure))
        .digest("hex");
    }
    return '';
  }

  private createDefaultVersionData(): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      id: this.id,
      parentId: this.parentId ?? null,
      name: this.name ?? '',
      url: this.url ?? '',
      versionNumber: this.versionNumber,
      isActive: this.isActive ?? true,
      releaseDate: this.releaseDate ? (this.releaseDate instanceof Date ? this.releaseDate.toISOString() : this.releaseDate) : '',
      buildVersions: this.buildVersions,
      documentId: this.documentId ?? '',
      draft: this.draft ?? false,
      userId: this.userId ?? '',
      content: this.content ?? '',
      metadata: this.metadata,
      versionData: this.versionData,
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      checksum: this.checksum ?? '',
      parentType: this.parentType ?? '',
      parentVersion: this.parentVersion ?? '',
      parentTitle: this.parentTitle ?? '',
      parentContent: this.parentContent ?? '',
      parentName: this.parentName ?? '',
      parentUrl: this.parentUrl ?? '',
      parentChecksum: this.parentChecksum ?? '',
      parentMetadata: this.parentMetadata ?? {},
      parentAppVersion: this.parentAppVersion ?? '',
      parentVersionNumber: this.parentVersionNumber ?? '',
      isLatest: this.isLatest ?? true,
      isPublished: this.isPublished ?? false,
      publishedAt: this.publishedAt ?? null,
      source: this.source ?? 'initial',
      status: this.status ?? 'active',
      version: {
        major: this.major,
        minor: this.minor,
        patch: this.patch
      },
      timestamp: new Date().toString(),
      user: 'unknown',
      changes: this.changes ?? [],
      comments: this.comments ?? [],
      workspaceId: this.workspaceId ?? '',
      workspaceName: this.workspaceName ?? '',
      workspaceType: this.workspaceType ?? '',
      workspaceUrl: this.workspaceUrl ?? '',
      workspaceViewers: this.workspaceViewers ?? [],
      workspaceAdmins: this.workspaceAdmins ?? [],
      workspaceMembers: this.workspaceMembers ?? [],
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      _structure: this._structure,
      frontendStructure: this.frontendStructure,
      backendStructure: this.backendStructure ?? Promise.resolve([]),
      data: this.data ?? [],
      backend: this.versions?.backend,
      frontend: this.versions?.frontend,
      history: this.versions?.history
    };
  }

  private initializeStructures(): void {
    const frontendStructureInstance = new FrontendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.frontendStructure = Promise.resolve(frontendStructureInstance.getStructureAsArray());

    const backendStructureInstance = new BackendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.backendStructure = Promise.resolve(backendStructureInstance.getStructureAsArray());
  }

  async getVersion(): Promise<string | null> {
    const mergedStructure = this.getStructure?.();
    if (mergedStructure) {
      return crypto
        .createHash("sha256")
        .update(JSON.stringify(mergedStructure))
        .digest("hex");
    }
    return null;
  }
}
  
  private async generateStructureHash?(): Promise<string> {
    // Wait for the resolution of the promise
    const frontendStructure = await this.frontendStructure;

    return crypto
      .createHash("sha1")
      .update(JSON.stringify(frontendStructure))
      .digest("hex");
  }



  // Type conversion utilities
  private static ensureString(value: string | number | undefined): string {
    if (value === undefined) return '';
    return typeof value === 'number' ? value.toString() : value;
  }

  private static ensureNumber(value: string | number | undefined): number {
    if (value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : value;
  }

  private static ensureVersionData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
    value: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
  ): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    if (value === undefined) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      } catch {
        return null;
      }
    }
    return value;
  }


  // Make the method public
  public transformToStructureItems(data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const { user } = useAuth();

    if (!user) {
      throw new Error('You must be logged in to access this data.');
    }

    // Check if the user has the required role (e.g., admin)
    if (user.role !== UserRoles.Administrator) {
      throw new Error('You do not have permission to access this data.');
    }
    // Transform the data
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      children: item.children ? this.transformToStructureItems(item.children) : undefined,
    }));
  }
   
  public async setFrontendAndBackendStructure?(): Promise<void> {
    const mergedStructure = this.getStructure
      ? this.getStructure()
      : this._structure;

    if (mergedStructure && this.setStructure) {
      this.setStructure({
        merged: Object.values(mergedStructure).flat() as AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      });
    }
  }

  public async getStructure(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined> {
    return new Promise((resolve, reject) => {
      try {
        // Step 1: Parse the structureData
        const parsedData = JSON.parse(this.structureData);

        // Step 2: Transform the parsed data into AppStructureItem array
        const structureItems: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = this.transformToStructureItems(parsedData);

        // Step 3: Convert the array to a Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
        const structureRecord: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
        structureItems.forEach((item, index) => {
          structureRecord[`item${index}`] = item; // Use a unique key for each item
        });

        // Step 4: Resolve the promise with the transformed data
        resolve(structureRecord);
      } catch (error: any) {
        // Reject the promise in case of error
        reject(new Error(`Failed to get structure: ${error.message}`));
      }
    });
  }

  // Inside the Version class
  public mergeAndHashStructures?(
    baseStructure: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    additionalStructure: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Promise<string> {
    const mergedStructure =
      this.mergeStructures?.(baseStructure, additionalStructure) || [];
    return new Promise<string>((resolve, reject) => {
      const hash = crypto
        .createHash("sha1")
        .update(JSON.stringify(mergedStructure))
        .digest("hex");
      resolve(hash);
    });
  }

  getVersionNumber(): string {
    return this.versionNumber;
  }

  updateVersionNumber?(newVersionNumber: string): void {
    this.versionNumber = newVersionNumber;
  }

  static create(versionInfo: {
    id: number;
    versionNumber: string;
    major: number;
    minor: number;
    patch: number;
    buildNumber: number | string;
    appVersion: string;
    limit: number;
    description: string;
    content: string;
    checksum: string;
    data: Data<BaseData<any>>[];
    name: string;
    versions: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    metadata: {
      author: string | undefined;
      timestamp: string | Date | undefined
    };
    url: string;
    versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    draft: boolean;
    userId: string;
    documentId: string | number;
    parentId: string;
    parentType: string;
    parentVersion: string;
    parentTitle: string;
    parentContent: string;
    parentName: string;
    parentUrl: string;
    parentChecksum: string;
    parentMetadata: {} | undefined;
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
    createdAt: Date;
    versionData: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
    structureData: string;
    buildVersions?: BuildVersion | undefined;
    deletedAt: Date | undefined,
    isDeleted: boolean,
    publishedBy: string,
    lastModifiedBy: string,
    lastModifiedAt: string | Date | null,
    rootId: string | null,
    branchId: string,
    isLocked: boolean,
    lockedBy: string,
    lockedAt: Date | null,
    isArchived: boolean,
    isActive: boolean;
    releaseDate: string | Date | undefined;
    archivedBy: string,
    archivedAt: Date | null,
    tags: TagsRecord,
    categories: Category[],
    permissions: DocumentPermissions,
    collaborators: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    comments: Comment[],
    reactions: string[],
    changes: string[],
    attachments: Attachment[],
    updatedAt: Date | undefined;
  }): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Create processedInfo with all type conversions
    const processedInfo = {
      // Convert id to number
      id: VersionImpl.ensureNumber(versionInfo.id),
      
      // Convert documentId to string
      documentId: VersionImpl.ensureString(versionInfo.documentId),
      
      // Convert versionData to proper type
      versionData: VersionImpl.ensureVersionData(versionInfo.versionData),
      
      // Convert version components to numbers
      major: VersionImpl.ensureNumber(versionInfo.major),
      minor: VersionImpl.ensureNumber(versionInfo.minor),
      patch: VersionImpl.ensureNumber(versionInfo.patch),
      
      // Convert buildNumber to string
      buildNumber: VersionImpl.ensureString(versionInfo.buildNumber),
      
      // Pass through string properties
      name: VersionImpl.ensureString(versionInfo.name),
      content: VersionImpl.ensureString(versionInfo.content),
      description: VersionImpl.ensureString(versionInfo.description),
      
      // Pass through other properties (they'll be handled in constructor)
      ...versionInfo
    };

    return new VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> (processedInfo);
  }
  // Method to get version data
async getVersionData?(): Promise<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    const { content, name, url, versionNumber } = this;
    if (!content || !name || !versionNumber) {
      return undefined;
    }

    const checksum = this.generateContentChecksum!(content);
    // Assuming you have a fileOrFolderId variable
    const fileOrFolderId = "fileOrFolderId";
    const metadata: StructuredMetadata<Data<BaseData<any>>, any> = {
      name: "Sample Project Name",
      description: "This project focuses on providing sample metadata structures.",
      id: "project-12345",
      category: "Sample Category",
      timestamp: new Date().toISOString(), // Assuming you want a string representation
      createdBy: "John Doe",
      
      tags: {},
      metadata: {},
      initialState: {} as InitializedState<Data<BaseData<any, any, any, Attachment>, BaseData<any, any, any, Attachment>, StructuredMetadata<BaseData<any, any, any, Attachment>, BaseData<any>>>, any>,
      meta: {} as Map<string, Snapshot<Data<BaseData<any>, BaseData<any>>, any>>,
      events: {
        eventRecords: {}
      },
  
     
      metadataEntries: {
        [fileOrFolderId]: {
            originalPath: "/path/to/original/file.txt",
            alternatePaths: ["/path/to/alternate/file1.txt", "/path/to/alternate/file2.txt"],
            author: "Jane Smith",
            timestamp: new Date(),
            fileType: "text/plain",
            title: "Example Text File",
            description: "This is an example text file used for demonstration purposes.",
            keywords: ["example", "text", "demo"],
            authors: ["Jane Smith", "John Doe"],
          contributors: [{
              
              username: "johndoe",
              email: "john.doe@example.com",
              tier: "pro",
              uploadQuota: 1000,
              memberName: "John Doe",
              teamId: "team-123",
              roleInTeam: "Developer",
              contributions: [
                { 
                  projectId: "p1", 
                  projectName: "Project Alpha", 
                  details: [
                    { note: "Initial draft", date: "2025-08-21" },
                    { note: "Refactoring", date: "2025-08-22" },
                    { note: "Bug fixes", date: "2025-08-23" }
                  ] 
                },
                { 
                  projectId: "p2", 
                  projectName: "Project Beta", 
                  details: [
                    { note: "Code review", date: "2025-08-21" },
                    { note: "Feature implementation", date: "2025-08-22" }
                  ] 
                }
              ],
              joinedAt: new Date(),
              active: true,

              hasQuota: true,
              processingTasks: [],
              role: UserRoles.Developer,
            persona: new Persona(PersonaTypeEnum.Default),
            friends: [],
            blockedUsers: [],
            activityLog: [],
            activityStatus: '',
            isAuthorized: false, 
            storeId: 0
           
            }],
            publisher: "Example Publishing",
            copyright: "© 2024 Example Publishing",
            license: "MIT",
            links: ["https://example.com", "https://example.org"],
            tags: ["demo", "example", "text"],
        },
      },
      apiEndpoint: "",
      apiKey: fluenceApiKey ? fluenceApiKey : undefined,
      timeout: 10000,
      retryAttempts: 0,
    };

    // Function to create a Version object from ExtendedVersion data
    const createVersion = async (versionData: ExtendedVersion): Promise<VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> > => {
      
      const {
        content,
        metadata,
        checksum,
        appVersion,
        description,
        buildNumber,
        versions,
        major,
        minor,
        patch,
        id,
        parentId,
        parentType,
        parentVersion,
        parentTitle,
        parentContent,
        parentName,
        parentUrl,
        parentChecksum,
        parentMetadata,
        parentAppVersion,
        parentVersionNumber,
        isLatest,
        isPublished,
        isActive,
        releaseDate,
        publishedAt,
        source,
        status,
        workspaceId,
        workspaceName,
        workspaceType,
        workspaceUrl,
        workspaceViewers,
        workspaceAdmins,
        workspaceMembers,
        createdAt,
        updatedAt,
        versionHistory,
        data,
        _structure,
        // Ensure all properties are destructured from versionData
      } = versionData;

      const category = process.argv[3] as keyof CategoryProperties;
      const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
      
      // All async operations moved here
      const [storeId, criteria, snapshotData] = await Promise.all([
        snapshotApi.getSnapshotStoreId(Number(snapshotId)),
        snapshotApi.getSnapshotCriteria(snapshotContainer, snapshot),
        snapshotApi.getSnapshotData(snapshotContainer, snapshot, criteria, storeId, config)
      ]);

      const config: SnapshotStoreConfig<SnapshotWithCriteria<Data, any>, any> = snapshotStoreConfig;
      const snapshotStoreDataConfig = snapshotApi.getSnapshotStoreConfigData(
        Number(snapshotId), 
        snapshotContainer, 
        criteria, 
        storeId, 
        config
      );
      
      const docPermissions = new DocumentPermissions(true, false);
      const baseData: BaseData = createBaseData({ ...snapshotData });
      
      const version: VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  = new VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ({
        content,
        metadata,
        checksum,
        appVersion,
        description,
        buildNumber,
        structureData: this.structureData,
        major,
        minor,
        patch,
        versions,
        versionData: null,
        id,
        parentId,
        parentType,
        parentVersion,
        parentTitle,
        parentContent,
        parentName,
        parentUrl,
        parentChecksum,
        parentMetadata,
        parentAppVersion,
        parentVersionNumber,
        isLatest,
        isPublished,
        isActive,
        releaseDate,
        publishedAt,
        source,
        status,
        workspaceId,
        workspaceName,
        workspaceType,
        workspaceUrl,
        workspaceViewers,
        workspaceAdmins,
        workspaceMembers,
        createdAt,
        updatedAt,
        versionHistory,
        data,
        _structure,
        name, // Set appropriately based on your application logic
        url: "", // Set appropriately based on your application logic
        versionNumber: "", // Set appropriately based on your application logic
        documentId: "", // Set appropriately based on your application logic
        draft: false, // Set appropriately based on your application logic
        userId: "", // Set appropriately based on your application logic
        isDeleted: false,
        publishedBy: "publisher",
        lastModifiedBy: "modified by",
        deletedAt: new Date(),
        lastModifiedAt: new Date(),
        rootId: "",
        branchId: "",
        isLocked: false,
        lockedBy: "",
        lockedAt: new Date(),
        isArchived: false,
        archivedBy: "",
        archivedAt: new Date(),
        tags: {},
        categories: [],
        permissions: docPermissions,
        collaborators: [],
        comments: [],
        reactions: [],
        attachments: [],
        changes: [],
        buildVersions: {
          data: dataVersions,
          baseData: baseData,
          backend: backendStructure,
          frontend: frontendStructure,
        }
      });

      return version;
    };

    // You'll need to call createVersion with actual versionData
    const versionData = await createVersion(/* pass actual versionData here */);
    
    // Return or use 'data' as needed
    return versionData;
  }

  // Method to update version history
  updateVersionHistory?(newVersionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    if (Array.isArray(this.versionHistory.versionData)) {
      this.versionHistory.versionData.push(newVersionData);
    } else {
      // Handle the case where it's not an array (initialize as an array)
      this.versionHistory.versionData = [newVersionData];
    }
  }

  // Add a new method for content-only checksum
  generateContentChecksum?(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  // Method to generate checksum
  generateChecksum(version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    const content = `${version.major}.${version.minor}.${version.patch}.${version.appVersion}`;
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  // Method to compare two versions
  compare?(otherVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    const currentParts = this.versionNumber
      .split(".")
      .map((part) => parseInt(part, 10));
    const otherParts = otherVersion.versionNumber
      .split(".")
      .map((part) => parseInt(part, 10));

    for (let i = 0; i < currentParts.length; i++) {
      if (currentParts[i] > otherParts[i]) return 1;
      if (currentParts[i] < otherParts[i]) return -1;
    }

    return 0;
  }

  // Method to parse a version string into an array of version parts
  parse?(): number[] {
    return this.versionNumber.split(".").map((part) => parseInt(part, 10));
  }

  // Method to check if the version is valid
  isValid?(): boolean {
    const versionParts = this.versionNumber.split(".");
    return versionParts.every((part) => /^\d+$/.test(part));
  }

  generateHash?(appVersion: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(this.versionNumber);
    // Include appVersion in hash generation
    hash.update(appVersion);
    return hash.digest("hex");
  }

  // Method to check if the version is newer than another
  isNewer?(otherVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
    return Boolean(this.compare && this.compare(otherVersion) === 1);
  }

  hashStructure?(structure: AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): string {
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(structure))
      .digest("hex");
  }

  // Calculate the hash of the structure data
  calculateHash(): string {
    // Logic to calculate and return the hash
    this.currentHash = this.hash(this.structureData);
    return this.currentHash;
  }

  // Method to update the structure hash
  async updateStructureHash(): Promise<void> {
    try {
      // Re-calculate the hash based on the current structure data
      const newHash = this.calculateHash();

      // Update the current hash if it has changed
      if (this.currentHash !== newHash) {
        this.currentHash = newHash;
        console.log(`Structure hash updated to: ${this.currentHash}`);
      } else {
        console.log('No changes detected; structure hash remains the same.');
      }
    } catch (error) {
      console.error('Error updating structure hash:', error);
      // Handle error appropriately, possibly rethrow or log
    }
  }

  setStructureData(newData: string) {
    this.structureData = newData;
    // Optionally call updateStructureHash() here if needed
  }

  // Method to get structure hash
  async getStructureHash?(): Promise<string> {
    return this.generateStructureHash && (await this.generateStructureHash())
      ? this.generateStructureHash()
      : Promise.resolve("");
  }

  // Method to retrieve version content
  getContent?(): string {
    return this.content;
  }

  // Method to set version content
  setContent?(content: string): void {
    this.content = content;
  }
 
  /**
   * Returns the version string in semantic versioning format (major.minor.patch)
   * Optionally includes build metadata and pre-release tags
   */
  getVersionString(options?: {
    includeBuild?: boolean;
    includePreRelease?: boolean;
    includeFull?: boolean;
  }): string {
    const { 
      includeBuild = false, 
      includePreRelease = false, 
      includeFull = false 
    } = options || {};

    // Base version string
    let versionString = `${this.major}.${this.minor}.${this.patch}`;

    // Add pre-release tag if available and requested
    if (includePreRelease || includeFull) {
      const preReleaseTag = this.getPreReleaseTag();
      if (preReleaseTag) {
        versionString += `-${preReleaseTag}`;
      }
    }

    // Add build metadata if available and requested
    if (includeBuild || includeFull) {
      const buildMetadata = this.getBuildMetadata();
      if (buildMetadata) {
        versionString += `+${buildMetadata}`;
      }
    }

    return versionString;
  }

  /**
   * Gets pre-release tag (alpha, beta, rc, etc.)
   */
  private getPreReleaseTag(): string {
    if (this.draft) return 'alpha';
    if (!this.isPublished) return 'beta';
    if (this.status?.toLowerCase().includes('rc')) return 'rc';
    if (this.status?.toLowerCase().includes('preview')) return 'preview';
    return '';
  }

  /**
   * Gets build metadata (build number, commit hash, etc.)
   */
  private getBuildMetadata(): string {
    if (this.buildNumber) {
      return `build.${this.buildNumber}`;
    }
    if (this.checksum) {
      return `commit.${this.checksum.substring(0, 7)}`;
    }
    return '';
  }
 
  /**
   * Adds release notes to the version
   */
  addReleaseNotes(notes: string): void {
    if (!this.description) {
      this.description = notes;
    } else {
      this.description += `\n\nRelease Notes: ${notes}`;
    }

    // Also add to version history
    if (this.versionHistory) {
      this.versionHistory.entries = [
        ...(this.versionHistory.entries || []),
        {
          version: this.getVersionString(),
          timestamp: new Date(),
          type: 'release_notes',
          notes: notes
        }
      ];
    }
  }

  /**
   * Parses a version string and updates the version properties
   */
  parseVersionString(versionString: string): boolean {
    try {
      // Basic semver pattern: major.minor.patch(-preRelease)(+build)
      const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
      const match = versionString.match(semverPattern);

      if (!match) {
        throw new Error('Invalid version string format');
      }

      this.major = parseInt(match[1], 10);
      this.minor = parseInt(match[2], 10);
      this.patch = parseInt(match[3], 10);

      // Handle pre-release tag
      if (match[4]) {
        this.status = match[4];
        this.draft = true;
        this.isPublished = false;
      }

      // Handle build metadata
      if (match[5]) {
        if (match[5].startsWith('build.')) {
          this.buildNumber = match[5].substring(6);
        }
      }

      this.versionNumber = `${this.major}.${this.minor}.${this.patch}`;
      return true;

    } catch (error) {
      console.error('Failed to parse version string:', error);
      return false;
    }
  }

  /**
   * Validates if the current version is a valid semantic version
   */
  isValidVersion(): boolean {
    return (
      Number.isInteger(this.major) && this.major >= 0 &&
      Number.isInteger(this.minor) && this.minor >= 0 &&
      Number.isInteger(this.patch) && this.patch >= 0
    );
  }

  /**
   * Compares this version with another version
   */
  compareTo(other: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    if (this.major !== other.major) {
      return this.major - other.major;
    }
    if (this.minor !== other.minor) {
      return this.minor - other.minor;
    }
    if (this.patch !== other.patch) {
      return this.patch - other.patch;
    }
    return 0;
  }

  /**
   * Checks if this version is newer than another version
   */
  isNewerThan(other: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Checks if this version is older than another version
   */
  isOlderThan(other: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * Create a new version with incremented version number
   */
  bumpVersion(type: "major" | "minor" | "patch" = "patch", notes?: string): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const parts = this.getVersionString().split(".").map(Number);
  
    switch (type) {
      case "major":
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case "minor":
        parts[1]++;
        parts[2] = 0;
        break;
      case "patch":
        parts[2]++;
        break;
    }
  
    this.major = parts[0];
    this.minor = parts[1];
    this.patch = parts[2];
  
    if (notes) {
      this.addReleaseNotes(notes);
    }
  }
  
  hash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  constructor(init?: Partial<VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) {
   Object.assign(this, init);
  }
}

const version = createVersion<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

const versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
id: "0",
name: "",
  url: "",
  versionNumber: "",
  documentId: "",
  isActive: false,
  releaseDate: '',  
  draft: false,
  userId: "",
  history: [],
  parentId: "", // Provide appropriate values based on your application logic
  parentType: "", // Provide appropriate values based on your application logic
  parentVersion: "", // Provide appropriate values based on your application logic
  parentTitle: "", // Provide appropriate values based on your application logic
  parentContent: "", // Provide appropriate values based on your application logic
  parentName: "", // Provide appropriate values based on your application logic
  parentUrl: "", // Provide appropriate values based on your application logic
  parentChecksum: "", // Provide appropriate values based on your application logic
  parentAppVersion: "", // Provide appropriate values based on your application logic
  parentVersionNumber: "", // Provide appropriate values based on your application logic
  isLatest: false, // Provide appropriate values based on your application logic
  isPublished: false, // Provide appropriate values based on your application logic
  publishedAt: null, // Provide appropriate values based on your application logic
  source: "", // Provide appropriate values based on your application logic
  status: "", // Provide appropriate values based on your application logic
  workspaceId: "", // Provide appropriate values based on your application logic
  workspaceName: "", // Provide appropriate values based on your application logic
  workspaceType: "", // Provide appropriate values based on your application logic
  workspaceUrl: "", // Provide appropriate values based on your application logic
  workspaceViewers: [], // Provide appropriate values based on your application logic
  workspaceAdmins: [], // Provide appropriate values based on your application logic
  workspaceMembers: [], // Provide appropriate values based on your application logic
  content: "Initial version content",
  checksum: "abc123",
  metadata: metadata,
  versionData: undefined,
  major: 0,
  minor: 0,
  patch: 0,

  data: [],
  version: version,
  timestamp: "",
  user: "",
  comments: [],
  backend: backendStructure,
  // todo to backend
  // Backend build information
      // buildServer: 'Jenkins',
      // buildDuration: '15m30s',
      // environment: 'production',
      // deploymentId: 'deploy-20241010-12345',
      // dependencies: {
      //   runtime: {
      //     node: '18.0.0',
      //     java: '17.0.0',
      //     python: '3.9.0'
      //   },
      //   frameworks: {
      //     spring: '3.0.0',
      //     hibernate: '6.0.0'
      //   }
      // }
  frontend: frontendStructure,
  // add to backend
  // Frontend build information
  //   buildTool: 'Webpack',
  //   bundleSize: {
  //     total: '2.4MB',
  //     gzipped: '650KB',
  //     breakdown: {
  //       main: '1.2MB',
  //       vendor: '800KB',
  //       runtime: '50KB'
  //     }
  //   },
  //   dependencies: {
  //     react: '18.2.0',
  //     typescript: '5.0.0',
  //     redux: '4.2.0'
  //   },
  //   testResults: {
  //     passed: 150,
  //     failed: 2,
  //     skipped: 5,
  //     coverage: 95.2
  //   }
  // },
  changes: [],
  buildVersions: {
    data: dataVersions,
    baseData: baseData,
    backend: backendStructure,
    frontend: frontendStructure
  },
};



// Example of using DevVersion for development-specific contexts
const devVersion: DevVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  id: 1,
  isActive: true,
  releaseDate: '2024-10-10',
  major: 1,
  minor: 0,
  patch: 3,
  name: 'Release 1.0.3',
  url: 'https://example.com/download/1.0.3',
  versionNumber: '1.0.3',
  documentId: 'abc123',
  draft: false,
  userId: 'user123',
  content: 'Content of the version',
  description: 'Description of the version',
  buildNumber: '12345',
  appVersion: '1.0.3',
  versions: {
    version: [],
    backend: backendStructure,
    frontend: frontendStructure,
    history: [],
  },
  versionData: versionData,
  checksum: 'abc123checksum',
  parentId: null,
  parentType: 'document',
  parentVersion: '1.0.2',
  parentTitle: 'Parent Version Title',
  parentContent: 'Parent Content',
  parentName: 'Parent Name',
  parentUrl: 'https://example.com/download/1.0.2',
  parentChecksum: 'parentchecksum',
  parentAppVersion: '1.0.2',
  parentVersionNumber: '1.0.2',
  isLatest: true,
  isPublished: true,
  publishedAt: null,
  source: 'local',
  status: 'released',
  workspaceId: 'workspace123',
  workspaceName: 'Development Workspace',
  workspaceType: 'team',
  workspaceUrl: 'https://example.com/workspace/123',
  workspaceViewers: [],
  workspaceAdmins: [],
  workspaceMembers: [],
  data: [],
  _structure: {},
  versionHistory: {
    versionData: {},
    latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    history: [],
    timestamp: new Date(),
    versions: [],
    currentVersionIndex: 0
  },
  getVersionNumber: undefined,
  updateStructureHash: async () => {},
  setStructureData: (newData: string) => {},
  hash: (value: string) => 'hashedvalue',
  currentHash: 'currenthash',
  structureData: 'structureData',
  calculateHash: () => 'calculatedhash',
  buildDate: '2024-10-01',
  commitHash: 'abc123commit',
  commitDate: '2024-09-30',
  commitMessage: 'Initial release',
  commitAuthor: 'John Doe',
  commitAuthorEmail: 'john.doe@example.com',
  commitCommitter: 'Jane Doe',
  commitCommitterEmail: 'jane.doe@example.com',
  branch: 'main',
  tag: 'v1.0.3',
  remoteOrigin: 'origin',
  remoteOriginURL: 'https://github.com/example/repo',
  isRelease: true,
  isBeta: false,
  isAlpha: false,
  isCandidate: false,
  isSnapshot: false,
  isPullRequest: false,
 // Pull request properties - now with realistic data
  pullRequestNumber: 'PR-456', // Pull request number with prefix
  pullRequestUrl: 'https://github.com/example-org/example-repo/pull/456', // Full PR URL
  pullRequestAuthor: 'Sarah Featuredev', // PR author name
  pullRequestAuthorEmail: 'sarah.featuredev@example.com', // PR author email
  pullRequestCommit: 'bcd234efg567hij890klm123nop456qrs789', // PR head commit hash
  pullRequestCommitUrl: 'https://github.com/example-org/example-repo/commit/bcd234efg567hij890klm123nop456qrs789', // Commit URL
  pullRequestCommitMessage: 'fix: resolve authentication issue in user service', // Commit message
  pullRequestCommitDate: '2024-09-28T14:30:00Z', // Commit timestamp
  pullRequestCommitAuthor: 'Sarah Featuredev', // Commit author
  pullRequestCommitAuthorEmail: 'sarah.featuredev@example.com', // Commit author email
  pullRequestCommitCommitter: 'GitHub Actions', // Commit committer
  pullRequestCommitCommitterEmail: 'actions@github.com', // Commit committer email
  pullRequestBranch: 'feature/user-auth-fix', // PR source branch
  pullRequestBaseBranch: 'main', // PR target branch
  pullRequestMergeBranch: 'feature/user-auth-fix', // Merge branch (same as PR branch)
  pullRequestMergeCommit: 'cde345fgh678ijk901lmn234opq567rst890', // Merge commit hash
  pullRequestMergeCommitUrl: 'https://github.com/example-org/example-repo/commit/cde345fgh678ijk901lmn234opq567rst890', // Merge commit URL
  pullRequestMergeCommitMessage: 'Merge pull request #456 from example-org/feature/user-auth-fix\n\nFix authentication issue in user service', // Merge commit message
  pullRequestMergeCommitDate: '2024-09-29T10:15:00Z', // Merge commit timestamp
  pullRequestMergeCommitAuthor: 'GitHub Actions', // Merge commit author
  pullRequestMergeCommitAuthorEmail: 'actions@github.com', // Merge commit author email
  pullRequestMergeCommitCommitter: 'GitHub Actions', // Merge commit committer
  pullRequestMergeCommitCommitterEmail: 'actions@github.com', // Merge commit committer email

  // Additional PR metadata that could be useful
  pullRequestTitle: 'Fix authentication issue in user service',
  pullRequestDescription: 'This PR addresses the authentication bug that was causing users to be logged out unexpectedly. The fix includes:\n- Updated token validation logic\n- Improved session management\n- Additional error handling',
  pullRequestLabels: ['bugfix', 'security', 'backend'],
  pullRequestReviewers: ['john.codeowner@example.com', 'mary.techlead@example.com'],
  pullRequestApprovers: ['john.codeowner@example.com'],
  pullRequestComments: 12,
  pullRequestAdditions: 247,
  pullRequestDeletions: 89,
  pullRequestChangedFiles: 8,
  pullRequestMilestone: 'Sprint 24.40',
  pullRequestProject: 'User Authentication',
  pullRequestStatus: 'merged',
  pullRequestMergeMethod: 'squash',
  pullRequestMergeable: true,
  pullRequestRebaseable: false,
  pullRequestMergeableState: 'clean',
  pullRequestMergedBy: 'GitHub Actions',
  pullRequestMergedAt: '2024-09-29T10:15:00Z',
  pullRequestClosedAt: '2024-09-29T10:15:00Z',
  pullRequestCreatedAt: '2024-09-27T09:00:00Z',
  pullRequestUpdatedAt: '2024-09-29T10:15:00Z',
  pullRequestDraft: false,
  pullRequestLocked: false,
  pullRequestMaintainerCanModify: true,
  pullRequestRequestedReviewers: ['backend-team', 'security-team'],
  pullRequestRequestedTeams: ['backend-reviewers'],
  pullRequestAutoMergeEnabled: true,
  pullRequestAutoMergeMethod: 'squash',
  pullRequestAutoMergeBy: 'GitHub Actions'
};

export default VersionImpl
export { createVersion, devVersion, version, versionData };
export type { BuildVersion, Version, Versions };

