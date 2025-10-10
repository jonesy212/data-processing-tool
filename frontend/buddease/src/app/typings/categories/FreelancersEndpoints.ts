// FreelancersEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface FreelancersEndpoints {
  list: EndpointConfig;
  single: (freelancerId: number) => EndpointConfig;
  submitProposal: EndpointConfig;
  engageInDiscussion: EndpointConfig;
  joinProject: (projectId: number) => EndpointConfig;
}