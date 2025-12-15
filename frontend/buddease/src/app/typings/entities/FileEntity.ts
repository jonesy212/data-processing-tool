// FileEntity.ts
import { FileMetadata } from '@/app/components/models/file/FileManager';
import { CommonData } from '@/app/models/CommonData';

import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { AppFile } from '@/app/typings/file/fileTypes';

export interface FileEntity extends BaseDataEntity {
  // Core file properties (align with your existing File interface)
  id?: string;
  name?: string | undefined;
  fileMetadata: FileMetadata;
  
  // Additional properties for entity system
  fileName: string; // Keep for compatibility
  filePath: string;
  fileSize: number; // Keep for compatibility
  fileType: string;
  mimeType: string;
  extension: string;
  
  // Content and storage
  content?: string | ArrayBuffer | Blob;
  fileUrl?: string;
  storageLocation: 'local' | 'cloud' | 'database' | 'external';
  
  // Versioning
  version: number;
  previousVersions?: string[]; // IDs of previous versions
  
  // Access and permissions
  isEncrypted: boolean;
  encryptionKey?: string;
  accessLevel: 'public' | 'private' | 'shared';
  sharedWith?: string[]; // User IDs
  
  // Metadata (extend your existing FileMetadata)
  lastModified: Date;
  lastAccessed?: Date;
  checksum?: string; // For file integrity verification
  
  // Relationships
  parentFolder?: string; // Folder ID
  attachedTo?: {
    entityType: string; // 'project', 'task', 'user', etc.
    entityId: string;
  };
}

export type AppFileEntity = FileEntity;
export type FileK = AppFileEntity;
export type FileMeta = DefaultMeta<FileEntity, FileK>;
export type FileAttachment = Attachment;
export type FileExcludedFields = 'content' | 'encryptionKey' | 'previousVersions';
export type FileIncludedFields = keyof AppFileEntity;

// Create specific type aliases
export type MainAppFile = AppFile
export type AppFileCommonData = CommonData<AppFileEntity, FileK, FileMeta, FileAttachment, FileExcludedFields, FileIncludedFields>;

