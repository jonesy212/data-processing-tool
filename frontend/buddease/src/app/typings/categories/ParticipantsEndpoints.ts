// ParticipantsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ParticipantsEndpoints {
  single: (userId: string | number) => EndpointConfig;
}