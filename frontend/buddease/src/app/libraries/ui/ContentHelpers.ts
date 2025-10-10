// ContentHelpers.ts
import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Task } from "@/app/models/tasks/Task";
import { Project } from "@/app/models/projects/Project";
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { Todo } from "@/app/todos/Todo";

export function isTask<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(content: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Project): content is Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (content as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>).status !== undefined;
}

export function isProject<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(content: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Project): content is Project {
  return (content as Project).startDate !== undefined;
}

export function isTodo<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(content: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): content is Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return (content as Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>).title !== undefined;
  }

  
export function isMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): data is SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  & Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
> {
    return data instanceof Map;
  }