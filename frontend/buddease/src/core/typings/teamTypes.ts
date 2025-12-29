// teamTypes.ts
import { Team } from '@/core/components/teams/Team';
import { DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { SnapshotsArray, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { TeamEntity } from '@/core/typings/entities/TeamEntity';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

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

