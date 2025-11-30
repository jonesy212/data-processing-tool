// VideosEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface VideosEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  uploadVideo: EndpointConfig;
  single: (videoId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (videoId: string) => EndpointConfig;
  update: (videoId: string) => EndpointConfig;
  conference: EndpointCategoryConfig;
  messages: EndpointCategoryConfig;
  annotations: EndpointCategoryConfig;
  playback: EndpointCategoryConfig;
  analytics: EndpointConfig;
  live: EndpointCategoryConfig;
  edit: EndpointConfig;
  transcribe: EndpointConfig;
  collaboration: EndpointCategoryConfig;
  manage: EndpointConfig;
  updateVideoTags: EndpointConfig;
}