// SearchingEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface SearchingEndpoints {
  searchMessages: EndpointConfig;
  searchDelegates: EndpointConfig;
  searchTasks: EndpointConfig;
  searchContent: EndpointConfig;
  searchData: EndpointConfig;
  searchHighlights: EndpointConfig;
  searchTodos: EndpointConfig;
}