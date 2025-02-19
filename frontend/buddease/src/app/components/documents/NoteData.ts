// NoteData.ts

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { DocumentSize } from "../models/data/StatusType";
import { Collaborator } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import Version from "../versions/Version";

import {CommonAnimationOptions} from './SharedDocumentProps'
import { BaseData } from "../models/data/Data";
import { Attachment } from '@/app/components/documents/Attachment/attachment'

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
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> 
  extends BaseData<T, K> {
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
  previousMetadata: StructuredMetadata<T, K>;
  currentMetadata: StructuredMetadata<T, K>;
  accessHistory: any[];
  lastModifiedDate: Date;
  version: Version;
  versionHistory: NoteVersion[] | Version[]; // Use a union type to allow either NoteVersion or Version
  colorLabel?: string; // Hex color code or predefined label
  collaborators: Collaborator[]; // Array of user IDs
  reminderDate?: Date;
  attachments?: NoteAttachment[];
  geolocation?: NoteGeolocation;
}

export interface NoteAttachment extends Attachment {
  id: string;
  type: AttachmentType;
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
