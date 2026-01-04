GeneratorsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface GeneratorsEndpoints extends EndpointCategoryConfig {
  generateTransferToken: EndpointConfig;
}