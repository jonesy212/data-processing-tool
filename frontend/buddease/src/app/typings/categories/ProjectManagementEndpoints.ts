// ProjectManagementEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ProjectManagementEndpoints {
  createProject: EndpointConfig;
  updateProject: (projectId: number) => EndpointConfig;
  deleteProject: (projectId: number) => EndpointConfig;
  getProjectDetails: (projectId: number) => EndpointConfig;
  listProjects: EndpointConfig;
}