// moderatorsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ModeratorsEndpoints } from '@/app/typings/categories/ModeratorsEndpoints';

export const moderatorsConfig: ModeratorsEndpoints = {
  list: { path: `${BASE_URL}/api/moderators`, method: "GET" },
  single: (moderatorId: number) => ({ path: `${BASE_URL}/api/moderators/${moderatorId}`, method: "GET" }),
  manageCommunity: { path: `${BASE_URL}/api/moderators/manage-community`, method: "POST" },
  moderateContent: { path: `${BASE_URL}/api/moderators/moderate-content`, method: "POST" },
  participateInDecisions: { path: `${BASE_URL}/api/moderators/participate-decisions`, method: "POST" },
};