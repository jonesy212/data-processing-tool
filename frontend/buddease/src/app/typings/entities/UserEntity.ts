// UserEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/Attachment/attachment';

// Define the actual UserEntity interface
export interface UserEntity extends BaseDataEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  secret?: string;
  role: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  preferences?: UserPreferences;
  // Add other user-specific fields
}

// User-specific type parameters
type UserEntity = UserEntity;
type UserK = UserEntity;
type UserMeta = DefaultMeta<UserEntity, UserK>;
type UserAttachment = Attachment;
type UserExcludedFields = DefaultExcludedFields<UserEntity> | "password" | "secret";
type UserIncludedFields = keyof UserEntity;

// User parameters container
type UserBaseParams = {
  T: UserEntity;
  K: UserK;
  Meta: UserMeta;
  AttachmentType: UserAttachment;
  ExcludedFields: UserExcludedFields;
  IncludedFields: UserIncludedFields;
};

// Complete user with all fields (including sensitive ones)
type CompleteUser = UserEntity;

// User without sensitive fields for public display
type PublicUserProfile = Pick<UserEntity, "id" | "name" | "email" | "role" | "avatar" | "createdAt" | "updatedAt" | "isActive">;

// Minimal user for basic display (lists, dropdowns)
type BasicUserInfo = Pick<UserEntity, "id" | "name" | "email" | "role" | "avatar">;

// User for authentication context (includes role but not sensitive data)
type AuthenticatedUser = Pick<UserEntity, "id" | "name" | "email" | "role" | "avatar" | "isActive" | "preferences">;

// User with secure fields for internal use
type InternalUser = Omit<UserEntity, "password" | "secret">;

// Specific filtered user types using the utility
type SecureUser = ApplyFieldFilters<UserEntity, "password" | "secret">;
type MinimalUserProfile = ApplyFieldFilters<UserEntity, "password" | "secret" | "avatar" | "createdAt" | "updatedAt" | "preferences", "id" | "name" | "email" | "role">;

type AppUser = User<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserData = UserData<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserProfile = UserProfile<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserSnapshot = Snapshot<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserSnapshotData = SnapshotData<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserSnapshotStore = SnapshotStore<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserRealtimeDataItem = RealtimeDataItem<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserUnifiedMetadata = UnifiedMetadata<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type AppUserStructuredMetadata = StructuredMetadata<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

// User-specific metadata types
type UserMeta = DefaultMeta<UserEntity, UserK>;
type UserExcludedFields = DefaultExcludedFields<UserEntity> | "password" | "secret";
type UserIncludedFields = keyof UserEntity;

// User configuration types
type UserSnapshotStoreConfig = SnapshotStoreConfig<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type UserSnapshotsArray = SnapshotsArray<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

type UserParams = SnapshotConfigParams<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

// User frontend structure
type UserFrontendStructure = FrontendStructure<
  UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields
>;

// User data variations
type PublicUserData = Pick<AppUserData, "id" | "username" | "email" | "avatar" | "profile" | "isActive" | "createdAt">;
type PrivateUserData = Omit<AppUserData, "password" | "secret" | "token">;
type AdminUserData = AppUserData; // Full access for admins

// User role-specific types
type BasicUser = Pick<AppUser, "id" | "username" | "email" | "role" | "isActive">;
type PremiumUser = AppUser & { tier: "premium" | "enterprise" };
type AdminUser = AppUser & { role: "admin" | "superadmin"; permissions: string[] };

// User state types
type UserSession = {
  user: AppUser;
  token: string;
  expiresAt: Date;
  permissions: string[];
};

type UserContext = {
  currentUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AppUserProfile>) => Promise<void>;
};

// User utility types
type UserFilterOptions = {
  role?: string;
  isActive?: boolean;
  tier?: string;
  search?: string;
  dateRange?: { start: Date; end: Date };
};

type UserSortOptions = {
  field: keyof AppUser;
  direction: 'asc' | 'desc';
};

// Export all the new types
export type {
  // Core App types
  AppUser,
  AppUserData,
  AppUserProfile,
  AppUserSnapshot,
  AppUserSnapshotData,
  AppUserSnapshotStore,
  AppUserRealtimeDataItem,
  AppUserUnifiedMetadata,
  AppUserStructuredMetadata,
  
  // User metadata types
  UserMeta,
  UserExcludedFields,
  UserIncludedFields,
  
  // Configuration types
  UserSnapshotStoreConfig,
  UserSnapshotsArray,
  UserParams,
  UserFrontendStructure,
  
  // Data variations
  PublicUserData,
  PrivateUserData,
  AdminUserData,
  
  // Role-specific types
  BasicUser,
  PremiumUser,
  AdminUser,
  
  // State types
  UserSession,
  UserContext,
  
  // Utility types
  UserFilterOptions,
  UserSortOptions
};

// Export the main interface
export type { UserEntity };
























// User-specific type parameters (from your UserEntity.ts)
type UserEntity = BaseDataEntity & {
  id: string;
  name: string;
  email: string;
  password: string;
  secret?: string;
  role: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  preferences?: UserPreferences;
};

type UserK = UserEntity;
type UserMeta = DefaultMeta<UserEntity, UserK>;
type UserAttachment = Attachment;
type UserExcludedFields = DefaultExcludedFields<UserEntity> | "password" | "secret";
type UserIncludedFields = keyof UserEntity;

// Base user parameters type
type UserBaseParams = {
  T: UserEntity;
  K: UserK;
  Meta: UserMeta;
  AttachmentType: UserAttachment;
  ExcludedFields: UserExcludedFields;
  IncludedFields: UserIncludedFields;
};

// Core user types using the pattern
type UserDataDefault = UserData<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

type UserSnapshotDefault = Snapshot<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

type UserSnapshotDataDefault = SnapshotData<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

type UserSnapshotStoreDefault = SnapshotStore<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

type UserRealtimeDataItemDefault = RealtimeDataItem<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

// User Metadata Types
type UserUnifiedMetadata = UnifiedMetadata<
  UserBaseParams['T'],
  UserBaseParams['K'], 
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

type UserStructuredMetadata = StructuredMetadata<
  UserBaseParams['T'],
  UserBaseParams['K'],
  UserBaseParams['Meta'],
  UserBaseParams['AttachmentType'],
  UserBaseParams['ExcludedFields'],
  UserBaseParams['IncludedFields']
>;

