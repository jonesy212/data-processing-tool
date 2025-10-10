// AppDevelopmentActions.ts
import { Data } from '@/app/models/data/Data';
import { createAction, PayloadAction  } from "@reduxjs/toolkit";
import { Phase } from "@/app/models/phases/Phase";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// Generic type for actions
export type AppDevelopmentActionsType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  addSubPhase: PayloadAction<string>;
  removeSubPhase: PayloadAction<string>;
  updateSubPhase: PayloadAction<{ subPhaseId: number; newDetails: any }>;

  canTransitionTo: PayloadAction<{ nextPhase: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>;
  handleTransitionTo: PayloadAction<{ nextPhase: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>;

  resetIdleTimeout: PayloadAction<void>;
  activatePhase: PayloadAction<void>;
  deactivatePhase: PayloadAction<void>;

  fetchPhaseRequest: PayloadAction<number>;
  fetchPhaseSuccess: PayloadAction<{ phase: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>;
  fetchPhaseFailure: PayloadAction<{ error: string }>;

  updatePhaseRequest: PayloadAction<{ phaseId: number; phaseData: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>;
  updatePhaseSuccess: PayloadAction<{ phase: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>;
  updatePhaseFailure: PayloadAction<{ error: string }>;

  batchFetchPhasesRequest: PayloadAction<void>;
  batchFetchPhasesSuccess: PayloadAction<{ phases: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] }>;
  batchFetchPhasesFailure: PayloadAction<{ error: string }>;

  batchUpdatePhasesRequest: PayloadAction<{ ids: number[]; newPhases: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] }>;
  batchUpdatePhasesSuccess: PayloadAction<{ phases: Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] }>;
  batchUpdatePhasesFailure: PayloadAction<{ error: string }>;

  batchRemovePhasesRequest: PayloadAction<number[]>;
  batchRemovePhasesSuccess: PayloadAction<number[]>;
  batchRemovePhasesFailure: PayloadAction<{ error: string }>;

  updatePhaseDetails: PayloadAction<Phase<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;
  updatePhaseStatus: PayloadAction<"pending" | "inProgress" | "completed">;
  updatePhaseName: PayloadAction<string>;
};

// Constant with generic inference
export const AppDevelopmentActions = {
  addSubPhase: createAction<string>("addSubPhase"),
  removeSubPhase: createAction<string>("removeSubPhase"),
  updateSubPhase: createAction<{ subPhaseId: number; newDetails: any }>("updateSubPhase"),

  canTransitionTo: createAction<{ nextPhase: Phase<any> }>("canTransitionTo"),
  handleTransitionTo: createAction<{ nextPhase: Phase<any> }>("handleTransitionTo"),

  resetIdleTimeout: createAction("resetIdleTimeout"),
  activatePhase: createAction("activatePhase"),
  deactivatePhase: createAction("deactivatePhase"),

  fetchPhaseRequest: createAction<number>("fetchPhaseRequest"),
  fetchPhaseSuccess: createAction<{ phase: Phase<any> }>("fetchPhaseSuccess"),
  fetchPhaseFailure: createAction<{ error: string }>("fetchPhaseFailure"),

  updatePhaseRequest: createAction<{ phaseId: number; phaseData: Phase<any> }>("updatePhaseRequest"),
  updatePhaseSuccess: createAction<{ phase: Phase<any> }>("updatePhaseSuccess"),
  updatePhaseFailure: createAction<{ error: string }>("updatePhaseFailure"),

  batchFetchPhasesRequest: createAction("batchFetchPhasesRequest"),
  batchFetchPhasesSuccess: createAction<{ phases: Phase<any>[] }>("batchFetchPhasesSuccess"),
  batchFetchPhasesFailure: createAction<{ error: string }>("batchFetchPhasesFailure"),

  batchUpdatePhasesRequest: createAction<{ ids: number[]; newPhases: Phase<any>[] }>("batchUpdatePhasesRequest"),
  batchUpdatePhasesSuccess: createAction<{ phases: Phase<any>[] }>("batchUpdatePhasesSuccess"),
  batchUpdatePhasesFailure: createAction<{ error: string }>("batchUpdatePhasesFailure"),

  batchRemovePhasesRequest: createAction<number[]>("batchRemovePhasesRequest"),
  batchRemovePhasesSuccess: createAction<number[]>("batchRemovePhasesSuccess"),
  batchRemovePhasesFailure: createAction<{ error: string }>("batchRemovePhasesFailure"),

  updatePhaseDetails: createAction<Phase<any>>("updatePhaseDetails"),
  updatePhaseStatus: createAction<"pending" | "inProgress" | "completed">("updatePhaseStatus"),
  updatePhaseName: createAction<string>("updatePhaseName"),
};
