import { Endpoints, endpoints } from "./ApiEndpoints";

interface Target {
    endpoint: string;
    params: {
      sortBy: string;
      limit: number;
      // Add more parameters as needed
    };
  }
const constructTarget = (
  category: keyof Endpoints,
  endpointKey: string,
  params: Record<string, string | number> = {}
): string => {
  const endpoint = endpoints[category][endpointKey];
  if (typeof endpoint === "string") {
    // If the endpoint is a string, directly concatenate with params
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    return `${endpoint}?${queryString}`;
  } else if (typeof endpoint === "function") {
    // If the endpoint is a function, call it with params
    return endpoint(...Object.values(params));
  } else {
    throw new Error(`Invalid endpoint type for ${category}/${endpointKey}`);
  }
};

export const target = constructTarget("apiWebBase", "login", { username: "user", password: "pass" });
export { constructTarget };
export type { Target };
