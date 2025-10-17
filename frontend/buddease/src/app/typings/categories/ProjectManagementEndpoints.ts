// ProjectManagementEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ProjectManagementEndpoints {
  createProject: EndpointConfig;
  updateProject: (projectId: number) => EndpointConfig;
  deleteProject: (projectId: number) => EndpointConfig;
  getProjectDetails: (projectId: number) => EndpointConfig;
  listProjects: EndpointConfig;
}