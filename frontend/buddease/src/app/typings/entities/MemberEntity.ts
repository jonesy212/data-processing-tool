// MemberEntity.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Member } from "@/app/models/members/Member";
import { CustomPhaseHooks, Phase, PhaseData } from '@/app/models/phases/Phase';
import { Project } from '@/app/models/projects/Project';
import { Task } from "@/app/models/tasks/Task";
import { UserRole } from "@/app/models/UserRole";
import UserRoles from "@/app/models/UserRoles";
import { Persona } from "@/app/pages/personas/Persona";
import { Permission } from '@/app/permissions/Permission';
import { Product } from '@/app/products/Product';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { AuditRecord } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { ProjectBudget } from '@/app/typings/projectTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { PhaseMeta } from '@/app/typings/entities/PhaseEntity';
// Core Member type definitions
type MemberEntity = BaseDataEntity & {
  // Only include fields that are fundamentally part of the entity data model
  // not behavioral or derived properties
  entityVersion?: number;
  schemaVersion?: string;
  memberSpecificField?: string;
  customMetadata?: Record<string, any>;

  // Other core data fields specific to member entities
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
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  datasets?: string;
  questionnaireResponses?: { [key: string]: string };
  userType: string;
  role?: UserRole
  permissions?: Permission[] | string[];
  joinDate?: Date;
  lastActive?: Date;
  status?: 'active' | 'inactive' | 'pending';
  teamId?: string;
  skills?: string[];
  tasks?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  prroducts?: Product<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  timestamp: string | number | Date | undefined,
  storeId: number,
  auditTrail: AuditRecord[],
  deleted: boolean,

  budget: ProjectBudget,
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  done: boolean
  // Add other fields specific to MemberData
}

// Default empty member data
const emptyMemberData: MemberData<
  MemberEntity,
  MemberK,
  MemberMeta,
  MemberAttachment,
  MemberExcludedFields,
  MemberIncludedFields
> = {
  uploadQuota: 0,
  timestamp: new Date(), // Should be Date or number, not string
  storeId: 0, // Should be number, not string
  auditTrail: [], // Should be AuditRecord[], not string
  deleted: false, // Should be boolean, not string
  isAuthorized: false,
  
  hasQuota: false, // Should be boolean, not string
  processingTasks: [], // Should be array, not string

  budget: {
    total: 0,
    used: 0,
    allocated: 0,        // Add this to match interface
    spent: 0,           // Add this to match interface
    remaining: 0,
    categories: {},      // Change from allocations[] to categories object
    variance: 0,
    currency: '0',
    allocations: [],
    lastUpdated: new Date()
  },
  phases: [],
  currentPhase: {
    id: '',
    name: 'Not Started',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'pending',
    tasks: [],
    progress: 0,
    order: 0,
    projectId: 'project-id',
    date: new Date()
  },
  done: false,
  activityStatus: 'offline',
  activityLog: [],
  persona: {} as Persona,
  friends: [],
  blockedUsers: [],
  id: 'member-0000',
  name: 'Unnamed Member',
  email: 'member@example.com',
  datasets: 'default',
  tasks: [],
  tier: "basic",
  username: "anonymous",
  roleInTeam: "contributor",
  role: UserRoles.Member,
  memberName: "Anonymous Member",
  questionnaireResponses: {},
  userType: 'member',
  permissions: ['read'],
  joinDate: new Date(),
  lastActive: new Date(),
  status: 'active',
  teamId: 'team-0000',
  projects: [],
  skills: ['general']
};

// Helper function to create default member data
const createDefaultMemberData = (
  baseData: Partial<MemberData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>>
): MemberData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields> => ({
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

