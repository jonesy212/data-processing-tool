// LogsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface LogsEndpoints {
  logSession: EndpointConfig;
  logVideoEvent: EndpointConfig;
  logAudioEvent: EndpointConfig;
  logChannelEvent: EndpointConfig;
  logDocumentEvent: EndpointConfig;
  logCollaborationEvent: EndpointConfig;
  logCalendarEvent: EndpointConfig;
  logCalendarEventUrl: EndpointConfig;
}