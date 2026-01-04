projectManagementConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { ProjectManagementEndpoints } from '@/core/typings/categories/ProjectManagementEndpoints';

export const projectManagementConfig: ProjectManagementEndpoints = {
  createProject: { path: `${BASE_URL}/api/project-management/create`, method: "POST" },
  updateProject: (projectId: number) => ({ path: `${BASE_URL}/api/project-management/${projectId}/update`, method: "PUT" }),
  deleteProject: (projectId: number) => ({ path: `${BASE_URL}/api/project-management/${projectId}/delete`, method: "DELETE" }),
  getProjectDetails: (projectId: number) => ({ path: `${BASE_URL}/api/project-management/${projectId}`, method: "GET" }),
  listProjects: { path: `${BASE_URL}/api/project-management/projects`, method: "GET" },
};