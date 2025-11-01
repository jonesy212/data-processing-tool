// ToolbarEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ToolbarEndpoints extends EndpointCategoryConfig {
  fetchToolbarSize: EndpointConfig;
  updateToolbarSize: EndpointConfig;
}