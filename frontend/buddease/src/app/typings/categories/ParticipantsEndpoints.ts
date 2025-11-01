// ParticipantsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ParticipantsEndpoints extends EndpointCategoryConfig {
  single: (userId: string | number) => EndpointConfig;
}