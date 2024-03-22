// DocumentActions.ts
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { createAction } from "@reduxjs/toolkit";
import { DocumentStatus } from "../components/documents/types";

export const DocumentActions = {
  // Single Document Actions
  addDocument: createAction<DocumentData>("addDocument"),
  addDocumentSuccess: createAction<{id: number, title: string}>("addDocumentSuccess"),
  addDocumentFailure: createAction<string>("addDocumentFailure"),
  
  updateDocument: createAction<Partial<DocumentData>>("updateDocument"),
  updateDocumentDetails: createAction<Partial<DocumentData>>("updateDocumentDetails"),
  updateDocumentDetailsSuccess: createAction<Partial<DocumentData>>("updateDocumentDetailsSuccess"),
  updateDocumentDetailsFailure: createAction<string>("updateDocumentDetailsFailure"),
  updateDocumentDetailsReset: createAction("updateDocumentDetailsReset"),
  
  
  
  deleteDocument: createAction<number>("deleteDocument"),
  
  selectDocument: createAction<number>("selectDocument"),
  selectDocumentSuccess: createAction<{id: number}>("selectDocumentSuccess"),


  updateDocumentTitle: createAction<{id: number, title: string}>("updateDocumentTitle"),
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



  // Bulk Document Actions
  addDocuments: createAction<DocumentData[]>("addDocuments"),
  updateDocuments: createAction<Partial<DocumentData>[]>("updateDocuments"),
  deleteDocuments: createAction<number[]>("deleteDocuments"),


  // Fetch Documents Actions
  fetchDocumentsRequest: createAction<{id: number, status: DocumentStatus}>("fetchDocumentsRequest"),
  fetchDocumentsSuccess: createAction<{ documents: DocumentData[] }>("fetchDocumentsSuccess"),
  fetchDocumentsFailure: createAction<{ error: string }>("fetchDocumentsFailure"),
  
  // UserIdea Actions
  selectUserIdea: createAction<{id: string, type: string}>("selectUserIdea"),
  addUserIdea: createAction<UserIdea>("addUserIdea"),
  updateUserIdea: createAction<Partial<UserIdea>>("updateUserIdea"),
  deleteUserIdea: createAction<number>("deleteUserIdea"),
};
