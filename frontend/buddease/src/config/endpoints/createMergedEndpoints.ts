// createMergedEndpoints.ts
import { EndpointConfig, EndpointConfigurations } from '@/config/EndpointConfig';
import { BASE_URL } from '@/app/api/baseUrl';
// Enhanced automated endpoint merger
export const createMergedEndpoints = (endpointConfigurations: EndpointConfigurations) => {
  const updatedEndpoints: any = {};
  
  // Automatically process every endpoint group
  Object.entries(endpointConfigurations).forEach(([category, config]) => {
    const categoryEndpoints: any = {};
    
      // Process each endpoint in the category - ADD TYPE ANNOTATION
    Object.entries(config as Record<string, EndpointConfig | ((...args: any[]) => EndpointConfig)>).forEach(([endpointKey, endpointConfig]) => {
      // Now TypeScript knows endpointConfig can be EndpointConfig or a function
      if (typeof endpointConfig === 'object' && endpointConfig && 'path' in endpointConfig) {
        // Generate URL based on endpoint configuration
        const generatedUrl = generateEndpointUrl(category as keyof EndpointConfigurations, endpointKey);
        categoryEndpoints[endpointKey] = generatedUrl;
      }
    });
    
    updatedEndpoints[category] = mergeConfigurations(config, categoryEndpoints);
  });
  
  return updatedEndpoints;
};

