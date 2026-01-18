// ThemeEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ThemeEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (themeId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (themeId: number) => EndpointConfig;
  settings: EndpointConfig;
  updateSettings: EndpointConfig;
}