import { Attachment } from '@/app/documents/attachment/Attachment';
import { Task, TaskData } from '@/app/models/tasks/Task';
import {
  ProjectAttachment,
  ProjectEntity,
  ProjectExcludedFields,
  ProjectIncludedFields,
  ProjectK,
  ProjectMeta
} from '@/app/typings/entities/ProjectEntity';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { TaskMetadata, UnifiedMetaDataOptions } from "@/app/config/MetaDataOptions";
import { ProjectMetadata, StructuredMetadata } from "@/app/config/StructuredMetadata";
import { sharedBaseData } from '@/app/config/metadata/MetadataHooks';

// Pick specific keys from T
type Fields<T, K extends keyof T> = Pick<T, K>;
type IncludeFields<T, K extends keyof T> = Pick<T, K>;

// Exclude specific keys from T
type ExcludeKeys<T, K extends keyof T> = Omit<T, K>;
type IncludeKeys<T, K extends keyof T> = Pick<T, K>;

// Combine include and exclude logic
type InclusiveExclusiveFields<
  T,
  Include extends keyof T = never,
  Exclude extends keyof T = never
> = Include extends never
  ? ExcludeKeys<T, Exclude>
  : IncludeFields<T, Include> & ExcludeKeys<T, Exclude>;


// Example of using Fields and ExcludeKeys with UnifiedMetaDataOptions
// Use the Fields utility type to get specific fields from UnifiedMetaDataOptions
type ProjectFields = Fields<ProjectMetadata<Task<TaskData>, Task<ProjectEntity,
  ProjectK,
  ProjectMeta,
  ProjectAttachment,
  ProjectExcludedFields,
  ProjectIncludedFields
  >
>, 'projectId'>; // { projectId: string }

// Use ExcludeKeys to create a type without specific keys
type TaskWithoutId = ExcludeKeys<TaskMetadata<Task<ProjectEntity,
    ProjectK,
    ProjectMeta,
    ProjectAttachment,
    ProjectExcludedFields,
    ProjectIncludedFields>,
    Task<ProjectEntity,
    ProjectK,
    ProjectMeta,
    ProjectAttachment,
    ProjectExcludedFields,
    ProjectIncludedFields
  >
>, 'taskId'>; // { taskName: string }

// If needed, we can also define ExcludedFields as a generic utility for clarity
type ExcludedFields<T, K extends keyof T> = {
  // Retain all properties of T except for the excluded keys K
  [P in Exclude<keyof T, K>]: T[P];
};

type MapExcludedFieldsToMetaKeys<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> = ExcludedFields extends keyof Meta ? ExcludedFields : never;

// Example utility function to add source tracking for shared fields
function addSource<T>(metadata: T, source: string): T & { source: string } {
  return { ...metadata, source };
}

// Type guard functions to determine the origin
function isTaskMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(metadata: any): metadata is TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return metadata?.source === 'TaskMetadata';
}


function isProjectMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(metadata: any): metadata is ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return metadata?.source === 'ProjectMetadata';
}


// Example function to demonstrate how to use the union and utility types
function processMetadata<T extends UnifiedMetaDataOptions<any>>(metadata: T) {
  // Example of using Fields utility type with task metadata fields
  if ('taskMetadata' in metadata) {
    const taskFields: Fields<TaskMetadata<any, any>, 'taskId' | 'taskName'> = {
      taskId: metadata.taskMetadata!.taskId,
      taskName: metadata.taskMetadata!.taskName,
    };
    console.log("Task Metadata Fields:", taskFields);
  }

  // Example of using Fields utility type with project metadata fields
  if ('projectMetadata' in metadata) {
    const projectFields: Fields<ProjectMetadata<any, any>, 'projectId' | 'projectName'> = {
      projectId: metadata.projectMetadata!.projectId,
      projectName: metadata.projectMetadata!.projectName,
    };
    console.log("Project Metadata Fields:", projectFields);
  }

  // Use ExcludeKeys utility type with UnifiedMetaDataOptions for other fields
  const excludedFields: ExcludeKeys<T, 'projectMetadata' | 'taskMetadata'> = { ...metadata };
  delete (excludedFields as any).projectMetadata;
  delete (excludedFields as any).taskMetadata;

  console.log("Excluded Fields:", excludedFields);
}

// Example: use BaseDataEntity directly
const exampleTaskMetadata: UnifiedMetaDataOptions<
  BaseDataEntity,                  // T
  BaseDataEntity,                  // K
  StructuredMetadata<BaseDataEntity, BaseDataEntity>, // Meta
  never                            // ExcludedFields
> = {
  taskMetadata: {
    taskId: '123',
    taskName: 'Complete documentation',
    id: 'task-1',
    priority: 'High',
    assignedTo: null,
  },
  source: 'TaskMetadata',
  timestamp: new Date(),
  metadataEntries: {},
  sharedBaseData: sharedBaseData,
};

// Call a function that processes the metadata
processMetadata(exampleTaskMetadata);


export type { ExcludedFields, ExcludeKeys, Fields, InclusiveExclusiveFields, MapExcludedFieldsToMetaKeys };
