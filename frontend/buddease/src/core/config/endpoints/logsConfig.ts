logsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { LogsEndpoints } from '@/core/typings/categories/LogsEndpoints';

export const logsConfig: LogsEndpoints = {
  logSession: { path: `${BASE_URL}/api/log/session`, method: "POST" },
  logVideoEvent: { path: `${BASE_URL}/api/log/video-event`, method: "POST" },
  logAudioEvent: { path: `${BASE_URL}/api/log/audio-event`, method: "POST" },
  logChannelEvent: { path: `${BASE_URL}/api/log/channel-event`, method: "POST" },
  logDocumentEvent: { path: `${BASE_URL}/api/log/document-event`, method: "POST" },
  logCollaborationEvent: { path: `${BASE_URL}/api/log/collaboration-event`, method: "POST" },
  logCalendarEvent: { path: `${BASE_URL}/api/log/calendar-event`, method: "POST" },
  logCalendarEventUrl: { path: `${BASE_URL}/api/log/calendar-event-url`, method: "POST" },
};