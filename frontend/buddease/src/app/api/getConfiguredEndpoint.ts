// getConfiguredEndpoint.ts
// Enhanced endpoint access using your ApiConfig system
import { apiConfig, getApiEndpoint, getApiEndpointUrl } from '@/app/api/endpointConfigurations';

// Option 1: Using the existing helper functions
export const getConfiguredEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
): { path: string; method: string; fullConfig?: any } => {
  
  // Use the built-in helper functions from your endpointConfigurations
  const endpointInfo = getApiEndpoint(category, endpointKey, ...params);
  const url = getApiEndpointUrl(category, endpointKey, ...params);
  
  return {
    path: url,
    method: endpointInfo.method,
    fullConfig: endpointInfo
  };
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