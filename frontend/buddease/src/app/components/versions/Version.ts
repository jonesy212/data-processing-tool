// Version.ts
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import crypto from "crypto";
import getAppPath from "../../../../appPath";
import { Data } from "../models/data/Data";
import { VersionData, VersionHistory } from "./VersionData";
class Version {
  name: string;
  url: string;
  versionNumber: string;
  appVersion: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  id: number; // Add id property
  content: string; // Add content property
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
  checksum: string;
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
  frontendStructure: Promise<AppStructureItem[]> | undefined;
  backendStructure: Promise<AppStructureItem[]> | undefined;
  data: Data[];
  metadata!: {
    author: string;
    timestamp: Date | undefined;
  } | undefined;
  draft: boolean;

  getVersion?: () => {};

  private _structure: Record<string, AppStructureItem[]> = {}; // Define private property _structure
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
    data: Data[];
    name: string;
    url: string;
    versionHistory: VersionHistory;
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
    createdAt: Date;
    updatedAt: Date | undefined;
    draft: boolean;
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
  }) {
    this.id = versionInfo.id;
    this.versionNumber = versionInfo.versionNumber;
    this.appVersion = versionInfo.appVersion;

    this.description = versionInfo.description;
    this.content = versionInfo.content;
    this.checksum = versionInfo.checksum;
    this.data = versionInfo.data;
    this.name = versionInfo.name;
    this.url = versionInfo.url;
    this.versionHistory = versionInfo.versionHistory;
    this.draft = versionInfo.draft;
    this.userId = versionInfo.userId;
    this.documentId = versionInfo.documentId;
    this.parentId = versionInfo.parentId;
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

    // Assuming FrontendStructure provides a method to get the structure as an array
    const frontendStructureInstance = new FrontendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.frontendStructure = frontendStructureInstance.getStructureAsArray() ?? []; // Use nullish coalescing operator
    const backendStructureInstance = new BackendStructure(
      getAppPath(this.versionNumber, this.appVersion)
    );
    this.backendStructure = backendStructureInstance.getStructureAsArray() ?? []; // Use nullish coalescing operator
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
    const mergedStructure = this.getStructure ? this.getStructure() : this._structure;
  
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

  getVersionNumber?(): string {
    return this.versionNumber;
  }

  updateVersionNumber?(newVersionNumber: string): void {
    this.versionNumber = newVersionNumber;
  }

  static create(versionInfo: {
    id: number;
    versionNumber: string;
    appVersion: string;
    limit: number;
    description: string;
    content: string;
    checksum: string;
    data: Data[];
    name: string;
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
    const metadata = {
      author: name,
      timestamp: new Date(),
      // Add other metadata if needed
    };
    return { content, metadata, checksum };
  }

  // Method to update version history
  updateVersionHistory?(newVersionData: VersionData): void {
    this.versionHistory.versions.push(newVersionData);
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
    return this.generateStructureHash && await this.generateStructureHash()
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
