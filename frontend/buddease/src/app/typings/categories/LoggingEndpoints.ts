// LoggingEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface LoggingEndpoints {
  logs: EndpointConfig;
  logInfo: EndpointConfig;
  logWarning: EndpointConfig;
  logError: EndpointConfig;
  logSuccess: EndpointConfig;
  logFailure: EndpointConfig;
}