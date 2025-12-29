// DataProvidersEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DataProvidersEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (providerId: string) => EndpointConfig;
  create: EndpointConfig;
  update: (providerId: string) => EndpointConfig;
  delete: (providerId: string) => EndpointConfig;
  getMany: EndpointConfig;
  createMany: EndpointConfig;
  updateMany: EndpointConfig;
  deleteMany: EndpointConfig;
}