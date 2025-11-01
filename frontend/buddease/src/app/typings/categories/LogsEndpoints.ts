// LogsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface LogsEndpoints extends EndpointCategoryConfig {
  logSession: EndpointConfig;
  logVideoEvent: EndpointConfig;
  logAudioEvent: EndpointConfig;
  logChannelEvent: EndpointConfig;
  logDocumentEvent: EndpointConfig;
  logCollaborationEvent: EndpointConfig;
  logCalendarEvent: EndpointConfig;
  logCalendarEventUrl: EndpointConfig;
}