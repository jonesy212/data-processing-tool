// ProjectManagementEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ProjectManagementEndpoints extends EndpointCategoryConfig {
  createProject: EndpointConfig;
  updateProject: (projectId: number) => EndpointConfig;
  deleteProject: (projectId: number) => EndpointConfig;
  getProjectDetails: (projectId: number) => EndpointConfig;
  listProjects: EndpointConfig;
}