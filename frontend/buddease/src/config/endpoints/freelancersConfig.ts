// freelancersConfig.ts
import { FreelancersEndpoints } from '../types/categories/FreelancersEndpoints';
import { BASE_URL } from './baseUrl';

export const freelancersConfig: FreelancersEndpoints = {
  list: { path: `${BASE_URL}/api/freelancers`, method: "GET" },
  single: (freelancerId: number) => ({ path: `${BASE_URL}/api/freelancers/${freelancerId}`, method: "GET" }),
  submitProposal: { path: `${BASE_URL}/api/freelancers/submit-proposal`, method: "POST" },
  engageInDiscussion: { path: `${BASE_URL}/api/freelancers/engage-discussion`, method: "POST" },
  joinProject: (projectId: number) => ({ path: `${BASE_URL}/api/freelancers/projects/${projectId}/join`, method: "POST" }),
};