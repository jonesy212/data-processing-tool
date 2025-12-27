// TaskEntity.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Permission } from '@/app/permissions/Permission';

import { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from '@/app/config/MetaDataOptions';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { Task } from '@/app/models/tasks/Task';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { AppMetadata } from '@/app/typings/metadataTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';

interface TaskEntity extends BaseEntity<AppMetadata<AppTaskMetadata>> {
  name: string;
  status?: AllStatus;
  priority?: PriorityTypeEnum;
  dueDate?: Date;
  isComplete?: boolean;
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  projectName?: string;
}


// 1a. Extended model (K)
interface TaskEntityExtended extends TaskEntity {
  ownerId: string;
  permissions: Permission[];
}

// 2. Type definitions with 6 parameters
type TaskEntity = BaseMetaEntity;
type TaskK = TaskEntityExtended;
type TaskMeta = DefaultMeta<TaskEntity, TaskK>;
type TaskAttachment = Attachment;
type TaskExcludedFields = DefaultExcludedFields<TaskEntity>;
type TaskIncludedFields = keyof TaskEntity;


// 3. App Metadata
type AppTaskMetadata = AppMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

// 4. Structured & Unified Metadata
type TaskStructuredMetadata = StructuredMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;

type TaskUnifiedMetadata = UnifiedMetadata<
  TaskEntity,
  TaskK,
  TaskMeta,
  TaskAttachment,
  TaskExcludedFields,
  TaskIncludedFields
>;


// 5. Parameters container
type TaskBaseParams = {
  T: TaskEntity;
  K: TaskK;
  Meta: TaskMeta;
  AttachmentType: TaskAttachment;
  ExcludedFields: TaskExcludedFields;
  IncludedFields: TaskIncludedFields;
};

// 6. Snapshot types
type TaskSnapshot = Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotData = SnapshotData<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotStore = SnapshotStore<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotWithCriteria = SnapshotWithCriteria<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSubscriberCollection = SubscriberCollection<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskRealtimeDataItem = RealtimeDataItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskCollection = TaskEntity[];

// 7. Config types
type TaskSnapshotStoreConfig = SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskSnapshotsArray = SnapshotsArray<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
type TaskParams = SnapshotConfigParams<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

// 8. Utility
type ApplyTaskFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;


export type AppTask = Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;

export type {
    ApplyTaskFieldFilters,
    AppTaskMetadata, TaskAttachment, TaskBaseParams,
    TaskCollection, TaskEntity, TaskExcludedFields,
    TaskIncludedFields, TaskK,
    TaskMeta, TaskParams, TaskRealtimeDataItem,
    TaskSnapshot, TaskSnapshotData,
    TaskSnapshotsArray, TaskSnapshotStore,
    TaskSnapshotStoreConfig,
    TaskSnapshotWithCriteria,
    TaskStructuredMetadata,
    TaskSubscriberCollection,
    TaskUnifiedMetadata
};

