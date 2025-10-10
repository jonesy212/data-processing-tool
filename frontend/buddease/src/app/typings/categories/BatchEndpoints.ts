// BatchEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface BatchEndpoints {
  fetchVideos: EndpointConfig;
  uploadVideos: EndpointConfig;
  addVideos: EndpointConfig;
  removeVideos: EndpointConfig;
  updateVideos: EndpointConfig;
}