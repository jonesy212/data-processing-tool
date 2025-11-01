// TeamManagementEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface TeamManagementEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (teamId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (teamId: number) => EndpointConfig;
  update: (teamId: number) => EndpointConfig;
  createTeam: EndpointConfig;
  deleteTeam: (teamId: number) => EndpointConfig;
  fetchTeamMemberData: EndpointConfig;
}