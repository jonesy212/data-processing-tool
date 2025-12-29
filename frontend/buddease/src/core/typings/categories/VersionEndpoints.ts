// VersionEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface VersionEndpoints extends EndpointCategoryConfig {
  getVersion: EndpointConfig;
  updateVersion: EndpointConfig;
  deleteVersion: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}