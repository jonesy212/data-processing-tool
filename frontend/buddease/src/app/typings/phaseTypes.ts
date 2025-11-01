// phaseTypes.ts
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { UniqueIDGenerator } from '@/app/generators/GenerateUniqueIds';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { PhaseData } from "@/app/models/phases/Phase";
import { Phase, CustomPhaseHooks } from '@/app/models/phases/Phase';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';

// Phase-specific type parameters
type PhaseEntity = BaseDataEntity;
type PhaseK = PhaseEntity;
type PhaseMeta = DefaultMeta<PhaseEntity, PhaseK>;
type PhaseAttachment = Attachment;
type PhaseExcludedFields = DefaultExcludedFields<PhaseEntity>;
type PhaseIncludedFields = keyof PhaseEntity;

// Base phase parameters type
type PhaseBaseParams = {
  T: PhaseEntity;
  K: PhaseK;
  Meta: PhaseMeta;
  AttachmentType: PhaseAttachment;
  ExcludedFields: PhaseExcludedFields;
  IncludedFields: PhaseIncludedFields;
};

// Core phase types using the pattern
type PhaseDataDefault = PhaseData<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;

type PhaseDefault = Phase<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;

type PhaseMetaDefault = PhaseMeta

type CustomPhaseHooksDefault = CustomPhaseHooks<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;


// Phase Metadata Types
type PhaseUnifiedMetadata = UnifiedMetadata<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'], 
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;

type PhaseStructuredMetadata = StructuredMetadata<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;



type AppPhase = Phase<
  PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields
>;

type AppPhaseData = PhaseData<
  PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields
>;

type AppPhaseMeta = PhaseMeta;

type CustomAppPhaseHooks = CustomPhaseHooks<
  PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields
>;


const phaseName = "default phase";
const generatePhaseId = UniqueIDGenerator.generatePhaseID(phaseName);
// Helper for creating phase instances
const createDefaultPhase = (options: Partial<PhaseDefault> = {}): PhaseDefault => ({
  id: options.id || generatePhaseId(),
  name: options.name || '',
  description: options.description || '',
  startDate: options.startDate,
  endDate: options.endDate,
  subPhases: options.subPhases || [],
  isActive: options.isActive ?? false,
  isComplete: options.isComplete ?? false,
  ...options
} as PhaseDefault);

// Empty/default phase
const emptyPhase: PhaseDefault = createDefaultPhase();


export type {
  AppPhase,
  AppPhaseData,
  AppPhaseMeta,
  CustomAppPhaseHooks, PhaseAttachment, PhaseBaseParams, PhaseDefault, PhaseEntity, PhaseExcludedFields,
  PhaseIncludedFields, PhaseK,
  PhaseMeta,
  PhaseStructuredMetadata
};
