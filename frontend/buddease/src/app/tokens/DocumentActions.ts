// DocumentActions.ts
import { Meta } from "@/app/components/models/data/dataStoreMethods";
import  { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { createAction } from "@reduxjs/toolkit";
import { DocumentEditingPermissions } from "../components/users/Permission";
import { DocumentOptions } from "../components/documents/DocumentOptions";
import { DocumentStatus } from "../components/documents/types";
import { UserIdea } from "../components/users/Ideas";

export const DocumentActions = {
  // Single Document Actions
  addDocument: createAction<DocumentData<any, Meta<any, any>>>("addDocument"),
  addDocumentSuccess: createAction<{ id: number, title: string }>("addDocumentSuccess"),
  addDocumentFailure: createAction<string>("addDocumentFailure"),

  createDocument: createAction<DocumentData<any, Meta<any, any>>>("createDocument"),
  updateDocument: createAction<Partial<DocumentData<any, Meta<any, any>>>>("updateDocument"),
  updateDocumentDetails: createAction<Partial<DocumentData<any, Meta<any, any>>>>("updateDocumentDetails"),
  updateDocumentDetailsSuccess: createAction<Partial<DocumentData<any, Meta<any, any>>>>("updateDocumentDetailsSuccess"),
  updateDocumentDetailsFailure: createAction<string>("updateDocumentDetailsFailure"),
  updateDocumentDetailsReset: createAction("updateDocumentDetailsReset"),
  showOptionsForSelectedText: createAction<{ selectedText: { id: number; text: string, startIndex: number, endIndex: number } }>("showOptionsForSelectedText"),
 
  deleteDocument: createAction<number>("deleteDocument"),

  selectDocument: createAction<number>("selectDocument"),
  selectDocumentSuccess: createAction<{ id: number }>("selectDocumentSuccess"),
  setOptions: createAction<{ options: DocumentOptions }>("setOptions"),

  updateDocumentTitle: createAction<{ id: number, title: string }>("updateDocumentTitle"),
  updateDocumentTitleSuccess: createAction<{ id: number; title: string }>("updateDocumentTitleSuccess"),
  updateDocumentTitleFailure: createAction<{ error: string }>("updateDocumentTitleFailure"),
  updateDocumentStatus: createAction<{ id: number; status: DocumentStatus }>("updateDocumentStatus"),
  updateDocumentStatusSuccess: createAction<{ id: number; status: DocumentStatus }>("updateDocumentStatusSuccess"),
  updateDocumentStatusFailure: createAction<{ id: number; status: DocumentStatus }>("updateDocumentStatusFailure"),
 
  communication: createAction<{ id: number; status: DocumentStatus }>("communication"),
  communicationSuccess: createAction<{ id: number; status: DocumentStatus }>("communicationSuccess"),
  communicationFailure: createAction<{ id: number; status: DocumentStatus }>("communicationFailure"),
 
  collaboration: createAction<{ id: number; userId: number; status: DocumentStatus }>("collaboration"),
  collaborationSuccess: createAction<{ id: number; userId: number; status: DocumentStatus }>("collaborationSuccess"),
  collaborationFailure: createAction<{ id: number; userId: number; status: DocumentStatus }>("collaborationFailure"),
 
  projectManagement: createAction<{ id: number; status: DocumentStatus }>("projectManagement"),
  projectManagementSuccess: createAction<{ id: number; status: DocumentStatus }>("projectManagementSuccess"),
  projectManagementFailure: createAction<{ id: number; status: DocumentStatus }>("projectManagementFailure"),

  dataAnalysis: createAction<{ id: number; status: DocumentStatus }>("dataAnalysis"),
  dataAnalysisSuccess: createAction<{ id: number; status: DocumentStatus }>("dataAnalysisSuccess"),
  dataAnalysisFailure: createAction<{ id: number; status: DocumentStatus }>("dataAnalysisFailure"),
 
  exportDocument: createAction<{ id: number; status: DocumentStatus }>("exportDocument"),
  exportDocumentSuccess: createAction<{ id: number; status: DocumentStatus }>("exportDocumentSuccess"),
  exportDocumentFailure: createAction<{ id: number; status: DocumentStatus }>("exportDocumentFailure"),
 
  selectDocumentEditingPermissions: createAction<{ id: number, userId: string, permissions: DocumentEditingPermissions[] }>("selectDocumentEditingPermissions"),
  saveDocumentEditingPermissions: createAction<{ id: number, userId: string, permissions: DocumentEditingPermissions[] }>("saveDocumentEditingPermissions"),

  // Bulk Document Actions
  addDocuments: createAction<DocumentData<any, Meta<any, any>>[]>("addDocuments"),
  updateDocuments: createAction<Partial<DocumentData<any, Meta<any, any>>>[]>("updateDocuments"),
  deleteDocuments: createAction<number[]>("deleteDocuments"),
 
  // Fetch Documents Actions
  fetchDocumentsRequest: createAction<{ id: number, status: DocumentStatus }>("fetchDocumentsRequest"),
  fetchDocumentsSuccess: createAction<{ documents: DocumentData<any, Meta<any, any>>[] }>("fetchDocumentsSuccess"),
  fetchDocumentsFailure: createAction<{ error: string }>("fetchDocumentsFailure"),

  // UserIdea Actions
  selectUserIdea: createAction<{ id: string, type: string }>("selectUserIdea"),
  addUserIdea: createAction<UserIdea>("addUserIdea"),
  updateUserIdea: createAction<Partial<UserIdea>>("updateUserIdea"),
  deleteUserIdea: createAction<number>("deleteUserIdea"),
};



// Define the action types
export type DocumentActionTypes =
  | ReturnType<typeof DocumentActions.addDocument>
  | ReturnType<typeof DocumentActions.addDocumentSuccess>
  | ReturnType<typeof DocumentActions.addDocumentFailure>
  | ReturnType<typeof DocumentActions.createDocument>
  | ReturnType<typeof DocumentActions.updateDocument>
  | ReturnType<typeof DocumentActions.updateDocumentDetails>
  | ReturnType<typeof DocumentActions.updateDocumentDetailsSuccess>
  | ReturnType<typeof DocumentActions.updateDocumentDetailsFailure>
  | ReturnType<typeof DocumentActions.updateDocumentDetailsReset>
  | ReturnType<typeof DocumentActions.showOptionsForSelectedText>
  | ReturnType<typeof DocumentActions.deleteDocument>
  | ReturnType<typeof DocumentActions.selectDocument>
  | ReturnType<typeof DocumentActions.selectDocumentSuccess>
  | ReturnType<typeof DocumentActions.setOptions>
  | ReturnType<typeof DocumentActions.updateDocumentTitle>
  | ReturnType<typeof DocumentActions.updateDocumentTitleSuccess>
  | ReturnType<typeof DocumentActions.updateDocumentTitleFailure>
  | ReturnType<typeof DocumentActions.updateDocumentStatus>
  | ReturnType<typeof DocumentActions.updateDocumentStatusSuccess>
  | ReturnType<typeof DocumentActions.updateDocumentStatusFailure>
  | ReturnType<typeof DocumentActions.communication>
  | ReturnType<typeof DocumentActions.communicationSuccess>
  | ReturnType<typeof DocumentActions.communicationFailure>
  | ReturnType<typeof DocumentActions.collaboration>
  | ReturnType<typeof DocumentActions.collaborationSuccess>
  | ReturnType<typeof DocumentActions.collaborationFailure>
  | ReturnType<typeof DocumentActions.projectManagement>
  | ReturnType<typeof DocumentActions.projectManagementSuccess>
  | ReturnType<typeof DocumentActions.projectManagementFailure>
  | ReturnType<typeof DocumentActions.dataAnalysis>
  | ReturnType<typeof DocumentActions.dataAnalysisSuccess>
  | ReturnType<typeof DocumentActions.dataAnalysisFailure>
  | ReturnType<typeof DocumentActions.exportDocument>
  | ReturnType<typeof DocumentActions.exportDocumentSuccess>
  | ReturnType<typeof DocumentActions.exportDocumentFailure>
  | ReturnType<typeof DocumentActions.selectDocumentEditingPermissions>
  | ReturnType<typeof DocumentActions.saveDocumentEditingPermissions>
  | ReturnType<typeof DocumentActions.addDocuments>
  | ReturnType<typeof DocumentActions.updateDocuments>
  | ReturnType<typeof DocumentActions.deleteDocuments>
  | ReturnType<typeof DocumentActions.fetchDocumentsRequest>
  | ReturnType<typeof DocumentActions.fetchDocumentsSuccess>
  | ReturnType<typeof DocumentActions.fetchDocumentsFailure>
  | ReturnType<typeof DocumentActions.selectUserIdea>
  | ReturnType<typeof DocumentActions.addUserIdea>
  | ReturnType<typeof DocumentActions.updateUserIdea>
  | ReturnType<typeof DocumentActions.deleteUserIdea>;