// ProductEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { CommonData } from '@/core/models/CommonData';
import { VisualizationData } from '@/core/users/User';

// Define the actual ProductEntity interface
interface ProductEntity extends BaseDataEntity, BaseEntity {
  // ✅ Product-specific required fields
  productId: string;
  productName: string;
  productDescription: string;
  category: string;
  price: number;
  inventory: number;
  manufacturer: string;
  releaseDate: Date;
  status: "planned" | "in development" | "testing" | "launched" | "draft";
  weight: number;
  
  // ✅ Product-specific optional fields
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  ratings?: {
    averageRating: number;
    numberOfRatings: number;
  };
  reviews?: Array<{
    userId: string;
    userName: string;
    reviewText: string;
    rating: number;
    date: Date;
  }>;
  features?: string[];
  images?: string[];
  relatedProducts?: string[]; // IDs of related products
  brainstormingDetails?: CommonData<VisualizationData[]>;
  launchDetails?: CommonData<VisualizationData[]>;
  
  // Additional product fields
  sku?: string;
  upc?: string;
  costPrice?: number;
  salePrice?: number;
  tags?: string[];
  variants?: string[]; // Product variant IDs
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
  
}

Product-specific type parameters
type ProductK = ProductEntity;
type ProductMeta = DefaultMeta<ProductEntity, ProductK> & {
  supplier?: string;
  warranty?: {
    period: number;
    unit: 'days' | 'months' | 'years';
    terms?: string;
  };
  shipping?: {
    weight: number;
    dimensions: { width: number; height: number; depth: number };
    restrictions?: string[];
  };
  customFields?: Record<string, any>;
};
type ProductAttachment = Attachment;
type ProductExcludedFields = DefaultExcludedFields<ProductEntity> | "costPrice" | "reviews" | "ratings";
type ProductIncludedFields = keyof ProductEntity;

// Product parameters container
type ProductBaseParams = {
  T: ProductEntity;
  K: ProductK;
  Meta: ProductMeta;
  AttachmentType: ProductAttachment;
  ExcludedFields: ProductExcludedFields;
  IncludedFields: ProductIncludedFields;
};

export type {
    ProductAttachment, ProductBaseParams, ProductEntity, ProductExcludedFields,
    ProductIncludedFields, ProductK,
    ProductMeta
};

