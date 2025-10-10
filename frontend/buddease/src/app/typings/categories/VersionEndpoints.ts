// VersionEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface VersionEndpoints {
  getVersion: EndpointConfig;
  updateVersion: EndpointConfig;
  deleteVersion: EndpointConfig;
  backend: EndpointConfig;
  frontend: EndpointConfig;
}