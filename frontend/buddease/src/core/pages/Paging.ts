Paging.ts
import { PromptPageProps } from "@/core/prompts/PromptPage";

export interface PagingState {
    currentPage: PromptPageProps;
    pageSize: number;
    totalItems: number;
  }
  