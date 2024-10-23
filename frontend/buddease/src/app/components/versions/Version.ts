// Version.ts
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure, {  backendStructure } from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, {  frontendStructure } from "@/app/configs/appStructure/FrontendStructure";
import crypto from "crypto";
import { createHash } from 'node:crypto';
import getAppPath from "../../../../appPath";
import { Data } from "../models/data/Data";
import { VersionData, VersionHistory } from "./VersionData";
import { User } from "../users/User";
import { TagsRecord } from "../snapshots/SnapshotWithCriteria";
import { Attachment } from "../documents/Attachment/attachment";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Member } from "../models/teams/TeamMembers";
import DocumentPermissions from "../documents/DocumentPermissions";
import { fluenceApiKey } from "../web3/dAppAdapter/DAppAdapterConfig";
import { dataVersions } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

interface ExtendedVersion extends Version {
  name: string;
  url: string;
  versionNumber: string;
  documentId: string;
  draft: boolean;
  userId: string;
}


interface BuildVersion {
  data: Data | undefined,
  backend: BackendStructure | undefined,
  frontend: FrontendStructure | undefined
}


interface Version {
  id: number;
  versionData?: VersionData | null; // Adjust based on actual type
  buildVersions?: BuildVersion | undefined; // Adjust based on actual type
  isActive: boolean;
  releaseDate: string | Date | undefined;
  major: number;
  minor: number;
  patch: number;
  name: string;
  url: string;
  versionNumber: string;
  documentId: string;
  draft: boolean;
  userId: string;
  content: string;
  description: string;
  buildNumber: string;
  metadata?: any; // Adjust based on actual type
  versions: any | null; // Adjust based on actual type
  appVersion: string;
  checksum: string;
  parentId: string | null;
  parentType: string;
  parentVersion: string;
  parentTitle: string;
  parentContent: string;
  parentName: string;
  parentUrl: string;
  parentChecksum: string;
  parentAppVersion: string;
  parentVersionNumber: string;
  parentMetadata?: {} | undefined;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  deletedAt?: string | Date | undefined;
  isLatest: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  source: string;
  status: string;
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: any[]; // Adjust based on actual type
  workspaceAdmins: any[]; // Adjust based on actual type
  workspaceMembers: any[]; // Adjust based on actual type
  data: any[]; // Adjust based on actual type
  _structure: Record<string, AppStructureItem[]>;
  versionHistory: {
    versionData: any; // Adjust based on actual type
  };
  getVersionNumber: (() => string) | undefined;
  updateStructureHash(): Promise<void>;
  setStructureData(newData: string): void;
  hash(value: string): string;


  currentHash: string; // Property to hold the current hash value
  structureData: string; // Property to hold the structure data
  calculateHash(): string; // Method to calculate the hash
}


// DevVersion: Extends BaseVersion and adds development-specific properties
interface DevVersion extends Version {
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




class VersionImpl implements Version {
  versionData?: VersionData | null | undefined;
  buildVersions?: BuildVersion | undefined;
  major: number;
  minor: number;
  patch: number;
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
  isActive: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  releaseDate: string | Date | undefined
  source: string;
  status: string;
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  workspaceUrl: string;
  workspaceViewers: string[];
  workspaceAdmins: string[];
  workspaceMembers: string[];
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  deletedAt?: string | Date | undefined;
  frontendStructure?: Promise<AppStructureItem[]>;
  backendStructure?: Promise<AppStructureItem[]>;
  data: Data[];

  getVersion?: () => Promise<string | null>;

  _structure: Record<string, AppStructureItem[]> = {}; // Define private property _structure
  versionHistory: VersionHistory; // Add version history property



  currentHash: string;
  structureData: string; // Data to be hashed

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
    major: number;
    minor: number;
    patch: number;
    versionNumber: string;
    structureData: string;
    buildVersions: BuildVersion;
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
    createdAt: string | Date | undefined
    updatedAt: string | Date | undefined
    deletedAt: string | Date | undefined
    draft: boolean;
    isActive: boolean;
    isLatest: boolean;
    isPublished: boolean;
    publishedAt: Date | null;
    releaseDate: string | Date | undefined;

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


    _structure?: Record<string, AppStructureItem[]>; // Added here
    frontendStructure?: Promise<AppStructureItem[]>; // Added here
    backendStructure?: Promise<AppStructureItem[]>; // Added here
  }
  ) {
    this.structureData = versionInfo.structureData;
    this.currentHash = '';
    this.id = versionInfo.id;
    this.buildVersions = versionInfo.buildVersions;
    this.versionNumber = versionInfo.versionNumber;
    this.appVersion = versionInfo.appVersion;
    this.versions = versionInfo.versions;
    this.major = versionInfo.major;
    this.minor = versionInfo.minor;
    this.patch = versionInfo.patch;
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
    this.isActive = versionInfo.isActive;
    this.isPublished = versionInfo.isPublished;
    this.releaseDate = versionInfo.releaseDate;
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
      isActive: versionInfo.isArchived,
      releaseDate: versionInfo.releaseDate 
      ? (versionInfo.releaseDate instanceof Date ? versionInfo.releaseDate.toISOString() : versionInfo.releaseDate) 
      : '',
      buildVersions: versionInfo.buildVersions,
      documentId: versionInfo.documentId ?? '',
      draft: versionInfo.draft ?? false,
      userId: versionInfo.userId ?? '',
      content: versionInfo.content ?? '',
      metadata: versionInfo.metadata ?? { author: '', timestamp: undefined },
      versionData: versionInfo.versionData ?? null,
      major: versionInfo.major ?? null,
      minor: versionInfo.minor ?? null,
      patch: versionInfo.patch ?? null,

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
      timestamp: versionInfo.metadata?.timestamp ? versionInfo.metadata.timestamp.toString() : new Date().toString(),
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
      createdAt: versionInfo.metadata?.timestamp ? versionInfo.metadata.timestamp.toString() : new Date().toString(),
      updatedAt: new Date().toString(),
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

  private transformToStructureItems(data: any): AppStructureItem[] {
    // Transform the input data to AppStructureItem format
    // Assuming data is an array of objects or a tree structure
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
        merged: Object.values(mergedStructure).flat() as AppStructureItem[],
      });
    }
  }


  public async getStructure(): Promise<AppStructureItem[]> {
    return new Promise((resolve, reject) => {
      try {
        // Step 1: Parse the structureData
        const parsedData = JSON.parse(this.structureData);

        // Step 2: Transform the parsed data into AppStructureItem array
        const structureItems: AppStructureItem[] = this.transformToStructureItems(parsedData);

        // Step 3: Resolve the promise with the transformed data
        resolve(structureItems);
      } catch (error: any) {
        // Reject the promise in case of error
        reject(new Error(`Failed to get structure: ${error.message}`));
      }
    });
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
    major: number;
    minor: number;
    patch: number;
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
      timestamp: string | Date | undefined
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
    structureData: string;
    buildVersions: BuildVersion;
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
    releaseDate: string;
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
    return new VersionImpl(versionInfo);
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
    const metadata: StructuredMetadata<Data, any> = {
      name: "Sample Project Name",
      description: "This project focuses on providing sample metadata structures.",
      id: "project-12345",
      category: "Sample Category",
      timestamp: new Date().toISOString(), // Assuming you want a string representation
      createdBy: "John Doe",
      
      tags: ["sample", "metadata", "example"],
      metadata: {},
      initialState: "Initialized",
      meta: {"Sample Meta Information": "Sample Meta Value"},
      events: {},
  
     
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
            contributors: ["Alice Johnson"],
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
    const createVersion = (versionData: ExtendedVersion): VersionImpl => {
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

      const docPermissions = new DocumentPermissions(true, false);

      const version: VersionImpl = new VersionImpl({
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
          backend: backendStructure,
          frontend: frontendStructure,
        }
      });

      return version;
    };

    // Return or use 'data' as needed
    return versionData;

  }
  // Method to update version history
  updateVersionHistory?(newVersionData: VersionData): void {
    if (Array.isArray(this.versionHistory.versionData)) {
      this.versionHistory.versionData.push(newVersionData);
    } else {
      // Handle the case where it's not an array (initialize as an array)
      this.versionHistory.versionData = [newVersionData];
    }
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

  hash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }
}

export default Version;



const versionData: VersionData = {
id: 0,
name: "",
  url: "",
  versionNumber: "",
  documentId: "",
  isActive: false,
  releaseDate: '',  
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
  major: 0,
  minor: 0,
  patch: 0,

  data: [],
  version: "",
  timestamp: "",
  user: "",
  comments: [],
  backend: backendStructure,
  frontend: frontendStructure,
  changes: [],
  buildVersions: {
    data: dataVersions,
    backend: backendStructure,
    frontend: frontendStructure
  }
};



// Example of using DevVersion for development-specific contexts
const devVersion: DevVersion = {
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
  versions: [],
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
  pullRequestNumber: '',
  pullRequestUrl: '',
  pullRequestAuthor: '',
  pullRequestAuthorEmail: '',
  pullRequestCommit: '',
  pullRequestCommitUrl: '',
  pullRequestCommitMessage: '',
  pullRequestCommitDate: '',
  pullRequestCommitAuthor: '',
  pullRequestCommitAuthorEmail: '',
  pullRequestCommitCommitter: '',
  pullRequestCommitCommitterEmail: '',
  pullRequestBranch: '',
  pullRequestBaseBranch: '',
  pullRequestMergeBranch: '',
  pullRequestMergeCommit: '',
  pullRequestMergeCommitUrl: '',
  pullRequestMergeCommitMessage: '',
  pullRequestMergeCommitDate: '',
  pullRequestMergeCommitAuthor: '',
  pullRequestMergeCommitAuthorEmail: '',
  pullRequestMergeCommitCommitter: '',
  pullRequestMergeCommitCommitterEmail: '',
};

export { versionData, VersionImpl };
export type { BuildVersion }








