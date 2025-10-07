// PhaseEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { SnapshotConfigParams } from '@/app/snapshots/SnapshpshotConfigBuilder';
import { SubscriberCollection } from '@/app/snapshots/SubscriberCollection';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import { Phase } from '@/app/models/data/Phase';

// Define the actual PhaseEntity interface
export interface PhaseEntity extends BaseDataEntity {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  projectId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  color?: string;
  progress?: number; // 0-100
  dependencies?: Dependency[]; // Phase IDs this phase depends on
  assignedTeamIds?: string[];
  budget?: number;
  actualCost?: number;
  milestones?: PhaseMilestone[];
  documents?: string[]; // Document IDs associated with this phase
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  assignedTo?: string; // User ID
}

export interface PhaseSettings {
  allowOverlap: boolean;
  autoProgress: boolean;
  notificationSettings: PhaseNotificationSettings;
  approvalRequired: boolean;
}

export interface PhaseNotificationSettings {
  onStart: boolean;
  onCompletion: boolean;
  onDelay: boolean;
  dailyProgress: boolean;
}

// Phase-specific type parameters
type PhaseEntity = PhaseEntity;
type PhaseK = PhaseEntityType;
type PhaseMeta = DefaultMeta<PhaseEntity, PhaseK>;
type PhaseAttachment = Attachment;
type PhaseExcludedFields = DefaultExcludedFields<PhaseEntity>;
type PhaseIncludedFields = keyof PhaseEntity;

// Phase parameters container
type PhaseBaseParams = {
  T: PhaseEntityType;
  K: PhaseK;
  Meta: PhaseMeta;
  AttachmentType: PhaseAttachment;
  ExcludedFields: PhaseExcludedFields;
  IncludedFields: PhaseIncludedFields;
};

// CLEARLY NAMED PHASE TYPES:

// Complete phase with all fields
type CompletePhase = PhaseEntityType;

// Phase for public display
type PublicPhaseProfile = Pick<PhaseEntityType, "id" | "name" | "description" | "order" | "status" | "progress" | "startDate" | "endDate" | "color">;

// Minimal phase for basic display (lists, dropdowns)
type BasicPhaseInfo = Pick<PhaseEntityType, "id" | "name" | "order" | "status" | "progress" | "color">;

// Phase with dependencies and milestones for detailed views
type PhaseWithDetails = PhaseEntityType & {
  dependentPhases?: PhaseEntityType[];
  milestoneDetails?: PhaseMilestone[];
};

// Phase-specific metadata extensions
interface PhaseSpecificMetadata extends PhaseStructuredMetadata {
  phaseMetrics?: {
    completionRate: number;
    averageDuration: number;
    budgetUtilization: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  phaseConstraints?: {
    maxDuration?: number;
    minStartDate?: Date;
    maxEndDate?: Date;
    resourceLimits?: Record<string, number>;
  };
}

// Core snapshot types
type PhaseSnapshot = Snapshot<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotData = SnapshotData<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotStore = SnapshotStore<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotWithCriteria = SnapshotWithCriteria<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSubscriberCollection = SubscriberCollection<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseRealtimeDataItem = RealtimeDataItem<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// Configuration types
type PhaseSnapshotStoreConfig = SnapshotStoreConfig<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotsArray = SnapshotsArray<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// PARAMS
type PhaseParams = SnapshotConfigParams<PhaseEntityType, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// Utility types for snapshots
type PhaseSnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type PhaseSnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

// App Phase type (the original Phase type with proper generics)
type AppPhase = Phase<
  PhaseBaseParams['T'],
  PhaseBaseParams['K'],
  PhaseBaseParams['Meta'],
  PhaseBaseParams['AttachmentType'],
  PhaseBaseParams['ExcludedFields'],
  PhaseBaseParams['IncludedFields']
>;

export type {
  // Core type parameters
  PhaseEntityType,
  PhaseK,
  PhaseMeta,
  PhaseAttachment,
  PhaseExcludedFields,
  PhaseIncludedFields,
  PhaseBaseParams,
  
  // Phase entity types
  CompletePhase,
  PublicPhaseProfile,
  BasicPhaseInfo,
  PhaseWithDetails,
  
  // Snapshot types
  PhaseSnapshot,
  PhaseSnapshotData,
  PhaseSnapshotStore,
  PhaseSnapshotWithCriteria,
  PhaseSubscriberCollection,
  PhaseRealtimeDataItem,
  PhaseSnapshotStoreConfig,
  PhaseSnapshotsArray,
  PhaseParams,
  
  // Metadata types
  PhaseUnifiedMetadata,
  PhaseStructuredMetadata,
  PhaseSpecificMetadata,
  
  // Utility types
  PhaseSnapshotFromParams,
  PhaseSnapshotUnionFromParams,
  
  // App Phase type
  AppPhase
};

// Export the main interfaces
export type { PhaseEntity, PhaseMilestone, PhaseSettings, PhaseNotificationSettings };