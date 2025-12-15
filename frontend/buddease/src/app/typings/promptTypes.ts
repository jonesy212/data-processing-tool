// promptTypes.ts
import { Category } from "@/app/libraries/categories/generateCategoryProperties";

export interface BasePrompt {
  id: string;
  title: string;
  content: string;
  type: PromptType;
  createdAt: Date;
  updatedAt: Date;
  category?: Category; // Add optional category
}

export interface ChatPrompt extends BasePrompt {
  text: string;
  options?: PromptOption[];
}

export interface FeaturePrompt extends BasePrompt {
  subjects: string[];
  conversationId?: string;
  tags: string[];
  accessLevel: 'private' | 'team' | 'public' | 'community';
  createdBy: string;
  linkedDocuments?: string[];
  category: Category;
}

export interface SystemPrompt extends BasePrompt {
  text: string;
  options?: PromptOption[];
  documentType?: string;
}

export type PromptType = "text" | "multipleChoice" | "system" | "user";
export interface PromptOption {
  id: string;
  text: string;
  value: any;
}