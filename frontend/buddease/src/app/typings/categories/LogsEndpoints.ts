// LogsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

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