// communicationConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { CommunicationEndpoints } from '@/core/typings/categories/CommunicationEndpoints';

export const communicationConfig: CommunicationEndpoints = {
  audioCall: { path: `${BASE_URL}/api/communication/audio-call`, method: "POST" },
  videoCall: { path: `${BASE_URL}/api/communication/video-call`, method: "POST" },
  textChat: { path: `${BASE_URL}/api/communication/text-chat`, method: "POST" },
  collaboration: { path: `${BASE_URL}/api/communication/collaboration`, method: "POST" },
  startSession: { path: `${BASE_URL}/api/communication/start-session`, method: "POST" },
  endSession: { path: `${BASE_URL}/api/communication/end-session`, method: "POST" },
  getSessionDetails: (sessionId: string) => ({ path: `${BASE_URL}/api/communication/session-details/${sessionId}`, method: "GET" }),
  uploadFile: { path: `${BASE_URL}/api/communication/upload`, method: "POST" },
  downloadFile: (fileId: string) => ({ path: `${BASE_URL}/api/communication/download/${fileId}`, method: "GET" }),
  getUserPresence: (userId: string) => ({ path: `${BASE_URL}/api/communication/user-presence/${userId}`, method: "GET" }),
  setUserPresence: { path: `${BASE_URL}/api/communication/set-presence`, method: "POST" },
  sendNotification: { path: `${BASE_URL}/api/communication/send-notification`, method: "POST" },
  getNotifications: { path: `${BASE_URL}/api/communication/notifications`, method: "GET" },
  markNotificationAsRead: (notificationId: string) => ({ path: `${BASE_URL}/api/communication/notifications/mark-read/${notificationId}`, method: "PUT" }),
  deleteNotification: (notificationId: string) => ({ path: `${BASE_URL}/api/communication/notifications/delete/${notificationId}`, method: "DELETE" }),
  shareFile: { path: `${BASE_URL}/api/communication/share-file`, method: "POST" },
  whiteboard: { path: `${BASE_URL}/api/communication/whiteboard`, method: "POST" },
  realTimeEditing: { path: `${BASE_URL}/api/communication/real-time-editing`, method: "POST" },
  screenSharing: { path: `${BASE_URL}/api/communication/screen-sharing`, method: "POST" },
  userPresenceStatus: { path: `${BASE_URL}/api/communication/user-presence-status`, method: "GET" },
  pushNotifications: { path: `${BASE_URL}/api/communication/push-notifications`, method: "POST" },
  communityForums: { path: `${BASE_URL}/api/communication/community-forums`, method: "GET" },
  analytics: { path: `${BASE_URL}/api/communication/analytics`, method: "GET" },
};