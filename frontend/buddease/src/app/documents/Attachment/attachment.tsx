// Attachment.tsx
import FileMetadata from '@/app/components/models/file/FileManager';

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  fileType?: FileType;
  fileMetadata?: FileMetadata;
  size: number;
  isImage?: boolean;
  metadata?: Record<string, any>;
  fileName?: string;
}

export type FileType =
  | "image"
  | "document"
  | "link"
  | "audio"
  | "video"
  | "nft"
  | "archive"
  | "text"
  | "code"
  | "compressed"
  | "vector"
  | "spreadsheet"
  | "presentation"
  | "pdf"
  | "other"
  | "directory"
  | "file"

export const attachmentInitialState: Record<string, Attachment> = {};


export type { Attachment };
