// teamTypes.ts
import UniqueIDGenerator  from '@/app/generators/GenerateUniqueIds';
import { Member } from '@/app/models/teams/TeamMembers';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Team } from '@/app/models/teams/Team'
import { TeamEntity } from '@/app/typings/entities/TeamEntity'

type TeamK = TeamEntity;
type TeamMeta = DefaultMeta<TeamEntity, TeamK>;
type TeamAttachment = Attachment;
type TeamExcludedFields = DefaultExcludedFields<TeamEntity>;
type TeamIncludedFields = keyof TeamEntity;

// Main parameters container
type TeamBaseParams = {
  T: TeamEntity;
  K: TeamK;
  Meta: TeamMeta;
  AttachmentType: TeamAttachment;
  ExcludedFields: TeamExcludedFields;
  IncludedFields: TeamIncludedFields;
};

// ✅ CLEAN TYPE ALIASES
type TeamFull = Team<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSnapshotFull = Snapshot<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSnapshotDataFull = SnapshotData<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSnapshotStoreFull = SnapshotStore<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSnapshotWithCriteriaFull = SnapshotWithCriteria<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSubscriberCollectionFull = SubscriberCollection<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamRealtimeDataItemFull = RealtimeDataItem<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

// Configuration types
type TeamSnapshotStoreConfigFull = SnapshotStoreConfig<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

type TeamSnapshotsArrayFull = SnapshotsArray<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

// PARAMS
type TeamParams = SnapshotConfigParams<
  TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields
>;

// Utility types
type TeamSnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type TeamSnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

// Supporting types
interface TeamSettings {
  visibility: 'public' | 'private' | 'restricted';
  joinPolicy: 'open' | 'invite' | 'approval';
  maxMembers?: number;
  permissions: TeamPermissions;
  notifications: TeamNotificationSettings;
}


interface TeamNotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  dailyDigest: boolean;
}

const generateId = UniqueIDGenerator.generateTeamID()
// Helper for creating team instances
const createDefaultTeam = (options: Partial<TeamFull> = {}): TeamFull => ({
  id: options.id || generateId(),
  name: options.name || 'Unnamed Team',
  description: options.description || '',
  members: options.members || [],
  ownerId: options.ownerId || '',
  createdDate: options.createdDate || new Date(),
  isActive: options.isActive ?? true,
  settings: options.settings || {
    visibility: 'private',
    joinPolicy: 'invite',
    notifications: {
      email: true,
      push: true,
      slack: false,
      frequency: 'instant'
    }
  },
  permissions: options.permissions || {
    canInvite: true,
    canRemove: true,
    canEditSettings: true,
    canManageProjects: true
  },
  ...options
} as TeamFull);

// Empty/default team
const emptyTeam: TeamFull = createDefaultTeam();

export type {
  TeamAttachment, 
  TeamBaseParams, 
  TeamEntity, 
  TeamExcludedFields, 
  TeamFull, 
  TeamIncludedFields, 
  TeamK,
  TeamMeta, 
  TeamNotificationSettings, 
  TeamParams, 
  TeamPermissions, 
  TeamRealtimeDataItemFull, 
  TeamSettings, 
  TeamSnapshotDataFull, 
  TeamSnapshotFull, 
  TeamSnapshotsArrayFull, 
  TeamSnapshotStoreConfigFull, 
  TeamSnapshotStoreFull, 
  TeamSnapshotWithCriteriaFull, 
  TeamSubscriberCollectionFull
};

export { createDefaultTeam, emptyTeam };

