// services/IdeaLifecycleAPI.ts
import axios, { AxiosResponse } from 'axios';

// Types
export interface IdeaData {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  // Add other idea properties as needed
  tags?: string[];
  priority?: IdeaPriority;
  estimatedImpact?: number;
  requiredResources?: string[];
  timeline?: IdeaTimeline;
}

export interface IdeaTimeline {
  startDate?: Date;
  endDate?: Date;
  milestones?: Milestone[];
}

export type IdeaStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'archived';
export type IdeaPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
|| 'http://localhost:3001/api' // comment out and set to /api
// || '/api';
const IDEA_BASE_PATH = '/ideas';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const IdeaLifecycleAPI = {
  // Confirm idea creation
  confirmIdeaCreation: async (ideaData: IdeaData): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.post(
        `${IDEA_BASE_PATH}/confirm`,
        ideaData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to confirm idea creation');
    }
  },

  // Create new idea
  createIdea: async (ideaData: Partial<IdeaData>): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.post(
        IDEA_BASE_PATH,
        ideaData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create idea');
    }
  },

  // Get idea by ID
  getIdea: async (ideaId: string): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.get(
        `${IDEA_BASE_PATH}/${ideaId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch idea');
    }
  },

  // Update idea
  updateIdea: async (ideaId: string, updates: Partial<IdeaData>): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.put(
        `${IDEA_BASE_PATH}/${ideaId}`,
        updates
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update idea');
    }
  },

  // Delete idea
  deleteIdea: async (ideaId: string): Promise<ApiResponse<void>> => {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `${IDEA_BASE_PATH}/${ideaId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete idea');
    }
  },

  // Get all ideas with optional filtering
  getIdeas: async (
    filters?: { 
      status?: IdeaStatus;
      category?: string;
      createdBy?: string;
      page?: number;
      limit?: number;
  }): Promise<ApiResponse<{ ideas: IdeaData[]; total: number; page: number; limit: number }>> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(IDEA_BASE_PATH, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch ideas');
    }
  },

  // Change idea status
  changeIdeaStatus: async (ideaId: string, status: IdeaStatus, notes?: string): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.patch(
        `${IDEA_BASE_PATH}/${ideaId}/status`,
        { status, notes }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to change idea status');
    }
  },

  // Add comment to idea
  addComment: async (ideaId: string, comment: { text: string; author: string }): Promise<ApiResponse<IdeaData>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.post(
        `${IDEA_BASE_PATH}/${ideaId}/comments`,
        comment
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add comment');
    }
  },

  // Upload attachment to idea
  uploadAttachment: async (ideaId: string, file: File): Promise<ApiResponse<IdeaData>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<ApiResponse<IdeaData>> = await apiClient.post(
        `${IDEA_BASE_PATH}/${ideaId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to upload attachment');
    }
  },

  // Get idea analytics
  getIdeaAnalytics: async (ideaId: string): Promise<ApiResponse<any>> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(
        `${IDEA_BASE_PATH}/${ideaId}/analytics`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch analytics');
    }
  },

  // Search ideas
  searchIdeas: async (query: string, filters?: any): Promise<ApiResponse<IdeaData[]>> => {
    try {
      const response: AxiosResponse<ApiResponse<IdeaData[]>> = await apiClient.get(
        `${IDEA_BASE_PATH}/search`,
        {
          params: { q: query, ...filters },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to search ideas');
    }
  },
};

export default IdeaLifecycleAPI;