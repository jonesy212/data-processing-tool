interface File {
  id?: string;
  name?: string | undefined;
  fileMetadata: FileMetadata
}


export interface FileMetadata {
  fileName: string;
  fileSize: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields that can be included
  fileType?: string;
  mimeType?: string;
  extension?: string;
  storageLocation?: 'local' | 'cloud' | 'database' | 'external';
  isEncrypted?: boolean;
  accessLevel?: 'public' | 'private' | 'shared';
  checksum?: string;
  dimensions?: { width: number; height: number }; // For images/videos
  duration?: number; // For audio/video
  
  [key: string]: any; // Additional fileMetadata fields
}




  export type { File, FileMetadata };
