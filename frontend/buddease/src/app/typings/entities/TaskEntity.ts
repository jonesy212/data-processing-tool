import { AppMetadata } from '@/server/database/MetaDataOptions';
// TaskEntity.ts

import { RealtimeDataItem } from '@/app/components/models/realtime/RealtimeData';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Comment } from "@/app/models/comments/Comments";
import { BaseData } from '@/app/models/data/Data';
import { Progress } from "@/app/models/tracker/ProgressBar";
import {  PriorityTypeEnum } from "@/app/models/data/StatusType";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { User } from "@/app/users/User";
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { StructuredMetadata  } from "@/config/StructuredMetadata";

// 1. Core Task Data
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

// 2. Type definitions with 6 parameters
type TaskK = TaskCoreData;
type TaskMeta = DefaultMeta<TaskCoreData, TaskK>;
type TaskAttachment = Attachment;
type TaskExcludedFields = DefaultExcludedFields<TaskCoreData>;
type TaskIncludedFields = keyof TaskCoreData;

// 3. App Metadata
type AppTaskMetadata = AppMetadata<
  TaskCoreData,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 4. Structured & Unified Metadata
type TaskStructuredMetadata = StructuredMetadata<
  TaskCoreData,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

type TaskUnifiedMetadata = UnifiedMetadata<
  TaskCoreData,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 5. Main Task Entity
interface TaskEntity
  extends BaseEntity<TaskUnifiedMetadata>,
    BaseData<TaskCoreData, TaskK, TaskStructuredMetadata, TaskAttachment>,
    TaskCoreData {

  // Task Management
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dependencies: TaskEntity[] | null;
  subtasks: TaskEntity[] | undefined;
  parentTaskId: string | null;
  taskNumber: string;

  // Progress & Status
  progress: Progress;
  estimatedHours: number | null;
  actualHours: number | null;
  timeSpent: number;
  completionPercentage: number;
  blocked: boolean;
  blockedReason: string | null;

  // Dates
  createdDate: Date;
  lastModifiedDate: Date;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;

  // Organization
  projectId: string;
  phaseId: string;
  labels: string[];
  category: string;

  // Collaboration
  comments: Comment[];
  attachments: Attachment[];

  // Workflow
  workflowState: string;
  customFields: Record<string, any>;
}

// 6. Parameters container
type TaskBaseParams = {
  T: TaskCoreData;
  K: TaskK;
  Meta: TaskMeta;
  AttachmentType: TaskAttachment;
  ExcludedFields: TaskExcludedFields;
  IncludedFields: TaskIncludedFields;
};

// 7. Snapshot types
type TaskSnapshot = Snapshot<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotData = SnapshotData<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotStore = SnapshotStore<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotWithCriteria = SnapshotWithCriteria<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSubscriberCollection = SubscriberCollection<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskRealtimeDataItem = RealtimeDataItem<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 8. Config types
type TaskSnapshotStoreConfig = SnapshotStoreConfig<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotsArray = SnapshotsArray<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskParams = SnapshotConfigParams<TaskCoreData, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 9. Utility
type ApplyTaskFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

export type {
    ApplyTaskFieldFilters, AppTaskMetadata, TaskAttachment, TaskBaseParams, TaskCoreData,
    TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK,
    TaskMeta, TaskParams, TaskRealtimeDataItem, TaskSnapshot, TaskSnapshotData, TaskSnapshotsArray, TaskSnapshotStore, TaskSnapshotStoreConfig, TaskSnapshotWithCriteria, TaskStructuredMetadata, TaskSubscriberCollection, TaskUnifiedMetadata
};

