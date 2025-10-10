// DataProvidersEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DataProvidersEndpoints {
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