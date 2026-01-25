// projectTypes.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { BaseData } from '@/core/models/data/Data';
import type { PriorityTypeEnum } from '@/core/models/data/StatusType';
import type { Member } from '@/core/models/members/Member';
import type { Task } from '@/core/models/tasks/Task';
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';
import type { ProjectAttachment, ProjectEntity, ProjectExcludedFields, ProjectIncludedFields, ProjectK, ProjectMeta } from '@/core/typings/entities/ProjectEntity';
import type { ProjectMilestone } from '@/core/typings/milestoneTypes';

// -------------------- Project Core Types --------------------

export enum ProjectStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ARCHIVED = "archived"
}

export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical"
}

export interface ProjectMetrics {
  taskCompletionRate: number;
  phaseProgress: number;
  budgetUtilization: number;
  resourceUtilization: number;
  riskCount: number;
  teamSatisfaction?: number;
  velocity: number;
  qualityMetrics: {
    bugCount: number;
    testCoverage: number;
    codeReviewPassRate: number;
  };
  timelineAdherence: number;
  budgetAdherence: number;
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // in days
  actualDuration?: number;
  milestones: ProjectMilestone[];
  criticalPath: string[];
}

export interface ProjectRisk {
  id: string;
  description: string;
  category: 'schedule' | 'budget' | 'technical' | 'resource' | 'scope';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigationPlan: string;
  assignedTo: string;
  dueDate: Date;
  status: 'identified' | 'monitoring' | 'mitigated' | 'resolved';
}

export interface ProjectResource {
  id: string;
  name: string;
  type: 'human' | 'equipment' | 'financial' | 'material';
  allocation: number; // percentage
  cost: number;
  availability: Date[];
  skills?: string[];
  assignedTasks: string[];
}

// Enhanced ProjectBudget interface
export interface ProjectBudget {
  total: number;
  used: number;
  allocated: number;      // Total allocated across all categories
  spent: number;
  remaining: number;
  currency: string;
  categories: {
    [category: string]: {
      allocated: number;  // Allocated for this specific category
      spent: number;
      remaining: number;
    }
  };
  allocations: {          // Detailed allocation records
    id: string;
    category: string;
    amount: number;
    date: Date;
    description: string;
  }[];
  variance: number;
  lastUpdated: Date;
}

// -------------------- Project Data Interface --------------------
export interface ProjectData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Project-specific properties
  currentPhase: ProjectPhase;
  projectStatus: ProjectStatus;
  priority: ProjectPriority;
  tasks: Task<T, K>[];
  
  // Project management
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  resources: ProjectResource[];
  risks: ProjectRisk[];
  metrics: ProjectMetrics;
  
  // Team and stakeholders
  projectManager: string;
  teamMembers: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  stakeholders: string[];
  
  // Metadata
  metadata: {
    convertedFromSnapshot?: boolean;
    snapshotId?: string;
    conversionTimestamp?: string;
    originalSnapshotType?: string;
    projectTemplate?: string;
    industry?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    [key: string]: any;
  };
}

// -------------------- Project Conversion Types --------------------
export interface ProjectConversionResult<T = any> {
  success: boolean;
  projectData?: T;
  error?: string;
  warnings?: string[];
  conversionMetadata?: {
    sourceType: string;
    conversionMethod: string;
    timestamp: string;
    processedItems: number;
  };
}

export interface ProjectValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// -------------------- Project Management Types --------------------
export interface ProjectManagementOptions {
  enableLogging?: boolean;
  autoSave?: boolean;
  validationStrict?: boolean;
  enableRealTimeSync?: boolean;
  backupEnabled?: boolean;
  conflictResolution?: 'auto' | 'manual' | 'hybrid';
}

export interface ProjectSearchCriteria {
  phase?: ProjectPhase;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  teamMembers?: string[];
  budgetRange?: {
    min: number;
    max: number;
  };
}

export interface ProjectFilterState {
  phases: ProjectPhase[];
  statuses: ProjectStatus[];
  priorities: ProjectPriority[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  teamMembers: string[];
  tags: string[];
}

// -------------------- Project Event Types --------------------
export interface ProjectEvent<T = any> {
  id: string;
  type: ProjectEventType;
  timestamp: Date;
  projectId: string;
  userId: string;
  data: T;
  metadata: {
    source: string;
    version: string;
    correlationId?: string;
  };
}

export enum ProjectEventType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  PHASE_CHANGED = 'phase_changed',
  TASK_ADDED = 'task_added',
  TASK_COMPLETED = 'task_completed',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  RISK_IDENTIFIED = 'risk_identified',
  BUDGET_UPDATED = 'budget_updated',
  RESOURCE_ALLOCATED = 'resource_allocated'
}

// -------------------- Project Snapshot Integration Types --------------------
export interface ProjectSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  timestamp: Date;
  projectId: string;
  data: ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  version: number;
  changeSet: ProjectChangeSet;
  metadata: {
    createdBy: string;
    snapshotType: 'manual' | 'auto' | 'recovery';
    description?: string;
  };
}

export interface ProjectChangeSet {
  added: string[];
  modified: string[];
  deleted: string[];
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
}

// -------------------- Project Template Types --------------------
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  complexity: 'simple' | 'moderate' | 'complex';
  phases: ProjectTemplatePhase[];
  defaultTasks: TaskTemplate[];
  estimatedDuration: number;
  requiredResources: string[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
  };
}

export interface ProjectTemplatePhase {
  phase: ProjectPhase;
  name: string;
  description: string;
  duration: number;
  deliverables: string[];
  successCriteria: string[];
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  phase: ProjectPhase;
  estimatedHours: number;
  dependencies: string[];
  requiredSkills: string[];
  priority: PriorityTypeEnum;
}

// -------------------- Project Report Types --------------------
export interface ProjectReport {
  id: string;
  projectId: string;
  reportType: ProjectReportType;
  generatedAt: Date;
  generatedBy: string;
  data: ProjectReportData;
  format: 'pdf' | 'excel' | 'html' | 'json';
}

export enum ProjectReportType {
  STATUS_REPORT = 'status_report',
  FINANCIAL_REPORT = 'financial_report',
  RISK_REPORT = 'risk_report',
  RESOURCE_REPORT = 'resource_report',
  PERFORMANCE_REPORT = 'performance_report',
  COMPREHENSIVE_REPORT = 'comprehensive_report'
}

export interface ProjectReportData {
  summary: ProjectSummary;
  metrics: ProjectMetrics;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  risks: ProjectRisk[];
  achievements: string[];
  challenges: string[];
  recommendations: string[];
}

export interface ProjectSummary {
  currentPhase: ProjectPhase;
  overallProgress: number;
  keyMilestones: ProjectMilestone[];
  nextSteps: string[];
  criticalIssues: string[];
}

// -------------------- Type Guards --------------------
export function isProjectData<T extends BaseDataEntity>(
  data: any
): data is ProjectData<T> {
  return (
    data &&
    typeof data === 'object' &&
    'currentPhase' in data &&
    'projectStatus' in data &&
    'tasks' in data &&
    Array.isArray(data.tasks) &&
    'timeline' in data &&
    'budget' in data
  );
}

export function isProjectConversionResult<T>(
  result: any
): result is ProjectConversionResult<T> {
  return (
    result &&
    typeof result === 'object' &&
    'success' in result &&
    typeof result.success === 'boolean'
  );
}

// -------------------- Utility Types --------------------
export type ProjectID = string & { readonly __brand: unique symbol };
export type ProjectPhaseType = keyof typeof ProjectPhase;
export type ProjectStatusType = keyof typeof ProjectStatus;

export type ProjectMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Map<string, ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

// -------------------- Default Project Type --------------------
export type DefaultProjectData = ProjectData<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;