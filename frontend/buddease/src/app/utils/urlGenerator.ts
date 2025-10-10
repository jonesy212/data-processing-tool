// urlGenerator.ts
import { EndpointConfigurations, EndpointConfig } from '../types/EndpointConfigurations';
import { BASE_URL } from '../configurations/baseUrl';

/**
 * Function to generate endpoint URL based on configuration.
 * @param category - The category of the endpoint.
 * @param endpoint - The specific endpoint to generate the URL for.
 * @param params - Any parameters to include in the URL.
 * @returns The generated endpoint URL.
 */
export const generateEndpointUrl = (
  category: keyof EndpointConfigurations,
  endpoint: string,
  params?: any
): string => {
  const endpointConfig = (endpointConfigurations as any)[category][endpoint] as EndpointConfig;
  
  if (!endpointConfig) {
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }
  
  let url = `${BASE_URL}${endpointConfig.path}`;

  // Handle dynamic parameters if needed
  if (params) {
    if (endpointConfig.method === "GET") {
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
      url += `?${queryString}`;
    }
  }

  return url;
};