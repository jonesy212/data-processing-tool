// Product.tsx

import { CommonData } from "@/app/models/CommonData";
import { UserData, VisualizationData } from "@/app/users/User";
import { Attachment } from "@/app/documents/attachment/Attachment";

interface Product<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Add specific properties for the product
  productId: string;
  productName: string;
  productDescription: string;
  category: string;
  price: number;
  inventory: number;
  manufacturer: string;
  releaseDate: Date;
  status: "planned" | "in development" | "testing" | "launched" | "draft";
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;
  ratings: {
    averageRating: number;
    numberOfRatings: number;
  };
  reviews: Array<{
    userId: string;
    userName: string;
    reviewText: string;
    rating: number;
    date: Date;
  }>;
  features: string[];
  images: string[];
  relatedProducts: string[]; // IDs of related products
  // Add more properties as needed
  brainstormingDetails: CommonData<VisualizationData[]>;
  launchDetails: CommonData<VisualizationData[]>;
}

export type { Product };
