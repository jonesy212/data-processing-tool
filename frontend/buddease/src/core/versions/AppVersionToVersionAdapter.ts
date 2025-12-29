// AppVersionToVersionAdapter.ts
import { AppStructureItem } from "@/core/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import AppVersionImpl from "@/core/versions/AppVersion";
import { Version } from "@/core/versions/Version";
import { VersionData, VersionHistory } from '@/core/versions/VersionData';

// Create an adapter that bridges AppVersionImpl to Version interface
class AppVersionToVersionAdapter<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  private _appVersion: AppVersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Declare all properties that are initialized in constructor
  id: string;
  buildNumber: number;
  versionNumber: string;
  name: string;
  description: string;
  content: string;
  documentId: string;
  appVersion: string;
  draft: boolean;
  url: string;
  userId: string;
  isActive: boolean;
  isPublished: boolean;
  isLatest: boolean;
  publishedAt: Date | null;
  releaseDate: string | Date;
  status: string;
  source: string;
  workspaceName: string;
  versionNotes: string[];
  versionHistory: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Workspace properties
  workspaceId: string = "app-workspace";
  workspaceType: string = "application";
  workspaceUrl: string = "";
  workspaceViewers: any[] = [];
  workspaceAdmins: any[] = [];
  workspaceMembers: any[] = [];

  // Data + structure
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {} as any;
  versionData: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  _structure: Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  structureData: string = "";
  attachments: AttachmentType[] = [];
  excludedFields: ExcludedFields[] = [];
  includedFields: IncludedFields[] = [];

  // Version linking
  previousVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  versions: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null = null;

  // Metadata and relationships - set defaults
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  parentId: string | null = null;
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

  constructor(appVersion: AppVersionImpl) {
    this._appVersion = appVersion;

    // Initialize properties that depend on _appVersion in the constructor
    this.id = `app-version-${this._appVersion.getVersionString()}`;
    this.buildNumber = this._appVersion.build;
    this.versionNumber = this._appVersion.getVersionNumber();
    this.name = this._appVersion.getAppName();
    this.description = `Application version ${this._appVersion.getVersionString()}`;
    this.content = "";
    this.documentId = this.id;
    this.appVersion = this._appVersion.getVersionString();
    this.draft = this._appVersion.prerelease;
    this.url = "";
    this.userId = "system";
    this.isActive = true;
    this.isPublished = !this._appVersion.prerelease;
    this.isLatest = true;
    this.publishedAt = this._appVersion.prerelease ? null : new Date();
    this.releaseDate = this._appVersion.releaseDate;
    this.status = this._appVersion.prerelease ? "prerelease" : "published";
    this.source = "app-version";
    this.workspaceName = this._appVersion.getAppName();
    this.versionNotes = this._appVersion.releaseNotes;

    // Initialize versionHistory after all other properties are set
    this.versionHistory = {
      versions: [],
      currentVersion: this as unknown as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      getVersion: (id: string) => this.versions?.find(v => v.id === id) || null,
      addVersion: (version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        if (!this.versions) this.versions = [];
        this.versions.push(version);
      },
      getLatest: () => this.versions?.[this.versions.length - 1] || this as unknown as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      getAll: () => this.versions || [this as unknown as Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]
    };
  }

  // Major, minor, patch from AppVersion
  get major(): number {
    return this._appVersion.major;
  }

  get minor(): number {
    return this._appVersion.minor;
  }

  get patch(): number {
    return this._appVersion.patch;
  }

  // Method implementations
  getVersionNumber(): string {
    return this._appVersion.getVersionNumber();
  }

  calculateHash(): string {
    return this.hash(this._appVersion.getVersionString());
  }

  generateChecksum(version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    return this.hash(JSON.stringify({
      version: version.versionNumber,
      name: version.name,
      timestamp: Date.now()
    }));
  }

  async updateStructureHash(): Promise<void> {
    this.structureData = this.calculateHash();
  }

  setStructureData(newData: string): void {
    this.structureData = newData;
  }

  hash(value: string): string {
    // Simple hash implementation - replace with your actual hash function
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  transformToStructureItems(data: any): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    // Basic transformation - adapt based on your actual structure
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      name: key,
      type: typeof value,
      value: value,
      metadata: {}
    } as AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>));
  }

  async getStructure(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined> {
    return this._structure;
  }

  bumpVersion(type: "major" | "minor" | "patch", notes?: string): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Delegate to AppVersionImpl's logic
    const newVersionNumber = type === "major" ? `${this.major + 1}.0.0` :
      type === "minor" ? `${this.major}.${this.minor + 1}.0` :
        `${this.major}.${this.minor}.${this.patch + 1}`;

    this._appVersion.updateVersionNumber(newVersionNumber);

    if (notes) {
      this._appVersion.addReleaseNotes(notes);
      this.versionNotes.push(notes);
    }

    return this;
  }

  toData(): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      id: this.id,
      versionNumber: this.versionNumber,
      name: this.name,
      description: this.description,
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      buildNumber: this.buildNumber,
      releaseDate: this.releaseDate,
      metadata: this.metadata,
      data: this.data,
      structureData: this.structureData,
      versionNotes: this.versionNotes,
      isLatest: this.isLatest,
      isActive: this.isActive,
      isPublished: this.isPublished,
      workspaceId: this.workspaceId,
      workspaceName: this.workspaceName,
      workspaceType: this.workspaceType,
      workspaceUrl: this.workspaceUrl,
      workspaceViewers: this.workspaceViewers,
      workspaceAdmins: this.workspaceAdmins,
      workspaceMembers: this.workspaceMembers,
      versionHistory: this.versionHistory,
    } as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
}

export default AppVersionToVersionAdapter