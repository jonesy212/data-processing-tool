
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

  getUrl<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>,
    ...params: Parameters<Extract<EndpointConfigurations[T][EndpointKey<T>], Function>>
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    
    if (typeof endpoint === 'function') {
      const result = (endpoint as Function)(...params);
      return result.path;
    }
    
    return (endpoint as EndpointConfig).path;
  }

  getMethod<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>,
    ...params: any[]
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    
    if (typeof endpoint === 'function') {
      const result = (endpoint as Function)(...params);
      return result.method;
    }
    
    return (endpoint as EndpointConfig).method;
  }

  getEndpointInfo<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>,
    ...params: any[]
  ) {
    const url = this.getUrl(category, endpointKey, ...params);
    const method = this.getMethod(category, endpointKey, ...params);
    
    return { url, method };
  }

  // BATCH OPERATIONS (New)

  batchGetUrls(requests: Array<{ 
    category: EndpointCategory; 
    endpointKey: string; 
    params?: any[] 
  }>) {
    return requests.map(request => 
      this.getUrl(request.category, request.endpointKey as any, ...(request.params || []))
    );
  }

  // LEGACY COMPATIBILITY (Keep for migration)

  getEndpointConfig<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T]
  ) {
    return this.configurations[category][endpointKey] as any;
  }

  getEndpointUrl<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    ...params: any[]
  ): string {
    return this.getUrl(category, endpointKey as any, ...params);
  }
}

export const apiConfig = new ApiConfig(endpointConfigurations, endpoints);
export default ApiConfig;