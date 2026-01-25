// VersionHistoryEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

// Core VersionHistory type definitions
type VersionHistoryEntity = BaseDataEntity & {
  versionNumber?: string;
  documentId?: string;
  draft?: boolean;
  userId?: string;
  content?: any;
  metadata?: Record<string, any>;
  versionData?: any[];
  published?: boolean;
  checksum?: string;
  releaseDate?: Date;
  major?: number;
  minor?: number;
  patch?: number;
  history?: any[];
  isActive?: boolean;
  isLatest?: boolean;
  isPublished?: boolean;
  publishedAt?: Date | null;
  source?: string;
  status?: string;
  version?: string;
  user?: any;
  comments?: any[];
  workspaceId?: string;
  workspaceName?: string;
  workspaceType?: string;
  workspaceUrl?: string;
  workspaceViewers?: any[];
  workspaceAdmins?: any[];
  workspaceMembers?: any[];
  backend?: any;
  frontend?: any;
  name?: string;
  url?: string;
  parentId?: string;
  parentType?: string;
  parentVersion?: string;
  parentTitle?: string;
  parentContent?: any;
  parentName?: string;
  parentUrl?: string;
  parentChecksum?: string;
  parentAppVersion?: string;
  parentVersionNumber?: string;
  changes?: any;
};

type VersionHistoryK = VersionHistoryEntity;
type VersionHistoryMeta = DefaultMeta<VersionHistoryEntity, VersionHistoryK>;
type VersionHistoryAttachment = Attachment;
type VersionHistoryExcludedFields = DefaultExcludedFields<VersionHistoryEntity>;
type VersionHistoryIncludedFields = keyof VersionHistoryEntity;

// Main parameters container
type VersionHistoryBaseParams = {
  T: VersionHistoryEntity;
  K: VersionHistoryK;
  Meta: VersionHistoryMeta;
  AttachmentType: VersionHistoryAttachment;
  ExcludedFields: VersionHistoryExcludedFields;
  IncludedFields: VersionHistoryIncludedFields;
};

type VersionHistorySnapshot = Snapshot<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistorySnapshotData = SnapshotData<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistorySnapshotStore = SnapshotStore<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistorySnapshotWithCriteria = SnapshotWithCriteria<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistorySubscriberCollection = SubscriberCollection<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistoryRealtimeDataItem = RealtimeDataItem<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;

// Configuration types
type VersionHistorySnapshotStoreConfig = SnapshotStoreConfig<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;
type VersionHistorySnapshotsArray = SnapshotsArray<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;

// PARAMS
type VersionHistoryParams = SnapshotConfigParams<VersionHistoryEntity, VersionHistoryK, VersionHistoryMeta, VersionHistoryAttachment, VersionHistoryExcludedFields, VersionHistoryIncludedFields>;

// Utility to pick or omit fields dynamically
type VersionHistoryApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
    VersionHistoryApplyFieldFilters, VersionHistoryAttachment, VersionHistoryBaseParams, VersionHistoryEntity, VersionHistoryExcludedFields,
    VersionHistoryIncludedFields, VersionHistoryK,
    VersionHistoryMeta, VersionHistoryParams,
    VersionHistoryRealtimeDataItem,
    VersionHistorySnapshot, VersionHistorySnapshotData,
    VersionHistorySnapshotsArray,
    VersionHistorySnapshotStore,
    VersionHistorySnapshotStoreConfig,
    VersionHistorySnapshotWithCriteria,
    VersionHistorySubscriberCollection
};

