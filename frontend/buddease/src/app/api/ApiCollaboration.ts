// ApiCollaboration.ts

import { endpoints } from '@/app/api/ApiEndpoints';
import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import { CollaborationLogger } from '../components/logging/Logger';
import axiosInstance from './axiosInstance';


const API_BASE_URL = endpoints.collaborationTools

  class CollaborationApiService {
    notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void;

    constructor(notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void) {
      this.notify = notify;
    }

    private async callApi(endpointPath: string, requestData: any): Promise<any> {
      try {
        const endpoint = API_BASE_URL[endpointPath] as string | undefined;
        if (!endpoint) {
          throw new Error(`${endpointPath} endpoint not found`);
        }
        const response: AxiosResponse = await axiosInstance.post(endpoint, requestData);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
        throw error;
      }
    }
    
  
    
  
    
  async createTask(taskData: any): Promise<any> {
  try {
    const responseData = await this.callApi('createTask', taskData);
    CollaborationLogger.logCollaboration("Task created", taskData.uniqueID, taskData.collaborationID);
    return responseData;
  } catch (error) {
    throw error;
  }
}

async updateTask(taskData: any): Promise<any> {
  try {
    const responseData = await this.callApi('updateTask', taskData);
    CollaborationLogger.logCollaboration("Task updated", taskData.uniqueID, taskData.collaborationID);
    return responseData;
  } catch (error) {
    throw error;
  }
}

async deleteTask(taskId: string): Promise<any> {
  try {
    const responseData = await this.callApi('deleteTask', { taskId });
    CollaborationLogger.logCollaboration("Task deleted", taskId, '');
    return responseData;
  } catch (error) {
    throw error;
  }
}

async fetchCollaborationData(projectId: number): Promise<any> { 
  try {
    const responseData = await this.callApi('fetchCollaborationData', projectId);
    CollaborationLogger.logCollaboration("fetching Collaboratio data", projectId.toString(), '');

    return responseData;
  } catch (error) {
    throw error;
  }
}

async startBrainstorming(projectId: number): Promise<any> {
  try {
    const responseData = await this.callApi('startBrainstorming', { projectId });
    CollaborationLogger.logCollaboration("Brainstorming started", projectId.toString(), '');
    return responseData;
  } catch (error) {
    throw error;
  }
}

    async endBrainstorming(projectId: number): Promise<any> {
      try {
        const responseData = await this.callApi('endBrainstorming', { projectId });
        CollaborationLogger.logCollaboration("Brainstorming ended", projectId.toString(), '');
        return responseData;
      } catch (error) {
        throw error;
      }
    }
  
  async createWhiteboard(): Promise<any> {
    try {
      const responseData = await this.callApi('createWhiteboard', {});
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  async updateWhiteboard(whiteboardId: number, whiteboardData: any): Promise<any> {
    try {
      const endpoint = endpoints.collaborationTools[`updateWhiteboard.${whiteboardId}`] as string | undefined;
  
      if (!endpoint) {
        throw new Error(`Endpoint updateWhiteboard.${whiteboardId} not found`);
      }
  
      const response: AxiosResponse = await axiosInstance.put(endpoint, whiteboardData);
      CollaborationLogger.logCollaboration("Whiteboard updated", whiteboardId.toString(), '');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update whiteboard");
      throw error;
    }
  }
  
  async deleteWhiteboard(whiteboardId: number): Promise<any> {
    try {
      const responseData = await this.callApi('deleteWhiteboard', { whiteboardId });
      CollaborationLogger.logCollaboration("Whiteboard deleted", whiteboardId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async getWhiteboardDetails(whiteboardId: number): Promise<any> {
    try {
      const responseData = await this.callApi('getWhiteboardDetails', { whiteboardId });
      CollaborationLogger.logCollaboration("Whiteboard details fetched", whiteboardId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async listWhiteboards(): Promise<any> {
    try {
      const responseData = await this.callApi('listWhiteboards', {});
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async shareDocument(documentData: any): Promise<any> {
    try {
      const responseData = await this.callApi('shareDocument', documentData);
      CollaborationLogger.logCollaboration("Document shared", documentData.documentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async commentOnDocument(commentData: any): Promise<any> {
    try {
      const responseData = await this.callApi('commentOnDocument', commentData);
      CollaborationLogger.logCollaboration("Comment added", commentData.commentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async resolveComment(commentId: number): Promise<any> {
    try {
      const responseData = await this.callApi('resolveComment', { commentId });
      CollaborationLogger.logCollaboration("Comment resolved", commentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async updateDocument(documentId: number, documentData: any): Promise<any> {
    try {
      const responseData = await this.callApi(`updateDocument.${documentId}`, documentData);
      CollaborationLogger.logCollaboration("Document updated", documentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteDocument(documentId: number): Promise<any> {
    try {
      const responseData = await this.callApi('deleteDocument', { documentId });
      CollaborationLogger.logCollaboration("Document deleted", documentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async getDocumentDetails(documentId: number): Promise<any> {
    try {
      const responseData = await this.callApi('getDocumentDetails', { documentId });
      CollaborationLogger.logCollaboration("Document details fetched", documentId.toString(), '');
      return responseData;
    } catch (error) {
      throw error;
    }
  }
  
  async listDocuments(): Promise<any> {
    try {
      const responseData = await this.callApi('listDocuments', {});
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Add more methods for other collaboration endpoints as needed
}

const collaborationApiService = new CollaborationApiService(useNotification);

export default collaborationApiService;
