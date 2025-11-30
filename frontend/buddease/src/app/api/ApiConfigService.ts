// ApiConfigService.ts
// ApiConfig.ts
import { Endpoints } from './ApiEndpoints';
import { EndpointConfig, EndpointConfigurations } from '@/app/config/EndpointConfig';
import { RetryConfig } from "@/app/services/ConfigurationService";
import { CacheConfig } from "@/app/config/CacheConfig";

type EndpointCategory = keyof EndpointConfigurations;
type EndpointKey<T extends EndpointCategory> = keyof EndpointConfigurations[T];

export interface ApiConfig {
  [x: string]: any;
  name: any;
  baseURL: string;
  timeout: number;
  headers: { [key: string]: string };
  retry: RetryConfig;
  cache: CacheConfig;
  responseType: { contentType: string; encoding: string } | string;
  withCredentials: boolean;
  onLoad?: (response: any) => void;
  apiKeys?: Record<string, string>;
}

class ApiConfigService implements ApiConfig {
  [x: string]: any;
  name: any;
  baseURL: string;
  timeout: number;
  headers: { [key: string]: string };
  retry: RetryConfig;
  cache: CacheConfig;
  responseType: { contentType: string; encoding: string } | string;
  withCredentials: boolean;
  onLoad?: (response: any) => void;
  apiKeys?: Record<string, string>;

  // Change from private to protected so child classes can access it
  constructor(
    protected configurations: EndpointConfigurations, // Changed to protected
    protected endpoints: Endpoints, // Also changed to protected for consistency
    options?: Partial<ApiConfig>
  ) {
    // Initialize interface properties
    this.name = options?.name || 'defaultApiConfig';
    this.baseURL = options?.baseURL || '';
    this.timeout = options?.timeout || 10000;
    this.headers = options?.headers || {};
    this.retry = options?.retry || {} as RetryConfig;
    this.cache = options?.cache || {} as CacheConfig;
    this.responseType = options?.responseType || { contentType: 'application/json', encoding: 'utf-8' };
    this.withCredentials = options?.withCredentials || false;
    this.onLoad = options?.onLoad;
    this.apiKeys = options?.apiKeys;
  }

  // TYPE-SAFE METHODS
  getEndpoint<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>
  ) {
    return this.configurations[category][endpointKey];
  }

  getUrl<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    
    if (typeof endpoint === 'function') {
      const result = (endpoint as (...args: any[]) => EndpointConfig)(...params);
      return result.path;
    }
    
    return (endpoint as EndpointConfig).path;
  }

  getMethod<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    
    if (typeof endpoint === 'function') {
      const result = (endpoint as (...args: any[]) => EndpointConfig)(...params);
      return result.method;
    }
    
    return (endpoint as EndpointConfig).method;
  }

  getEndpointInfo<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ) {
    const url = this.getUrl(category, endpointKey, ...params);
    const method = this.getMethod(category, endpointKey, ...params);
    
    return { url, method };
  }

  // BATCH OPERATIONS
  batchGetUrls(requests: Array<{ 
    category: EndpointCategory; 
    endpointKey: string; 
    params?: any[];
  }>) {
    return requests.map(request => {
      const endpoint = this.configurations[request.category][request.endpointKey as keyof EndpointConfigurations[typeof request.category]];
      
      if (typeof endpoint === 'function') {
        const result = (endpoint as Function)(...(request.params || []));
        return result.path;
      }
      
      return (endpoint as EndpointConfig).path;
    });
  }

  // Get all categories
  getCategories(): EndpointCategory[] {
    return Object.keys(this.configurations) as EndpointCategory[];
  }

  // Get endpoints for a specific category
  getEndpointsForCategory<T extends EndpointCategory>(category: T): EndpointKey<T>[] {
    return Object.keys(this.configurations[category]) as EndpointKey<T>[];
  }

  // Add getter methods for child class access (optional but good practice)
  getConfigurations(): EndpointConfigurations {
    return this.configurations;
  }

  getEndpoints(): Endpoints {
    return this.endpoints;
  }
}

export default ApiConfigService;
