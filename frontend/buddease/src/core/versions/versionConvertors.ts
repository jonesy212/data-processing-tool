// versionConvertors.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import '@/core/versions/Version';
import { VersionData } from '@/core/versions/VersionData';



function toVersionData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    id: version.documentId,
    parentId: version.parentId,
    isLatest: version.isLatest,
    isActive: version.isActive,
    isPublished: version.isPublished,
    workspaceId: version.workspaceId,
    setServices: () => {}, // or actual implementation

    // Optional fields
    parentAppVersion: version.parentAppVersion,
    parentVersionNumber: version.parentVersionNumber,
    parentType: version.parentType,
    parentVersion: version.parentVersion,
    parentTitle: version.parentTitle,
    parentContent: version.parentContent,
    parentName: version.parentName,
    parentUrl: version.parentUrl,
    parentChecksum: version.parentChecksum,
    parentMetadata: version.parentMetadata,
    description: version.description,
    publishedAt: version.publishedAt,
    source: version.source,
    status: version.status,
    user: version.userId,
    changes: [], // map from versionHistory if needed
    notes: [],
    workspaceName: version.workspaceName,
    workspaceType: version.workspaceType,
    workspaceUrl: version.workspaceUrl,
    workspaceViewers: version.workspaceViewers,
    workspaceAdmins: version.workspaceAdmins,
    workspaceMembers: version.workspaceMembers,
    createdAt: version.createdAt,
    createdBy: version.userId,
    updatedAt: version.updatedAt,
    _structure: version._structure,
    data: version.data,
    backend: version.versions?.backend,
    frontend: version.versions?.frontend,
    services: {}, // Optional - map from actual services
    history: version.versions?.history
  };
}

function toVersion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

    const historyEntries = versionData.history ?? [];

    const versionHistory: VersionHistory = {
      versionData: versionData.versionData ?? null,
      latestVersion: versionData.versionNumber ?? null,
      timestamps: historyEntries.map((entry) => entry.timestamp ?? new Date()),
      // Add more fields as needed based on your `VersionHistory` definition
    };
  
  return new VersionImpl<T, K>({
    id: versionData.id,
    major: versionData.major ?? 0,
    minor: versionData.minor ?? 0,
    patch: versionData.patch ?? 0,
    name: versionData.description ?? '',
    url: versionData.parentUrl ?? '',
    versionNumber: `${versionData.major}.${versionData.minor}.${versionData.patch}`,
    documentId: versionData.id,
    draft: !versionData.isPublished,
    userId: versionData.user,
    content: versionData.parentContent ?? '',
    description: versionData.description ?? '',
    buildNumber: versionData.buildNumber ?? '',
    metadata: versionData.metadata,
    versionHistory,
    appVersion: versionData.appVersion ?? '',
    checksum: versionData.checksum ?? '',
    parentId: versionData.parentId,
    parentType: versionData.parentType ?? '',
    parentVersion: versionData.parentVersion ?? '',
    parentTitle: versionData.parentTitle ?? '',
    parentContent: versionData.parentContent ?? '',
    parentName: versionData.parentName ?? '',
    parentUrl: versionData.parentUrl ?? '',
    parentChecksum: versionData.parentChecksum ?? '',
    parentAppVersion: versionData.parentAppVersion ?? '',
    parentVersionNumber: versionData.parentVersionNumber ?? '',
    parentMetadata: versionData.parentMetadata ?? {},
    createdAt: versionData.createdAt,
    updatedAt: versionData.updatedAt,
    isLatest: versionData.isLatest,
    isPublished: versionData.isPublished,
    publishedAt: versionData.publishedAt ?? null,
    isActive: versionData.isActive,
    source: versionData.source ?? '',
    status: versionData.status ?? '',
    workspaceId: versionData.workspaceId,
    workspaceName: versionData.workspaceName,
    workspaceType: versionData.workspaceType,
    workspaceUrl: versionData.workspaceUrl,
    workspaceViewers: versionData.workspaceViewers ?? [],
    workspaceAdmins: versionData.workspaceAdmins ?? [],
    workspaceMembers: versionData.workspaceMembers ?? [],
    data: versionData.data,
    _structure: versionData._structure ?? {},
    currentHash: '',
    structureData: '',
    getVersionNumber: undefined,
    getStructure: undefined,
    transformToStructureItems: () => [],
    updateStructureHash: async () => {},
    setStructureData: () => {},
    hash: (value: string) => value,
    calculateHash: () => ''
  });
}
