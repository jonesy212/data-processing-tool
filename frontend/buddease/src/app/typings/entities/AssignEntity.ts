// AssignEntity.ts

import FrontendStructure from '@/app/config/appStructure/FrontendStructure';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot, SnapshotData, SnapshotStoreConfig } from '@/app/snapshots/Snapshot';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { ApplyFieldFilters } from '@/app/typings/entities/AppEntity';

// Define sensitive fields for assignments
const SensitiveAssignFields = [
  'internalNotes',
  'evaluationData',
  'confidentialFeedback',
  'salaryData',
  'performanceMetrics'
] as const;

type SensitiveAssignField = typeof SensitiveAssignFields[number];

// Define the AssignEntity interface
interface AssignEntity extends BaseDataEntity {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'project' | 'review' | 'training' | 'maintenance';
  
  // 🔒 SENSITIVE FIELDS (Restricted access)
  internalNotes?: string;
  evaluationData?: Record<string, any>;
  confidentialFeedback?: string;
  salaryData?: {
    hourlyRate?: number;
    totalBudget?: number;
    approvedAmount?: number;
  };
  performanceMetrics?: {
    qualityScore: number;
    timelinessScore: number;
    communicationScore: number;
    overallRating: number;
  };
  
  // 🔐 ASSIGNMENT CONTROLS
  assigneeId: string;
  assignerId: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // 📅 SCHEDULING
  dueDate: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  
  // 🎯 OBJECTIVES & DELIVERABLES
  objectives: string[];
  deliverables: {
    name: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate?: Date;
    completedDate?: Date;
  }[];
  
  // 📊 PROGRESS TRACKING
  progress: {
    percentage: number;
    completedItems: number;
    totalItems: number;
    lastUpdate: Date;
  };
  
  // 🔗 RELATIONSHIPS
  relatedTo?: string[]; // IDs of related assignments/projects
  parentId?: string;
  subAssignments?: string[];
  tags: string[];
  
  // 📝 REQUIREMENTS & CRITERIA
  requirements: {
    skills: string[];
    tools: string[];
    prerequisites: string[];
    acceptanceCriteria: string[];
  };
  
  // 🏷️ METADATA
  category: string;
  labels: string[];
  customFields?: Record<string, any>;
  
  // 🔄 WORKFLOW
  workflow: {
    currentStage: string;
    stages: {
      name: string;
      status: 'pending' | 'active' | 'completed';
      completedDate?: Date;
      assignedTo?: string;
    }[];
  };
  
  // 💬 COMMUNICATION
  comments: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    isInternal: boolean;
  }[];
  
  // 📎 ATTACHMENTS
  attachments: string[]; // Attachment IDs
  
  // 🛡️ SECURITY & ACCESS
  visibility: 'private' | 'team' | 'department' | 'organization' | 'public';
  permissions: {
    canEdit: string[];
    canView: string[];
    canComment: string[];
    canApprove: string[];
  };
  
  // 📈 PERFORMANCE & ANALYTICS
  analytics: {
    timeSpent: number;
    efficiencyScore?: number;
    bottlenecks?: string[];
    suggestions?: string[];
  };
  
  // ⚙️ SYSTEM FIELDS
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  version: number;
  isArchived: boolean;
  
  // 🔄 SYNC STATUS
  syncStatus: {
    lastSynced: Date;
    syncMethod?: 'manual' | 'automatic';
    conflicts?: any[];
  };
}

// Assign-specific type parameters
type AssignK = AssignEntity;
type AssignMeta = DefaultMeta<AssignEntity, AssignK> & {
  assignmentSpecific: {
    complexity: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high';
    businessImpact: 'low' | 'medium' | 'high';
    strategicAlignment: number; // 1-10
    
    resourceAllocation: {
      estimatedResources: number;
      actualResources: number;
      resourceType: 'personnel' | 'equipment' | 'financial';
    };
    
    dependencies: {
      blocking: string[]; // IDs of blocking assignments
      blockedBy: string[]; // IDs that block this assignment
    };
    
    stakeholders: {
      id: string;
      role: 'sponsor' | 'reviewer' | 'approver' | 'contributor';
      interestLevel: 'high' | 'medium' | 'low';
    }[];
    
    compliance: {
      requiresApproval: boolean;
      approvalWorkflow: string[];
      regulatoryRequirements: string[];
      auditTrailRequired: boolean;
    };
  };
};

type AssignAttachment = Attachment;
type AssignExcludedFields = DefaultExcludedFields<AssignEntity> | SensitiveAssignField;
type AssignIncludedFields = keyof AssignEntity;

// Assign parameters container
type AssignBaseParams = {
  T: AssignEntity;
  K: AssignK;
  Meta: AssignMeta;
  AttachmentType: AssignAttachment;
  ExcludedFields: AssignExcludedFields;
  IncludedFields: AssignIncludedFields;
};

// Add this missing core type
type AssignData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  id: string;
  data: T;
  metadata: Meta;
  // ... other data properties
};

// Complete assign with all fields
type CompleteAssign = AssignEntity;

// Assign without sensitive fields for public display
type PublicAssignInfo = Pick<AssignEntity, 
  "id" | "title" | "type" | "status" | "priority" | "dueDate" | 
  "assigneeId" | "assignerId" | "progress" | "createdAt"
>;

// Minimal assign for basic operations
type BasicAssignInfo = Pick<AssignEntity, "id" | "title" | "status" | "assigneeId" | "dueDate">;

// Assign for dashboard display
type DashboardAssign = Pick<AssignEntity, 
  "id" | "title" | "type" | "status" | "priority" | "dueDate" | 
  "progress" | "assigneeId" | "labels"
>;

// Secure assign without sensitive data
type SecureAssign = ApplyFieldFilters<AssignEntity, SensitiveAssignField>;

// Core assign types using the pattern
type AssignDataDefault = AssignData<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignSnapshotDefault = Snapshot<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignSnapshotDataDefault = SnapshotData<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignSnapshotStoreDefault = SnapshotStore<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignRealtimeDataItemDefault = RealtimeDataItem<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

// Assign Metadata Types
type AssignUnifiedMetadata = UnifiedMetadata<
  AssignBaseParams['T'],
  AssignBaseParams['K'], 
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignStructuredMetadata = StructuredMetadata<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

// Assign configuration types
type AssignSnapshotStoreConfig = SnapshotStoreConfig<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignSnapshotsArray = SnapshotsArray<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

type AssignParams = SnapshotConfigParams<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

// Assign frontend structure
type AssignFrontendStructure = FrontendStructure<
  AssignBaseParams['T'],
  AssignBaseParams['K'],
  AssignBaseParams['Meta'],
  AssignBaseParams['AttachmentType'],
  AssignBaseParams['ExcludedFields'],
  AssignBaseParams['IncludedFields']
>;

// Assign utility types
type AssignFilterOptions = {
  status?: AssignEntity['status'];
  assigneeId?: string;
  assignerId?: string;
  type?: AssignEntity['type'];
  priority?: AssignEntity['priority'];
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  category?: string;
};

type AssignSortOptions = {
  field: keyof AssignEntity;
  direction: 'asc' | 'desc';
};

type AssignState = {
  currentAssignments: AssignContextData[];
  isLoading: boolean;
  error?: string;
  lastUpdated: Date;
};

// 🔒 RESTRICTED ASSIGN TYPES

// For API responses - never includes sensitive data
type ApiAssignResponse = PublicAssignInfo & {
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
  relatedAssignments?: BasicAssignInfo[];
};

// For internal services - includes critical but not sensitive data
type InternalAssignData = SecureAssign & {
  managementInfo: {
    complexity: string;
    riskLevel: string;
    businessImpact: string;
  };
};

// 🔐 SINGLE COMBINED ASSIGN CONTEXT DATA TYPE
type AssignContextData = {
  // ========================
  // 📋 CORE ASSIGNMENT INFO
  // ========================
  assignment: SecureAssign & PublicAssignInfo;
  
  // ========================
  // 👥 PEOPLE INVOLVED
  // ========================
  assignee?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  assigner?: {
    id: string;
    name: string;
    role: string;
  };
  
  // ========================
  // 📊 PROGRESS & ANALYTICS
  // ========================
  analytics?: {
    efficiency: number;
    timelineAdherence: number;
    qualityScore: number;
    peerComparison?: number;
  };
  
  // ========================
  // 📝 WORKFLOW & ACTIVITY
  // ========================
  workflow?: {
    currentStage: string;
    nextStage?: string;
    stageDeadline?: Date;
    stageRequirements?: string[];
  };
  
  recentActivity?: {
    type: 'comment' | 'status-change' | 'attachment' | 'progress-update';
    timestamp: Date;
    user: string;
    details: string;
  }[];
  
  // ========================
  // 🔗 RELATED ITEMS
  // ========================
  relatedItems?: {
    documents: Array<{ id: string; name: string; type: string }>;
    conversations: Array<{ id: string; topic: string; lastActivity: Date }>;
    dependencies: Array<{ id: string; title: string; status: string }>;
  };
  
  // ========================
  // ⚙️ SETTINGS & PREFERENCES
  // ========================
  settings?: {
    notifications: boolean;
    reminders: boolean;
    autoProgressTracking: boolean;
    reportingFrequency: 'daily' | 'weekly' | 'monthly';
  };
  
  // ========================
  // 🔄 LOADING & ERROR STATES
  // ========================
  isLoading?: boolean;
  error?: string;
  lastSynced?: Date;
};

// 🛡️ SECURE ASSIGN OPERATIONS

type AssignOperation = {
  operation: 'create' | 'update' | 'reassign' | 'complete' | 'cancel';
  data: Partial<AssignEntity>;
  user: {
    id: string;
    role: string;
    permissions: string[];
  };
  timestamp: Date;
};

// 📊 REPORTING TYPES

type AssignReportData = {
  assignments: DashboardAssign[];
  metrics: {
    total: number;
    completed: number;
    overdue: number;
    averageCompletionTime: number;
    priorityBreakdown: Record<string, number>;
  };
  trends: {
    completionRate: number[];
    workloadDistribution: Record<string, number>;
  };
};

export type {

  CompleteAssign as __CompleteAssign, // 🟢 CLIENT-SAFE
  ApiAssignResponse, // 🟡 INTERNAL
  AssignAttachment, // 🟡 INTERNAL
  AssignBaseParams, // 🟢 CLIENT-SAFE
  AssignContextData, // 🟢 CLIENT-SAFE



  // ========================
  // ⚙️ CONFIGURATION & METADATA
  // ========================
  AssignDataDefault,
  // ========================
  // 🔧 CORE ENTITY & PARAMETERS
  // ========================
  AssignEntity, // 🟡 INTERNAL
  AssignExcludedFields, // 🟢 CLIENT-SAFE



  // ========================
  // 🎯 UTILITY & STATE TYPES
  // ========================
  AssignFilterOptions, // 🟡 INTERNAL
  AssignFrontendStructure, // 🟡 INTERNAL
  AssignIncludedFields, // 🟡 INTERNAL
  AssignK, // 🟡 INTERNAL  
  AssignMeta, // 🔴 RESTRICTED ACCESS



  // ========================
  // 🔐 SECURE OPERATIONS
  // ========================
  AssignOperation, // 🟡 INTERNAL
  AssignParams, // 🟡 INTERNAL
  AssignRealtimeDataItemDefault, // 🟡 INTERNAL
  AssignReportData, // 🟡 INTERNAL
  AssignSnapshotDataDefault, // 🟡 INTERNAL
  AssignSnapshotDefault, // 🟡 INTERNAL
  AssignSnapshotsArray, // 🟡 INTERNAL
  AssignSnapshotStoreConfig, // 🟡 INTERNAL
  AssignSnapshotStoreDefault, // 🟢 CLIENT-SAFE
  AssignSortOptions, // 🟢 CLIENT-SAFE
  AssignState, // 🟡 INTERNAL
  AssignStructuredMetadata, // 🟡 INTERNAL
  AssignUnifiedMetadata, // 🟢 CLIENT-SAFE
  BasicAssignInfo, // 🟢 CLIENT-SAFE
  DashboardAssign, // 🟢 CLIENT-SAFE

  InternalAssignData, // 🟡 INTERNAL



  // ========================
  // 📊 DATA VARIATIONS (Security Tiered)
  // ========================
  PublicAssignInfo, // 🟡 INTERNAL
  SecureAssign, // 🟡 INTERNAL
  SensitiveAssignField // 🟡 INTERNAL
};

// Export the sensitive fields array for validation
    export { SensitiveAssignFields };
