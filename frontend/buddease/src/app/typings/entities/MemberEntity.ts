// MemberEntity.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Member } from "@/app/models/members/Member";
import { CustomPhaseHooks, Phase, PhaseData } from '@/app/models/phases/Phase';
import { Project } from '@/app/models/projects/Project';
import { Task } from "@/app/models/tasks/Task";
import { UserRole } from "@/app/models/UserRole";
import { Permission } from '@/app/permissions/Permission';
import { Product } from '@/app/products/Product';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { PhaseMeta } from '../phaseTypes';
import { ProjectBudget } from '@/app/typings/projectTypes'
// Core Member type definitions
type MemberEntity = BaseDataEntity & {
  datasets?: string;
  tasks?: Task<any, any, any, any, any, any>[]; // Using any for flexibility with Task types
  questionnaireResponses?: any;
  userType: string;
  role?: string;
  permissions?: Permission[] | string[];
  joinDate?: Date;
  lastActive?: Date;
  status?: 'active' | 'inactive' | 'pending';
  // Add other member-specific fields
};

type MemberK = MemberEntity;
type MemberMeta = DefaultMeta<MemberEntity, MemberK>;
type MemberAttachment = Attachment;
type MemberExcludedFields = DefaultExcludedFields<MemberEntity>;
type MemberIncludedFields = keyof MemberEntity;

// Main parameters container
type MemberBaseParams = {
  T: MemberEntity;
  K: MemberK;
  Meta: MemberMeta;
  AttachmentType: MemberAttachment;
  ExcludedFields: MemberExcludedFields;
  IncludedFields: MemberIncludedFields;
};

// Helper type to extract UnifiedMetadata with Member types
type MemberUnifiedMetadata = UnifiedMetadata<
  MemberBaseParams['T'],
  MemberBaseParams['K'], 
  MemberBaseParams['Meta'],
  MemberBaseParams['AttachmentType'],
  MemberBaseParams['ExcludedFields'],
  MemberBaseParams['IncludedFields']
>;

// Helper type for StructuredMetadata
type MemberStructuredMetadata = StructuredMetadata<
  MemberBaseParams['T'],
  MemberBaseParams['K'],
  MemberBaseParams['Meta'],
  MemberBaseParams['AttachmentType'],
  MemberBaseParams['ExcludedFields'],
  MemberBaseParams['IncludedFields']
>;


// Core App Member Types
type AppMember = Phase<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;

type AppMemberData = PhaseData<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;

type AppMemberMeta = PhaseMeta;

type CustomAppMemberHooks = CustomPhaseHooks<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;


// Core snapshot types
type MemberSnapshot = Snapshot<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberSnapshotData = SnapshotData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberSnapshotStore = SnapshotStore<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberSnapshotWithCriteria = SnapshotWithCriteria<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberSubscriberCollection = SubscriberCollection<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberRealtimeDataItem = RealtimeDataItem<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;

// Configuration types
type MemberSnapshotStoreConfig = SnapshotStoreConfig<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;
type MemberSnapshotsArray = SnapshotsArray<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;

// PARAMS
type MemberParams = SnapshotConfigParams<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>;

// Utility to pick or omit fields dynamically
type MemberApplyFieldFilters<
  T extends BaseDataEntity,
  ExcludedFields extends keyof T = never,
  IncludedFields extends Exclude<keyof T, ExcludedFields> = Exclude<keyof T, ExcludedFields>
> = Pick<Omit<T, ExcludedFields>, IncludedFields>;

// Define the MemberData interface extending Member
interface MemberData<
  T extends BaseDataEntity = MemberEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Member {
  datasets?: string;
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  questionnaireResponses?: any;
  userType: string;
  role?: UserRole
  permissions?: Permission[] | string[];
  joinDate?: Date;
  lastActive?: Date;
  status?: 'active' | 'inactive' | 'pending';
  teamId?: string;
  prroducts?: Product<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  skills?: string[];

  budget: ProjectBudget, 
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], 
  currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  done: boolean
  // Add other fields specific to MemberData
}

// Default empty member data
const emptyMemberData: MemberData = {
  isAuthorized, uploadQuota, hasQuota, processingTasks,
  budget, phases, currentPhase, done,

  id: '',
  name: '',
  email: '',
  datasets: '',
  tasks: [],
  tier: "",
  username: "",
  roleInTeam: "",
  role: UserRole.Member,
  memberName: "",
  questionnaireResponses: undefined,
  userType: 'member',
  permissions: [],
  joinDate: new Date(),
  lastActive: new Date(),
  status: 'active',
  teamId: '',
  projects: [],
  skills: []
};

// Helper function to create default member data
const createDefaultMemberData = (baseData: Partial<MemberData>): MemberData => ({
  ...emptyMemberData,
  ...baseData,
  id: baseData.id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  joinDate: baseData.joinDate || new Date(),
  lastActive: new Date(),
  tasks: baseData.tasks || [],
  permissions: baseData.permissions || ['read'],
  status: baseData.status || 'active'
});

export default MemberData; 

export type {
  MemberApplyFieldFilters, MemberAttachment, MemberBaseParams, MemberData, MemberEntity, MemberExcludedFields,
  MemberIncludedFields, MemberK,
  MemberMeta, MemberParams, MemberRealtimeDataItem, MemberSnapshot,
  MemberSnapshotData, MemberSnapshotsArray, MemberSnapshotStore, MemberSnapshotStoreConfig, MemberSnapshotWithCriteria, MemberStructuredMetadata, MemberSubscriberCollection, MemberUnifiedMetadata
};

  export {
    createDefaultMemberData, emptyMemberData
  };

