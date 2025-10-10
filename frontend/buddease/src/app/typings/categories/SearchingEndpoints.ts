// SearchingEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface SearchingEndpoints {
  searchMessages: EndpointConfig;
  searchDelegates: EndpointConfig;
  searchTasks: EndpointConfig;
  searchContent: EndpointConfig;
  searchData: EndpointConfig;
  searchHighlights: EndpointConfig;
  searchTodos: EndpointConfig;
}