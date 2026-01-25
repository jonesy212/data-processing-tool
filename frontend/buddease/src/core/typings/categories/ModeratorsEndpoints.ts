// ModeratorsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ModeratorsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (moderatorId: number) => EndpointConfig;
  manageCommunity: EndpointConfig;
  moderateContent: EndpointConfig;
  participateInDecisions: EndpointConfig;
}