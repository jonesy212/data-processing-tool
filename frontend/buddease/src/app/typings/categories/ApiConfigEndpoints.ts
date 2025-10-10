// ApiConfigEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ApiConfigEndpoints {
  getUserApiConfig: EndpointConfig;
  updateUserApiConfig: EndpointConfig;
  aquaConfig: EndpointConfig;
}