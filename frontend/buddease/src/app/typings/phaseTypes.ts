// phaseTypes.ts

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

type PhaseMetaDefault = PhaseMeta<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;

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

type AppPhaseMeta = PhaseMeta<
  PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields
>;

type CustomAppPhaseHooks = CustomPhaseHooks<
  PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields
>;


// Helper for creating phase instances
const createDefaultPhase = (options: Partial<PhaseDefault> = {}): PhaseDefault => ({
  id: options.id || generateId(),
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
  PhaseEntity,
  PhaseK, 
  PhaseMeta,
  PhaseAttachment,
  PhaseExcludedFields,
  PhaseIncludedFields,
  PhaseBaseParams,
  AppPhase,          
  AppPhaseData,      
  AppPhaseMeta,      
  CustomAppPhaseHooks
};