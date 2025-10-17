// GlobalCollaborationEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface GlobalCollaborationEndpoints {
  startProject: EndpointConfig;
  getProjects: EndpointConfig;
  getProjectDetails: (projectId: string) => EndpointConfig;
  updateProjectDetails: (projectId: string) => EndpointConfig;
  deleteProject: (projectId: string) => EndpointConfig;
  translateContent: EndpointConfig;
  culturalAdaptation: EndpointConfig;
}