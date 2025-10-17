// ProjectsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ProjectsEndpoints {
  list: EndpointConfig;
  single: (projectId: number) => EndpointConfig;
}