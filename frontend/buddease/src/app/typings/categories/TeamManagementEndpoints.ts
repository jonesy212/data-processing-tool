// TeamManagementEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface TeamManagementEndpoints {
  list: EndpointConfig;
  single: (teamId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (teamId: number) => EndpointConfig;
  update: (teamId: number) => EndpointConfig;
  createTeam: EndpointConfig;
  deleteTeam: (teamId: number) => EndpointConfig;
  fetchTeamMemberData: EndpointConfig;
}