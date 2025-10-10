// ScreenSharingEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ScreenSharingEndpoints {
  startSession: EndpointConfig;
  endSession: EndpointConfig;
  getSessionDetails: (sessionId: string) => EndpointConfig;
}