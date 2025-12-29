// ParticipantsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ParticipantsEndpoints extends EndpointCategoryConfig {
  single: (userId: string | number) => EndpointConfig;
}