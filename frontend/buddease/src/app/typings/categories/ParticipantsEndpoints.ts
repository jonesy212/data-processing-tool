// ParticipantsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ParticipantsEndpoints {
  single: (userId: string | number) => EndpointConfig;
}