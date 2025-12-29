// urlGenerator.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { endpointConfigurations } from '@/core/api/endpointConfigurations';
import { EndpointConfig, EndpointConfigurations } from '@/core/config/EndpointConfig';

/**
 * Function to generate endpoint URL based on configuration.
 * @param category - The category of the endpoint.
 * @param endpoint - The specific endpoint to generate the URL for.
 * @param params - Any parameters to include in the URL.
 * @returns The generated endpoint URL.
 */

// Enhanced URL generator that handles all endpoint types
export const generateEndpointUrl = (
  category: keyof EndpointConfigurations,
  endpoint: string,
  params?: any
): string | ((...args: any[]) => string) => {
  const categoryConfig = endpointConfigurations[category];
  const endpointConfig = (categoryConfig as any)[endpoint] as EndpointConfig;
  
  if (!endpointConfig) {
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }
  
  // Handle function endpoints (like teamsConfig.single)
  if (typeof endpointConfig === 'function') {
    return (...args: any[]) => {
      const resolvedConfig = endpointConfig(...args);
      let url = `${BASE_URL}${resolvedConfig.path}`;
      
      // Add query parameters for GET requests
      if (resolvedConfig.method === "GET" && args.length > 0 && typeof args[0] === 'object') {
        const queryParams = args[0];
        const queryString = Object.keys(queryParams)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
          .join("&");
        
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      return url;
    };
  }
  
  // Handle object endpoints (like devConfig.getMockData)
  if (typeof endpointConfig === 'object' && endpointConfig.path) {
    let baseUrl = `${BASE_URL}${endpointConfig.path}`;
    
    // Check if this is a parameterized endpoint (contains :param or {param})
    const hasParams = baseUrl.includes(':') || baseUrl.includes('{');
    
    if (hasParams) {
      // This should be a function that takes parameters
      return (...args: any[]) => {
        let url = baseUrl;
        
        // Replace path parameters
        if (args.length > 0) {
          // Simple replacement for :param or {param} patterns
          url = url.replace(/:(\w+)|{(\w+)}/g, (match, p1, p2) => {
            const paramName = p1 || p2;
            const paramValue = args[0][paramName] || args[0];
            return encodeURIComponent(String(paramValue));
          });
        }
        
        // Add query parameters for GET requests
        if (endpointConfig.method === "GET" && args.length > 0 && typeof args[0] === 'object') {
          const queryParams = args[0];
          const queryString = Object.keys(queryParams)
            .filter(key => !baseUrl.includes(`:${key}`) && !baseUrl.includes(`{${key}}`)) // Don't include path params
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join("&");
          
          if (queryString) {
            url += `?${queryString}`;
          }
        }
        
        return url;
      };
    }
    
    // Simple string endpoint (no path parameters)
    if (params && endpointConfig.method === "GET") {
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
      baseUrl += queryString ? `?${queryString}` : '';
    }
    
    return baseUrl;
  }
  
  throw new Error(`Invalid endpoint configuration: ${String(category)}.${endpoint}`);
};