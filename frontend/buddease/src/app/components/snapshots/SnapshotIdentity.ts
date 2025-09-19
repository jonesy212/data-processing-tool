import { Category } from "../../../data_analysis/frontend/buddease/src/app/components/libraries/categories/generateCategoryProperties";
import { ProjectPhaseTypeEnum, StatusType } from "../../../data_analysis/frontend/buddease/src/app/components/models/data/StatusType";
import { Task } from "../../../data_analysis/frontend/buddease/src/app/components/models/tasks/Task";
import { Phase, PhaseData } from "../../../data_analysis/frontend/buddease/src/app/components/phases/Phase";
import { AllTypes } from "../../../data_analysis/frontend/buddease/src/app/components/typings/PropTypes";
import { User } from "../../../data_analysis/frontend/buddease/src/app/components/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig";

export interface SnapshotIdentity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> {
  // From CoreSnapshot properties
  id?: string;
  snapshotId?: string | number | null;
  parentId?: string | null;
  parentSnapshotId?: string;
  name?: string;
  description?: string | null;
  type?: string | AllTypes;
  category?: symbol | string | Category | undefined;
  currentCategory?: Category;
  createdBy?: string | undefined;
  ownerId?: string;
  user?: User;
  subscriberId?: string;
  timestamp?: string | number | Date | undefined;
  date?: string | number | Date | null;
  status?: StatusType | undefined;
  phases?: ProjectPhaseTypeEnum;
  phase?: Phase<PhaseData<BaseDataEntity>, PhaseData<BaseDataEntity>> | null;
  isCore?: boolean;
  isInitialized?: boolean;
  initializedAt?: Date;
  length?: number;
  task?: Task<T, K, Meta, ExcludedFields>;
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
  environment?: 'development' | 'staging' | 'production' | 'test';
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotIdentity<SnapshotIdentity<T, K, Meta, ExcludedFields>> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> (overrides: Partial<SnapshotIdentity<SnapshotIdentity<T, K, Meta, ExcludedFields>>> = {}): SnapshotIdentity<SnapshotIdentity<T, K, Meta, ExcludedFields>> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> (obj: any): obj is SnapshotIdentity<T, K, Meta, ExcludedFields> {
  return obj && (obj.id !== undefined || obj.snapshotId !== undefined);
}

export function hasValidSnapshotIdentity(obj: any): boolean {
  return isSnapshotIdentity(obj) && 
         (obj.id !== null && obj.id !== undefined) &&
         (obj.timestamp instanceof Date || 
          typeof obj.timestamp === 'string' || 
          typeof obj.timestamp === 'number');
}