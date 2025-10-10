// screenSharingConfig.ts
import { ScreenSharingEndpoints } from '../types/categories/ScreenSharingEndpoints';
import { BASE_URL } from './baseUrl';

export const screenSharingConfig: ScreenSharingEndpoints = {
  startSession: { path: `${BASE_URL}/api/screen-sharing/start-session`, method: "POST" },
  endSession: { path: `${BASE_URL}/api/screen-sharing/end-session`, method: "POST" },
  getSessionDetails: (sessionId: string) => ({ path: `${BASE_URL}/api/screen-sharing/session-details/${sessionId}`, method: "GET" }),
};