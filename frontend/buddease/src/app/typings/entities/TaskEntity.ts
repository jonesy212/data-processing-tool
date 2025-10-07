// TaskEntity.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { AppMetadata } from "@/config/AppMetadata";
import { BaseData } from '@/app/models/data/Data';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { Attachment } from "@/app/documents/Attachment/attachment";
import { AllStatus, PriorityTypeEnum } from "@/app/models/data/StatusType";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";


// 1. Core Task Data (just the data)
interface TaskCoreData extends BaseDataEntity {
  id: string;
  title: string;
  description?: string;
  status?: AllStatus;
  priority?: PriorityTypeEnum;
  dueDate?: Date | null;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  isComplete?: boolean;
  userId?: number;
  projectName?: string;
}

// Type definitions with 6 parameters
type TaskK = TaskCoreData;
type TaskMeta = DefaultMeta<TaskCoreData, TaskK>;
type TaskAttachment = Attachment;
type TaskExcludedFields = DefaultExcludedFields<TaskCoreData>;
type TaskIncludedFields = keyof TaskCoreData;

// 2. Proper AppMetadata that matches your 6-parameter structure
type AppTaskMetadata = AppMetadata<
  TaskCoreData,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 3. TaskEntity with proper metadata integration
interface TaskEntity
  extends BaseEntity<UnifiedMetadata<
    TaskCoreData,
    TaskK,
    TaskMeta, 
    TaskAttachment,
    TaskExcludedFields,
    TaskIncludedFields
  >>,
    BaseData<
      TaskCoreData,
      TaskK,
      TaskStructuredMetadata,
      TaskAttachment
    >,
    TaskCoreData {
  
  // Task Management Properties
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dependencies: TaskEntity[] | null;
  subtasks: TaskEntity[] | undefined;
  parentTaskId: string | null;
  taskNumber: string;
  
  // Progress & Status Tracking
  progress: Progress;
  estimatedHours: number | null;
  actualHours: number | null;
  timeSpent: number;
  completionPercentage: number;
  blocked: boolean;
  blockedReason: string | null;
  
  // Dates & Scheduling
  createdDate: Date;
  lastModifiedDate: Date;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  
  // Organization & Categorization
  projectId: string;
  phaseId: string;
  labels: string[];
  category: string;
  
  // Collaboration
  comments: Comment[];
  attachments: Attachment[];
  
  // Workflow & Customization
  workflowState: string;
  customFields: Record<string, any>;
}
// Main parameters container
type TaskBaseParams = {
  T: TaskCoreData;
  K: TaskK;
  Meta: TaskMeta;
  AttachmentType: TaskAttachment;
  ExcludedFields: TaskExcludedFields;
  IncludedFields: TaskIncludedFields;
};

export type { 
  TaskCoreData,
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields,
  TaskBaseParams,
  TaskStructuredMetadata
};