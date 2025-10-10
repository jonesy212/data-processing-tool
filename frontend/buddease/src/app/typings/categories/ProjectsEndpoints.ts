// ProjectsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ProjectsEndpoints {
  list: EndpointConfig;
  single: (projectId: number) => EndpointConfig;
}