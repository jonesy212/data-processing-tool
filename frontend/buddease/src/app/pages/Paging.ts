// Paging.ts
import { PromptPageProps } from "@/app/components/prompts/PromptPage";

export interface PagingState {
    currentPage: PromptPageProps;
    pageSize: number;
    totalItems: number;
  }
  