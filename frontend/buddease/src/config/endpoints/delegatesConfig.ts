// delegatesConfig.ts
import { DelegatesEndpoints } from '../types/categories/DelegatesEndpoints';

export const delegatesConfig: DelegatesEndpoints = {
  list: { path: "/api/delegates", method: "GET" },
  single: (delegateId: number) => ({ path: `/api/delegates/${delegateId}`, method: "GET" }),
  add: { path: "/api/delegates/add", method: "POST" },
  remove: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/remove`, method: "DELETE" }),
  update: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/update`, method: "PUT" }),
  updateList: { path: "/api/delegates/updateList", method: "POST" },
  search: { path: "/api/delegates/search", method: "POST" },
  updateRole: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/updateRole`, method: "PUT" }),
  updateRoles: (delegateIds: number[]) => ({ path: "/api/delegates/updateRoles", method: "POST", body: delegateIds }),
  fetch: { path: "/api/delegates/fetch", method: "GET" },
  create: { path: "/api/delegates/create", method: "POST" },
  delete: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/delete`, method: "DELETE" }),
  fetchById: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/fetchById`, method: "GET" }),
};