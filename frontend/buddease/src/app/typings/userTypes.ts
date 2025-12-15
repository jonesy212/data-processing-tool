// userTypes.ts
import ChatSettings from '@/app/hooks/userInterface/ChatSettings';
import { UserDataDefault, UserEntity } from '@/app/typings/entities/UserEntity';


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
  chat: ChatSettings;
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

    // Supporting interfaces
    UserPreferences, UserProfileDetails, UserSettings
};

  export {
        createDefaultUser, createDefaultUserData, emptyUser, emptyUserData
    };

