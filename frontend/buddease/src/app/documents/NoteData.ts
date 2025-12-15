// NoteData.ts

import { Collaborator } from "@/app/collaborators/Collaborator";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { DocumentSize } from "@/app/models/data/StatusType";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { Version } from "@/app/versions/Version";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CommonAnimationOptions } from '@/app/documents/SharedDocumentProps';
import { BaseData } from '@/app/models/data/Data';

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
  AttachmentType extends Attachment = Attachment, // <-- key change
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
  attachments?: AttachmentType[];
  geolocation?: NoteGeolocation;
}

export interface NoteAttachment extends Attachment {
  id: string;
  url: string;
  type: AttachmentTypeEnum;
  purpose?: AttachmentPurpose; // Optional role within the note

  // Additional properties as needed
}



export enum NoteStatus {
  ACTIVE = "Active",
  ARCHIVED = "Archived",
  DELETED = "Deleted",
}

export enum AttachmentTypeEnum {
  // Basic types
  IMAGE = "Image",
  FILE = "File",
  LINK = "Link",
  
  // Communication & media
  AUDIO = "Audio",
  VIDEO = "Video",
  TRANSCRIPT = "Transcript",
  PRESENTATION = "Presentation",

  // Documents & assets
  DOCUMENT = "Document",
  SPREADSHEET = "Spreadsheet",
  PDF = "PDF",
  WHITEPAPER = "Whitepaper",
  DESIGN = "Design",
  MOCKUP = "Mockup",

  // Data & analytics
  REPORT = "Report",
  DASHBOARD = "Dashboard",
  DATASET = "Dataset",
  CHART = "Chart",
  CODE_SNIPPET = "Code Snippet",

  // Crypto-related
  WALLET_FILE = "Wallet File",
  TRANSACTION_RECEIPT = "Transaction Receipt",
  SMART_CONTRACT = "Smart Contract",
  CRYPTO_STATEMENT = "Crypto Statement",
  
  // Miscellaneous
  ARCHIVE = "Archive",
  CONFIG = "Config File",
  NOTE_ATTACHMENT = "Note Attachment",
}


export enum AttachmentPurpose {
  // UI & Presentation
  COVER_IMAGE = "Cover Image",
  THUMBNAIL = "Thumbnail",
  BANNER = "Banner Image",
  LOGO = "Logo",
  BACKGROUND = "Background",

  // Documentation & Reference
  SUPPLEMENTARY_FILE = "Supplementary File",
  REFERENCE_LINK = "Reference Link",
  SOURCE_DOCUMENT = "Source Document",
  EVIDENCE = "Evidence File",
  CITATION = "Citation Source",

  // Collaboration & Communication
  MEETING_RECORDING = "Meeting Recording",
  CHAT_ATTACHMENT = "Chat Attachment",
  DISCUSSION_NOTE = "Discussion Note",
  PRESENTATION_MATERIAL = "Presentation Material",

  // Crypto & Finance
  TRANSACTION_PROOF = "Transaction Proof",
  WALLET_BACKUP = "Wallet Backup",
  SMART_CONTRACT_ATTACHMENT = "Smart Contract Attachment",
  EXCHANGE_LOG = "Exchange Log",
  INVESTMENT_REPORT = "Investment Report",

  // Analytics & Data
  PERFORMANCE_REPORT = "Performance Report",
  DATA_EXPORT = "Data Export",
  CHART_ATTACHMENT = "Chart Attachment",

  // Development & Config
  API_REFERENCE = "API Reference",
  CONFIG_FILE = "Configuration File",
  CODE_REFERENCE = "Code Reference",

  // Miscellaneous
  GENERAL_ATTACHMENT = "General Attachment",
  NOTE_ATTACHMENT = "Note Attachment",
  TASK_ATTACHMENT = "Task Attachment",
  PROJECT_FILE = "Project File",
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
