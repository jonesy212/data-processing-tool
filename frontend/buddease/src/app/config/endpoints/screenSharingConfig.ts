// screenSharingConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ScreenSharingEndpoints } from '@/app/typings/categories/ScreenSharingEndpoints';

export const screenSharingConfig: ScreenSharingEndpoints = {
  startSession: { path: `${BASE_URL}/api/screen-sharing/start-session`, method: "POST" },
  endSession: { path: `${BASE_URL}/api/screen-sharing/end-session`, method: "POST" },
  getSessionDetails: (sessionId: string) => ({ path: `${BASE_URL}/api/screen-sharing/session-details/${sessionId}`, method: "GET" }),
};