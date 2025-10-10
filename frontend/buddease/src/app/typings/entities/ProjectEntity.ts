// ProjectEntity.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { StructuredMetadata, UnifiedMetadata } from "@/config/StructuredMetadata";
import { Snapshot, SnapshotStore, SnapshotWithCriteria, SnapshotStoreConfig, SnapshotData } from "@/app/snapshots";
import { SubscriberCollection } from "@/app/subscribers/SubscriberCollection";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import { CalendarManagerStoreClass, CalendarEvent, StatusType, AnalysisTypeEnum } from "@/app/calendar";

// -------------------
// Project Entity Type
// -------------------
type ProjectEntity = BaseDataEntity & {
  projectName: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: string;
  description?: string;
  teamMembers?: string[]; // references to Member IDs
  tasks?: string[];       // references to Task IDs
  milestones?: string[];
  videos?: string[];
  projectId?: number;
  contributors?: string[];
  links?: string[];
  isActive?: boolean;
  permissions?: string[];
  customFields?: Record<string, any>;
};

// -------------------
// Type Aliases for Six Arguments
// -------------------
type ProjectK = ProjectEntity;
type ProjectMeta = DefaultMeta<ProjectEntity, ProjectK>;
type ProjectAttachment = Attachment;
type ProjectExcludedFields = DefaultExcludedFields<ProjectEntity>;
type ProjectIncludedFields = keyof ProjectEntity;


// -------------------
// Params Type
// -------------------
type ProjectBaseParams = {
  T: ProjectEntity;
  K: ProjectK;
  Meta: ProjectMeta;
  AttachmentType: ProjectAttachment;
  ExcludedFields: ProjectExcludedFields;
  IncludedFields: ProjectIncludedFields;
};

// ✅ CLEAN TYPE ALIASES
type ProjectFull = Project<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSnapshotFull = Snapshot<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSnapshotDataFull = SnapshotData<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSnapshotStoreFull = SnapshotStore<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSnapshotWithCriteriaFull = SnapshotWithCriteria<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSubscriberCollectionFull = SubscriberCollection<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectRealtimeDataItemFull = RealtimeDataItem<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

// Configuration types
type ProjectSnapshotStoreConfigFull = SnapshotStoreConfig<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

type ProjectSnapshotsArrayFull = SnapshotsArray<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

// PARAMS
type ProjectParams = SnapshotConfigParams<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

// Utility types
type ProjectSnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type ProjectSnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;


// -------------------
// Metadata Types
// -------------------
type ProjectUnifiedMetadata = UnifiedMetadata<
  ProjectBaseParams['T'],
  ProjectBaseParams['K'],
  ProjectBaseParams['Meta'],
  ProjectBaseParams['AttachmentType'],
  ProjectBaseParams['ExcludedFields'],
  ProjectBaseParams['IncludedFields']
>;

type ProjectStructuredMetadata = StructuredMetadata<
  ProjectBaseParams['T'],
  ProjectBaseParams['K'],
  ProjectBaseParams['Meta'],
  ProjectBaseParams['AttachmentType'],
  ProjectBaseParams['ExcludedFields'],
  ProjectBaseParams['IncludedFields']
>;

// -------------------
// Snapshot Types
// -------------------
type ProjectSnapshot = Snapshot<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type ProjectSnapshotStore = SnapshotStore<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type ProjectSnapshotWithCriteria = SnapshotWithCriteria<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type ProjectSnapshotData = SnapshotData<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type ProjectSubscriberCollection = SubscriberCollection<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;


// -------------------
// Config Types
// -------------------
type ProjectSnapshotStoreConfig = SnapshotStoreConfig<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
