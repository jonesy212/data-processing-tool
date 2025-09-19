// AppDevelopmentActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Phase } from "./Phase";
import { Data } from '@/app/components/models/data/Data';

export const AppDevelopmentActions<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
> = {
  // Actions for adding, removing, and updating sub-phases
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),

  // Actions for handling transitions and hooks
  canTransitionTo: createAction<{ nextPhase: Phase<Data<T, K, Meta, ExcludedFields>> }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: Phase<Data<T, K, Meta, ExcludedFields>> }>("handleTransitionTo"),

  // Additional actions for custom hooks
  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

  // Actions for phase management
  fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
  fetchPhaseSuccess: createAction<{ phase: Phase<Data<T, K, Meta, ExcludedFields>> }>("fetchPhaseSuccess"),
  fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),

  updatePhaseRequest: createAction<{ phaseId: number; phaseData: Phase<Data<T, K, Meta, ExcludedFields>> }>("updatePhaseRequest"),
  updatePhaseSuccess: createAction<{ phase: Phase<Data<T, K, Meta, ExcludedFields>> }>("updatePhaseSuccess"),
  updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),

  // Batch actions for fetching, updating, and removing phases
  batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
  batchFetchPhasesSuccess: createAction<{ phases: Phase<Data<T, K, Meta, ExcludedFields>>[] }>("batchFetchPhasesSuccess"),
  batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),

  batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: Phase<Data<T, K, Meta, ExcludedFields>>[] }>("batchUpdatePhasesRequest"),
  batchUpdatePhasesSuccess: createAction<{ phases: Phase<Data<T, K, Meta, ExcludedFields>>[] }>("batchUpdatePhasesSuccess"),
  batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),

  batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
  batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
  batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),

  // Additional actions similar to DataActions
  updatePhaseDetails: createAction<PayloadAction<Phase<Data<T, K, Meta, ExcludedFields>>>("updatePhaseDetails"),
  updatePhaseStatus: createAction<PayloadAction<"pending" | "inProgress" | "completed">>("updatePhaseStatus"),
  updatePhaseName: createAction<PayloadAction<string>>("updatePhaseName"),
  // Add more actions as needed
};
