// urlBuilder.ts

import { EndpointDefinition, EndpointConfig } from '@/app/config/EndpointConfig';

export const buildUrl = (endpoint: EndpointDefinition, params?: Record<string, any>): string => {
  let config: EndpointConfig;
  
  // Handle both function and object endpoint definitions
  if (typeof endpoint === 'function') {
    config = endpoint(params);
  } else {
    config = endpoint;
  }
  
  // Build URL with parameters if provided
  let url = config.path;
  if (params && config.parameters) {
    Object.keys(config.parameters).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url = url.replace(`:${key}`, encodeURIComponent(params[key]));
      }
    });
    
    // Add query parameters for non-path parameters
    const queryParams: string[] = [];
    Object.keys(params).forEach(key => {
      if (!config.parameters?.[key] && params[key] !== undefined && params[key] !== null) {
        queryParams.push(`${key}=${encodeURIComponent(params[key])}`);
      }
    });
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
  }
  
  return url;
};