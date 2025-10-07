// TeamEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotConfigParams } from '@/app/snapshots/SnapshpshotConfigBuilder';
import { SubscriberCollection } from '@/app/snapshots/SubscriberCollection';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";

// Define the actual TeamEntity interface
export interface TeamEntity extends BaseDataEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings?: TeamSettings;
  avatar?: string;
  // Add other team-specific fields
}

export interface TeamSettings {
  privacy: 'public' | 'private' | 'invite-only';
  permissions: TeamPermissions;
  notifications: TeamNotificationSettings;
}

export interface TeamPermissions {
  canInviteMembers: boolean;
  canCreateProjects: boolean;
  canDeleteTeam: boolean;
  canManageSettings: boolean;
}

export interface TeamNotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
}

// Team-specific type parameters
type TeamEntityType = TeamEntity;
type TeamK = TeamEntityType;
type TeamMeta = DefaultMeta<TeamEntityType, TeamK>;
type TeamAttachment = Attachment;
type TeamExcludedFields = DefaultExcludedFields<TeamEntityType>;
type TeamIncludedFields = keyof TeamEntityType;

// Team parameters container
type TeamBaseParams = {
  T: TeamEntityType;
  K: TeamK;
  Meta: TeamMeta;
  AttachmentType: TeamAttachment;
  ExcludedFields: TeamExcludedFields;
  IncludedFields: TeamIncludedFields;
};

// CLEARLY NAMED TEAM TYPES:

// Complete team with all fields
type CompleteTeam = TeamEntityType;

// Team for public display
type PublicTeamProfile = Pick<TeamEntityType, "id" | "name" | "description" | "avatar" | "isActive" | "settings">;

// Minimal team for basic display (lists, dropdowns)
type BasicTeamInfo = Pick<TeamEntityType, "id" | "name" | "avatar" | "isActive">;

// Team with member details for internal use
type TeamWithMembers = TeamEntityType & {
  members?: any[]; // You can define a proper Member type
};

// Core snapshot types
type TeamSnapshot = Snapshot<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotData = SnapshotData<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotStore = SnapshotStore<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotWithCriteria = SnapshotWithCriteria<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSubscriberCollection = SubscriberCollection<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamRealtimeDataItem = RealtimeDataItem<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// Configuration types
type TeamSnapshotStoreConfig = SnapshotStoreConfig<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotsArray = SnapshotsArray<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// PARAMS
type TeamParams = SnapshotConfigParams<TeamEntityType, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// Team Metadata Types
type TeamUnifiedMetadata = UnifiedMetadata<
  TeamBaseParams['T'],        // TeamEntityType
  TeamBaseParams['K'],        // TeamK  
  TeamBaseParams['Meta'],     // TeamMeta
  TeamBaseParams['AttachmentType'],  // TeamAttachment
  TeamBaseParams['ExcludedFields'],  // TeamExcludedFields
  TeamBaseParams['IncludedFields']   // TeamIncludedFields
>;

type TeamStructuredMetadata = StructuredMetadata<
  TeamBaseParams['T'],        // TeamEntityType
  TeamBaseParams['K'],        // TeamK
  TeamBaseParams['Meta'],     // TeamMeta
  TeamBaseParams['AttachmentType'],  // TeamAttachment
  TeamBaseParams['ExcludedFields'],  // TeamExcludedFields
  TeamBaseParams['IncludedFields']   // TeamIncludedFields
>;

// Utility types for snapshots
type TeamSnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type TeamSnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

export type {
  // Core type parameters
  TeamEntityType,
  TeamK,
  TeamMeta,
  TeamAttachment,
  TeamExcludedFields,
  TeamIncludedFields,
  TeamBaseParams,
  
  // Team entity types
  CompleteTeam,
  PublicTeamProfile,
  BasicTeamInfo,
  TeamWithMembers,
  
  // Snapshot types
  TeamSnapshot,
  TeamSnapshotData,
  TeamSnapshotStore,
  TeamSnapshotWithCriteria,
  TeamSubscriberCollection,
  TeamRealtimeDataItem,
  TeamSnapshotStoreConfig,
  TeamSnapshotsArray,
  TeamParams,
  
  // Metadata types
  TeamUnifiedMetadata,
  TeamStructuredMetadata,
  
  // Utility types
  TeamSnapshotFromParams,
  TeamSnapshotUnionFromParams
};

// Export the main interfaces
export type { TeamEntity, TeamSettings, TeamPermissions, TeamNotificationSettings };