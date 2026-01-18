// ToolbarEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ToolbarEndpoints extends EndpointCategoryConfig {
  fetchToolbarSize: EndpointConfig;
  updateToolbarSize: EndpointConfig;
}