// Paging.ts
import { PromptPageProps } from "@/app/prompts/PromptPage";

export interface PagingState {
    currentPage: PromptPageProps;
    pageSize: number;
    totalItems: number;
  }
  