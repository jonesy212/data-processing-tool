// ScreenSharingEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ScreenSharingEndpoints {
  startSession: EndpointConfig;
  endSession: EndpointConfig;
  getSessionDetails: (sessionId: string) => EndpointConfig;
}