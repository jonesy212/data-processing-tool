// MonetizationEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface MonetizationEndpoints extends EndpointCategoryConfig {
  startClientProject: EndpointConfig;
  getClientProjects: EndpointConfig;
  getClientProjectDetails: (projectId: string) => EndpointConfig;
  updateClientProject: (projectId: string) => EndpointConfig;
  deleteClientProject: (projectId: string) => EndpointConfig;
  sendGift: (userId: string, giftId: string) => EndpointConfig;
  getReceivedGifts: (userId: string) => EndpointConfig;
  redeemGift: (giftId: string) => EndpointConfig;
}