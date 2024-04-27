// phases/PhaseActions.ts
import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Phase } from "./Phase";

export const PhaseActions = {
 
  // Additional actions similar to TodoActions
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),
  performPhaseActions: createAction<string | null>("performPhaseActions"),
  // Actions for handling transitions and hooks
  canTransitionTo: createAction<{ nextPhase: Phase }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: Phase }>("handleTransitionTo"),
  setCurrentPhase: createAction<ProjectPhaseTypeEnum>("setCurrentPhase"),
  setNextPhase: createAction<ProjectPhaseTypeEnum>("setNextPhase"),
  // Additional actions for custom hooks
  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

    // Actions for phase management
    fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
    fetchPhaseSuccess: createAction<{ phase: Phase }>("fetchPhaseSuccess"),
    fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),
  
    updatePhaseRequest: createAction<{ phaseId: number; phaseData: Phase }>("updatePhaseRequest"),
    updatePhaseSuccess: createAction<{ phase: Phase }>("updatePhaseSuccess"),
    updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),
  
    // Batch actions for fetching, updating, and removing phases
    batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
    batchFetchPhasesSuccess: createAction<{ phases: Phase[] }>("batchFetchPhasesSuccess"),
    batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),
  
    batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: Phase[] }>("batchUpdatePhasesRequest"),
    batchUpdatePhasesSuccess: createAction<{ phases: Phase[] }>("batchUpdatePhasesSuccess"),
    batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),
  
    batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
    batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
    batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),
  
    // Additional actions similar to DataActions
    updatePhaseDetails: createAction<PayloadAction<Phase>>("updatePhaseDetails"),
    updatePhaseStatus: createAction<PayloadAction<"pending" | "inProgress" | "completed">>("updatePhaseStatus"),
    updatePhaseName: createAction<PayloadAction<string>>("updatePhaseName"),
    // Add more actions as needed
  
  // Add more actions as needed
};
