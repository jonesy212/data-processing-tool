// ParticipantsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ParticipantsEndpoints extends EndpointCategoryConfig {
  single: (userId: string | number) => EndpointConfig;
}