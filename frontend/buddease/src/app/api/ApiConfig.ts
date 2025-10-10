import endpointConfigurations,{  EndpointConfig, endpoints, EndpointConfigurations } from '@/app/api/endpointConfigurations';
import { Endpoints } from '@/app/api/ApiEndpoints';

type EndpointCategory = keyof EndpointConfigurations;
type EndpointKey<T extends EndpointCategory> = keyof EndpointConfigurations[T];

class ApiConfig {
  constructor(
    private configurations: EndpointConfigurations,
    private endpoints: Endpoints
  ) {}

  // TYPE-SAFE METHODS (Enhanced)

  getEndpoint<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>
  ) {
    return this.configurations[category][endpointKey];
  }

  getUrl<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: EndpointConfigurations[T][K] extends Function ? FunctionParams<T, K> : []
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
    ...params: EndpointConfigurations[T][K] extends Function ? FunctionParams<T, K> : []
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
    ...params: EndpointConfigurations[T][K] extends Function ? FunctionParams<T, K> : []
  ) {
    const url = this.getUrl(category, endpointKey, ...params);
    const method = this.getMethod(category, endpointKey, ...params);
    
    return { url, method };
  }

  // BATCH OPERATIONS (New) - Simplified for dynamic usage
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

  // LEGACY COMPATIBILITY (Keep for migration)
  getEndpointConfig<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>
  ) {
    return this.configurations[category][endpointKey];
  }

  getEndpointUrl<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>,
    ...params: any[]
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    
    if (typeof endpoint === 'function') {
      const result = (endpoint as Function)(...params);
      return result.path;
    }
    
    return (endpoint as EndpointConfig).path;
  }
}

export const apiConfig = new ApiConfig(endpointConfigurations, endpoints);
export default ApiConfig;