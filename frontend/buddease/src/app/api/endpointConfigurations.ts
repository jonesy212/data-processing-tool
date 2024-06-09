import useFiltering from "../components/hooks/useFiltering";
import { SearchOptions, searchOptions } from "../pages/searchs/SearchOptions";
import useSearchOptions from "../pages/searchs/useSearchOptions";
import { BASE_URL } from "./baseUrl";
import { FilterTasksRequestProps } from "../pages/searchs/FilterTasksRequest";
import mergeConfigurations from "./mergeConfigurations";

interface EndpointConfig {
  path: string;
  method: string;
}

interface EndpointConfigurations {
  apiWebBase: {
    login: EndpointConfig;
    logout: EndpointConfig;
  };
  web: {
    send: EndpointConfig;
    get: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
  };
  sorting: {
    sortEvents: EndpointConfig;
    sortMessages: EndpointConfig;
  };
  filtering: {
    filterTasks: EndpointConfig;
    // Add more filtering endpoints as needed
  };
  searching: {
    searchMessages: EndpointConfig;
    // Add more searching endpoints as needed
  };
}


// Define endpoint configurations
const endpointConfigurations: EndpointConfigurations = {
  apiWebBase: {
    login: { path: "/login", method: "POST" },
    logout: { path: "/logout", method: "POST" },
  },
  web: {
    send: { path: "/api/messages/web/send", method: "POST" },
    get: { path: "/api/messages/web/get", method: "GET" },
    update: { path: "/api/messages/web/update", method: "PUT" },
    delete: { path: "/api/messages/web/delete", method: "DELETE" },
  },
  sorting: {
    sortEvents: { path: "/api/sorting/events", method: "POST" },
    sortMessages: { path: "/api/sorting/messages", method: "POST" },
  },
  filtering: {
    filterTasks: { path: "/api/filtering/tasks", method: "POST" },
    // Add more filtering endpoints as needed
  },
  searching: {
    searchMessages: { path: "/api/searching/messages", method: "POST" },
    // Add more searching endpoints as needed
  },
};
/**
 * Function to generate endpoint URL based on configuration.
 * @param category - The category of the endpoint.
 * @param endpoint - The specific endpoint to generate the URL for.
 * @param params - Any parameters to include in the URL.
 * @returns The generated endpoint URL.
 */

const generateEndpointUrl = (
  category: keyof EndpointConfigurations,
  endpoint: string,
  params?: any
): string => {
  const endpointConfig = endpointConfigurations[category][endpoint as keyof typeof endpointConfigurations[typeof category]] as EndpointConfig;
  let url = `${BASE_URL}${endpointConfig.path}`;
  // Handle dynamic parameters if needed
  if (params) {
    if (endpointConfig.method === "GET") {
      url += `?${Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&")}`;
    } else {
      url += JSON.stringify(params);
    }
  }
  return url;
};

const { handleFilterTasks } = useSearchOptions();
const { addFilter } = useFiltering(searchOptions);

// Merge configurations dynamically
const updatedEndpoints = {
  apiWebBase: mergeConfigurations(endpointConfigurations.apiWebBase, {
    login: generateEndpointUrl("apiWebBase", "login"),
    logout: generateEndpointUrl("apiWebBase", "logout"),
  }),
  web: mergeConfigurations(endpointConfigurations.web, {
    send: generateEndpointUrl("web", "send"),
    get: generateEndpointUrl("web", "get"),
    update: generateEndpointUrl("web", "update"),
    delete: generateEndpointUrl("web", "delete"),
  }),
};

export const endpoints = updatedEndpoints;
export default endpointConfigurations;
export { updatedEndpoints };
