// BatchEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface BatchEndpoints {
  fetchVideos: EndpointConfig;
  uploadVideos: EndpointConfig;
  addVideos: EndpointConfig;
  removeVideos: EndpointConfig;
  updateVideos: EndpointConfig;
}