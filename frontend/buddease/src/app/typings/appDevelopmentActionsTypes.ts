// appDevelopmentActionsTypes.ts
// AppDevelopmentActionsType.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Data } from "@/app/models/data/Data";
import { Phase } from "@/app/models/phases/Phase";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { PayloadAction } from "@reduxjs/toolkit";

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
