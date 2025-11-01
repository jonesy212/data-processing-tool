// MarkerEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface MarkerEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  fetchMarkers: EndpointConfig;
  addMarker: EndpointConfig;
  removeMarker: (markerId: number) => EndpointConfig;
}