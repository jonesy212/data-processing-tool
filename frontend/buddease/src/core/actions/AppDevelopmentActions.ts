// AppDevelopmentActions.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Data } from "@/core/models/data/Data";
import type { Phase } from "@/core/models/phases/Phase";
import { createAction } from "@reduxjs/toolkit";

// Hybrid generic defaults for convenience
type AppDefault = BaseDataEntity;
type DefaultK = AppDefault;
type DefaultMetaType = DefaultMeta<AppDefault, AppDefault>;
type DefaultAttachment = Attachment;
type DefaultExcluded = DefaultExcludedFields<AppDefault>;
type DefaultIncluded = keyof AppDefault;

export const AppDevelopmentActions = {
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),

  canTransitionTo: createAction<{ nextPhase: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>> }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>> }>("handleTransitionTo"),

  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

  fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
  fetchPhaseSuccess: createAction<{ phase: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>> }>("fetchPhaseSuccess"),
  fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),

  updatePhaseRequest: createAction<{ phaseId: number; phaseData: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>> }>("updatePhaseRequest"),
  updatePhaseSuccess: createAction<{ phase: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>> }>("updatePhaseSuccess"),
  updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),

  batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
  batchFetchPhasesSuccess: createAction<{ phases: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>>[] }>("batchFetchPhasesSuccess"),
  batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),

  batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>>[] }>("batchUpdatePhasesRequest"),
  batchUpdatePhasesSuccess: createAction<{ phases: Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>>[] }>("batchUpdatePhasesSuccess"),
  batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),

  batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
  batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
  batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),

  updatePhaseDetails: createAction<Phase<Data<AppDefault, DefaultK, DefaultMetaType, DefaultAttachment, DefaultExcluded, DefaultIncluded>>>("updatePhaseDetails"),
  updatePhaseStatus: createAction<"pending" | "inProgress" | "completed">("updatePhaseStatus"),
  updatePhaseName: createAction<string>("updatePhaseName"),
};