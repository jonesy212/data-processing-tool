ArticleEntity.ts
ArticleEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

Specific entity for articles
interface ArticleEntity extends BaseDataEntity {
  id: string;
  title: string;
  content: string;
  author?: string;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  readTime?: number; // in minutes
  featured?: boolean;
  excerpt?: string;
  slug?: string;
  [key: string]: any;
}

Article-specific type definitions
type ArticleK = ArticleEntity;
type ArticleMeta = DefaultMeta<ArticleEntity, ArticleK>;
type ArticleAttachment = Attachment;
type ArticleIncludedFields = keyof ArticleEntity;
type ArticleExcludedFields = DefaultExcludedFields<ArticleEntity>;

Article-specific parameters container
type ArticleBaseParams = {
  T: ArticleEntity;
  K: ArticleK;
  Meta: ArticleMeta;
  AttachmentType: ArticleAttachment;
  ExcludedFields: ArticleExcludedFields;
  IncludedFields: ArticleIncludedFields;
};

export type {
    ArticleAttachment, ArticleBaseParams, ArticleEntity, ArticleExcludedFields, ArticleIncludedFields, ArticleK,
    ArticleMeta
};

