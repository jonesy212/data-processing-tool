// GeneratorsEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface GeneratorsEndpoints extends EndpointCategoryConfig {
  generateTransferToken: EndpointConfig;
}