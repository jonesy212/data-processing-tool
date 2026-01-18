// SnapshotIdentity.ts
import type { Task } from "@/core/components/models/tasks/Task";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
import type { ProjectPhaseTypeEnum, StatusType } from "@/core/models/data/StatusType";
import type { PhaseDefault } from '@/core/typings/phaseTypes';
import type { AllTypes } from "@/core/typings/PropTypes";
import type { User } from "@/core/users/User";

export interface SnapshotIdentity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // From CoreSnapshot properties
  id?: string;
  snapshotId?: string | number | null;
  parentId?: string | null;
  parentSnapshotId?: string;
  name?: string;
  description?: string | null;
  type?: string | AllTypes;
  category?: Category;
  currentCategory?: Category;
  createdBy?: string | undefined;
  ownerId?: string;
  user?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscriberId?: string;
  timestamp?: string | number | Date | undefined;
  date?: string | number | Date | null;
  status?: StatusType | undefined;
  phases?: ProjectPhaseTypeEnum;
  phase?: PhaseDefault | null;
  isCore?: boolean;
  isInitialized?: boolean;
  initializedAt?: Date;
  length?: number;
  task?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  orders?: any;
  
  // Identity-specific properties
  version?: string | number;
  hash?: string;
  signature?: string;
  fingerprint?: string;
  created?: Date;
  modified?: Date;
  source?: string;
  origin?: string;
  namespace?: string;
  realm?: string;
  domain?: string;
  environment?: 'development' | 'staging' | 'production' | 'test' | string;
  instanceId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  
  // Security identity
  permissions?: string[];
  roles?: string[];
  scopes?: string[];
  authContext?: {
    userId?: string;
    tenantId?: string;
    sessionId?: string;
    authMethod?: string;
    issuedAt?: Date;
    expiresAt?: Date;
  };
  
  // Versioning
  versionNumber?: number;
  versionHash?: string;
  previousVersionId?: string;
  versionChain?: string[];
  
  // Relationships
  relatedIds?: string[];
  parentIds?: string[];
  childIds?: string[];
  siblingIds?: string[];
  
  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  
  // System info
  system?: {
    hostname?: string;
    ipAddress?: string;
    processId?: string;
    threadId?: string;
    runtime?: string;
    platform?: string;
  };
  
  // Custom identity extensions
  customFields?: Record<string, any>;
  extensions?: Record<string, any>;
}

// Optional: Create a more specific version if needed
export interface SnapshotIdentityWithTimestamps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotIdentity<SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  archivedAt?: Date;
}

// Optional: Create a minimal identity for basic snapshots
export interface BasicSnapshotIdentity {
  id: string;
  type: string;
  timestamp: Date;
  version: string;
}

// Helper function to create a snapshot identity
export function createSnapshotIdentity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> (overrides: Partial<SnapshotIdentity<SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> = {}): SnapshotIdentity<SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  const now = new Date();
  
  return {
    id: generateId(),
    timestamp: now,
    created: now,
    version: '1.0.0',
    environment: 'development',
    ...overrides
  };
}

// Helper function to generate unique IDs
export function generateId(prefix: string = 'snapshot'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Type guards
export function isSnapshotIdentity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> (obj: any): obj is SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return obj && (obj.id !== undefined || obj.snapshotId !== undefined);
}

export function hasValidSnapshotIdentity(obj: any): boolean {
  return isSnapshotIdentity(obj) && 
         (obj.id !== null && obj.id !== undefined) &&
         (obj.timestamp instanceof Date || 
          typeof obj.timestamp === 'string' || 
          typeof obj.timestamp === 'number');
}