// GlobalCollaborationEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface GlobalCollaborationEndpoints extends EndpointCategoryConfig {
  startProject: EndpointConfig;
  getProjects: EndpointConfig;
  getProjectDetails: (projectId: string) => EndpointConfig;
  updateProjectDetails: (projectId: string) => EndpointConfig;
  deleteProject: (projectId: string) => EndpointConfig;
  translateContent: EndpointConfig;
  culturalAdaptation: EndpointConfig;
}