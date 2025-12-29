// collaborationToolsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { CollaborationToolsEndpoints } from '@/core/typings/categories/CollaborationToolsEndpoints';

export const collaborationToolsConfig: CollaborationToolsEndpoints = {
  createTask: { path: `${BASE_URL}/api/collaboration/tasks/create`, method: "POST" },
  updateTask: (taskId: number) => ({ path: `${BASE_URL}/api/collaboration/tasks/${taskId}/update`, method: "PUT" }),
  deleteTask: (taskId: number) => ({ path: `${BASE_URL}/api/collaboration/tasks/${taskId}/delete`, method: "DELETE" }),
  getTaskDetails: (taskId: number) => ({ path: `${BASE_URL}/api/collaboration/tasks/${taskId}`, method: "GET" }),
  listTasks: { path: `${BASE_URL}/api/collaboration/tasks`, method: "GET" },
  fetchCollaborationData: { path: `${BASE_URL}/api/collaboration/fetch-collaboration-data`, method: "GET" },
  startBrainstorming: { path: `${BASE_URL}/api/collaboration/start-brainstorming`, method: "POST" },
  endBrainstorming: { path: `${BASE_URL}/api/collaboration/end-brainstorming`, method: "POST" },
  createWhiteboard: { path: `${BASE_URL}/api/collaboration/create-whiteboard`, method: "POST" },
  updateWhiteboard: (whiteboardId: number) => ({ path: `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/update`, method: "PUT" }),
  deleteWhiteboard: (whiteboardId: number) => ({ path: `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/delete`, method: "DELETE" }),
  getWhiteboardDetails: (whiteboardId: number) => ({ path: `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}`, method: "GET" }),
  listWhiteboards: { path: `${BASE_URL}/api/collaboration/whiteboards`, method: "GET" },
  shareDocument: { path: `${BASE_URL}/api/collaboration/share-document`, method: "POST" },
  commentOnDocument: { path: `${BASE_URL}/api/collaboration/comment-on-document`, method: "POST" },
  resolveComment: { path: `${BASE_URL}/api/collaboration/resolve-comment`, method: "POST" },
  updateDocument: (documentId: number) => ({ path: `${BASE_URL}/api/collaboration/documents/${documentId}/update`, method: "PUT" }),
  deleteDocument: (documentId: number) => ({ path: `${BASE_URL}/api/collaboration/documents/${documentId}/delete`, method: "DELETE" }),
  getDocumentDetails: (documentId: number) => ({ path: `${BASE_URL}/api/collaboration/documents/${documentId}`, method: "GET" }),
  listDocuments: { path: `${BASE_URL}/api/collaboration/documents`, method: "GET" },
};