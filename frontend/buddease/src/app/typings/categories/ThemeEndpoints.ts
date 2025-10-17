// ThemeEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ThemeEndpoints {
  list: EndpointConfig;
  single: (themeId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (themeId: number) => EndpointConfig;
  settings: EndpointConfig;
  updateSettings: EndpointConfig;
}