// FileActions.ts

import CustomFile from "@/core/documents/File";
import { FileTypeEnum } from "@/core/documents/FileType";
import { createAction } from "@reduxjs/toolkit";

export const FileActions = {
  // Standard file actions
  addFile: createAction<CustomFile<any>>("addFile"),
  removeFile: createAction<number>("removeFile"),
  removeFileSuccess: createAction<CustomFile<any>>("removeFileSuccess"),
  updateFile: createAction<{ id: number, newTitle: string }>("updateFileTitle"),
  validateFile: createAction<CustomFile<any>>("validateFile"),
  setSelectedFile: createAction<CustomFile<any>[] | null>("setSelectedFile"),
  setInputValue: createAction<string>("setInputValue"),

  fetchFileData: createAction<number>("fetchFileData"),
  fetchFileRequest: createAction<CustomFile<any>>("fetchFileRequest"),

  fetchFiles: createAction<{ fileType: FileTypeEnum, files: CustomFile<any>[] }>("fetchFiles"),
  fetchFilesRequest: createAction("fetchFilesRequest"),
  fetchFilesSuccess: createAction<{ files: CustomFile<any>[] }>("fetchFilesSuccess"),
  fetchFilesFailure: createAction<{ error: string }>("fetchFilesFailure"),
  
  // Additional actions for file handling
  uploadFile: createAction<CustomFile<any>>("uploadFile"),
  uploadFileRequest: createAction<CustomFile<any>>("uploadFileRequest"),
  uploadFileSuccess: createAction<CustomFile<any>>("uploadFileSuccess"),
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
    autosaveFileSuccess: createAction<CustomFile<any>>("autosaveFileSuccess"),
    autosaveFileFailure: createAction<{ error: string }>("autosaveFileFailure"),
  
};
