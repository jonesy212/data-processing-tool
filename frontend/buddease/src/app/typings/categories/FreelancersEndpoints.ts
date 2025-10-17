// FreelancersEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface FreelancersEndpoints {
  list: EndpointConfig;
  single: (freelancerId: number) => EndpointConfig;
  submitProposal: EndpointConfig;
  engageInDiscussion: EndpointConfig;
  joinProject: (projectId: number) => EndpointConfig;
}