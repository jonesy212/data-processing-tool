// MarkerEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface MarkerEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  fetchMarkers: EndpointConfig;
  addMarker: EndpointConfig;
  removeMarker: (markerId: number) => EndpointConfig;
}