// BlogEntity.ts
// BlogEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';

// Core Blog type definitions
type BlogEntity = BaseDataEntity & {
  // Blog-specific fields
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  publishDate?: Date;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  slug: string;
  readTime?: number;
  // Add other blog-specific properties as needed
};
type BlogK = BlogEntity;
type BlogMeta = DefaultMeta<BlogEntity, BlogK>;
type BlogAttachment = Attachment;
type BlogExcludedFields = DefaultExcludedFields<BlogEntity>;
type BlogIncludedFields = keyof BlogEntity;

// Main parameters container
type BlogBaseParams = {
  T: BlogEntity;
  K: BlogK;
  Meta: BlogMeta;
  AttachmentType: BlogAttachment;
  ExcludedFields: BlogExcludedFields;
  IncludedFields: BlogIncludedFields;
};

// Snapshot types
type BlogSnapshot = Snapshot<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogSnapshotData = SnapshotData<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogSnapshotStore = SnapshotStore<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogSnapshotWithCriteria = SnapshotWithCriteria<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogSubscriberCollection = SubscriberCollection<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogRealtimeDataItem = RealtimeDataItem<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;

// Configuration types
type BlogSnapshotStoreConfig = SnapshotStoreConfig<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;
type BlogSnapshotsArray = SnapshotsArray<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;

// PARAMS
type BlogParams = SnapshotConfigParams<BlogEntity, BlogK, BlogMeta, BlogAttachment, BlogExcludedFields, BlogIncludedFields>;

// Utility to pick or omit fields dynamically
type ApplyBlogFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
  ApplyBlogFieldFilters, BlogAttachment, BlogBaseParams, BlogEntity, BlogExcludedFields,
  BlogIncludedFields, BlogK, BlogMeta, BlogParams,
  BlogRealtimeDataItem, BlogSnapshot, BlogSnapshotData, BlogSnapshotsArray,
  BlogSnapshotStore, BlogSnapshotStoreConfig, BlogSnapshotWithCriteria,
  BlogSubscriberCollection
};

