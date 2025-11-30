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
  versionData?: Partial<Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  const now = new Date();

  // Create a proper VersionImpl instance
  const versionImpl = new VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
    id: 1,
    major: 1,
    minor: 0,
    patch: 0,
    name: "Latest Version",
    url: "/versions/latest",
    versionNumber: "1.0.0",
    documentId: "latest-doc",
    draft: false,
    userId: "system",
    content: "Latest version content",
    description: "Latest version description",
    buildNumber: "1",
    appVersion: "1.0.0",
    checksum: "latest-checksum",
    parentId: null,
    parentType: "document",
    parentVersion: "1.0.0",
    parentTitle: "Parent Document",
    parentContent: "Parent content",
    parentName: "Parent Name",
    parentUrl: "/parent",
    parentChecksum: "parent-checksum",
    parentAppVersion: "1.0.0",
    parentVersionNumber: "1.0.0",
    isLatest: true,
    isActive: true,
    isPublished: true,
    publishedAt: now,
    source: "system",
    status: "active",
    workspaceId: "workspace-1",
    workspaceName: "Workspace",
    workspaceType: "default",
    workspaceUrl: "/workspace",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: undefined,
    _structure: {},
    currentHash: "",
    structureData: "{}",
    versionHistory: {
      versionData: null,
      latestVersion: createLatestVersion(),
      history: [],
      timestamp: now,
      versions: [],
      currentVersionIndex: 0
    },
    metadata: {
      author: "system",
      timestamp: now,
      area: "default",
      metadataEntries: {},
      latestVersion: createLatestVersion(),
      schema: {}
    },
    // Apply any overrides
    ...versionData
  });

  return versionImpl;
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
    latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    history: []
  };
}


const versionHistory: VersionHistory<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> = {
  versionData: [],
  history: [],
  currentVersionIndex: 0,
  latestVersion: createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>({
    id: 1,
    name: "Initial Release",
    versionNumber: "1.0.0",
    userId: "user123",
    content: "Initial version of the content.",
    description: "Initial version description",
    structureData: "{}",
    releaseDate: new Date("2024-11-24"),
    major: 1,
    minor: 0,
    patch: 0,
    isPublished: true,
    publishedAt: new Date(),
    source: "Generated",
    status: "Active",
    workspaceName: "Main Workspace",
    documentId: "doc-123",
    url: "/versions/1.0.0",
    buildNumber: "1",
    appVersion: "1.0.0",
    checksum: "abc123",
    parentId: null,
    parentType: "document",
    parentVersion: "1.0.0",
    parentTitle: "Parent Document",
    parentContent: "Parent content",
    parentName: "Parent Name",
    parentUrl: "/parent",
    parentChecksum: "parent-checksum",
    parentAppVersion: "1.0.0",
    parentVersionNumber: "1.0.0",
    workspaceId: "workspace-123",
    workspaceType: "default",
    workspaceUrl: "/workspace/main",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    metadata: {
      author: "Author Name",
      timestamp: new Date(),
      area: 'version history area',
      metadataEntries: {},
      latestVersion: createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(),
      schema: {}
    }
  }),
  lastUpdated: new Date(),
  timestamp: new Date(),
};