// StateGovCitiesEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface StateGovCitiesEndpoints {
  list: EndpointConfig;
  single: (cityId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (cityId: number) => EndpointConfig;
  update: (cityId: number) => EndpointConfig;
}