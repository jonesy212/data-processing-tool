// teamsConfig.ts
import { TeamsEndpoints } from '@/core/typings/categories/TeamsEndpoints';

export const teamsConfig: TeamsEndpoints = {
  list: { path: "/api/teams", method: "GET" },
  single: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "GET" }),
  add: { path: "/api/teams", method: "POST" },
  fetchTeamData: (teamId: number) => ({ path: `/api/teams/${teamId}/data`, method: "GET" }),
  remove: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "DELETE" }),
  update: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "PUT" }),
  updateTeams: (teamIds: number[]) => ({ path: `/api/teams/${teamIds.join(",")}`, method: "PUT" }),
};