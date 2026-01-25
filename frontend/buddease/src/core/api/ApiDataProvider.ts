// ApiDataProvider.ts
import { handleApiError } from '@/core/api/ApiLogs';
import axiosInstance from "@/core/api/csrfToken";
import { endpoints } from "@/core/api/endpointConfigurations";
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { AxiosError } from "axios";

const API_BASE_URL = endpoints.dataProviders;

const { notify } = useNotification();

export const fetchProviderData = async (params: any, token: string) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/list`, {
      headers: {
        ...headersConfig,
        Authorization: `Bearer ${token}`,
      },
      params, // Pass any parameters needed for the request
    });

    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to fetch provider data");
    throw error;
  }
};

export const fetchProviderRecord = async (
  id: number, token: string
) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/single/${id}`, {
      headers: {
        ...headersConfig,
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to fetch provider record");
    throw error;
  }
};

export const createProviderRecord = async (data: any, token: string) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/create`, data, {
      headers: {
        ...headersConfig,
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.id;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to create provider record");
    throw error;
  }
};

export const updateProviderRecord = async (id: number, data: any, token: string) => {
  try {
    await axiosInstance.put(`${API_BASE_URL}/update/${id}`, data, {
      headers: {
        ...headersConfig,
        Authorization: `Bearer ${token}`,
      },
    });

    notify({
      id: "UpdateProviderRecordSuccessId",
      message: "Provider record updated successfully",
      data: { 
        id,
        operation: "updateProviderRecord",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.API_SUCCESS, // or SUCCESS if that exists
      level: 'success'
    });

    return;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to update provider record");
    
    // Also notify about the error
    notify({
      id: "UpdateProviderRecordErrorId",
      message: "Failed to update provider record",
      data: { 
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: "updateProviderRecord",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.API_ERROR, // or ERROR if that exists
      level: 'error'
    });
    
    throw error;
  }
};

export const deleteProviderRecord = async (id: number, token: string) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/delete/${id}`, {
      headers: {
        ...headersConfig,
        Authorization: `Bearer ${token}`,
      },
    });

    notify({
      id: "DeleteProviderRecordSuccessId",
      message: "Provider record deleted successfully",
      data: { 
        id,
        operation: "deleteProviderRecord",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.API_SUCCESS, // or SUCCESS if that exists
      level: 'success'
    });

    return id;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to delete provider record");
    
    // Also notify about the error
    notify({
      id: "DeleteProviderRecordErrorId",
      message: "Failed to delete provider record",
      data: { 
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: "deleteProviderRecord",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.API_ERROR, // or ERROR if that exists
      level: 'error'
    });
    
    throw error;
  }
};


export const getManyProviders = async (providerIds: number[], token: string) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/getBatchDataProviders`, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${token}`,
        },
        params: {
          ids: providerIds.join(','), // Convert array of IDs to comma-separated string
        },
      });
  
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError, "Failed to get many providers");
      throw error;
    }
  };
  
  export const createManyProviders = async (data: any[], token: string) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/createBatchDataProviders`, data, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError, "Failed to create many providers");
      throw error;
    }
  };
  
  export const updateManyProviders = async (providerUpdates: { id: number; data: any }[], token: string) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/updateBatchDataProviders`, providerUpdates, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError, "Failed to update many providers");
      throw error;
    }
  };
  
  export const deleteManyProviders = async (providerIds: number[], token: string) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/deleteBatchDataProviders`, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${token}`,
        },
        data: {
          ids: providerIds, // Send array of IDs in the request body
        },
      });
  
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError, "Failed to delete many providers");
      throw error;
    }
  };