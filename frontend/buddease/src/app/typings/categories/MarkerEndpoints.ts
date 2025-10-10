// MarkerEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface MarkerEndpoints {
  list: EndpointConfig;
  fetchMarkers: EndpointConfig;
  addMarker: EndpointConfig;
  removeMarker: (markerId: number) => EndpointConfig;
}