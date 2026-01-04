LoggingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface LoggingEndpoints extends EndpointCategoryConfig {
  logs: EndpointConfig;
  logInfo: EndpointConfig;
  logWarning: EndpointConfig;
  logError: EndpointConfig;
  logSuccess: EndpointConfig;
  logFailure: EndpointConfig;
}