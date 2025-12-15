// EndpointConstructor.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { Endpoints } from '@/app/api/ApiEndpoints'

interface Target {
  endpoint: string;
  params: {
    sortBy: string;
    limit: number;
    [key: string]: string | number;
  };
  toArray?: any;
  url?: string;
}

const constructTarget = <K extends keyof typeof endpoints>(
  endpointCategory: K,
  endpointKey: keyof Endpoints[K],
  params: { sortBy: string; limit: number; [key: string]: string | number } = {
    sortBy: "",
    limit: 0,
  }
): Target => {
  const category = endpoints[endpointCategory];
  
  if (!category || typeof category !== 'object') {
    throw new Error(`Invalid endpoint category: ${String(endpointCategory)}`);
  }
  
  const endpoint = (category as any)[endpointKey];
  
  if (!endpoint) {
    throw new Error(`Invalid endpoint: ${String(endpointCategory)}.${String(endpointKey)}`);
  }
  
  if (typeof endpoint === "string") {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return { endpoint: url, params, url };
  } else if (typeof endpoint === "function") {
    const url = endpoint(params);
    return { endpoint: url, params, url };
  } else {
    throw new Error(`Invalid endpoint type for ${String(endpointCategory)}.${String(endpointKey)}`);
  }
};

// Example usage
export const target = constructTarget("apiWebBase", "login", {
  sortBy: "",
  limit: 0,
  username: "user",
  password: "pass",
});

export { constructTarget };
export type { Target };