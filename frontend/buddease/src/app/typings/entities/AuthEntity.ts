// AuthEntity.ts

import FrontendStructure from '@/app/config/appStructure/FrontendStructure';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { AccessControlEntry } from '@/app/permissions/AccessControlEntry';
import { PermissionLevel, VisibilityLevel } from '@/app/permissions/PermissionEnums';
import { AuthenticationProvider } from '@/app/server/auth/AuthService';
import { Snapshot, SnapshotData, SnapshotStoreConfig } from '@/app/snapshots';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SecurityEvent } from '@/app/state/redux/slices/SecurityEventSlice';
import { UserContactInfo, UserNotificationPreferences, UserSession } from '@/app/state/stores/AuthStore';
import { SubscriptionPlan } from '@/app/subscriptions/SubscriptionPlan';
import { DashboardConfig } from '@/app/typings/authTypes';
import { PublicUserProfile } from '@/app/typings/entities/UserEntity';
import { UserPreferences } from '@/app/typings/userTypes';
import { User } from "@/app/users/User";
import { RealtimeDataItem } from '../realtimeTypes';
import { ApplyFieldFilters } from './AppEntity';

// Define sensitive fields that should never be exposed
const SensitiveAuthFields = [
  'token',
  'refreshToken', 
  'mfaSecret',
  'privateKey',
  'apiKey',
  'sessionToken',
  'authSecret',
  'encryptionKey'
] as const;

type SensitiveAuthField = typeof SensitiveAuthFields[number];

// Define critical fields that should have limited exposure
const CriticalAuthFields = [
  'userId',
  'loginAttempts',
  'isLocked',
  'lockUntil',
  'deviceInfo',
  'ipAddress'
] as const;

type CriticalAuthField = typeof CriticalAuthFields[number];



// Define the actual AuthEntity interface
interface AuthEntity extends BaseDataEntity {
  id: string;
  userId: string;
  
  // 🔒 SENSITIVE FIELDS (Never expose these)
  token: string;
  refreshToken?: string;
  mfaSecret?: string;
  privateKey?: string;
  apiKey?: string;
  sessionToken?: string;
  authSecret?: string;
  encryptionKey?: string;

    // 🔐 AUTHENTICATION CONTROLS (from AuthMeta.accessControl)
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  mfaEnabled: boolean;
  
  // 🔒 RESOURCE ACCESS CONTROLS (integration point)
  defaultAccessLevel: PermissionLevel;
  accessControlEntries?: AccessControlEntry[]; // User's personal access entries
  inheritedAccess?: AccessControlEntry[]; // Access inherited from groups
  
  // 👥 GROUP MEMBERSHIPS (for access inheritance)
  groupMemberships: {
    groupId: string;
    role: string;
    inheritedPermissions: PermissionLevel;
  }[];
  
  // 📋 CONTENT CONTROLS (from AccessControlled)
  contentSettings: {
    defaultVisibility: VisibilityLevel;
    allowEmbedding: boolean;
    allowDownload: boolean;
    isFamilyFriendly: boolean;
    licenseType?: string;
  };
  
  // ⚠️ CRITICAL FIELDS (Limited exposure)
  loginAttempts: number;
  isLocked: boolean;
  lockUntil?: Date;
  deviceInfo: {
    userAgent: string;
    ipAddress: string; // Consider hashing in production
    location?: string;
    deviceId?: string;
  };
  
  // 🔐 SECURE FIELDS (Safe for internal use)
  tokenExpiry: Date;
  isAuthenticated: boolean;
  authMethod: 'password' | 'oauth' | 'sso' | 'biometric';
  provider?: AuthenticationProvider;
  lastLogin: Date;
  sessionId: string;
  permissions: string[];
  roles: string[];
  scope: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // 🛡️ SECURITY METADATA
  securityLevel: 'low' | 'medium' | 'high';
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    soc2: boolean;
    pci: boolean;
  };
  auditTrail: SecurityEvent[];
}

// Auth-specific type parameters
type AuthK = AuthEntity;
type AuthMeta = DefaultMeta<AuthEntity, AuthK> & {
  securityLevel: 'low' | 'medium' | 'high';
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    soc2: boolean;
    pci: boolean;
  };
  sessionDetails: {
    persistent: boolean;
    deviceTrusted: boolean;
    riskScore: number;
    threatLevel: 'low' | 'medium' | 'high';
  };

  accessControl: {
    // Authentication Security
    authentication: {
      maxLoginAttempts: number;
      lockoutDuration: number;
      sessionTimeout: number;
      passwordPolicy: {
        minLength: number;
        requireSpecialChar: boolean;
        requireNumbers: boolean;
        expiryDays: number;
      };
    };
    
    // Resource Permissions (AccessControlEntry system)
    resourcePermissions: {
      defaultLevel: PermissionLevel;
      inheritance: {
        enabled: boolean;
        overrideAllowed: boolean;
        inheritanceDepth: number;
      };
      visibilitySettings: {
        defaultVisibility: VisibilityLevel;
        allowUnlisted: boolean;
        allowPrivate: boolean;
      };
    };
    
    // Content Controls (AccessControlled system)
    contentControls: {
      licensing: {
        defaultLicense: string;
        allowCommercialUse: boolean;
        requireAttribution: boolean;
      };
      distribution: {
        allowEmbedding: boolean;
        allowDownload: boolean;
        familyFriendly: boolean;
        geographicRestrictions: string[];
      };
    };
    
    // Advanced Policies
    advancedPolicies: {
      requireMfaFor: PermissionLevel[]; // Require MFA for these permission levels
      ipRestrictions: {
        whitelist: string[];
        blacklist: string[];
      };
      timeBasedAccess: {
        allowedHours: { start: number; end: number }[];
        blockedDays: string[];
      };
    };
  };
};

type AuthAttachment = Attachment;
type AuthExcludedFields = DefaultExcludedFields<AuthEntity> | "token" | "refreshToken" | "mfaSecret";
type AuthIncludedFields = keyof AuthEntity;

// Auth parameters container
type AuthBaseParams = {
  T: AuthEntity;
  K: AuthK;
  Meta: AuthMeta;
  AttachmentType: AuthAttachment;
  ExcludedFields: AuthExcludedFields;
  IncludedFields: AuthIncludedFields;
};

// Add this missing core type
type AuthData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  // Define based on your Data type structure
  id: string;
  // ... other data properties
};

// Complete auth with all fields (including sensitive ones)
type CompleteAuth = AuthEntity;
type AppAuth = User<
  AuthEntity,
  AuthK,
  AuthMeta,
  AuthAttachment,
  AuthExcludedFields,
  AuthIncludedFields
  >;

// Auth without sensitive fields for public display
type PublicAuthInfo = Pick<AuthEntity, "id" | "userId" | "isAuthenticated" | "authMethod" | "lastLogin" | "roles" | "mfaEnabled">;

// Minimal auth for basic operations
type BasicAuthInfo = Pick<AuthEntity, "id" | "userId" | "isAuthenticated" | "roles">;

// Auth for session management
type SessionAuth = Pick<AuthEntity, "id" | "userId" | "token" | "tokenExpiry" | "sessionId" | "deviceInfo">;

// Secure auth without sensitive tokens
type SecureAuth = ApplyFieldFilters<AuthEntity, "token" | "refreshToken" | "mfaSecret">;


// Core auth types using the pattern
type AuthDataDefault = AuthData<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthSnapshotDefault = Snapshot<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthSnapshotDataDefault = SnapshotData<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthSnapshotStoreDefault = SnapshotStore<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthRealtimeDataItemDefault = RealtimeDataItem<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

// Auth Metadata Types
type AuthUnifiedMetadata = UnifiedMetadata<
  AuthBaseParams['T'],
  AuthBaseParams['K'], 
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthStructuredMetadata = StructuredMetadata<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

// Auth configuration types
type AuthSnapshotStoreConfig = SnapshotStoreConfig<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthSnapshotsArray = SnapshotsArray<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

type AuthParams = SnapshotConfigParams<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

// Auth frontend structure
type AuthFrontendStructure = FrontendStructure<
  AuthBaseParams['T'],
  AuthBaseParams['K'],
  AuthBaseParams['Meta'],
  AuthBaseParams['AttachmentType'],
  AuthBaseParams['ExcludedFields'],
  AuthBaseParams['IncludedFields']
>;

// Auth utility types
type AuthFilterOptions = {
  isAuthenticated?: boolean;
  authMethod?: string;
  role?: string;
  dateRange?: { start: Date; end: Date };
  deviceTrusted?: boolean;
};

type AuthSortOptions = {
  field: keyof AuthEntity;
  direction: 'asc' | 'desc';
};

// Auth state types
type AuthSessionState = {
  currentAuth: AuthContextData;
  isLoading: boolean;
  error?: string;
  lastActivity: Date;
};

type AuthProviderConfig = {
  providers: AuthenticationProvider[];
  defaultProvider: string;
  autoRefresh: boolean;
  sessionTimeout: number;
};



type InternalAuthInfo = ApplyFieldFilters<AuthEntity, SensitiveAuthField,
  "id" | "userId" | "isAuthenticated" | "authMethod" | "lastLogin" | "roles" | 
  "mfaEnabled" | "loginAttempts" | "isLocked" | "deviceInfo"
>;

type SecureAuthInfo = ApplyFieldFilters<AuthEntity, SensitiveAuthField>;

export type PermissionLevelType = keyof typeof PermissionLevel;
type VisibilityLevelType = VisibilityLevel; 


// 🔒 RESTRICTED AUTH TYPES

// For API responses - never includes sensitive data
type ApiAuthResponse = PublicAuthInfo & {
  user?: PublicUserProfile; // From your UserEntity
  session?: {
    id: string;
    expiresAt: Date;
    device: string;
  };
};

// For internal services - includes critical but not sensitive data
type InternalAuthData = InternalAuthInfo & {
  securityContext: {
    riskScore: number;
    threatLevel: string;
    requiredActions: string[];
  };
};
// 🔐 SINGLE COMBINED AUTH CONTEXT DATA TYPE
type AuthContextData = {
  // ========================
  // 🔐 CORE AUTHENTICATION
  // ========================
  auth: SecureAuth & PublicAuthInfo;
  
  // ========================
  // 👤 USER INFORMATION
  // ========================
  user?: PublicUserProfile;
  
  // ========================
  // 🕒 SESSION MANAGEMENT
  // ========================
  session: {
    id: string;
    expiresAt: Date;
    renewAt: Date;
    device: string;
    activeSessions?: UserSession[];
  };
  
  // ========================
  // 🛡️ SECURITY & COMPLIANCE
  // ========================
  security: {
    mfaRequired: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    trustedDevice: boolean;
    threatLevel?: 'low' | 'medium' | 'high';
    requiredActions?: string[];
  };
  
  // ========================
  // ⚙️ USER PREFERENCES & CONFIG
  // ========================
  userPreferences?: UserPreferences;
  dashboardConfig?: DashboardConfig;
  userContactInfo?: UserContactInfo;
  userNotificationPreferences?: UserNotificationPreferences;
  userSubscriptionPlan?: SubscriptionPlan;
  
  // ========================
  // 📊 SESSION HISTORY
  // ========================
  userSessions?: UserSession[];
  
  // ========================
  // 🔄 LOADING & ERROR STATES
  // ========================
  isLoading?: boolean;
  error?: string;
  lastActivity?: Date;
};
// 🛡️ SECURE AUTH OPERATIONS

// For authentication operations only
type AuthCredentials = {
  userId: string;
  token: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
  };
};

type SecureAuthOperation = {
  operation: 'login' | 'logout' | 'refresh' | 'validate';
  credentials: AuthCredentials;
  securityContext: {
    ipAddress: string;
    userAgent: string;
    location?: string;
  };
};

// 🔐 ENCRYPTED AUTH TYPES

// For storing encrypted sensitive data
type EncryptedAuthData = {
  encryptedToken: string;
  encryptedRefreshToken?: string;
  encryptionKey: string; // Different from auth encryption key
  iv: string;
  algorithm: 'aes-256-gcm';
};

// For secure token storage
type SecureTokenStorage = {
  accessToken: string; // JWT or similar
  refreshToken?: string;
  tokenType: 'bearer';
  expiresIn: number;
  scope: string;
} & EncryptedAuthData;

// 🚫 NEVER EXPOSE THESE TYPES

// These should only be used internally with proper security measures
type RawAuthData = CompleteAuth; // Includes all sensitive fields
type TokenData = Pick<AuthEntity, 'token' | 'refreshToken' | 'tokenExpiry'>;
type SecurityData = Pick<AuthEntity, 'mfaSecret' | 'privateKey' | 'authSecret'>;

// Security utility types
type AuthValidationResult = {
  isValid: boolean;
  reason?: 'expired' | 'invalid' | 'revoked' | 'suspicious';
  securityActions?: string[];
  riskScore: number;
};

type AuthSecurityConfig = {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  mfaRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireSpecialChar: boolean;
    requireNumbers: boolean;
    expiryDays: number;
  };
};

// Export all the auth types with integrated security levels
export type {

  CompleteAuth as __CompleteAuth, // 🔴 SECURITY ONLY
  EncryptedAuthData as __EncryptedAuthData, // 🔴 SECURITY ONLY
  RawAuthData as __RawAuthData, // 🔴 SECURITY ONLY
  SecureTokenStorage as __SecureTokenStorage, // 🔴 SECURITY ONLY
  SecurityData as __SecurityData, // 🟡 INTERNAL
  TokenData as __TokenData, // 🟢 CLIENT-SAFE
  ApiAuthResponse, // 🟢 CLIENT-SAFE



  // ========================
  // 🎯 UTILITY & STATE TYPES
  // ========================
  AppAuth, // 🟡 INTERNAL
  AuthAttachment, // 🟡 INTERNAL
  AuthBaseParams, // 🟢 CLIENT-SAFE
  AuthContextData, // 🔴 SECURITY ONLY



  // ========================
  // 🔐 SECURITY & AUTH OPERATIONS
  // ========================
  AuthCredentials, // 🔴 SECURITY ONLY



  // ========================
  // ⚙️ CONFIGURATION & METADATA
  // ========================
  AuthDataDefault,
  // ========================
  // 🔧 CORE ENTITY & PARAMETERS
  // ========================
  AuthEntity, // 🟡 INTERNAL
  AuthExcludedFields, AuthFilterOptions, // 🟡 INTERNAL
  AuthFrontendStructure, // 🟡 INTERNAL
  AuthIncludedFields, // 🟡 INTERNAL
  AuthK, // 🟡 INTERNAL  
  AuthMeta, // 🟡 INTERNAL
  AuthParams, // 🟡 INTERNAL
  AuthProviderConfig, // 🟡 INTERNAL
  AuthRealtimeDataItemDefault, // 🟡 INTERNAL
  AuthSecurityConfig, // 🟢 CLIENT-SAFE
  AuthSessionState, // 🟡 INTERNAL
  AuthSnapshotDataDefault, // 🟡 INTERNAL
  AuthSnapshotDefault, // 🟡 INTERNAL
  AuthSnapshotsArray, // 🟡 INTERNAL
  AuthSnapshotStoreConfig, // 🟡 INTERNAL
  AuthSnapshotStoreDefault, // 🟢 CLIENT-SAFE
  AuthSortOptions, // 🟡 INTERNAL
  AuthStructuredMetadata, // 🟡 INTERNAL
  AuthUnifiedMetadata, // 🟢 CLIENT-SAFE
  AuthValidationResult, // 🟢 CLIENT-SAFE
  BasicAuthInfo, // 🟡 INTERNAL
  CriticalAuthField // 🟡 INTERNAL
  , // 🟢 CLIENT-SAFE
  InternalAuthData, // 🟡 INTERNAL



  // ========================
  // 📊 DATA VARIATIONS (Security Tiered)
  // ========================
  PublicAuthInfo, // 🟡 INTERNAL
  SecureAuth, // 🟡 INTERNAL
  SecureAuthInfo, // 🟡 INTERNAL
  SecureAuthOperation, // 🟡 INTERNAL
  SecurityEvent, // 🟡 INTERNAL
  SensitiveAuthField, // 🟡 INTERNAL
  SessionAuth
};

// Export the sensitive fields arrays for validation
    export { CriticalAuthFields, SensitiveAuthFields };
