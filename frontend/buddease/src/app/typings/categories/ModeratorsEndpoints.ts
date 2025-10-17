// ModeratorsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ModeratorsEndpoints {
  list: EndpointConfig;
  single: (moderatorId: number) => EndpointConfig;
  manageCommunity: EndpointConfig;
  moderateContent: EndpointConfig;
  participateInDecisions: EndpointConfig;
}