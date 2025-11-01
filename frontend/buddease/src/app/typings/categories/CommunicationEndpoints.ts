// CommunicationEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface CommunicationEndpoints extends EndpointCategoryConfig {
  audioCall: EndpointConfig;
  videoCall: EndpointConfig;
  textChat: EndpointConfig;
  collaboration: EndpointConfig;
  startSession: EndpointConfig;
  endSession: EndpointConfig;
  getSessionDetails: (sessionId: string) => EndpointConfig;
  uploadFile: EndpointConfig;
  downloadFile: (fileId: string) => EndpointConfig;
  getUserPresence: (userId: string) => EndpointConfig;
  setUserPresence: EndpointConfig;
  sendNotification: EndpointConfig;
  getNotifications: EndpointConfig;
  markNotificationAsRead: (notificationId: string) => EndpointConfig;
  deleteNotification: (notificationId: string) => EndpointConfig;
  shareFile: EndpointConfig;
  whiteboard: EndpointConfig;
  realTimeEditing: EndpointConfig;
  screenSharing: EndpointConfig;
  userPresenceStatus: EndpointConfig;
  pushNotifications: EndpointConfig;
  communityForums: EndpointConfig;
  analytics: EndpointConfig;
}