// NoteData.ts

import { DocumentSize } from "@/app/models/data/StatusType";
import { Collaborator } from "@/app/collaborators/Collaborator";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { Version } from "@/app/versions/Version";
import { StructuredMetadata } from "@/config/StructuredMetadata";

import { CommonAnimationOptions } from '@/app/documents/SharedDocumentProps';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseData } from '@/app/models/data/Data';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

export interface Change {
  id: number;
  description: string;
  timestamp: Date;
  author: string;
  type: "task" | "milestone" | "project" | "communication" | "resource" | "cryptoTransaction" | "added" | "modified" | "removed";
  progress: Progress
  payload: any
  escalated: boolean
  // Add more properties as needed
}



interface Highlight {
  id: number;
  text: string;
  startIndex: number;
  endIndex: number;
  // Additional properties as needed
}

export interface NoteData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> 
  extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: number;
  title: string;
  content: string;
  tags: string[];
  topics: string[];
  highlights: Highlight[]; // Use the Highlight type here
  keywords: string[];
  category: string;
  status: NoteStatus;
  locked: boolean;
  changes: Change[];
  options: NoteOptions;
  folderPath: string;
  previousContent?: string;
  currentContent?: string;
  previousMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  currentMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  accessHistory: any[];
  lastModifiedDate: Date;
  version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versionHistory: NoteVersion[] | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Use a union type to allow either NoteVersion or Version
  colorLabel?: string; // Hex color code or predefined label
  collaborators: Collaborator[]; // Array of user IDs
  reminderDate?: Date;
  attachments?: NoteAttachment[];
  geolocation?: NoteGeolocation;
}

export interface NoteAttachment extends Attachment {
  id: string;
  type: Attachment;
  url: string;
  purpose?: AttachmentPurpose; // Optional role within the note

  // Additional properties as needed
}



export enum NoteStatus {
  ACTIVE = "Active",
  ARCHIVED = "Archived",
  DELETED = "Deleted",
}

export enum AttachmentType {
  IMAGE = "Image",
  FILE = "File",
  LINK = "Link",
}

export enum AttachmentPurpose {
  COVER_IMAGE = "Cover Image",
  SUPPLEMENTARY_FILE = "Supplementary File",
  REFERENCE_LINK = "Reference Link",
}


export interface NoteOptions {
  size: DocumentSize;
  animations: NoteAnimationOptions & { duration?: number };
  additionalOption2: string;
}

export interface NoteVersion {
  versionNumber: number;
  content: string;
  // Additional properties as needed
}

export interface NoteGeolocation {
  latitude: number;
  longitude: number;
}


export interface NoteOptions {
  size: DocumentSize;
  animations: NoteAnimationOptions & {
    duration?: number 
    
  };
  additionalOption2: string;
}

export interface NoteAnimationOptions extends CommonAnimationOptions {
  // You can add any note-specific animation properties here if needed
}



export type { Highlight };
