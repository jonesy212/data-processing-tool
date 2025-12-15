// ApiConfigManager.ts
import ApiConfig from '@/app/api/ApiConfigService';
import { Endpoints } from './ApiEndpoints';
import { EndpointConfig, EndpointConfigurations, EndpointDefinition } from '@/app/config/EndpointConfig';
import { buildUrl } from '@/utils/urlBuilder'; // Add this import

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
          } else if (typeof endpoint === 'object' && endpoint.path) {
            // Already an EndpointConfig object - keep as is
            (generatedConfig[categoryKey as keyof EndpointConfigurations] as any)[endpointKey] = endpoint;
          } else if (typeof endpoint === 'function') {
            // Function-based endpoint - wrap to maintain functionality
            (generatedConfig[categoryKey as keyof EndpointConfigurations] as any)[endpointKey] = 
              (...params: any[]) => {
                const result = endpoint(...params);
                return typeof result === 'string' 
                  ? this.convertToEndpointConfig(result) 
                  : result;
              };
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
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET" // Added PATCH
  ): EndpointConfig {
    return {
      path: endpointPath,
      method: method,
      requiresAuth: true, // Default value
      cacheable: false, // Default value
      retryable: true // Default value
    };
  }

  // VALIDATION - Enhanced to handle both objects and functions
  validateEndpointConfig(config: EndpointDefinition): boolean {
    if (typeof config === 'function') {
      // Test the function with empty params to see if it returns valid config
      try {
        const result = config({});
        return !!(result.path && result.method);
      } catch {
        return false;
      }
    }
    return !!(config.path && config.method);
  }

  validateCategory(category: string): boolean {
    return category in this.configurations;
  }

  // CONFIGURATION ANALYSIS - Enhanced to handle different endpoint types
  getEndpointStats() {
    const stats = {
      totalCategories: 0,
      totalEndpoints: 0,
      categories: {} as Record<string, number>,
      endpointTypes: {
        object: 0,
        function: 0,
        string: 0
      }
    };

    Object.keys(this.configurations).forEach(category => {
      const categoryConfig = this.configurations[category as keyof EndpointConfigurations];
      const endpoints = Object.keys(categoryConfig);
      
      endpoints.forEach(endpointKey => {
        const endpoint = (categoryConfig as any)[endpointKey];
        if (typeof endpoint === 'string') {
          stats.endpointTypes.string++;
        } else if (typeof endpoint === 'function') {
          stats.endpointTypes.function++;
        } else if (typeof endpoint === 'object') {
          stats.endpointTypes.object++;
        }
      });
      
      stats.categories[category] = endpoints.length;
      stats.totalEndpoints += endpoints.length;
    });

    stats.totalCategories = Object.keys(this.configurations).length;
    return stats;
  }

  // FIND ENDPOINTS - Updated to use URL builder
  findEndpointByPath(path: string) {
    for (const category of this.getCategories()) {
      for (const endpointKey of this.getEndpointsForCategory(category)) {
        const endpoint = this.getEndpoint(category, endpointKey);
        
        try {
          // Use buildUrl to get the actual path for comparison
          const endpointPath = buildUrl(endpoint);
          if (endpointPath === path) {
            return { category, endpointKey, endpoint };
          }
        } catch (error) {
          // Skip endpoints that can't be built without parameters
          continue;
        }
      }
    }
    return null;
  }

  // NEW: Get URL for an endpoint (useful for external consumption)
  getEndpointUrl<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    params?: Record<string, any>
  ): string {
    const endpoint = this.getEndpoint(category, endpointKey);
    return buildUrl(endpoint, params);
  }

  // NEW: Validate all configurations
  validateAllConfigurations(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.keys(this.configurations).forEach(category => {
      const categoryKey = category as keyof EndpointConfigurations;
      const categoryConfig = this.configurations[categoryKey];
      
      Object.keys(categoryConfig).forEach(endpointKey => {
        const endpoint = (categoryConfig as any)[endpointKey];
        if (!this.validateEndpointConfig(endpoint)) {
          errors.push(`Invalid endpoint: ${category}.${endpointKey}`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // NEW: Get all endpoint URLs for a category (useful for testing)
  getCategoryUrls<T extends keyof EndpointConfigurations>(
    category: T,
    sampleParams?: Record<string, any>
  ): Record<string, string> {
    const urls: Record<string, string> = {};
    const categoryConfig = this.configurations[category];
    
    Object.keys(categoryConfig).forEach(endpointKey => {
      try {
        const endpoint = (categoryConfig as any)[endpointKey];
        urls[endpointKey] = buildUrl(endpoint, sampleParams);
      } catch (error) {
        urls[endpointKey] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    });
    
    return urls;
  }
}

export default ApiConfigManager;