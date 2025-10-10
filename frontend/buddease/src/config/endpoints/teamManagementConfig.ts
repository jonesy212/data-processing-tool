// teamManagementConfig.ts
import { TeamManagementEndpoints } from '../types/categories/TeamManagementEndpoints';
import { BASE_URL } from './baseUrl';

export const teamManagementConfig: TeamManagementEndpoints = {
  list: { path: `${BASE_URL}/api/team-management`, method: "GET" },
  single: (teamId: number) => ({ path: `${BASE_URL}/api/team-management/${teamId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/team-management`, method: "POST" },
  remove: (teamId: number) => ({ path: `${BASE_URL}/api/team-management/${teamId}`, method: "DELETE" }),
  update: (teamId: number) => ({ path: `${BASE_URL}/api/team-management/${teamId}`, method: "PUT" }),
  createTeam: { path: `${BASE_URL}/api/team-management/create-team`, method: "POST" },
  deleteTeam: (teamId: number) => ({ path: `${BASE_URL}/api/team-management/${teamId}`, method: "DELETE" }),
  fetchTeamMemberData: { path: `${BASE_URL}/api/team-management/teammember-data`, method: "GET" },
};