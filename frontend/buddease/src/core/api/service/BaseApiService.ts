// BaseApiService.ts
import { handleApiError } from "@/core/api/ApiLogs";
import axiosInstance from '@/core/api/csrfToken';
import { AxiosError, AxiosRequestConfig } from "axios";

export abstract class BaseApiService {
  protected API_BASE_URL: string;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  // Generic request method
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
    endpointPath: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.request({
        method,
        url: endpoint,
        data,
        ...config
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to ${method} ${endpointPath}`);
      throw error;
    }
  }

  // Convenience methods
  protected async get<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', endpointPath, undefined, config);
  }

  protected async post<T>(endpointPath: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', endpointPath, data, config);
  }

  protected async put<T>(endpointPath: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', endpointPath, data, config);
  }

  protected async delete<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpointPath, undefined, config);
  }

  protected async patch<T>(endpointPath: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpointPath, data, config);
  }

    // Add HEAD method
  protected async head<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('HEAD', endpointPath, undefined, config);
  }

  // Add OPTIONS method
  protected async options<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('OPTIONS', endpointPath, undefined, config);
  }
}