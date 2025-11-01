// VideosEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface VideosEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  uploadVideo: EndpointConfig;
  single: (videoId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (videoId: string) => EndpointConfig;
  update: (videoId: string) => EndpointConfig;
  conference: {
    create: EndpointConfig;
    join: EndpointConfig;
    end: EndpointConfig;
  };
  messages: {
    send: EndpointConfig;
    retrieve: EndpointConfig;
  };
  annotations: {
    add: EndpointConfig;
    retrieve: EndpointConfig;
  };
  playback: {
    speed: EndpointConfig;
    frame: EndpointConfig;
  };
  analytics: EndpointConfig;
  live: {
    start: EndpointConfig;
    end: EndpointConfig;
    status: EndpointConfig;
  };
  edit: EndpointConfig;
  transcribe: EndpointConfig;
  collaboration: {
    create: EndpointConfig;
    invite: EndpointConfig;
    join: EndpointConfig;
  };
  manage: EndpointConfig;
  updateVideoTags: EndpointConfig;
}