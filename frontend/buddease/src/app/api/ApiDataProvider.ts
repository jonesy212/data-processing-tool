// ApiDataProvider.ts

import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { handleApiError } from "./ApiLogs";
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";

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

    notify(
      "UpdateProviderRecordSuccessId",
      "Provider record updated successfully",
      { id },
      new Date(),
      NotificationTypeEnum.Success
    );

    return;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to update provider record");
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

    notify(
      "DeleteProviderRecordSuccessId",
      "Provider record deleted successfully",
      { id },
      new Date(),
      NotificationTypeEnum.Success
    );

    return id;
  } catch (error) {
    handleApiError(error as AxiosError, "Failed to delete provider record");
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