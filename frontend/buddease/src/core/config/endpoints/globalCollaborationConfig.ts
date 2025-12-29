// globalCollaborationConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { GlobalCollaborationEndpoints } from '@/core/typings/categories/GlobalCollaborationEndpoints';

export const globalCollaborationConfig: GlobalCollaborationEndpoints = {
  startProject: { path: `${BASE_URL}/api/global-collaboration/start-project`, method: "POST" },
  getProjects: { path: `${BASE_URL}/api/global-collaboration/projects`, method: "GET" },
  getProjectDetails: (projectId: string) => ({ path: `${BASE_URL}/api/global-collaboration/projects/${projectId}`, method: "GET" }),
  updateProjectDetails: (projectId: string) => ({ path: `${BASE_URL}/api/global-collaboration/projects/${projectId}`, method: "PUT" }),
  deleteProject: (projectId: string) => ({ path: `${BASE_URL}/api/global-collaboration/projects/${projectId}`, method: "DELETE" }),
  translateContent: { path: `${BASE_URL}/api/global-collaboration/translate`, method: "POST" },
  culturalAdaptation: { path: `${BASE_URL}/api/global-collaboration/adapt`, method: "POST" },
};
