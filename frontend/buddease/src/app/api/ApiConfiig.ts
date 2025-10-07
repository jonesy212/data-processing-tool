// ApiConfig.ts
import { Endpoints } from './ApiEndpoints';
import { EndpointConfig, EndpointConfigurations } from './endpointConfigurations';

// Main API Configuration class
class ApiConfig {
  private configurations: EndpointConfigurations;
  private endpoints: Endpoints;

  constructor(configurations: EndpointConfigurations, endpoints: Endpoints) {
    this.configurations = configurations;
    this.endpoints = endpoints;
  }

  // Get endpoint configuration by category and key
  getEndpointConfig<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T]
  ): EndpointConfig | ((...args: any[]) => EndpointConfig) {
    return this.configurations[category][endpointKey] as any;
  }

  // Get full URL from endpoint configurations
  getEndpointUrl<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    ...params: any[]
  ): string {
    const config = this.getEndpointConfig(category, endpointKey);
    
    if (typeof config === 'function') {
      const result = config(...params);
      return `${result.path}`;
    } else {
      return `${config.path}`;
    }
  }

  // Get method from endpoint configuration
  getEndpointMethod<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    ...params: any[]
  ): string {
    const config = this.getEndpointConfig(category, endpointKey);
    
    if (typeof config === 'function') {
      const result = config(...params);
      return result.method;
    } else {
      return config.method;
    }
  }

  // Get complete endpoint info (url + method)
  getEndpointInfo<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    ...params: any[]
  ): { url: string; method: string; config: EndpointConfig } {
    const config = this.getEndpointConfig(category, endpointKey);
    let endpointConfig: EndpointConfig;

    if (typeof config === 'function') {
      endpointConfig = config(...params);
    } else {
      endpointConfig = config;
    }

    return {
      url: endpointConfig.path,
      method: endpointConfig.method,
      config: endpointConfig
    };
  }

  // Convert legacy endpoints to new configuration format
  convertToEndpointConfig(
    endpointPath: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
  ): EndpointConfig {
    return {
      path: endpointPath,
      method: method
    };
  }

  // Generate configuration from existing endpoints
  generateConfigFromEndpoints(): Partial<EndpointConfigurations> {
    const generatedConfig: Partial<EndpointConfigurations> = {};

    Object.keys(this.endpoints).forEach(category => {
      const categoryKey = category as keyof Endpoints;
      const categoryEndpoints = this.endpoints[categoryKey];
      
      if (typeof categoryEndpoints === 'object') {
        generatedConfig[categoryKey as keyof EndpointConfigurations] = {} as any;
        
        Object.keys(categoryEndpoints).forEach(endpointKey => {
          const endpoint = (categoryEndpoints as any)[endpointKey];
          
          if (typeof endpoint === 'string') {
            (generatedConfig[categoryKey as keyof EndpointConfigurations] as any)[endpointKey] = 
              this.convertToEndpointConfig(endpoint);
          } else if (typeof endpoint === 'function') {
            (generatedConfig[categoryKey as keyof EndpointConfigurations] as any)[endpointKey] = 
              (...params: any[]) => this.convertToEndpointConfig(endpoint(...params));
          }
        });
      }
    });

    return generatedConfig;
  }

  // Merge configurations
  mergeConfigurations(
    baseConfig: EndpointConfigurations,
    additionalConfig: Partial<EndpointConfigurations>
  ): EndpointConfigurations {
    return {
      ...baseConfig,
      ...additionalConfig
    } as EndpointConfigurations;
  }

  // Validate endpoint configuration
  validateEndpointConfig(config: EndpointConfig): boolean {
    return !!(config.path && config.method);
  }

  // Get all categories
  getCategories(): (keyof EndpointConfigurations)[] {
    return Object.keys(this.configurations) as (keyof EndpointConfigurations)[];
  }

  // Get endpoints for a specific category
  getEndpointsForCategory<T extends keyof EndpointConfigurations>(
    category: T
  ): (keyof EndpointConfigurations[T])[] {
    return Object.keys(this.configurations[category]) as (keyof EndpointConfigurations[T])[];
  }
}

// Factory function to create ApiConfig instance
export const createApiConfig = (
  configurations: EndpointConfigurations,
  endpoints: Endpoints
): ApiConfig => {
  return new ApiConfig(configurations, endpoints);
};

// Default export
export default ApiConfig;