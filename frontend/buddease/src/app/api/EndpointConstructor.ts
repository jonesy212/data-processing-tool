import { Endpoints, endpoints } from "@/app/api/endpointConfigurations";

interface Target {
  endpoint: string;
  params: {
    sortBy: string;
    limit: number;
    // Add more parameters as needed
  };
  toArray?: any;
  url?: string;
}

const constructTarget = (
  endpointCategory: keyof Endpoints,
  endpointKey: string,
  params: { sortBy: string; limit: number; [key: string]: string | number } = {
    sortBy: "",
    limit: 0,
  }
): Target => {
const constructTarget = (
  endpointCategory: keyof Endpoints,
  endpointKey: string,
  params: { sortBy: string; limit: number; [key: string]: string | number } = {
    sortBy: "",
    limit: 0,
  }
): Target => {
  const category = endpoints[endpointCategory];
  
  // Runtime validation
  if (!category || !(endpointKey in category)) {
    throw new Error(`Invalid endpoint: ${endpointCategory}.${endpointKey}`);
  }
  
  const endpoint = (category as any)[endpointKey];
  
  if (typeof endpoint === "string") {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return { endpoint: url, params };
    } else if (typeof endpoint === "function") {
      const url = endpoint(...Object.values(params));
      return { endpoint: url, params };
    } else {
      throw new Error(`Invalid endpoint type for ${endpointCategory}.${endpointKey}`);
    }
  };
};

export const target = constructTarget("apiWebBase", "login", {
  sortBy: "",
  limit: 0,
  username: "user",
  password: "pass",
});
export { constructTarget };
export type { Target };

