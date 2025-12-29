// ProjectEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Project } from "@/core/models/projects/Project";
import { SnapshotsArray, SnapshotUnion } from "@/core/snapshots/LocalStorageSnapshotStore";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from "@/core/snapshots/SnapshotConfigBuilder";
import { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { Resource } from '@/core/state/redux/slices/CollaborationSlice';
import { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import { ProjectData } from '@/core/typings/projectTypes';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
;

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
  title: string;
  projectScope?: string;
  resources?: Resource[];
  initialTasks?: any[];
};


type AppProject = Project<ProjectEntity, 
  ProjectK, 
  ProjectMeta, 
  ProjectAttachment, 
  ProjectExcludedFields, 
  ProjectIncludedFields
>;

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
type ProjectDataType = ProjectData<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

// -------------------
// Config Types
// -------------------
type ProjectSnapshotStoreConfig = SnapshotStoreConfig<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;

export type {
    ProjectAttachment, ProjectDataType, ProjectEntity, ProjectExcludedFields, ProjectFull, ProjectIncludedFields, ProjectK,
    ProjectMeta, ProjectParams, ProjectRealtimeDataItemFull, ProjectSnapshot, ProjectSnapshotData, ProjectSnapshotDataFull, ProjectSnapshotFromParams, ProjectSnapshotFull, ProjectSnapshotsArrayFull, ProjectSnapshotStore, ProjectSnapshotStoreConfig, ProjectSnapshotStoreConfigFull, ProjectSnapshotStoreFull, ProjectSnapshotUnionFromParams, ProjectSnapshotWithCriteria, ProjectSnapshotWithCriteriaFull, ProjectSubscriberCollection, ProjectSubscriberCollectionFull
};

