// ScreenSharingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ScreenSharingEndpoints extends EndpointCategoryConfig {
  startSession: EndpointConfig;
  endSession: EndpointConfig;
  getSessionDetails: (sessionId: string) => EndpointConfig;
}