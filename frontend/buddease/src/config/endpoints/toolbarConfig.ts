// toolbarConfig.ts
import { ToolbarEndpoints } from '../types/categories/ToolbarEndpoints';
import { BASE_URL } from './baseUrl';

export const toolbarConfig: ToolbarEndpoints = {
  fetchToolbarSize: { path: `${BASE_URL}/api/toolbar/size`, method: "GET" },
  updateToolbarSize: { path: `${BASE_URL}/api/toolbar/size`, method: "PUT" },
};