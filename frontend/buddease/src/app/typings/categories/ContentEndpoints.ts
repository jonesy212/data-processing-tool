// ContentEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ContentEndpoints extends EndpointCategoryConfig {
  fetchContent: EndpointConfig;
  createContent: EndpointConfig;
  updateContent: EndpointConfig;
  deleteContent: EndpointConfig;
  publishContent: EndpointConfig;
  unpublishContent: EndpointConfig;
  searchContent: EndpointConfig;
}