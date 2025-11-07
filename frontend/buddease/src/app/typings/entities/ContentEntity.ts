// ContentEntity.ts
import { ItemUnion } from '@/app/snapshots/SnapshotContainer';
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields, DefaultIncludedFields} from '@/app/config/BaseConfig';
import { ContentItem } from '@/app/components/models/content/ContentItem'
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Content } from '@/app/models/content/AddContent';
import { CommonData } from '@/app/models/CommonData'
import { Task } from "@/app/models/tasks/Task";

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