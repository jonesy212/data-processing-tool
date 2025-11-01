// themeConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ThemeEndpoints } from '@/app/typings/categories/ThemeEndpoints';

export const themeConfig: ThemeEndpoints = {
  list: { path: `${BASE_URL}/api/themes`, method: "GET" },
  single: (themeId: number) => ({ path: `${BASE_URL}/api/themes/${themeId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/themes`, method: "POST" },
  remove: (themeId: number) => ({ path: `${BASE_URL}/api/themes/${themeId}`, method: "DELETE" }),
  settings: { path: `${BASE_URL}/api/theme-settings`, method: "GET" },
  updateSettings: { path: `${BASE_URL}/api/theme-settings/update`, method: "PUT" },
};