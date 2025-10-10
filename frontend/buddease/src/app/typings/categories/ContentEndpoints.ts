// ContentEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ContentEndpoints {
  fetchContent: EndpointConfig;
  createContent: EndpointConfig;
  updateContent: EndpointConfig;
  deleteContent: EndpointConfig;
  publishContent: EndpointConfig;
  unpublishContent: EndpointConfig;
  searchContent: EndpointConfig;
}