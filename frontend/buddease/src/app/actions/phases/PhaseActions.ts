// PhaseActions.ts
// phases/PhaseActions.ts
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { AppPhase } from '@/app/typings/entities/PhaseEntity';
import { createAction, PayloadAction } from "@reduxjs/toolkit";

export const PhaseActions = {

  // Additional actions similar to TodoActions
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),
  performPhaseActions: createAction<string | null>("performPhaseActions"),
  
  // Actions for handling transitions and hooks
  canTransitionTo: createAction<{ nextPhase: AppPhase }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: AppPhase }>("handleTransitionTo"),
  setCurrentPhase: createAction<ProjectPhaseTypeEnum>("setCurrentPhase"),
  setNextPhase: createAction<ProjectPhaseTypeEnum>("setNextPhase"),
  
  // Additional actions for custom hooks
  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

  // Actions for phase management
  fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
  fetchPhaseSuccess: createAction<{ phase: AppPhase }>("fetchPhaseSuccess"),
  fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),

  updatePhaseRequest: createAction<{ phaseId: number; phaseData: AppPhase }>("updatePhaseRequest"),
  updatePhaseSuccess: createAction<{ phase: AppPhase }>("updatePhaseSuccess"),
  updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),

  // Batch actions for fetching, updating, and removing phases
  batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
  batchFetchPhasesSuccess: createAction<{ phases: AppPhase[] }>("batchFetchPhasesSuccess"),
  batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),

  batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: AppPhase[] }>("batchUpdatePhasesRequest"),
  batchUpdatePhasesSuccess: createAction<{ phases: AppPhase[] }>("batchUpdatePhasesSuccess"),
  batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),

  batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
  batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
  batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),

  // Additional actions similar to DataActions
  updatePhaseDetails: createAction<PayloadAction<AppPhase>>("updatePhaseDetails"),
  updatePhaseStatus: createAction<PayloadAction<"pending" | "inProgress" | "completed">>("updatePhaseStatus"),
  updatePhaseName: createAction<PayloadAction<string>>("updatePhaseName"),
  // Add more actions as needed
};
