// TaskDetailsComponent.tsx
// TaskDetails.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

// using commong detais we genrate details for components by mapping through the objects.
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
      currentMetadata: task as unknown as SupportedData<T, K, Meta>["data"],
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