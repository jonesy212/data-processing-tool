// configConfig.ts
// src/config/endpoints/configConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { EndpointConfigurations } from '@/app/config/EndpointConfig';

export const configConfig: EndpointConfigurations['config'] = {
  getSystemConfigs: { path: `${BASE_URL}/api/config/system`, method: "GET" },
  getUserConfigs: { path: `${BASE_URL}/api/config/user`, method: "GET" },
  getUserSettings: { path: `${BASE_URL}/api/config/settings`, method: "GET" },
};
