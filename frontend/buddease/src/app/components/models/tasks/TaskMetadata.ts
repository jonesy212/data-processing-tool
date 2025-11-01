// TaskMetadata.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Task } from "@/app/models/tasks/Task";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { TaskMetadata } from '@/app/config/MetaDataOptions';



export const taskMetadata = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    // Core identifiers
    id: task.id,
    _id: task._id,
    taskId: task.taskId || "",
    taskName: task.taskName || "",
    
    // Basic task properties
    name: task.name,
    category: task.category,
    description: task.description,
    priority: task.priority,
    assignedTo: task.assignedTo,
    
    // Timestamps and versioning
    timestamp: task.timestamp,
    version: task.version || undefined,
    latestVersion: task.latestVersion,
    versionData: task.versionData,
    
    // Status and configuration
    isActive: task.isActive,
    config: task.config,
    schema: task.schema,
    
    // Relationships
    subtasks: task.dependencies || [],
    scheduledDate: task.scheduled?.startDate || undefined,
    
    // Metadata and content
    metadataEntries: task.metadataEntries,
    keywords: task.keywords,
    customFields: task.customFields,
    
    // System properties
    createdBy: task.createdBy,
    permissions: task.permissions,
    
    // API and operational
    apiEndpoint: task.apiEndpoint,
    apiKey: task.apiKey,
    timeout: task.timeout,
    retryAttempts: task.retryAttempts,
    
    // Data management
    metadata: task.metadata,
    initialState: task.initialState,
    meta: task.meta,
    mappedSnapshot: task.mappedSnapshot,
    events: task.events,
  };
};