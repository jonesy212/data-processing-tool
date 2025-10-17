// MarkerEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface MarkerEndpoints {
  list: EndpointConfig;
  fetchMarkers: EndpointConfig;
  addMarker: EndpointConfig;
  removeMarker: (markerId: number) => EndpointConfig;
}