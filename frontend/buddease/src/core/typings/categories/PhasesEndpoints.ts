PhasesEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface PhasesEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (phaseId: number) => EndpointConfig;
  add: EndpointConfig;
  remove: (phaseId: number) => EndpointConfig;
  update: (phaseId: number) => EndpointConfig;
  createPhase: EndpointConfig;
  updatePhase: (phaseId: number) => EndpointConfig;
  deletePhase: (phaseId: number) => EndpointConfig;
  getPhaseDetails: (phaseId: number) => EndpointConfig;
  addSuccess: EndpointConfig;
  addFailure: EndpointConfig;
  bulkAssign: EndpointConfig;
  bulkUnassign: EndpointConfig;
  search: EndpointConfig;
}