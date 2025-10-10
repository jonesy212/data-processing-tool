// themeConfig.ts
import { ThemeEndpoints } from '../types/categories/ThemeEndpoints';
import { BASE_URL } from './baseUrl';

export const themeConfig: ThemeEndpoints = {
  list: { path: `${BASE_URL}/api/themes`, method: "GET" },
  single: (themeId: number) => ({ path: `${BASE_URL}/api/themes/${themeId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/themes`, method: "POST" },
  remove: (themeId: number) => ({ path: `${BASE_URL}/api/themes/${themeId}`, method: "DELETE" }),
  settings: { path: `${BASE_URL}/api/theme-settings`, method: "GET" },
  updateSettings: { path: `${BASE_URL}/api/theme-settings/update`, method: "PUT" },
};