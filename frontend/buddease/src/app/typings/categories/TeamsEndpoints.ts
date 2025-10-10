// TeamsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface TeamsEndpoints {
  list: EndpointConfig;
  single: (teamId: number) => EndpointConfig;
  add: EndpointConfig;
  fetchTeamData: (teamId: number) => EndpointConfig;
  remove: (teamId: number) => EndpointConfig;
  update: (teamId: number) => EndpointConfig;
  updateTeams: (teamIds: number[]) => EndpointConfig;
}