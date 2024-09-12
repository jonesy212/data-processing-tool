// Version.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure, { backend, backendStructure } from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, { frontend, frontendStructure } from "@/app/configs/appStructure/FrontendStructure";
import crypto from "crypto";
import getAppPath from "../../../../appPath";
import { Data } from "../models/data/Data";
import { VersionData, VersionHistory } from "./VersionData";
import { User } from "../users/User";
import { TagsRecord } from "../snapshots/SnapshotWithCriteria";
import { Attachment } from "../documents/Attachment/attachment";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Member } from "../models/teams/TeamMembers";
import DocumentPermissions from "../documents/DocumentPermissions";

interface ExtendedVersion extends Version {
  name: string;
  url: string;
  versionNumber: string;
  documentId: string;
  draft: boolean;
  userId: string;
}

class Version {
  versionData: VersionData;
  name: string;
  url: string;
  versionNumber: string;
  documentId: string;
  draft: boolean;
  userId: string;
  content: string;
  description: string;
  buildNumber: string;
  metadata: {
    author: string;
    timestamp: string | Date | undefined;
    revisionNotes?: string;
  } | undefined;
  versions: {
    data: VersionData | undefined;
    backend: BackendStructure | undefined;
    frontend: FrontendStructure | undefined;
  } | null;
  appVersion: string;
  published?: boolean;
  checksum: string;

  // Add other properties as needed
  id: number;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  deletedAt?: Date | undefined;
  frontendStructure?: Promise<AppStructureItem[]>;
  backendStructure?: Promise<AppStructureItem[]>;
  data: Data[];

  getVersion?: () => Promise<string | null>;

  _structure: Record<string, AppStructureItem[]> = {}; // Define private property _structure
  versionHistory: VersionHistory; // Add version history property

  // Method to set structure (private)
  private setStructure?(structure: Record<string, AppStructureItem[]>): void {
    this._structure = structure;
  }

  private mergeStructures?(
    baseStructure: AppStructureItem[],
    additionalStructure: AppStructureItem[]
  ): AppStructureItem[] {
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

  constructor(versionInfo: {
    id: number;
    versionNumber: string;
    appVersion: string;
    description: string;
    content: string;
    checksum: string;
    versionData: VersionData[];
    data: Data[];
    name: string;
    url: string;
    metadata: {
      author: string;
      timestamp: string | Date | undefined;
      revisionNotes?: string;
    } | undefined;
    versions: {
      data: VersionData | undefined;
      backend: BackendStructure | undefined;
      frontend: FrontendStructure | undefined;
    } | null;
    versionHistory: VersionHistory;
    userId: string;
    documentId: string;
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
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    deletedAt: Date | undefined;
    draft: boolean;
    isLatest: boolean;
    isPublished: boolean;
    publishedAt: Date | null;


    isDeleted: boolean,
 
    publishedBy: User['username'] | null,
    lastModifiedBy: User['username'] | null,
    lastModifiedAt: string | Date | null,
 
    rootId: string | null;
    branchId: string | null;
    isLocked: boolean;
    lockedBy: string | null;
    lockedAt: Date | null;
    isArchived: boolean;
    archivedBy: User['username']
    archivedAt: Date | null;
    tags: TagsRecord;
    categories: Category[];
    permissions: DocumentPermissions;
    collaborators: Member[];
    comments: Comment[];
    reactions: string[];
    changes: string[]
    attachments: Attachment[];
    source: string;
    status: string;
    buildNumber: string;
    workspaceId: string;
    workspaceName: string;
    workspaceType: string;
    workspaceUrl: string;
    workspaceViewers: string[];
    workspaceAdmins: string[];
    workspaceMembers: string[];

    _structure?: any; // Added here
    frontendStructure?: Promise<AppStructureItem[]>; // Added here
    backendStructure?: Promise<AppStructureItem[]>; // Added here
  }) {
    this.id = versionInfo.id;
    this.versionNumber = versionInfo.versionNumber;
    this.appVersion = versionInfo.appVersion;
    this.versions = versionInfo.versions;
    this.metadata = versionInfo.metadata;
    this.description = versionInfo.description;
    this.buildNumber = versionInfo.buildNumber;
    this.content = versionInfo.content;
    this.checksum = versionInfo.checksum;
    this.data = versionInfo.data;
    this.name = versionInfo.name;
    this.url = versionInfo.url;
     // Initialize versionData with default values
     this.versionHistory = versionInfo.versionHistory;
     this.draft = versionInfo.draft;
     this.userId = versionInfo.userId;
     this.documentId = versionInfo.documentId;
     this.parentId = versionInfo.parentId ? versionInfo.parentId : null;
     this.parentType = versionInfo.parentType;
     this.parentVersion = versionInfo.parentVersion;
     this.parentTitle = versionInfo.parentTitle;
     this.parentContent = versionInfo.parentContent;
     this.parentName = versionInfo.parentName;
     this.parentUrl = versionInfo.parentUrl;
     this.parentChecksum = versionInfo.parentChecksum;
     this.parentMetadata = versionInfo.parentMetadata;
     this.parentAppVersion = versionInfo.parentAppVersion;
     this.parentVersionNumber = versionInfo.parentVersionNumber;
    this.createdAt = versionInfo.createdAt;
    this.updatedAt = versionInfo.updatedAt;
    this.deletedAt = versionInfo.deletedAt;
    this.isLatest = versionInfo.isLatest;
    this.isPublished = versionInfo.isPublished;
    this.publishedAt = versionInfo.publishedAt;
    this.source = versionInfo.source;
    this.status = versionInfo.status;
    this.workspaceId = versionInfo.workspaceId;
    this.workspaceName = versionInfo.workspaceName;
    this.workspaceType = versionInfo.workspaceType;
    this.workspaceUrl = versionInfo.workspaceUrl;
    this.workspaceViewers = versionInfo.workspaceViewers;
    this.workspaceAdmins = versionInfo.workspaceAdmins;
    this.workspaceMembers = versionInfo.workspaceMembers;
    
    this.versionData = {
     id: versionInfo.id,
     parentId: versionInfo.parentId ?? null, // Handle null parentId
     name: versionInfo.name ?? '',
     url: versionInfo.url ?? '',
     versionNumber: versionInfo.versionNumber ?? '',
     documentId: versionInfo.documentId ?? '',
     draft: versionInfo.draft ?? false,
     userId: versionInfo.userId ?? '',
     content: versionInfo.content ?? '',
     metadata: versionInfo.metadata ?? { author: '', timestamp: undefined },
     versionData: versionInfo.versionData ?? null,
     checksum: versionInfo.checksum ?? '',
     parentType: versionInfo.parentType ?? '',
     parentVersion: versionInfo.parentVersion ?? '',
     parentTitle: versionInfo.parentTitle ?? '',
     parentContent: versionInfo.parentContent ?? '',
     parentName: versionInfo.parentName ?? '',
     parentUrl: versionInfo.parentUrl ?? '',
     parentChecksum: versionInfo.parentChecksum ?? '',
     parentMetadata: versionInfo.parentMetadata ?? {},
     parentAppVersion: versionInfo.parentAppVersion ?? '',
     parentVersionNumber: versionInfo.parentVersionNumber ?? '',
     isLatest: versionInfo.isLatest ?? true,
     isPublished: versionInfo.isPublished ?? false,
     publishedAt: versionInfo.publishedAt ?? null,
     source: versionInfo.source ?? 'initial',
     status: versionInfo.status ?? 'active',
     version: versionInfo.versionNumber ?? '',
     timestamp: versionInfo.metadata?.timestamp ?? new Date(),
     user: 'unknown', // Replace with actual user if available
     changes: versionInfo.changes ?? [],
     comments: versionInfo.comments ?? [],
     workspaceId: versionInfo.workspaceId ?? '',
     workspaceName: versionInfo.workspaceName ?? '',
     workspaceType: versionInfo.workspaceType ?? '',
     workspaceUrl: versionInfo.workspaceUrl ?? '',
     workspaceViewers: versionInfo.workspaceViewers ?? [],
     workspaceAdmins: versionInfo.workspaceAdmins ?? [],
     workspaceMembers: versionInfo.workspaceMembers ?? [],
     createdAt: versionInfo.metadata?.timestamp ?? new Date(),
     updatedAt: new Date(),
     _structure: versionInfo._structure,
     frontendStructure: versionInfo.frontendStructure,
     backendStructure: versionInfo.backendStructure ?? Promise.resolve([]),
     data: versionInfo.data ?? [],
     backend: versionInfo.versions?.backend ?? undefined,
     frontend: versionInfo.versions?.frontend ?? undefined
   };

    this.getVersion = async (): Promise<string | null> => {
      // Access getStructure using optional chaining
      const mergedStructure = this.getStructure?.();

      // Check if mergedStructure is not undefined or null
      if (mergedStructure) {
        // Generate hash of the merged structure
        const hash = crypto
          .createHash("sha256")
          .update(JSON.stringify(mergedStructure))
          .digest("hex");

        return hash;
      }

      return null;
    };

    const frontendStructureInstance = new FrontendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.frontendStructure = Promise.resolve(frontendStructureInstance.getStructureAsArray());

    const backendStructureInstance = new BackendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.backendStructure = Promise.resolve(backendStructureInstance.getStructureAsArray());
  }

  private async generateStructureHash?(): Promise<string> {
    // Wait for the resolution of the promise
    const frontendStructure = await this.frontendStructure;

    return crypto
      .createHash("sha1")
      .update(JSON.stringify(frontendStructure))
      .digest("hex");
  }

  public async setFrontendAndBackendStructure?(): Promise<void> {
    const mergedStructure = this.getStructure
      ? this.getStructure()
      : this._structure;

    if (mergedStructure && this.setStructure) {
      this.setStructure({
        merged: Object.values(mergedStructure).flat() as AppStructureItem[],
      });
    }
  }

  // Inside the Version class
  public mergeAndHashStructures?(
    baseStructure: AppStructureItem[],
    additionalStructure: AppStructureItem[]
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
    buildNumber: string;
    appVersion: string;
    limit: number;
    description: string;
    content: string;
    checksum: string;
    data: Data[];
    name: string;
    versions: {
      data: VersionData | undefined;
      backend: BackendStructure | undefined;
      frontend: FrontendStructure | undefined;
    };
    metadata: {
      author: string;
      timestamp: string | Date  | undefined
    };
    url: string;
    versionHistory: VersionHistory;
    draft: boolean;
    userId: string;
    documentId: string;
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
    versionData: VersionData[];
    deletedAt:  Date | undefined,
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
    
    archivedBy: string,
    archivedAt: Date | null,
    tags: TagsRecord,
    categories: Category[],
    permissions: DocumentPermissions,
    collaborators: Member[],
    comments: Comment[],
    reactions: string[],
    changes: string[],
    attachments: Attachment[],
    updatedAt: Date | undefined;
  }): Version {
    return new Version(versionInfo);
  }
  // Method to get version data
  getVersionData?(): VersionData | undefined {
    const { content, name, url, versionNumber } = this;
    if (!content || !name || !versionNumber) {
      return undefined;
    }

    const checksum = this.generateChecksum!(content);
    // Assuming you have a fileOrFolderId variable
    const fileOrFolderId = "fileOrFolderId";
    const metadata: StructuredMetadata = {
      metadataEntries: {
        [fileOrFolderId]: {
          originalPath: "",
          alternatePaths: [],
          author: name,
          timestamp: new Date(),
          fileType: "",
          title: "",
          description: "",
          keywords: [],
          authors: [],
          contributors: [],
          publisher: "",
          copyright: "",
          license: "",
          links: [],
          tags: [],
        },
      }
    };

    // Function to create a Version object from ExtendedVersion data
    const createVersion = (versionData: ExtendedVersion): Version => {
      const {
        content,
        metadata,
        checksum,
        appVersion,
        description,
        buildNumber,
        versions,
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

      const docPermissions = new DocumentPermissions(true, false);

      const version: Version = new Version({
        content,
        metadata,
        checksum,
        appVersion,
        description,
        buildNumber,
        versions,
        versionData: [],
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
        isDeleted:false,
        publishedBy:"publisher",
        lastModifiedBy: "modified by",
       
        deletedAt: new Date(),
        lastModifiedAt: new Date(),
        rootId:"",
        branchId:"",
        isLocked: false,
       
        lockedBy:"",
        lockedAt:new Date(),
        isArchived: false,
        archivedBy: "",
       
        archivedAt:new Date,
        tags: {},
        categories:[],
        permissions: docPermissions,
        collaborators:[],
        comments:[],
        reactions:[],
        attachments:[],
        changes: []
      });

      return version;
    };

    // Return or use 'data' as needed
    return data;
  }

  // Method to update version history
  updateVersionHistory?(newVersionData: VersionData): void {
    this.versionHistory.versionData.push(newVersionData);
  }

  // Method to generate checksum
  generateChecksum?(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  // Method to compare two versions
  compare?(otherVersion: Version): number {
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
  isNewer?(otherVersion: Version): boolean {
    return Boolean(this.compare && this.compare(otherVersion) === 1);
  }

  hashStructure?(structure: AppStructureItem[]): string {
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(structure))
      .digest("hex");
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
  getStructure?: () => Record<string, AppStructureItem[]>;
}

export default Version;





const data: VersionData = {
  id: 0,
  name: "",
  url: "",
  versionNumber: "",
  documentId: "",
  draft: false,
  userId: "",
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
  metadata: {
    author: "Author Name",
    timestamp: new Date(),
    revisionNotes: undefined, // Adjust as per your application logic
  },
  versionData: [],
  data: [],
  version: "",
  timestamp: "",
  user: "",
  comments: [],
  backend: backendStructure,
  frontend: frontendStructure,
  changes: []
};

export { data };
