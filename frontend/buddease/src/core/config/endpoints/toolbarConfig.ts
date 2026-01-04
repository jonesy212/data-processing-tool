toolbarConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { ToolbarEndpoints } from '@/core/typings/categories/ToolbarEndpoints';

export const toolbarConfig: ToolbarEndpoints = {
  fetchToolbarSize: { path: `${BASE_URL}/api/toolbar/size`, method: "GET" },
  updateToolbarSize: { path: `${BASE_URL}/api/toolbar/size`, method: "PUT" },
};