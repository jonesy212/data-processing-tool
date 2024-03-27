// FileActions.ts

import { createAction } from "@reduxjs/toolkit";
import { FileTypeEnum } from "../documents/FileType";
import File from "../documents/File";

export const FileActions = {
  // Standard file actions
  addFile: createAction<File>("addFile"),
  removeFile: createAction<number>("removeFile"),
  updateFile: createAction<{ id: number, newTitle: string }>("updateFileTitle"),
  validateFile: createAction<File>("validateFile"),
  
  fetchFileData: createAction<number>("fetchFileData"),
  fetchFileRequest: createAction<File>("fetchFileRequest"),

  fetchFiles: createAction<{ fileType: FileTypeEnum, files: File[] }>("fetchFiles"),
  fetchFilesRequest: createAction("fetchFilesRequest"),
  fetchFilesSuccess: createAction<{ files: File[] }>("fetchFilesSuccess"),
  fetchFilesFailure: createAction<{ error: string }>("fetchFilesFailure"),
  
  // Additional actions for file handling
  uploadFileRequest: createAction<File>("uploadFileRequest"),
  uploadFileSuccess: createAction<File>("uploadFileSuccess"),
  uploadFileFailure: createAction<{ error: string }>("uploadFileFailure"),

  // Batch actions for file operations
  batchRemoveFilesRequest: createAction<number[]>("batchRemoveFilesRequest"),
  batchRemoveFilesSuccess: createAction<number[]>("batchRemoveFilesSuccess"),
  batchRemoveFilesFailure: createAction<{ error: string }>("batchRemoveFilesFailure"),

  // Action for marking file as completed (example)
  markFileAsComplete: createAction<string>("markFileAsComplete"),
  markFileAsCompleteRequest: createAction<string>("markFileAsCompleteRequest"),
  markFileAsCompleteSuccess: createAction<string>("markFileAsCompleteSuccess"),
    markFileAsCompleteFailure: createAction<{ fileId: string, error: string }>("markFileAsCompleteFailure"),
  

    startCollaborativeEdit: createAction<{ fileId: string, userId: string }>("startCollaborativeEdit"),
    endCollaborativeEdit: createAction<{ fileId: string, userId: string }>("endCollaborativeEdit"),
    applyCollaborativeEdits: createAction<{ fileId: string, edits: any[] }>("applyCollaborativeEdits"),
    
    createFileVersion: createAction<{ fileId: string, version: number }>("createFileVersion"),
    fetchFileVersions: createAction<{ fileId: string }>("fetchFileVersions"),
    restoreFileVersion: createAction<{ fileId: string, version: number }>("restoreFileVersion"),
    
    shareFile: createAction<{ fileId: string, recipientId: string }>("shareFile"),
    unshareFile: createAction<{ fileId: string, recipientId: string }>("unshareFile"),
    requestAccessToFile: createAction<{ fileId: string, requesterId: string }>("requestAccessToFile"),
    grantAccessToFile: createAction<{ fileId: string, recipientId: string }>("grantAccessToFile"),
    
    receiveFileUpdate: createAction<{ fileId: string, update: any }>("receiveFileUpdate"),
    applyFileUpdate: createAction<{ fileId: string, update: any }>("applyFileUpdate"),
    broadcastFileUpdate: createAction<{ fileId: string, update: any }>("broadcastFileUpdate"),
    
    exportFile: createAction<{ fileId: string, format: string }>("exportFile"),
    importFile: createAction<{ fileId: string, source: string }>("importFile"),
  exportFileAsPDF: createAction<{ fileId: string }>("exportFileAsPDF"),
    exportFileAsImage: createAction<{ fileId: string, resolution: string }>("exportFileAsImage"),
    
    archiveFile: createAction<{ fileId: string }>("archiveFile"),
    deleteFile: createAction<{ fileId: string }>("deleteFile"),
    restoreFileFromArchive: createAction<{ fileId: string }>("restoreFileFromArchive"),
    
    determineFileType: createAction<{ filePath: string, fileType: FileTypeEnum }>("determineFileType"),
  

    autosaveFileRequest: createAction<{ editorContent: string }>("autosaveFileRequest"),
    autosaveFileSuccess: createAction<File>("autosaveFileSuccess"),
    autosaveFileFailure: createAction<{ error: string }>("autosaveFileFailure"),
  
};
