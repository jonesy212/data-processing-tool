// apiComponentService.ts
// /app/services/apiComponentService.ts
import internalApiService from '@/core/api/ApiClient';
export interface FetchComponentPayload { id: string; }
export interface CreateComponentPayload { data: any; }
export interface UpdateComponentPayload { id: string; data: any; }
export interface DeleteComponentPayload { id: string; }

export const apiComponentService = {
  fetchComponent: async (payload: FetchComponentPayload) => {
    return internalApiService.get(`/api/v1/components/${payload.id}`);
  },

  createComponent: async (payload: CreateComponentPayload) => {
    return internalApiService.post(`/api/v1/components/`, payload.data);
  },

  updateComponent: async (payload: UpdateComponentPayload) => {
    return internalApiService.put(`/api/v1/components/${payload.id}`, payload.data);
  },

  deleteComponent: async (payload: DeleteComponentPayload) => {
    return internalApiService.delete(`/api/v1/components/${payload.id}`);
  }
};
