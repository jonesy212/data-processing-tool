// PersonasEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface PersonasEndpoints extends EndpointCategoryConfig {
  selectedPersona: EndpointConfig;
}