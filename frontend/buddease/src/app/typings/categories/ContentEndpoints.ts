// ContentEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ContentEndpoints {
  fetchContent: EndpointConfig;
  createContent: EndpointConfig;
  updateContent: EndpointConfig;
  deleteContent: EndpointConfig;
  publishContent: EndpointConfig;
  unpublishContent: EndpointConfig;
  searchContent: EndpointConfig;
}