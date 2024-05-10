export interface Attachment extends File {
  id: string;
  url: string;
  name: string;
  fileType: FileType;
  size: number;
  isImage?: boolean;
  metadata?: Record<string, any>;
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
