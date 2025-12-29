// FreelancersEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface FreelancersEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (freelancerId: number) => EndpointConfig;
  submitProposal: EndpointConfig;
  engageInDiscussion: EndpointConfig;
  joinProject: (projectId: number) => EndpointConfig;
}