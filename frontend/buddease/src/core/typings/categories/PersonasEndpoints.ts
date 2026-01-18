// PersonasEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface PersonasEndpoints extends EndpointCategoryConfig {
  selectedPersona: EndpointConfig;
}