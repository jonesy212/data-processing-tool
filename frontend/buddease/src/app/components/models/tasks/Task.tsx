// Task.tsx
// Task.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SupportedData } from '@/app/models/CommonData';
import { CommonDetails } from '@/app/components/models/details/CommonDetails'

import { BaseData } from '@/app/models/data/Data';
import { Task } from '@/app/models/tasks/Task';
import { Permission } from '@/app/permissions/Permission';
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta } from '@/app/typings/entities/TaskEntity';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
 
export interface TaskEntityExtended extends TaskEntity {
  permissions?: Permission[] | string[];
  ownerId: string;
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({ 
  task,
  completed,
}: {
  task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  completed: boolean;
}) => (
  <CommonDetails
    data={{
      id: task.id, 
      completed,
      label: task.label,
      currentMeta: task.currentMeta,
      currentMetadata: task as unknown as SupportedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["data"],
      date: new Date(), 
      createdBy: task.createdBy,
      latestVersion: task.latestVersion
    }}
    details={{
      _id: task.id,
      id: task.id as string,
      title: task.title,
      description: task.description,
      status: task.status,
      participants: task.participants,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
      startDate: task.startDate,
      uploadedAt: task.uploadedAt,
      type: task.type,
      tags: task.tags,
      isActive: task.isActive,
      phase: task.phase,
      fakeData: task.fakeData,
      comments: task.comments,
      analysisResults: task.analysisResults,
      completed: task.isComplete,
      currentMeta: task.currentMeta,
      currentMetadata: task.currentMetadata,
      latestVersion: task.latestVersion,
      date: task.date
    }}
  />
);

export default TaskDetails;
export type { Task };

