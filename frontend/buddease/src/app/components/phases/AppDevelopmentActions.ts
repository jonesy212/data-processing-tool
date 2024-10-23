// AppDevelopmentActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { Phase } from "./Phase";
import { Data } from '@/app/components/models/data/Data';

export const AppDevelopmentActions = {
  // Actions for adding, removing, and updating sub-phases
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),

  // Actions for handling transitions and hooks
  canTransitionTo: createAction<{ nextPhase: Phase<Data> }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: Phase<Data> }>("handleTransitionTo"),

  // Additional actions for custom hooks
  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

  // Actions for phase management
  fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
  fetchPhaseSuccess: createAction<{ phase: Phase<Data> }>("fetchPhaseSuccess"),
  fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),

  updatePhaseRequest: createAction<{ phaseId: number; phaseData: Phase<Data> }>("updatePhaseRequest"),
  updatePhaseSuccess: createAction<{ phase: Phase<Data> }>("updatePhaseSuccess"),
  updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),

  // Batch actions for fetching, updating, and removing phases
  batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
  batchFetchPhasesSuccess: createAction<{ phases: Phase<Data>[] }>("batchFetchPhasesSuccess"),
  batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),

  batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: Phase<Data>[] }>("batchUpdatePhasesRequest"),
  batchUpdatePhasesSuccess: createAction<{ phases: Phase<Data>[] }>("batchUpdatePhasesSuccess"),
  batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),

  batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
  batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
  batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),

  // Additional actions similar to DataActions
  updatePhaseDetails: createAction<PayloadAction<Phase<Data>>>("updatePhaseDetails"),
  updatePhaseStatus: createAction<PayloadAction<"pending" | "inProgress" | "completed">>("updatePhaseStatus"),
  updatePhaseName: createAction<PayloadAction<string>>("updatePhaseName"),
  // Add more actions as needed
};
