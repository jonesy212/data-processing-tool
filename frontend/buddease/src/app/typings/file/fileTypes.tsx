interface File {
  id?: string;
  name?: string | undefined;
  fileMetadata: FileMetadata
}

interface FileMetadata {
    fileName: string;
    fileSize: number;
    size: number;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any; // Additional fileMetadata fields
  }



  export type { File, FileMetadata };
