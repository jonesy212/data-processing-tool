// DetailsEntity.ts

import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import FrontendStructure from '@/app/config/appStructure/FrontendStructure';
import { DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Content, ContentData } from "@/app/models/content/AddContent";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Permission } from '@/app/permissions/Permission';
import { Snapshot, SnapshotData, SnapshotStoreConfig } from '@/app/snapshots/SnapshotData';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { AppEntity } from '@/app/typings/entities/AppEntity';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { ApplyFieldFilters } from '@/app/typings/entities/AppEntity';

// Define the actual DetailsEntity interface
interface DetailsEntity extends AppEntity {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: string;
  category?: string;
  tags: string[];
  authorId: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  visibility: 'public' | 'private' | 'restricted';
  version: number;
  parentId?: string;
  language: string;
  metadata?: Record<string, any>;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  isFeatured: boolean;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  rating?: number;
  // Add other details-specific fields
}

// Details-specific type parameters
type AppDetailsEntity = DetailsEntity;
type DetailsK = DetailsEntity;
type DetailsMeta = DefaultMeta<DetailsEntity, DetailsK> & {
  // Add only the specific StructuredMetadata properties you need
  description?: string;
  fileType?: string;
  keywords: string[];
  permissions?: Permission[] | string[];
  customFields?: Record<string, any>;
  contentSummary?: string;
  readingTime?: number;
  wordCount?: number;
  // Omit the problematic recursive properties
};
type DetailsAttachment = Attachment;
type DetailsExcludedFields = DefaultExcludedFields<AppDetailsEntity> | "content" | "metadata" | "attachments";
type DetailsIncludedFields = keyof AppDetailsEntity;

// Details parameters container
type DetailsBaseParams = {
  T: DetailsEntity;
  K: DetailsK;
  Meta: DetailsMeta;
  AttachmentType: DetailsAttachment;
  ExcludedFields: DetailsExcludedFields;
  IncludedFields: DetailsIncludedFields;
};

// Complete details with all fields (including sensitive ones)
type CompleteDetails = DetailsEntity;

// Details without sensitive fields for public display
type PublicDetailsProfile = Pick<DetailsEntity, 
  "id" | "title" | "description" | "contentType" | "category" | "tags" | 
  "status" | "visibility" | "authorId" | "createdAt" | "updatedAt" | 
  "publishedAt" | "isFeatured" | "isPinned" | "viewCount" | "likeCount" | 
  "shareCount" | "rating"
>;

// Minimal details for basic display (lists, dropdowns)
type BasicDetailsInfo = Pick<DetailsEntity, 
  "id" | "title" | "description" | "contentType" | "category" | "status" | 
  "authorId" | "createdAt" | "viewCount"
>;

// Details for content management context
type ManagedDetails = Pick<DetailsEntity, 
  "id" | "title" | "description" | "content" | "contentType" | "category" | 
  "tags" | "status" | "visibility" | "authorId" | "createdAt" | "updatedAt" | 
  "publishedAt" | "isFeatured" | "isPinned" | "metadata"
>;

// Details with secure fields for internal use
type InternalDetails = Omit<DetailsEntity, "content" | "metadata" | "attachments">;

// Specific filtered details types using the utility
type SecureDetails = ApplyFieldFilters<DetailsEntity, "content" | "metadata" | "attachments">;
type MinimalDetailsProfile = ApplyFieldFilters<DetailsEntity, 
  "content" | "metadata" | "attachments" | "expiresAt" | "version", 
  "id" | "title" | "description" | "contentType" | "status" | "authorId"
>;

type AppDetails = Content<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsData = ContentData<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsProfile = DetailsItem<DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields>;

type AppDetailsSnapshot = Snapshot<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsSnapshotData = SnapshotData<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsSnapshotStore = SnapshotStore<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsRealtimeDataItem = RealtimeDataItem<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsUnifiedMetadata = UnifiedMetadata<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type AppDetailsStructuredMetadata = StructuredMetadata<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

// Details configuration types
type DetailsSnapshotStoreConfig = SnapshotStoreConfig<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type DetailsSnapshotsArray = SnapshotsArray<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

type DetailsParams = SnapshotConfigParams<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

// Details frontend structure
type DetailsFrontendStructure = FrontendStructure<
  DetailsEntity, DetailsK, DetailsMeta, DetailsAttachment, DetailsExcludedFields, DetailsIncludedFields
>;

// Details data variations
type PublicDetailsData = Pick<AppDetailsData, 
  "id" | "title" | "description" | "contentType" | "category" | "tags" | 
  "status" | "visibility" | "authorId" | "createdAt" | "updatedAt" | 
  "publishedAt" | "isFeatured" | "viewCount" | "likeCount" | "shareCount" | "rating"
>;

type PrivateDetailsData = Omit<AppDetailsData, "content" | "metadata" | "attachments">;
type AdminDetailsData = AppDetailsData; // Full access for admins

// Details status-specific types
type DraftDetails = Pick<AppDetails, "id" | "title" | "description" | "contentType" | "status" | "authorId" | "createdAt"> & { status: "draft" };
type PublishedDetails = AppDetails & { 
  status: "published"; 
  publishedAt: Date;
  isFeatured: boolean;
};
type ArchivedDetails = AppDetails & { 
  status: "archived";
  archivedAt: Date;
};

// Details state types
type DetailsSession = {
  details: AppDetails;
  token: string;
  expiresAt: Date;
  permissions: string[];
};

type DetailsContext = {
  currentDetails: AppDetails | null;
  isLoading: boolean;
  isLoaded: boolean;
  create: (details: Partial<AppDetails>) => Promise<void>;
  update: (updates: Partial<AppDetails>) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

// Details utility types
type DetailsFilterOptions = {
  contentType?: string;
  category?: string;
  status?: string;
  authorId?: string;
  tags?: string[];
  isFeatured?: boolean;
  isPinned?: boolean;
  dateRange?: { start: Date; end: Date };
  search?: string;
};

type DetailsSortOptions = {
  field: keyof AppDetails;
  direction: 'asc' | 'desc';
};

// Core details types using the pattern
type DetailsDataDefault = ContentData<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

type DetailsSnapshotDefault = Snapshot<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

type DetailsSnapshotDataDefault = SnapshotData<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

type DetailsSnapshotStoreDefault = SnapshotStore<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

type DetailsRealtimeDataItemDefault = RealtimeDataItem<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

// Details Metadata Types
type DetailsUnifiedMetadata = UnifiedMetadata<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'], 
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

type DetailsStructuredMetadata = StructuredMetadata<
  DetailsBaseParams['T'],
  DetailsBaseParams['K'],
  DetailsBaseParams['Meta'],
  DetailsBaseParams['AttachmentType'],
  DetailsBaseParams['ExcludedFields'],
  DetailsBaseParams['IncludedFields']
>;

// Content-specific types
type ContentAnalytics = {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  averageRating?: number;
  engagementRate: number;
  lastViewed?: Date;
};

type ContentVersion = {
  version: number;
  content: string;
  changes: string[];
  authorId: string;
  createdAt: Date;
  notes?: string;
};

type ContentWorkflow = {
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  currentStep: number;
  totalSteps: number;
  reviewers: string[];
  approvals: string[];
  comments: string[];
};

// Export all the new types
export type {
  AdminDetailsData,
  // Core App types
  AppDetails,
  AppDetailsData,
  AppDetailsProfile,
  AppDetailsRealtimeDataItem,
  AppDetailsSnapshot,
  AppDetailsSnapshotData,
  AppDetailsSnapshotStore,
  AppDetailsStructuredMetadata,
  AppDetailsUnifiedMetadata, ArchivedDetails, BasicDetailsInfo,
  // Filtered types
  CompleteDetails,
  // Content-specific types
  ContentAnalytics,
  ContentVersion,
  ContentWorkflow, DetailsAttachment,
  // Base params
  DetailsBaseParams,
  // Utility types
  DetailsContext,
  // Configuration types
  DetailsDataDefault,
  // Core entity types
  DetailsEntity, DetailsExcludedFields, DetailsFilterOptions, DetailsFrontendStructure, DetailsIncludedFields, DetailsK,
  DetailsMeta, DetailsParams, DetailsRealtimeDataItemDefault, DetailsSession, DetailsSnapshotDataDefault, DetailsSnapshotDefault, DetailsSnapshotsArray, DetailsSnapshotStoreConfig, DetailsSnapshotStoreDefault, DetailsSortOptions, DetailsStructuredMetadata, DetailsUnifiedMetadata,
  // Status-specific types
  DraftDetails, InternalDetails, ManagedDetails, MinimalDetailsProfile, PrivateDetailsData,
  // Data variations
  PublicDetailsData, PublicDetailsProfile, PublishedDetails, SecureDetails
};

