// GlobalCollaborationEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface GlobalCollaborationEndpoints {
  startProject: EndpointConfig;
  getProjects: EndpointConfig;
  getProjectDetails: (projectId: string) => EndpointConfig;
  updateProjectDetails: (projectId: string) => EndpointConfig;
  deleteProject: (projectId: string) => EndpointConfig;
  translateContent: EndpointConfig;
  culturalAdaptation: EndpointConfig;
}