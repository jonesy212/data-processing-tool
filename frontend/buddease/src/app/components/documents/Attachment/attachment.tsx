interface Attachment extends File {
  id: string;
  url: string;
  fileType: FileType;
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


export type { Attachment }