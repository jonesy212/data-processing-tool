// TeamEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { TeamPermissions } from '@/app/permissions/Permission';
import { SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
// Define the actual TeamEntity interface
interface TeamEntity extends BaseDataEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  members: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // User IDs
  createdDate: Date;
  permissions: TeamPermissions;
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
    CompleteTeam,
    PublicTeamProfile, TeamAttachment, TeamBaseParams, TeamExcludedFields,
    TeamIncludedFields, TeamK,
    TeamMeta, TeamParams, TeamRealtimeDataItem,
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
