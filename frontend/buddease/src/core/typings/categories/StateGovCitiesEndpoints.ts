// StateGovCitiesEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface StateGovCitiesEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (cityId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (cityId: number) => EndpointConfig;
  update: (cityId: number) => EndpointConfig;
}