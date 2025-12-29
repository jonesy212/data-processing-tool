// PhaseEntity.ts
import { BaseDataEntity, BaseDataRoot, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Phase } from '@/core/models/phases/Phase';
import { Dependency } from '@/core/models/realtime/IntegrationLogic';
import { SnapshotsArray, SnapshotUnion } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/core/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { NotificationAttachment, NotificationEntity, NotificationExcludedFields, NotificationIncludedFields, NotificationK, NotificationMeta } from '@/core/typings/entities/NotificationEntity';
import { PhaseStructuredMetadata } from '@/core/typings/phaseTypes';
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";

// Define the actual PhaseEntity interface
interface PhaseEntity
  extends BaseEntity<BaseDataRoot> {
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

interface PhaseMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  assignedTo?: string; // User ID
  isPhaseEntry: true,
  phaseCompletionRequired: true
}

interface PhaseSettings {
  allowOverlap: boolean;
  autoProgress: boolean;
  notificationSettings: PhaseNotificationSettings;
  approvalRequired: boolean;
}

interface PhaseNotificationSettings {
  onStart: boolean;
  onCompletion: boolean;
  onDelay: boolean;
  dailyProgress: boolean;
}

// Phase-specific type parameters
type PhaseT = PhaseEntity;
type PhaseK = PhaseT;
type PhaseMeta = DefaultMeta<PhaseT, PhaseK>;
type PhaseAttachment = Attachment;
type PhaseExcludedFields = DefaultExcludedFields<PhaseT>;
type PhaseIncludedFields = keyof PhaseT;


// Phase parameters container
type PhaseBaseParams = {
  T: PhaseEntity;
  K: PhaseK;
  Meta: PhaseMeta;
  AttachmentType: PhaseAttachment;
  ExcludedFields: PhaseExcludedFields;
  IncludedFields: PhaseIncludedFields;
};

// CLEARLY NAMED PHASE TYPES:

// Complete phase with all fields
type CompletePhase = PhaseT;

// Phase for public display
type PublicPhaseProfile = Pick<PhaseT, "id" | "name" | "description" | "order" | "status" | "progress" | "startDate" | "endDate" | "color">;

// Minimal phase for basic display (lists, dropdowns)
type BasicPhaseInfo = Pick<PhaseT, "id" | "name" | "order" | "status" | "progress" | "color">;

// Phase with dependencies and milestones for detailed views
type PhaseWithDetails = PhaseT & {
  dependentPhases?: PhaseT[];
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
type PhaseSnapshot = Snapshot<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotData = SnapshotData<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotStore = SnapshotStore<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotWithCriteria = SnapshotWithCriteria<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSubscriberCollection = SubscriberCollection<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseRealtimeDataItem = RealtimeDataItem<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// Configuration types
type PhaseSnapshotStoreConfig = SnapshotStoreConfig<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
type PhaseSnapshotsArray = SnapshotsArray<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// PARAMS
type PhaseParams = SnapshotConfigParams<PhaseT, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

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





// Base default types for Phase
type PhaseWithGenerics<
  T extends BaseDataEntity = PhaseT,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = PhaseMeta,
  AttachmentType extends Attachment = PhaseAttachment,
  ExcludedFields extends keyof T = PhaseExcludedFields,
  IncludedFields extends keyof T = PhaseIncludedFields
> = Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

// Specialized variants for common use cases
type DefaultPhase = PhaseWithGenerics; // Uses all default Phase types
type CustomEntityPhase<T extends BaseDataEntity> = PhaseWithGenerics<T>; // Custom entity only
type CustomMetaPhase<M extends DefaultMeta<PhaseT, PhaseK>> = PhaseWithGenerics<PhaseT, PhaseK, M>; // Custom meta only

// For your NotificationProvider pattern matching
type NotificationPhase = PhaseWithGenerics<
  NotificationEntity,
  NotificationK,
  NotificationMeta,
  NotificationAttachment,
  NotificationExcludedFields,
  NotificationIncludedFields
>;

export type {

    // App Phase type
    AppPhase, BasicPhaseInfo,
    // Phase entity types
    CompletePhase, PhaseAttachment, PhaseBaseParams, PhaseEntity, PhaseExcludedFields,
    PhaseIncludedFields, PhaseK,
    PhaseMeta, PhaseMilestone, PhaseNotificationSettings, PhaseParams, PhaseRealtimeDataItem, PhaseSettings,
    // Snapshot types
    PhaseSnapshot,
    PhaseSnapshotData,
    // Utility types
    PhaseSnapshotFromParams, PhaseSnapshotsArray, PhaseSnapshotStore, PhaseSnapshotStoreConfig, PhaseSnapshotUnionFromParams, PhaseSnapshotWithCriteria, PhaseSpecificMetadata, PhaseStructuredMetadata, PhaseSubscriberCollection,
    // Core type parameters
    PhaseT,
    // Metadata tmypes
    PhaseWithDetails, PublicPhaseProfile
};

// Export the main interfaces
