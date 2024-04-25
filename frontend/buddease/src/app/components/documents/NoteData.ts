// NoteData.ts

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Collaborator } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import Version from "../versions/Version";
import { DocumentOptions } from "./DocumentOptions";



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

export interface NoteData {
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
  previousMetadata: StructuredMetadata;
  currentMetadata: StructuredMetadata;
  accessHistory: any[];
  lastModifiedDate: Date;
  version: Version;
  versionHistory: NoteVersion[] | Version[]; // Use a union type to allow either NoteVersion or Version
  colorLabel?: string; // Hex color code or predefined label
  collaborators: Collaborator[]; // Array of user IDs
  reminderDate?: Date;
  attachments: NoteAttachment[];
  geolocation?: NoteGeolocation;
}

export interface NoteAttachment {
  id: number;
  type: AttachmentType;
  url: string;
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

export interface NoteOptions extends DocumentOptions {
  size: NoteSize;
  animations: NoteAnimationOptions;
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

export type NoteSize = "letter" | "legal" | "a4" | "custom";

export interface NoteAnimationOptions {
  type: "slide" | "fade" | "custom" | "show";
  duration?: number;
  // Add more animation options if needed
}
