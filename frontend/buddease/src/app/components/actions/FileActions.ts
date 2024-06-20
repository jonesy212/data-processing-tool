// FileActions.ts

import { createAction } from "@reduxjs/toolkit";
import { FileTypeEnum } from "../documents/FileType";
import CustomFile from "../documents/File";

export const FileActions = {
  // Standard file actions
  addFile: createAction<CustomFile>("addFile"),
  removeFile: createAction<number>("removeFile"),
  removeFileSuccess: createAction<CustomFile>("removeFileSuccess"),
  updateFile: createAction<{ id: number, newTitle: string }>("updateFileTitle"),
  validateFile: createAction<CustomFile>("validateFile"),
  setSelectedFile: createAction<CustomFile[] | null>("setSelectedFile"),
  setInputValue: createAction<string>("setInputValue"),

  fetchFileData: createAction<number>("fetchFileData"),
  fetchFileRequest: createAction<CustomFile>("fetchFileRequest"),

  fetchFiles: createAction<{ fileType: FileTypeEnum, files: CustomFile[] }>("fetchFiles"),
  fetchFilesRequest: createAction("fetchFilesRequest"),
  fetchFilesSuccess: createAction<{ files: CustomFile[] }>("fetchFilesSuccess"),
  fetchFilesFailure: createAction<{ error: string }>("fetchFilesFailure"),
  
  // Additional actions for file handling
  uploadFile: createAction<CustomFile>("uploadFile"),
  uploadFileRequest: createAction<CustomFile>("uploadFileRequest"),
  uploadFileSuccess: createAction<CustomFile>("uploadFileSuccess"),
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
    autosaveFileSuccess: createAction<CustomFile>("autosaveFileSuccess"),
    autosaveFileFailure: createAction<{ error: string }>("autosaveFileFailure"),
  
};
