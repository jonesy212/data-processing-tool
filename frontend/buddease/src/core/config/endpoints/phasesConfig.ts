phasesConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { PhasesEndpoints } from '@/core/typings/categories/PhasesEndpoints';

export const phasesConfig: PhasesEndpoints = {
  list: { path: `${BASE_URL}/api/phases`, method: "GET" },
  single: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/phases`, method: "POST" },
  remove: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}`, method: "DELETE" }),
  update: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}`, method: "PUT" }),
  createPhase: { path: `${BASE_URL}/api/phases/create`, method: "POST" },
  updatePhase: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}/update`, method: "PUT" }),
  deletePhase: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}/delete`, method: "DELETE" }),
  getPhaseDetails: (phaseId: number) => ({ path: `${BASE_URL}/api/phases/${phaseId}`, method: "GET" }),
  addSuccess: { path: `${BASE_URL}/api/phases/add-success`, method: "POST" },
  addFailure: { path: `${BASE_URL}/api/phases/add-failure`, method: "POST" },
  bulkAssign: { path: `${BASE_URL}/api/phases/bulk-assign`, method: "POST" },
  bulkUnassign: { path: `${BASE_URL}/api/phases/bulk-unassign`, method: "POST" },
  search: { path: `${BASE_URL}/api/phases/search`, method: "POST" },
};