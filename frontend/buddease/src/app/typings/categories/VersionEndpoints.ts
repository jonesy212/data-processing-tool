// VersionEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface VersionEndpoints {
  getVersion: EndpointConfig;
  updateVersion: EndpointConfig;
  deleteVersion: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}