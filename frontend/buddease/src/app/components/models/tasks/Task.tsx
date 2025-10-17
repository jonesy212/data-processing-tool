// Task.ts
import { PhaseData, PhaseMeta } from '@/app/models/phases/Phase';
import { Permission } from '@/app/permissions/Permission';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { BaseConfig, BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { EventManager } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { BaseData } from '@/app/models/data/Data';
import { K, T } from '@/app/models/data/dataStoreMethods';
import CommonDetails, { SupportedData } from '@/app/models/CommonData';
import { PriorityTypeEnum, TaskStatus } from '@/app/models/data/StatusType';
import { Phase } from '@/app/models/phases/Phase';
import { Snapshot } from '@/app/snapshots';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { AllTypes } from '@/app/typings/PropTypes';
import { Idea } from '@/app/users/Ideas';
import { VideoData } from '@/app/video/Video';
import { UnifiedMetaDataOptions } from '@/configs/database/MetaDataOptions';

export type TaskData = BaseData<any, any, StructuredMetadata<any, any>, Attachment>;
 

export interface TaskEntityExtended extends TaskEntity {
  permissions: Permission[];
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

