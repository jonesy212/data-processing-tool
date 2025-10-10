// moderatorsConfig.ts
import { ModeratorsEndpoints } from '../types/categories/ModeratorsEndpoints';
import { BASE_URL } from './baseUrl';

export const moderatorsConfig: ModeratorsEndpoints = {
  list: { path: `${BASE_URL}/api/moderators`, method: "GET" },
  single: (moderatorId: number) => ({ path: `${BASE_URL}/api/moderators/${moderatorId}`, method: "GET" }),
  manageCommunity: { path: `${BASE_URL}/api/moderators/manage-community`, method: "POST" },
  moderateContent: { path: `${BASE_URL}/api/moderators/moderate-content`, method: "POST" },
  participateInDecisions: { path: `${BASE_URL}/api/moderators/participate-decisions`, method: "POST" },
};