// userTypes.ts
// UserEntityTypes.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshpshotConfigBuilder';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStore } from '@/app/snapshots/SnapshotStore';
import { SnapshotConfig } from "@/app/snapshot/SnapshotConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';

// Supporting interfaces (from your UserData.ts)
interface UserPreferences {
  ui?: {
    compactMode?: boolean;
    sidebarCollapsed?: booleapn;
    fontSize?: 'small' | 'medium' | 'large';
  };
  notifications?: {
    emailFrequency?: 'instant' | 'daily' | 'weekly';
    desktopAlerts?: boolean;
    soundEnabled?: boolean;
  };
}

interface UserProfileDetails {
  bio?: string;
  avatar?: string;
  banner?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

interface UserSettings {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    activityVisibility?: boolean;
    emailVisibility?: boolean;
  };
}

// Helper for creating user instances
const createDefaultUser = (options: Partial<UserEntity> = {}): UserEntity => ({
  id: options.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: options.name || '',
  email: options.email || '',
  password: options.password || '',
  role: options.role || 'user',
  createdAt: options.createdAt || new Date(),
  updatedAt: new Date(),
  isActive: options.isActive !== undefined ? options.isActive : true,
  ...options
} as UserEntity);

// Empty/default user
const emptyUser: UserEntity = createDefaultUser();

// Helper for creating UserData instances
const createDefaultUserData = (options: Partial<UserDataDefault> = {}): UserDataDefault => ({
  ...createDefaultUser(options),
  profile: options.profile || undefined,
  settings: options.settings || undefined,
  preferences: options.preferences || undefined,
  socialAccounts: options.socialAccounts || [],
  notifications: options.notifications || [],
  activityLog: options.activityLog || [],
  teams: options.teams || [],
  projects: options.projects || [],
  tasks: options.tasks || [],
  permissions: options.permissions || ['read'],
  subscription: options.subscription || undefined,
  analytics: options.analytics || undefined,
  ...options
} as UserDataDefault);

// Empty/default user data
const emptyUserData: UserDataDefault = createDefaultUserData();

export type {
  // Core type parameters
  UserEntity,
  UserK, 
  UserMeta,
  UserAttachment,
  UserExcludedFields,
  UserIncludedFields,
  UserBaseParams,
  
  // Default types
  UserDataDefault,
  UserSnapshotDefault,
  UserSnapshotDataDefault,
  UserSnapshotStoreDefault,
  UserRealtimeDataItemDefault,
  
  // Metadata types
  UserUnifiedMetadata,
  UserStructuredMetadata,
  
  // App-specific types
  AppUser,
  AppUserData,
  AppUserSnapshot,
  AppUserSnapshotData,
  AppUserSnapshotStore,
  AppUserRealtimeDataItem,
  AppUserUnifiedMetadata,
  AppUserStructuredMetadata,
  
  // Frontend structure
  UserFrontendStructure,
  
  // Configuration types
  UserSnapshotStoreConfig,
  UserSnapshotsArray,
  UserParams,
  
  // Supporting interfaces
  UserPreferences,
  UserProfile,
  UserSettings
};

export {
  createDefaultUser,
  emptyUser,
  createDefaultUserData,
  emptyUserData
};