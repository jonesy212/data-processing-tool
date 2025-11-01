// ApiConfigEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ApiConfigEndpoints extends EndpointCategoryConfig {
  getUserApiConfig: EndpointConfig;
  updateUserApiConfig: EndpointConfig;
  aquaConfig: EndpointConfig;
}