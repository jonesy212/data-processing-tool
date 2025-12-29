// monetizationConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { MonetizationEndpoints } from '@/core/typings/categories/MonetizationEndpoints';

export const monetizationConfig: MonetizationEndpoints = {
  startClientProject: { path: `${BASE_URL}/api/monetization/start-client-project`, method: "POST" },
  getClientProjects: { path: `${BASE_URL}/api/monetization/client-projects`, method: "GET" },
  getClientProjectDetails: (projectId: string) => ({ path: `${BASE_URL}/api/monetization/client-projects/${projectId}`, method: "GET" }),
  updateClientProject: (projectId: string) => ({ path: `${BASE_URL}/api/monetization/client-projects/${projectId}`, method: "PUT" }),
  deleteClientProject: (projectId: string) => ({ path: `${BASE_URL}/api/monetization/client-projects/${projectId}`, method: "DELETE" }),
  sendGift: (userId: string, giftId: string) => ({ path: `${BASE_URL}/api/virtual-gifting/send-gift/${userId}/${giftId}`, method: "POST" }),
  getReceivedGifts: (userId: string) => ({ path: `${BASE_URL}/api/virtual-gifting/received-gifts/${userId}`, method: "GET" }),
  redeemGift: (giftId: string) => ({ path: `${BASE_URL}/api/virtual-gifting/redeem-gift/${giftId}`, method: "POST" }),
};