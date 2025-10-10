// ThemeEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ThemeEndpoints {
  list: EndpointConfig;
  single: (themeId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (themeId: number) => EndpointConfig;
  settings: EndpointConfig;
  updateSettings: EndpointConfig;
}