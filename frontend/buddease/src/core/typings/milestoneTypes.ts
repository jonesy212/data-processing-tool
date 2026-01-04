milestoneTypes.ts
import {
    BaseEntityProperties,
    SharedIdentifiers,
    SharedSnapshotProperties,
    SharedStatusFlags,
    SharedTimestamps
} from '@/core/documents/RelatedProps';
import { StatusType } from '@/core/models/data/StatusType';
import { Reminder } from '@/core/settings/Reminder';

-------------------- Core Milestone Interface --------------------
export interface Milestone extends 
  BaseEntityProperties,
  SharedTimestamps,
  SharedStatusFlags {
  
  // Core Identification (some already in BaseEntityProperties)
  // id, name, title, category are already in BaseEntityProperties
  
  // Milestone-specific properties not covered by shared interfaces
  description: string;
  deliverables: string[]; // What needs to be delivered
  successCriteria: string[]; // How we know it's done
  
  // Dependencies & Relationships
  dependencies: string[]; // IDs of milestones this depends on
  dependentMilestones: string[]; // IDs of milestones that depend on this
  projectId: string; // Parent project ID
  phaseId?: string; // Optional phase association
  
  // Dates (some already in SharedTimestamps, add milestone-specific)
  date: Date; // Primary milestone date
  dueDate: Date | null; // Optional specific due date
  startDate: Date | null; // Optional start date for milestone period
  completedDate?: Date; // When milestone was actually completed
  estimatedDate?: Date; // Original estimated completion date
  
  // Status & Progress (status flags in SharedStatusFlags)
  status: AllStatus;
  completed: boolean; // Simple completion flag
  progress: number; // 0-100 percentage
  
  // Resource Information
  assignedTo?: string; // Person/team responsible
  requiredResources: string[]; // Resources needed
  budgetAllocation?: number; // Budget for this milestone
  
  // Risk & Impact
  riskLevel: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  blockers: string[]; // Current blocking issues
  
  // Priority & Tags (already in BaseEntityProperties as category?)
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

-------------------- Specialized Milestone Types --------------------

-------------------- Phase-Specific Milestone --------------------
export interface PhaseMilestone extends 
  Milestone,
  SharedSnapshotProperties<BaseDataEntity> { // Add snapshot properties
  
  // Phase-specific required properties
  phaseId: string; // Required for PhaseMilestone (optional in base)
  phaseName: string;
  phaseOrder: number; // Order within the phase
  phaseStatus: 'pending' | 'in-progress' | 'completed' | 'blocked';
  
  // Phase-specific metadata
  isPhaseEntry?: boolean; // Marks entry into a phase
  isPhaseExit?: boolean; // Marks exit from a phase
  phaseCompletionRequired?: boolean; // Must complete to exit phase
  
  // Additional phase-specific properties
  phaseDescription?: string;
  phaseDeliverables?: string[];
  phaseSuccessCriteria?: string[];
}

-------------------- Project-Specific Milestone --------------------
export interface ProjectMilestone extends 
  Milestone,
  SharedIdentifiers<BaseDataEntity> { // Add identifier properties
  
  // Project-specific extensions
  projectPhase: string;
  isCritical: boolean; // Part of critical path
  baselineDate?: Date; // Original planned date
  variance?: number; // Days ahead/behind schedule
  
  // Additional project metrics
  earnedValue?: number;
  plannedValue?: number;
  actualCost?: number;
  scheduleVariance?: number;
  costVariance?: number;
}

-------------------- Usage/Productivity Milestone --------------------
export interface UsageMilestone extends 
  Milestone,
  SharedSnapshotProperties<BaseDataEntity> {
  
  // Usage-specific properties
  type: 'usage' | 'productivity' | 'collaboration' | 'learning' | 'financial';
  achievedAt: Date;
  value: number;
  badgeUrl?: string;
  
  // Usage metrics
  metricName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CalendarMilestone extends Milestone {
  // Calendar-specific extensions
  calendarId: string;
  eventId?: string; // Linked calendar event
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  visibility: 'public' | 'private' | 'team';
  reminders: Reminder[];
}

export interface TaskMilestone extends Milestone {
  // Task-specific extensions
  taskId: string;
  subtasks: string[]; // Related subtask IDs
  effortEstimate: number; // Hours/days estimate
  actualEffort?: number; // Actual time spent
}

-------------------- Supporting Types --------------------

export interface MilestoneDependency {
  fromMilestoneId: string;
  toMilestoneId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number; // Days of lag/lead
}

export interface MilestoneGroup {
  id: string;
  name: string;
  description: string;
  milestones: string[]; // Milestone IDs
  status: AllStatus;
  progress: number;
}

-------------------- Milestone Filter & Query Types --------------------
export interface MilestoneFilter {
  status?: AllStatus[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  assignedTo?: string[];
  projectId?: string;
  tags?: string[];
  search?: string;
}

export interface MilestoneQueryParams {
  filter?: MilestoneFilter;
  sortBy?: 'date' | 'dueDate' | 'name' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  includeCompleted?: boolean;
  page?: number;
  pageSize?: number;
}

-------------------- Milestone Update & Change Types --------------------
export interface MilestoneUpdate {
  id: string;
  changes: Partial<Milestone>;
  reason?: string;
  updatedBy: string;
}

export interface MilestoneProgressUpdate {
  milestoneId: string;
  progress: number;
  status: AllStatus;
  notes?: string;
  updatedBy: string;
  date: Date;
}

-------------------- Milestone Analytics Types --------------------
export interface MilestoneAnalytics {
  milestoneId: string;
  onTime: boolean;
  daysEarly?: number;
  daysLate?: number;
  progressTrend: 'improving' | 'declining' | 'stable';
  riskScore: number;
  dependencyHealth: number; // 0-100 score of dependency status
}

export interface MilestoneBurndown {
  date: Date;
  planned: number; // Planned milestones to complete
  actual: number; // Actual milestones completed
  remaining: number; // Milestones remaining
}

-------------------- Factory Functions --------------------
export function createMilestone(base: Partial<Milestone> = {}): Milestone {
  const now = new Date();
  
  return {
    id: base.id || `milestone-${Date.now()}`,
    name: base.name || 'New Milestone',
    title: base.title || base.name || 'New Milestone',
    date: base.date || now,
    dueDate: base.dueDate || null,
    startDate: base.startDate || null,
    status: base.status || StatusType.Pending,
    completed: base.completed || false,
    progress: base.progress || 0,
    description: base.description || '',
    deliverables: base.deliverables || [],
    successCriteria: base.successCriteria || [],
    dependencies: base.dependencies || [],
    dependentMilestones: base.dependentMilestones || [],
    projectId: base.projectId || '',
    priority: base.priority || 'medium',
    tags: base.tags || [],
    createdBy: base.createdBy || 'system',
    createdAt: base.createdAt || now,
    updatedAt: base.updatedAt || now,
    requiredResources: base.requiredResources || [],
    riskLevel: base.riskLevel || 'low',
    impact: base.impact || 'medium',
    blockers: base.blockers || [],
    ...base
  };
}

export function createProjectMilestone(base: Partial<ProjectMilestone> = {}): ProjectMilestone {
  const milestone = createMilestone(base);
  
  return {
    ...milestone,
    projectPhase: base.projectPhase || '',
    isCritical: base.isCritical || false,
    baselineDate: base.baselineDate,
    variance: base.variance
  };
}

export function createCalendarMilestone(base: Partial<CalendarMilestone> = {}): CalendarMilestone {
  const milestone = createMilestone(base);
  
  return {
    ...milestone,
    calendarId: base.calendarId || '',
    eventId: base.eventId,
    recurrence: base.recurrence,
    visibility: base.visibility || 'team',
    reminders: base.reminders || []
  };
}

-------------------- Type Guards --------------------
export function isMilestone(obj: any): obj is Milestone {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'date' in obj &&
    'status' in obj &&
    'projectId' in obj
  );
}

export function isProjectMilestone(obj: any): obj is ProjectMilestone {
  return isMilestone(obj) && 'projectPhase' in obj;
}

export function isCalendarMilestone(obj: any): obj is CalendarMilestone {
  return isMilestone(obj) && 'calendarId' in obj;
}

-------------------- Utility Functions --------------------
export function calculateMilestoneProgress(milestone: Milestone): number {
  if (milestone.completed) return 100;
  
  // Simple calculation based on time elapsed
  if (milestone.startDate && milestone.dueDate) {
    const total = milestone.dueDate.getTime() - milestone.startDate.getTime();
    const elapsed = Date.now() - milestone.startDate.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }
  
  return milestone.progress;
}

export function isMilestoneOverdue(milestone: Milestone): boolean {
  if (milestone.completed) return false;
  return milestone.dueDate ? new Date() > milestone.dueDate : false;
}

export function getMilestoneStatus(milestone: Milestone): AllStatus {
  if (milestone.completed) return StatusType.Completed;
  if (isMilestoneOverdue(milestone)) return StatusType.Overdue;
  if (milestone.progress > 0) return StatusType.InProgress;
  return milestone.status;
}

-------------------- Default Export --------------------
export default Milestone;