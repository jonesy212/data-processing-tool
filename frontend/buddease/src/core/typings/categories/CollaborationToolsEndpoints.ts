// CollaborationToolsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface CollaborationToolsEndpoints extends EndpointCategoryConfig {
  createTask: EndpointConfig;
  updateTask: (taskId: number) => EndpointConfig;
  deleteTask: (taskId: number) => EndpointConfig;
  getTaskDetails: (taskId: number) => EndpointConfig;
  listTasks: EndpointConfig;
  fetchCollaborationData: EndpointConfig;
  startBrainstorming: EndpointConfig;
  endBrainstorming: EndpointConfig;
  createWhiteboard: EndpointConfig;
  updateWhiteboard: (whiteboardId: number) => EndpointConfig;
  deleteWhiteboard: (whiteboardId: number) => EndpointConfig;
  getWhiteboardDetails: (whiteboardId: number) => EndpointConfig;
  listWhiteboards: EndpointConfig;
  shareDocument: EndpointConfig;
  commentOnDocument: EndpointConfig;
  resolveComment: EndpointConfig;
  updateDocument: (documentId: number) => EndpointConfig;
  deleteDocument: (documentId: number) => EndpointConfig;
  getDocumentDetails: (documentId: number) => EndpointConfig;
  listDocuments: EndpointConfig;
}