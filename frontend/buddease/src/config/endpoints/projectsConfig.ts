// projectsConfig.ts
import { ProjectsEndpoints } from '../types/categories/ProjectsEndpoints';

export const projectsConfig: ProjectsEndpoints = {
  list: { path: "/news", method: "GET" },
  single: (projectId: number) => ({ path: `/projects/${projectId}`, method: "GET" }),
};