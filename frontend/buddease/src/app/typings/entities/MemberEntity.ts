// MemberEntity.ts
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { Attachment } from "@/app/documents/Attachment/attachment";
import { SnapshotConfigParams } from '@/app/snapshots/SnapshpshotConfigBuilder';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStore } from '@/app/snapshots/SnapshotStore';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SnapshotConfig } from "@/app/snapshot/SnapshotConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Task } from "@/app/models/tasks/Task";
import { Member } from "@/app/components/models/teams/TeamMembers";

// Core Member type definitions
type MemberEntity = BaseDataEntity & {
  datasets?: string;
  tasks?: Task<any, any, any, any, any, any>[]; // Using any for flexibility with Task types
  questionnaireResponses?: any;
  userType: string;
  role?: string;
  permissions?: string[];
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


type AppPhase = Phase<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;

type AppPhaseData = PhaseData<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;

type AppPhaseMeta = PhaseMeta<
  MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields
>;

type CustomAppPhaseHooks = CustomPhaseHooks<
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
  Excluded extends keyof T = never,
  Included extends keyof T = keyof T
> = Pick<Omit<T, Excluded>, Included>;

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
  role?: string;
  permissions?: string[];
  joinDate?: Date;
  lastActive?: Date;
  status?: 'active' | 'inactive' | 'pending';
  teamId?: string;
  projects?: string[];
  skills?: string[];
  // Add other fields specific to MemberData
}

// Default empty member data
const emptyMemberData: MemberData = {
  id: '',
  name: '',
  email: '',
  datasets: '',
  tasks: [],
  questionnaireResponses: undefined,
  userType: 'member',
  role: 'member',
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

export type { 
  MemberEntity,
  MemberK,
  MemberMeta,
  MemberAttachment,
  MemberExcludedFields,
  MemberIncludedFields,
  MemberSnapshot,
  MemberSnapshotData,
  MemberSnapshotStore,
  MemberSnapshotWithCriteria,
  MemberSubscriberCollection,
  MemberRealtimeDataItem,
  MemberSnapshotStoreConfig,
  MemberSnapshotsArray,
  MemberParams,
  MemberBaseParams,
  MemberUnifiedMetadata,
  MemberStructuredMetadata,
  MemberApplyFieldFilters,
  MemberData
};

export {
  emptyMemberData,
  createDefaultMemberData
};