// CollaborationToolsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface CollaborationToolsEndpoints {
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