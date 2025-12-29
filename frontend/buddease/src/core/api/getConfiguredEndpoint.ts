// getConfiguredEndpoint.ts
// Enhanced endpoint access using your ApiConfig system
import { apiConfig, getApiEndpoint, getApiEndpointUrl } from '@/core/api/endpointConfigurations';
import { EndpointConfigurations } from '@/core/config/EndpointConfig';
import { buildUrl } from '@/utils/urlBuilder';



export const getConfiguredEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): {
  path: string;
  method: string;
  fullConfig: any;
  endpoint: any;
  url: string;
} => {
  
  // 1. Get the validated endpoint configuration
  const endpoint = getValidatedEndpoint(category, endpointKey);
  
  // 2. Get the full configuration info
  const endpointInfo = getApiEndpoint(category, endpointKey, ...params);
  
  // 3. Get the constructed URL
  const url = getApiEndpointUrl(category, endpointKey, ...params);
  
  // 4. Extract method with better logic
  let method = 'GET';
  
  // Try multiple ways to get method:
  if (endpointInfo.config && typeof endpointInfo.config === 'object') {
    method = endpointInfo.config.method || method;
  } 
  
  // If not in config, check the endpoint directly
  else if (typeof endpoint === 'function') {
    try {
      // Handle both direct function call and wrapped function
      const result = endpoint(...params);
      if (result && typeof result === 'object') {
        method = result.method || method;
      }
    } catch (error) {
      // Fall back to default method if function call fails
      console.debug('Could not extract method from function endpoint:', error);
    }
  } 
  
  // If endpoint is an object
  else if (endpoint && typeof endpoint === 'object') {
    method = (endpoint as any).method || method;
  }
  
  // 5. Return comprehensive endpoint info
  return {
    path: url,
    method,
    fullConfig: endpointInfo,
    endpoint: endpoint,
    url: url
  };
}


/**
 * Get complete endpoint configuration for making API calls
 */
export const getEndpointForRequest = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): {
  url: string;
  method: string;
  config: any;
  original: any;
} => {
  const { path, method, fullConfig } = getCompositeEndpointInfo(category, endpointKey, ...params);
  
  return {
    url: path,
    method,
    config: fullConfig?.config || {},
    original: fullConfig?.original
  };
};

// Option 1: Using existing helper functions (composite approach)
export const getCompositeEndpointInfo = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): { path: string; method: string; fullConfig?: any } => {
  
  // Use the built-in helper functions from your endpointConfigurations
  const endpointInfo = getApiEndpoint(category, endpointKey, ...params);
  const url = getApiEndpointUrl(category, endpointKey, ...params);
  
  // Extract method from config or original endpoint
  let method = 'GET'; // Default fallback
  
  // Try to get method from config first
  if (endpointInfo.config && typeof endpointInfo.config === 'object') {
    method = endpointInfo.config.method || method;
  } 
  // Try from original endpoint if available
  else if (endpointInfo.original) {
    const original = endpointInfo.original;
    
    // Type-safe check for function
    if (typeof original === 'function') {
      try {
        // Cast to function type to satisfy TypeScript
        const endpointFunc = original as (...args: any[]) => any;
        const config = endpointFunc(...params);
        method = config?.method || method;
      } catch {
        // If function call fails, keep default method
      }
    } 
    // Check if it's an object with method property
    else if (typeof original === 'object' && original !== null && 'method' in original) {
      method = (original as any).method as string;
    }
  }
  
  return {
    path: url,
    method,
    fullConfig: endpointInfo
  };
};

// Option 2: Direct/low-level access (bypasses some abstractions)
export const getDirectEndpointInfo = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): { path: string; method: string; fullConfig?: any } => {
  
  // Get the endpoint directly
  const endpoint = getValidatedEndpoint(category, endpointKey);
  
  // Determine method based on endpoint type
  let method = 'GET';
  let url = '';
  
  if (typeof endpoint === 'function') {
    const config = endpoint(...params);
    method = config.method || 'GET';
    url = buildUrl(endpoint, params);
  } else if (typeof endpoint === 'object' && endpoint !== null) {
    method = endpoint.method || 'GET';
    url = buildUrl(endpoint, params);
  }
  
  return {
    path: url,
    method,
    fullConfig: endpoint
  };
};

// Helper to safely extract method
const extractMethod = (endpoint: any): string => {
  if (!endpoint) return 'GET';
  
  if (typeof endpoint === 'function') {
    try {
      const config = endpoint();
      return config?.method || 'GET';
    } catch {
      return 'GET';
    }
  }
  
  if (typeof endpoint === 'object' && 'method' in endpoint) {
    return String(endpoint.method);
  }
  
  return 'GET';
};

// Option 2: Direct ApiConfig usage
export const getEndpointDirect = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => {
  return apiConfig.getEndpointInfo(category, endpointKey, ...params);
};

// Option 3: For URL only
export const getEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): string => {
  return apiConfig.getUrl(category, endpointKey, ...params);
};