// CommonDocumentPropertiesAndMethods.ts
import { Task } from "@/app/models/tasks/Task";
import { Collaborator } from "@/app/collaborators/Collaborator";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

interface CommonDocumentPropertiesAndMethods<  
T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > {
  //Common propertis and methods for a document ypes
  getTitle(): string;
  getAuthor(): string;
  printInfo(): void;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: string[];
  downloadUrl: string;
  version: number;
  comments: string[];
  tags: string[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  collaborators: Collaborator[];
  permissions: Record<string, boolean>;
  isPublic: boolean;
  parentDocument: string;
  history: string[];
  isTemplate: boolean;
  dueDate: Date;
  owner: string;
  favorite: boolean;
  collaborativeEditing: boolean;
  taskAssignees: Record<string, string[]>;
  fileType: string;
}

export type { CommonDocumentPropertiesAndMethods };
