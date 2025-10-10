// ModeratorsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ModeratorsEndpoints {
  list: EndpointConfig;
  single: (moderatorId: number) => EndpointConfig;
  manageCommunity: EndpointConfig;
  moderateContent: EndpointConfig;
  participateInDecisions: EndpointConfig;
}