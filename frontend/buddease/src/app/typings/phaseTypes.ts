// phaseTypes.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { CustomPhaseHooks, Phase, PhaseData } from "@/app/models/phases/Phase";
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { DocumentPhaseTypeEnum } from "@/app/documents/editing/DocumentPhaseType";
import { ProgressPhase } from '@/app/models/tracker/ProgressBar'


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
  id: options.id || generatePhaseId,
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



export enum PhaseType {
  Ideation = 'ideation',
  Planning = 'planning',
  Execution = 'execution',
  Review = 'review',
  Completion = 'completion',
  Development = 'development',
  Testing = 'testing',
  Deployment = 'deployment',
  Maintenance = 'maintenance'
}

// Unified PhaseType type
export type UnifiedPhaseType = 
  | ProjectPhaseTypeEnum 
  | ProgressPhase 
  | DocumentPhaseTypeEnum 
  | string 
  | undefined;; // Allow string for flexibility

// Default phase type
export type PhaseDefaultEnum = UnifiedPhaseType | undefined;

export type {
  AppPhase,
  AppPhaseData,
  AppPhaseMeta,
  CustomAppPhaseHooks, PhaseAttachment, PhaseBaseParams, PhaseDefault, PhaseEntity, PhaseExcludedFields,
  PhaseIncludedFields, PhaseK,
  PhaseMeta,
  PhaseStructuredMetadata,
};

