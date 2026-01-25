// TeamEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Member } from '@/core/models/members/Member';
import { TeamPermission } from '@/core/permissions/Permission';
import { SnapshotsArray, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import type { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import type { MemberAttachment, MemberEntity, MemberExcludedFields, MemberIncludedFields, MemberK, MemberMeta } from '@/core/typings/entities/MemberEntity';
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";
import { TeamSettings } from '@/core/typings/teamTypes';

// Define the actual TeamEntity interface

type TeamMembers = Members<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>[]

export interface Members<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  members: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface TeamEntity extends BaseDataEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  members: Members<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createdDate: Date;
  permissions?: TeamPermission;
  settings?: TeamSettings;
  avatar?: string;

  // Add other team-specific fields
}

// Team-specific type parameters
type AppTeamEntity = TeamEntity;
type TeamK = AppTeamEntity;
type TeamMeta = DefaultMeta<AppTeamEntity, TeamK>;
type TeamAttachment = Attachment;
type TeamExcludedFields = DefaultExcludedFields<AppTeamEntity>;
type TeamIncludedFields = keyof AppTeamEntity;

// Team parameters container
type TeamBaseParams = {
  T: AppTeamEntity;
  K: TeamK;
  Meta: TeamMeta;
  AttachmentType: TeamAttachment;
  ExcludedFields: TeamExcludedFields;
  IncludedFields: TeamIncludedFields;
};

// CLEARLY NAMED TEAM TYPES:

// Complete team with all fields
type CompleteTeam = AppTeamEntity;

// Team for public display
type PublicTeamProfile = Pick<AppTeamEntity, "id" | "name" | "description" | "avatar" | "isActive" | "settings">;

// Minimal team for basic display (lists, dropdowns)
type BasicTeamInfo = Pick<AppTeamEntity, "id" | "name" | "avatar" | "isActive">;

// Team with member details for internal use
type TeamWithMembers = AppTeamEntity & {
  members?: any[]; // You can define a proper Member type
};

// Core snapshot types
type TeamSnapshot = Snapshot<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotData = SnapshotData<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotStore = SnapshotStore<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotWithCriteria = SnapshotWithCriteria<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSubscriberCollection = SubscriberCollection<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamRealtimeDataItem = RealtimeDataItem<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// Configuration types
type TeamSnapshotStoreConfig = SnapshotStoreConfig<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;
type TeamSnapshotsArray = SnapshotsArray<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// PARAMS
type TeamParams = SnapshotConfigParams<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>;

// Team Metadata Types
type TeamUnifiedMetadata = UnifiedMetadata<
  TeamBaseParams['T'],        // AppTeamEntity
  TeamBaseParams['K'],        // TeamK  
  TeamBaseParams['Meta'],     // TeamMeta
  TeamBaseParams['AttachmentType'],  // TeamAttachment
  TeamBaseParams['ExcludedFields'],  // TeamExcludedFields
  TeamBaseParams['IncludedFields']   // TeamIncludedFields
>;

type TeamStructuredMetadata = StructuredMetadata<
  TeamBaseParams['T'],        // AppTeamEntity
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
    AppTeamEntity, BasicTeamInfo,
    // Team entity types
    TeamK,
    TeamMeta, 
    CompleteTeam,
    PublicTeamProfile, 
    TeamAttachment, 
    TeamBaseParams, 
    TeamExcludedFields,
    TeamParams, 
    TeamIncludedFields,
    TeamRealtimeDataItem,
    // Snapshot types
    TeamSnapshot,
    TeamSnapshotData,
    // Utility types
    TeamSnapshotFromParams, TeamSnapshotsArray,
    TeamSnapshotStore, TeamSnapshotStoreConfig,
    TeamSnapshotUnionFromParams, TeamSnapshotWithCriteria,
    TeamStructuredMetadata, TeamSubscriberCollection,
    // Metadata types
    TeamUnifiedMetadata, TeamWithMembers
};

// Export the main interfaces
  export type { TeamEntity };
