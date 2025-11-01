// ApiConfigManager.ts
import ApiConfig from './ApiConfig';
import { Endpoints } from './ApiEndpoints';
import { EndpointConfig, EndpointConfigurations } from './endpointConfigurations';

class ApiConfigManager extends ApiConfig {
  constructor(configurations: EndpointConfigurations, endpoints: Endpoints) {
    super(configurations, endpoints);
  }

  // CONFIG GENERATION AND MERGING
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

  // VALIDATION
  validateEndpointConfig(config: EndpointConfig): boolean {
    return !!(config.path && config.method);
  }

  validateCategory(category: string): boolean {
    return category in this.configurations;
  }

  // CONFIGURATION ANALYSIS
  getEndpointStats() {
    const stats = {
      totalCategories: 0,
      totalEndpoints: 0,
      categories: {} as Record<string, number>
    };

    Object.keys(this.configurations).forEach(category => {
      const endpoints = Object.keys(this.configurations[category as keyof EndpointConfigurations]);
      stats.categories[category] = endpoints.length;
      stats.totalEndpoints += endpoints.length;
    });

    stats.totalCategories = Object.keys(this.configurations).length;
    return stats;
  }

  // FIND ENDPOINTS
  findEndpointByPath(path: string) {
    for (const category of this.getCategories()) {
      for (const endpointKey of this.getEndpointsForCategory(category)) {
        const endpoint = this.getEndpoint(category, endpointKey);
        const endpointPath = typeof endpoint === 'function' 
          ? endpoint().path 
          : endpoint.path;
        
        if (endpointPath === path) {
          return { category, endpointKey, endpoint };
        }
      }
    }
    return null;
  }
}

export default ApiConfigManager;