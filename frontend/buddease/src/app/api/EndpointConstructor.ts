import { Endpoints, endpoints } from "./ApiEndpoints";

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
  const endpoint = endpoints[endpointCategory][endpointKey];
  if (typeof endpoint === "string") {
    // If the endpoint is a string, directly concatenate with params
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const url = `${endpoint}?${queryString}`;
    return { endpoint: url, params };
  } else if (typeof endpoint === "function") {
    // If the endpoint is a function, call it with params
    const url = endpoint(...Object.values(params));
    return { endpoint: url, params };
  } else {
    throw new Error(`Invalid endpoint type for ${endpointCategory}/${endpointKey}`);
  }
};

export const target = constructTarget("apiWebBase", "login", {
  sortBy: "",
  limit: 0,
  username: "user",
  password: "pass",
});
export { constructTarget };
export type { Target };

