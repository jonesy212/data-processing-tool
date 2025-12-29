// ModeratorsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ModeratorsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (moderatorId: number) => EndpointConfig;
  manageCommunity: EndpointConfig;
  moderateContent: EndpointConfig;
  participateInDecisions: EndpointConfig;
}