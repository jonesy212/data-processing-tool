// ContentEntity.ts
import { ContentItem } from '@/core/components/models/content/ContentItem';
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { CommonData } from '@/core/models/CommonData';
import { Content } from '@/core/models/content/AddContent';
import type { Task } from "@/core/models/tasks/Task";
import { ItemUnion } from '@/core/snapshots/SnapshotContainer';
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";

export interface ContentEntity extends BaseDataEntity {
  // Core content properties
  id: string | number | undefined;
  title: string;
  description: string;
  subscriberId: string;
  category?: Category;

  // categories?: CategoryProperties[];

  timestamp: string | number | Date;
  length: number;
  items: ItemUnion[];
  
  // Data field with various possible types
  data: any; // Simplified - will be properly typed in generic interface
  
  // Additional content properties
  contentItems?: ContentItem[];
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  author?: string;
  publishedAt?: Date;
  lastModified?: Date;
  views?: number;
  likes?: number;
  shares?: number;
}




export type ContentTask = Task<
  ContentEntity,
  ContentK,
  ContentMeta,
  ContentAttachment,
  ContentExcludedFields,
  ContentIncludedFields
>;

export type WritableContentTask = WritableDraft<ContentTask>;

// Content-specific types
export type AppContentEntity = ContentEntity;
export type ContentK = AppContentEntity;
export type ContentMeta = DefaultMeta<ContentEntity, ContentK>;
export type ContentExcludedFields = 'contentItems' | 'data' | 'categoryProperties';
export type ContentIncludedFields = keyof AppContentEntity;

// Create specific type aliases
export type AppContent = Content<AppContentEntity, ContentK, ContentMeta, ContentAttachment, ContentExcludedFields, ContentIncludedFields>;
export type AppContentCommonData = CommonData<AppContentEntity, ContentK, ContentMeta, ContentAttachment, ContentExcludedFields, ContentIncludedFields>;


// Content-specific metadata
export interface ContentMetaMetric extends DefaultMeta<ContentEntity, ContentEntity> {
  contentSpecificMeta?: {
    seoKeywords?: string[];
    readingTime?: number;
    wordCount?: number;
    featuredImage?: string;
    socialMediaPreview?: string;
  };
}

// Content-specific attachment type
export interface ContentAttachment extends Attachment {
  contentSpecificAttachment?: {
    embeddedMedia?: Array<{
      type: 'image' | 'video' | 'audio';
      url: string;
      caption?: string;
    }>;
    downloadableAssets?: string[];
  };
}