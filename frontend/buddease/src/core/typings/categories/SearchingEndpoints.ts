// SearchingEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface SearchingEndpoints extends EndpointCategoryConfig {
  searchMessages: EndpointConfig;
  searchDelegates: EndpointConfig;
  searchTasks: EndpointConfig;
  searchContent: EndpointConfig;
  searchData: EndpointConfig;
  searchHighlights: EndpointConfig;
  searchTodos: EndpointConfig;
}