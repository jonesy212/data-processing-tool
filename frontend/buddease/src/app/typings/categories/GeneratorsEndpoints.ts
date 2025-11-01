// GeneratorsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface GeneratorsEndpoints extends EndpointCategoryConfig {
  generateTransferToken: EndpointConfig;
}