// BatchEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface BatchEndpoints extends EndpointCategoryConfig {
  fetchVideos: EndpointConfig;
  uploadVideos: EndpointConfig;
  addVideos: EndpointConfig;
  removeVideos: EndpointConfig;
  updateVideos: EndpointConfig;
}