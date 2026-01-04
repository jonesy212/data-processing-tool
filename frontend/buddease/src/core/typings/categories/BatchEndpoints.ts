BatchEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface BatchEndpoints extends EndpointCategoryConfig {
  fetchVideos: EndpointConfig;
  uploadVideos: EndpointConfig;
  addVideos: EndpointConfig;
  removeVideos: EndpointConfig;
  updateVideos: EndpointConfig;
}