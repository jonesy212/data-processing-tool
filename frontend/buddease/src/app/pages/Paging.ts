import { PromptPageProps } from "../components/prompts/PromptPage";

export interface PagingState {
    currentPage: PromptPageProps;
    pageSize: number;
    totalItems: number;
  }
  