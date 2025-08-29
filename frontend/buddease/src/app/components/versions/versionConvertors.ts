import { VersionData } from '@/app/components/versions/VersionData';
import { Version } from '@/app/components/versions/Version';
import { BaseData } from '@/app/components/models/data/Data';
import VersionImpl from "@/app/components/versions/Version";



function toVersionData<T extends BaseData<any>, K extends T = T>(
  version: Version<T, K>
): VersionData<T, K> {
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

function toVersion<T extends BaseData<any>, K extends T = T>(
  versionData: VersionData<T, K>
): Version<T, K> {

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
