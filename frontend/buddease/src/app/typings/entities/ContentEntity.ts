ContentEntity.ts// ContentEntity.ts
import { BaseDataEntity } from './DataEntity';
import { DefaultMeta } from './AppMetadataEntity';
import { Attachment } from './CommonEntities';

export interface ContentEntity extends BaseDataEntity {
  // Core content properties
  id: string | number | undefined;
  title: string;
  description: string;
  subscriberId: string;
  category?: Category;
  categoryProperties: string | CategoryProperties | undefined;
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


// Content-specific types
export type AppContentEntity = ContentEntity;
export type ContentK = AppContentEntity;
export type ContentMeta = ContentMeta;
export type ContentAttachment = ContentAttachment;
export type ContentExcludedFields = 'contentItems' | 'data' | 'categoryProperties';
export type ContentIncludedFields = keyof AppContentEntity;

// Create specific type aliases
export type AppContent = Content<AppContentEntity, ContentK, ContentMeta, ContentAttachment, ContentExcludedFields, ContentIncludedFields>;
export type AppContentCommonData = CommonData<AppContentEntity, ContentK, ContentMeta, ContentAttachment, ContentExcludedFields, ContentIncludedFields>;


// Content-specific metadata
export interface ContentMeta extends DefaultMeta<ContentEntity, ContentEntity> {
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