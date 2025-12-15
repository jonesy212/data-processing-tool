// DetailsApiService.ts
import ApiConfig from '@/app/api/ApiConfigService';
import { endpointConfigurations, endpoints } from '@/app/api/endpointConfigurations';

export abstract class BaseApiService {
  protected baseUrl: string;
  protected apiConfig: ApiConfig; 

  constructor(baseUrl: string, apiConfig?: ApiConfig) {
    this.baseUrl = baseUrl;
    this.apiConfig = apiConfig || new ApiConfig(endpointConfigurations, endpoints);
  }

  // HTTP methods
  protected async get<T>(endpoint: string = '', config?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      ...config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  protected async post<T>(endpoint: string = '', data?: any, config?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: JSON.stringify(data),
      ...config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  protected async put<T>(endpoint: string = '', data?: any, config?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: JSON.stringify(data),
      ...config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  protected async delete<T>(endpoint: string = '', config?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      ...config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as T;
  }
}