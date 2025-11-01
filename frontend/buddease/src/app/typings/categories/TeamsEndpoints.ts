// TeamsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface TeamsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (teamId: number) => EndpointConfig;
  add: EndpointConfig;
  fetchTeamData: (teamId: number) => EndpointConfig;
  remove: (teamId: number) => EndpointConfig;
  update: (teamId: number) => EndpointConfig;
  updateTeams: (teamIds: number[]) => EndpointConfig;
}