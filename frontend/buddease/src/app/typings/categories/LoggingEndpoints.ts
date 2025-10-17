// LoggingEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface LoggingEndpoints {
  logs: EndpointConfig;
  logInfo: EndpointConfig;
  logWarning: EndpointConfig;
  logError: EndpointConfig;
  logSuccess: EndpointConfig;
  logFailure: EndpointConfig;
}