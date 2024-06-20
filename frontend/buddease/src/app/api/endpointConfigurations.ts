import useFiltering from "../components/hooks/useFiltering";
import { searchOptions } from "../pages/searchs/SearchOptions";
import useSearchOptions from "../pages/searchs/useSearchOptions";
import { BASE_URL } from "./baseUrl";
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
    snapshots: EndpointConfig;
  };
  filtering: {
    filterTasks: EndpointConfig;
    // Add more filtering endpoints as needed
  };
  searching: {
    searchMessages: EndpointConfig;
    // Add more searching endpoints as needed
  };
  snapshots: {

  },
  tasks: {
    create: EndpointConfig;
    list: EndpointConfig;
    single: (taskId: number) => string;
    add: EndpointConfig;
    remove: (taskId: number) => string;
    process: EndpointConfig;
    completeAll: EndpointConfig;
    toggle: (taskId: number) => string;
    removeMultiple: EndpointConfig;
    toggleMultiple: EndpointConfig;
    markInProgress: (taskId: number) => string;
    update: (taskId: number) => string;
  };
  todos: {
    create: string;
    list: EndpointConfig;
    single: (todoId: number) => string;
    add: EndpointConfig;
    remove: (todoId: number) => string;
    toggle: (todoId: number, entityType: string) => string;
    removeMultiple: EndpointConfig;
    toggleMultiple: EndpointConfig;
    update: (todoId: number) => string;
    delete: (todo: number) => string;
    process: EndpointConfig;


    complete: (todoId: number) => string;
    uncomplete: (todoId: number) => string;

    fetch: string;
    assign: (todoId: number, teamId: number) => string
    reassign: (todoId: number, newTeamId: number) => string
    unassign: (todoId: number) => string,
  
    search: string
    bulkAssign: string
    bulkUnassign: string
  }
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
    snapshots: { path: "/api/sorting/snapshots", method: "POST" },
  },
  filtering: {
    filterTasks: { path: "/api/filtering/tasks", method: "POST" },
    // Add more filtering endpoints as needed
  },
  searching: {
    searchMessages: { path: "/api/searching/messages", method: "POST" },
    // Add more searching endpoints as needed
  },
  tasks: {
    create: { path: "/api/tasks/create", method: "POST" },
    list: { path: "/api/tasks", method: "GET" },
    single: (taskId: number) => `/api/tasks/${taskId}`,
    add: { path: "/api/tasks/add", method: "POST" },
    remove: (taskId: number) => `/api/tasks/${taskId}/remove`,
    process: { path: "/api/tasks/process", method: "POST" },
    completeAll: { path: "/api/tasks/completeAll", method: "POST" },
    toggle: (taskId: number) => `/api/tasks/${taskId}/toggle`,
    removeMultiple: { path: "/api/tasks/removeMultiple", method: "POST" },
    toggleMultiple: { path: "/api/tasks/toggleMultiple", method: "POST" },
    markInProgress: (taskId: number) => `/api/tasks/${taskId}/markInProgress`,
    update: (taskId: number) => `/api/tasks/${taskId}/update`,
  },
  snapshots: {
    create: { path: "/api/snapshots/create", method: "POST" },
    list: { path: "/api/snapshots", method: "GET" },
    single: (snapshotId: number) => `/api/snapshots/${snapshotId}`,
    add: { path: "/api/snapshots/add", method: "POST" },
    remove: (snapshotId: number) => `/api/snapshots/${snapshotId}/remove`,
  },
  todos: {
    create: `${BASE_URL}/api/todos/create`,
    list: { path: "/api/todos", method: "GET" },
    single: (taskId: number) => `/api/todos/${taskId}`,
    add: { path: "/api/todos/add", method: "POST" },
    remove: (taskId: number) => `/api/todos/${taskId}/remove`,
    process: { path: "/api/todos/process", method: "POST" },

    update: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/update`,
    delete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/delete`,
    complete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/complete`,
    uncomplete: (todoId: number) =>
      `${BASE_URL}/api/todos/${todoId}/uncomplete`,
    fetch: `${BASE_URL}/api/todos`,
    assign: (todoId: number, teamId: number) =>
      `${BASE_URL}/api/todos/${todoId}/assign/${teamId}`,
    reassign: (todoId: number, newTeamId: number) =>
      `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`,
    unassign: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/unassign`,
    toggle: (entityId: number, entityType: string) =>
      `${BASE_URL}/api/toggle/${entityType}/${entityId}`,
    search: `${BASE_URL}/api/todos/search`,
    bulkAssign: `${BASE_URL}/api/todos/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/todos/bulk-unassign`,
    removeMultiple: { path: "/api/todos/removeMultiple", method: "POST" },
    toggleMultiple: { path: "/api/todos/toggleMultiple", method: "POST" },
    // Define todo endpoints here
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
  tasks: mergeConfigurations(endpointConfigurations.tasks, {
    create: generateEndpointUrl("tasks", "create"),
    list: generateEndpointUrl("tasks", "list"),
    single: (taskId: number) =>
      `${generateEndpointUrl("tasks", "single")}/${taskId}`,
    add: generateEndpointUrl("tasks", "add"),
    remove: (taskId: number) =>
      `${generateEndpointUrl("tasks", "remove")}/${taskId}`,
    process: generateEndpointUrl("tasks", "process"),
    completeAll: generateEndpointUrl("tasks", "completeAll"),
    toggle: (taskId: number) =>
      generateEndpointUrl("tasks", "toggle", { taskId }),
    removeMultiple: generateEndpointUrl("tasks", "removeMultiple"),
    toggleMultiple: generateEndpointUrl("tasks", "toggleMultiple"),
    markInProgress: (taskId: number) =>
      generateEndpointUrl("tasks", "markInProgress", { taskId }),
    update: (taskId: number) =>
      generateEndpointUrl("tasks", "update", { taskId }),
  }),
  snapshots: mergeConfigurations(endpointConfigurations.sorting.snapshots, {
    create: generateEndpointUrl("snapshots", "create"),
    list: generateEndpointUrl("snapshots", "list"),
    single: (snapshotId: number) =>
      generateEndpointUrl("snapshots", "single", { snapshotId }),
    add: generateEndpointUrl("snapshots", "add"),
    remove: (snapshotId: number) => generateEndpointUrl("snapshots", "remove", { snapshotId }),
    removeBatch: generateEndpointUrl("snapshots", "removeBatch"),

  }),
  todos: mergeConfigurations(endpointConfigurations.todos, {
    create: generateEndpointUrl("todos", "create"),
    update: (todoId: number) =>
      generateEndpointUrl("todos", "update", { todoId }),
    delete: (todoId: number) =>
      generateEndpointUrl("todos", "delete", { todoId }),
    complete: (todoId: number) =>
      generateEndpointUrl("todos", "complete", { todoId }),
    uncomplete: (todoId: number) =>
      generateEndpointUrl("todos", "uncomplete", { todoId }),
    fetch: generateEndpointUrl("todos", "fetch"),
    assign: (todoId: number, teamId: number) =>
      generateEndpointUrl("todos", "assign", { todoId, teamId }),
    reassign: (todoId: number, newTeamId: number) =>
      generateEndpointUrl("todos", "reassign", { todoId, newTeamId }),
    unassign: (todoId: number) =>
      generateEndpointUrl("todos", "unassign", { todoId }),
    toggle: (entityId: number, entityType: string) =>
      generateEndpointUrl("todos", "toggle", { entityId, entityType }),
    search: generateEndpointUrl("todos", "search"),
    bulkAssign: generateEndpointUrl("todos", "bulkAssign"),
    bulkUnassign: generateEndpointUrl("todos", "bulkUnassign"),
  }),
};

export const endpoints = updatedEndpoints;
export default endpointConfigurations;
export { updatedEndpoints };
