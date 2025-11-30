// ScreenSharingEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ScreenSharingEndpoints extends EndpointCategoryConfig {
  start: EndpointConfig;
  stop: EndpointConfig;
  join: (sessionId: string) => EndpointConfig;
  leave: (sessionId: string) => EndpointConfig;
  status: (sessionId: string) => EndpointConfig;
  permissions: EndpointCategoryConfig;
}

export const screenSharingConfig: ScreenSharingEndpoints = {
  start: { path: '/api/screen-sharing/start', method: "POST" },
  stop: { path: '/api/screen-sharing/stop', method: "POST" },
  join: (sessionId: string) => ({ path: `/api/screen-sharing/${sessionId}/join`, method: "POST" }),
  leave: (sessionId: string) => ({ path: `/api/screen-sharing/${sessionId}/leave`, method: "POST" }),
  status: (sessionId: string) => ({ path: `/api/screen-sharing/${sessionId}/status`, method: "GET" }),
  permissions: {
    request: { path: '/api/screen-sharing/permissions/request', method: "POST" },
    grant: { path: '/api/screen-sharing/permissions/grant', method: "POST" },
    revoke: { path: '/api/screen-sharing/permissions/revoke', method: "POST" },
  }
};