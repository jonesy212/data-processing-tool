import useFiltering from "../components/hooks/useFiltering";
import { searchOptions } from "../pages/searchs/SearchOptions";
import useSearchOptions from "../pages/searchs/useSearchOptions";
import { BASE_URL } from "./baseUrl";
import mergeConfigurations from "./mergeConfigurations";

interface EndpointConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}


interface NewsEndpoints {
  list: EndpointConfig;
  single: (newsId: number) => EndpointConfig;
  add: EndpointConfig;
  update: (newsId: number) => EndpointConfig;
  remove: (newsId: number) => EndpointConfig;
  search: EndpointConfig;
  publish: (newsId: number) => EndpointConfig;
  unpublish: (newsId: number) => EndpointConfig;
}

interface EndpointConfigurations {
  apiWebBase: {
    login: EndpointConfig;
    logout: EndpointConfig;
  };
  content: { // Add the content property here
    fetchContent: EndpointConfig;
    createContent: EndpointConfig;
    updateContent: EndpointConfig;
    deleteContent: EndpointConfig;
    publishContent: EndpointConfig;
    unpublishContent: EndpointConfig;
    searchContent: EndpointConfig;
  };
  data: {
    single: EndpointConfig;
    list: EndpointConfig;
    getData: EndpointConfig;
    addData: EndpointConfig;
    getSpecificData: EndpointConfig;
    deleteData: EndpointConfig;
    updateDataTitle: EndpointConfig;
    streamData: EndpointConfig;
    dataProcessing: EndpointConfig;
    updateData: EndpointConfig;
    highlightList: EndpointConfig;
    addHighlight: EndpointConfig;
    getSpecificHighlight: EndpointConfig;
    updateHighlight: EndpointConfig;
    deleteHighlight: EndpointConfig;
    uploadData: EndpointConfig;
  };
  delegates: {
    list: EndpointConfig;
    single: (delegateId: number) => EndpointConfig;
    add: EndpointConfig;
    remove: (delegateId: number) => EndpointConfig;
    update: (delegateId: number) => EndpointConfig;
    updateList: EndpointConfig;
    search: EndpointConfig;
    updateRole: (delegateId: number) => EndpointConfig;
    updateRoles: (delegateIds: number[]) => EndpointConfig;
    fetch: EndpointConfig;
    create: EndpointConfig;
    delete: (delegateId: number) => EndpointConfig;
    fetchById: (delegateId: number) => EndpointConfig;
  }
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
  highlights: {
    list: EndpointConfig;
    add: EndpointConfig;
    getSpecific: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
    backend: EndpointConfig;
    frontend: EndpointConfig
  };
  news: NewsEndpoints; // Add the news property here

  searching: {
    searchMessages: EndpointConfig;
    searchDelegates: EndpointConfig;
    searchTasks: EndpointConfig;
    searchContent: EndpointConfig;
    searchData: EndpointConfig;
    searchHighlights: EndpointConfig;
    searchTodos: EndpointConfig;
    // Add more searching endpoints as needed
  };
  snapshots: {
    create: EndpointConfig;
    list: EndpointConfig;
    single: (snapshotId: string) => EndpointConfig;
    add: EndpointConfig;
    remove: (snapshotId: string) => EndpointConfig;
    update: (snapshotId: string) => EndpointConfig;
    fetchUpdatedData: (snapshotId: string) => EndpointConfig;
    bulkAdd: EndpointConfig;
    bulkRemove: EndpointConfig;
    bulkUpdate: EndpointConfig;
  };
  version: {
    getVersion: EndpointConfig;
    updateVersion: EndpointConfig;
    deleteVersion: EndpointConfig;
    backend: EndpointConfig;
    frontend: EndpointConfig;
  };
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
    assign: (todoId: number, teamId: number) => string;
    reassign: (todoId: number, newTeamId: number) => string;
    unassign: (todoId: number) => string;
    search: string;
    bulkAssign: string;
    bulkUnassign: string;
  };

  users: {
    list: EndpointConfig;
    single: (userId: number) => EndpointConfig;
    add: EndpointConfig;
    remove: (userId: number) => EndpointConfig;
    update: (userId: number) => EndpointConfig;
    updateList: EndpointConfig;
    search: EndpointConfig;
    updateRole: (userId: number) => EndpointConfig;
    updateRoles: (userIds: number[]) => EndpointConfig;
  };
}


// Define endpoint configurations

const endpointConfigurations: EndpointConfigurations = {
  apiWebBase: {
    login: { path: "/login", method: "POST" },
    logout: { path: "/logout", method: "POST" },
  },


  content: {
    fetchContent: { path: "/api/content/fetch", method: "GET" },
    createContent: { path: "/api/content/create", method: "POST" },
    updateContent: { path: "/api/content/update", method: "PUT" },
    deleteContent: { path: "/api/content/delete", method: "DELETE" },
    publishContent: { path: "/api/content/publish", method: "POST" },
    unpublishContent: { path: "/api/content/unpublish", method: "POST" },
    searchContent: { path: "/api/content/search", method: "POST" },
  },
  data: {
    single: { path: "/api/data/single", method: "GET" },
    list: { path: "/api/data/list", method: "GET" },
    getData: { path: "/api/data", method: "GET" },
    addData: { path: "/api/data", method: "POST" },
    getSpecificData: { path: "/api/data/{dataId}", method: "GET" },
    deleteData: { path: "/api/data/{dataId}", method: "DELETE" },
    updateDataTitle: { path: "/api/data/update_title", method: "PUT" },
    streamData: { path: "/api/stream_data", method: "GET" },
    dataProcessing: { path: "/api/data/data-processing", method: "POST" },
    updateData: { path: "/api/data/update", method: "PUT" },
    highlightList: { path: "/api/highlights", method: "GET" },
    addHighlight: { path: "/api/highlights", method: "POST" },
    getSpecificHighlight: { path: "/api/highlights/{highlightId}", method: "GET" },
    updateHighlight: { path: "/api/highlights/{highlightId}", method: "PUT" },
    deleteHighlight: { path: "/api/highlights/{highlightId}", method: "DELETE" },
    uploadData: { path: "/api/data/upload", method: "POST" },
  },
  delegates: {
    list: { path: "/api/delegates", method: "GET" },
    single: (delegateId: number) => ({ path: `/api/delegates/${delegateId}`, method: "GET" }),
    add: { path: "/api/delegates/add", method: "POST" },
    remove: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/remove`, method: "DELETE" }),
    update: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/update`, method: "PUT" }),
    updateList: { path: "/api/delegates/updateList", method: "POST" },
    search: { path: "/api/delegates/search", method: "POST" },
    updateRole: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/updateRole`, method: "PUT" }),
    updateRoles: (delegateIds: number[]) => ({ path: "/api/delegates/updateRoles", method: "POST", body: delegateIds }),
    fetch: { path: "/api/delegates/fetch", method: "GET" },
    create: { path: "/api/delegates/create", method: "POST" },
    delete: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/delete`, method: "DELETE" }),
    fetchById: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/fetchById`, method: "GET" }),
  },
  
  sorting: {
    sortEvents: { path: "/api/sorting/events", method: "POST" },
    sortMessages: { path: "/api/sorting/messages", method: "POST" },
    snapshots: { path: "/api/sorting/snapshots", method: "POST" },
  },
  filtering: {
    filterTasks: { path: "/api/filtering/tasks", method: "POST" },
  },
  highlights: {
    list: { path: "/api/highlights", method: "GET" },
    add: { path: "/api/highlights", method: "POST" },
    getSpecific: { path: "/api/highlights/{highlightId}", method: "GET" },
    update: { path: "/api/highlights/{highlightId}", method: "PUT" },
    delete: { path: "/api/highlights/{highlightId}", method: "DELETE" },
    backend: { path: "/api/highlights/backend", method: "POST"},
    frontend: { path: "/api/highlights/frontend", method: "POST"},
  },
  news: {
    list: { path: "/news", method: "GET" },
    single: (newsId: number) => ({ path: `/news/${newsId}`, method: "GET" }),
    add: { path: "/news", method: "POST" },
    update: (newsId: number) => ({ path: `/news/${newsId}`, method: "PUT" }),
    remove: (newsId: number) => ({ path: `/news/${newsId}`, method: "DELETE" }),
    search: { path: "/news/search", method: "POST" },
    publish: (newsId: number) => ({ path: `/news/${newsId}/publish`, method: "PUT" }),
    unpublish: (newsId: number) => ({ path: `/news/${newsId}/unpublish`, method: "PUT" }),
  },
  searching: {
    searchMessages: { path: "/api/searching/messages", method: "POST" },
    searchDelegates: { path: "/api/searching/delegates", method: "POST" },
    searchTasks: { path: "/api/searching/tasks", method: "POST" },
    searchContent: { path: "/api/searching/content", method: "POST" },
    searchData: { path: "/api/searching/data", method: "POST" },
    searchHighlights: { path: "/api/searching/highlights", method: "POST" },
    searchTodos: { path: "/api/searching/todos", method: "POST" },
  },
  snapshots: {
    list: { path: "/api/snapshots", method: "GET" },
    create: { path: "/api/snapshots/create", method: "POST" },
    single: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "GET" }),
    add: { path: "/api/snapshots/add", method: "POST" },
    remove: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/remove`, method: "DELETE" }),
    update: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "PUT" }),
    fetchUpdatedData: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/fetch-updated-data`, method: "GET" }),
    bulkAdd: { path: "/api/snapshots/bulk-add", method: "POST" },
    bulkRemove: { path: "/api/snapshots/bulk-remove", method: "POST" },
    bulkUpdate: { path: "/api/snapshots/bulk-update", method: "POST" },
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
  todos: {
    create: `${BASE_URL}/api/todos/create`,
    list: { path: "/api/todos", method: "GET" },
    single: (todoId: number) => `${BASE_URL}/api/todos/${todoId}`,
    add: { path: "/api/todos/add", method: "POST" },
    remove: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/remove`,
    process: { path: "/api/todos/process", method: "POST" },
    update: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/update`,
    delete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/delete`,
    complete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/complete`,
    uncomplete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/uncomplete`,
    fetch: `${BASE_URL}/api/todos`,
    assign: (todoId: number, teamId: number) => `${BASE_URL}/api/todos/${todoId}/assign/${teamId}`,
    reassign: (todoId: number, newTeamId: number) => `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`,
    unassign: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/unassign`,
    toggle: (entityId: number, entityType: string) => `${BASE_URL}/api/toggle/${entityType}/${entityId}`,
    search: `${BASE_URL}/api/todos/search`,
    bulkAssign: `${BASE_URL}/api/todos/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/todos/bulk-unassign`,
    removeMultiple: { path: "/api/todos/removeMultiple", method: "POST" },
    toggleMultiple: { path: "/api/todos/toggleMultiple", method: "POST" },
  },
  users: {
    list: { path: "/users", method: "GET" },
    single: (userId: number) => ({ path: `/users/${userId}`, method: "GET" }),
    add: { path: "/users", method: "POST" },
    remove: (userId: number) => ({ path: `/users/${userId}`, method: "DELETE" }),
    update: (userId: number) => ({ path: `/users/${userId}`, method: "PUT" }),
    updateList: { path: "/users/update-list", method: "POST" },
    search: { path: "/users/search", method: "POST" },
    updateRole: (userId: number) => ({ path: `/users/${userId}/update-role`, method: "PUT" }),
    updateRoles: (userIds: number[]) => ({ path: `/users/${userIds.join(",")}/update-roles`, method: "PUT" }),
  },
  version: {
    getVersion: { path: "/version", method: "GET" },
    updateVersion: { path: "/version", method: "PUT" },
    deleteVersion: { path: "/version", method: "DELETE" },
    backend: { path: "/version/backend", method: "GET" },
    frontend: {path: "/version/frontend", method: "GET"},
  },
  web: {
    send: { path: "/api/messages/web/send", method: "POST" },
    get: { path: "/api/messages/web/get", method: "GET" },
    update: { path: "/api/messages/web/update", method: "PUT" },
    delete: { path: "/api/messages/web/delete", method: "DELETE" },
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
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
      url += `?${queryString}`;
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

  data: mergeConfigurations(endpointConfigurations.data, {
    single: generateEndpointUrl("data", "single"),
    list: generateEndpointUrl("data", "list"),
    getData: generateEndpointUrl("data", "getData"),
    addData: generateEndpointUrl("data", "addData"),
    getSpecificData: generateEndpointUrl("data", "getSpecificData"),
    deleteData: generateEndpointUrl("data", "deleteData"),
    updateDataTitle: generateEndpointUrl("data", "updateDataTitle"),
    streamData: generateEndpointUrl("data", "streamData"),
    dataProcessing: generateEndpointUrl("data", "dataProcessing"),
    updateData: generateEndpointUrl("data", "updateData"),
    highlightList: generateEndpointUrl("data", "highlightList"),
    addHighlight: generateEndpointUrl("data", "addHighlight"),
    getSpecificHighlight: generateEndpointUrl("data", "getSpecificHighlight"),
    updateHighlight: generateEndpointUrl("data", "updateHighlight"),
    deleteHighlight: generateEndpointUrl("data", "deleteHighlight"),
    uploadData: generateEndpointUrl("data", "uploadData"),
  }),

  content: mergeConfigurations(endpointConfigurations.content, {
    create: generateEndpointUrl("content", "create"),
    update: (contentId: number) =>
      generateEndpointUrl("content", "update", { contentId }),
    delete: (contentId: number) =>
      generateEndpointUrl("content", "delete", { contentId }),
    fetch: generateEndpointUrl("content", "fetch"),
    add: generateEndpointUrl("content", "add"),
    remove: (contentId: number) =>
      generateEndpointUrl("content", "remove", { contentId }),
    fetchAll: generateEndpointUrl("content", "fetchAll"),
    fetchAllByType: (contentType: string) =>
      generateEndpointUrl("content", "fetchAllByType", { contentType }),
    fetchAllByTypeAndTeam: (contentType: string, teamId: number) =>
      generateEndpointUrl("content", "fetchAllByTypeAndTeam", {
        contentType,
        teamId,
      }),

    delegates: mergeConfigurations(endpointConfigurations.delegates, {
      create: generateEndpointUrl("delegates", "create"),
      list: generateEndpointUrl("delegates", "list"),
      single: (delegateId: number) =>
        generateEndpointUrl("delegates", "single", { delegateId }),
      add: generateEndpointUrl("delegates", "add"),
      remove: (delegateId: number) =>
        generateEndpointUrl("delegates", "remove", { delegateId }),
      update: (delegateId: number) =>
        generateEndpointUrl("delegates", "update", { delegateId }),
    }),

    fetchAllByTeam: (teamId: number) =>
      generateEndpointUrl("content", "fetchAllByTeam", { teamId }),
  }),
  
  filtering: mergeConfigurations(endpointConfigurations.filtering, {
    filterTasks: generateEndpointUrl("filtering", "filterTasks"),
  }),

  highlights: mergeConfigurations(endpointConfigurations.highlights, {
    list: generateEndpointUrl("highlights", "list"),
    add: generateEndpointUrl("highlights", "add"),
    getSpecific: generateEndpointUrl("highlights", "getSpecific"),
    update: generateEndpointUrl("highlights", "update"),
    delete: generateEndpointUrl("highlights", "delete"),
  }),

  news: mergeConfigurations(endpointConfigurations.news, {
    list: generateEndpointUrl("news", "list"),
    single: (newsId: number) => generateEndpointUrl("news", `single/${newsId}`),
    add: generateEndpointUrl("news", "add"),
    update: (newsId: number) => generateEndpointUrl("news", `update/${newsId}`),
    remove: (newsId: number) => generateEndpointUrl("news", `remove/${newsId}`),
    search: generateEndpointUrl("news", "search"),
    publish: (newsId: number) => generateEndpointUrl("news", `publish/${newsId}`),
    unpublish: (newsId: number) => generateEndpointUrl("news", `unpublish/${newsId}`),
  }),

  sorting: mergeConfigurations(endpointConfigurations.sorting, {
    sortEvents: generateEndpointUrl("sorting", "sortEvents"),
    sortMessages: generateEndpointUrl("sorting", "sortMessages"),
    snapshots: generateEndpointUrl("sorting", "snapshots"),
  }),

  searching: mergeConfigurations(endpointConfigurations.searching, {
    searchMessages: generateEndpointUrl("searching", "searchMessages"),
    searchDelegates: generateEndpointUrl("searching", "searchDelegates"),
    searchTasks: generateEndpointUrl("searching", "searchTasks"),
    searchContent: generateEndpointUrl("searching", "searchContent"),
    searchData: generateEndpointUrl("searching", "searchData"),
    searchHighlights: generateEndpointUrl("searching", "searchHighlights"),
    searchTodos: generateEndpointUrl("searching", "searchTodos"),
  }),

  snapshots: mergeConfigurations(endpointConfigurations.snapshots, {
    list: generateEndpointUrl("snapshots", "list"),
    create: generateEndpointUrl("snapshots", "create"),
    single: (snapshotId: string) =>
      generateEndpointUrl("snapshots", "single", { snapshotId }),
    add: generateEndpointUrl("snapshots", "add"),
    remove: (snapshotId: string) =>
      generateEndpointUrl("snapshots", "remove", { snapshotId }),
    update: (snapshotId: string) =>
      generateEndpointUrl("snapshots", "update", { snapshotId }),
    fetchUpdatedData: (snapshotId: string) =>
      generateEndpointUrl("snapshots", "fetchUpdatedData", { snapshotId }),
    bulkAdd: generateEndpointUrl("snapshots", "bulkAdd"),
    bulkRemove: generateEndpointUrl("snapshots", "bulkRemove"),
    bulkUpdate: generateEndpointUrl("snapshots", "bulkUpdate"),
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

  users: mergeConfigurations(endpointConfigurations.users, {
    list: generateEndpointUrl("users", "list"),
    single: (userId: number) =>
      generateEndpointUrl("users", "single", { userId }),
    add: generateEndpointUrl("users", "add"),
    remove: (userId: number) =>
      generateEndpointUrl("users", "remove", { userId }),
    update: (userId: number) =>
      generateEndpointUrl("users", "update", { userId }),
    updateList: generateEndpointUrl("users", "updateList"),
    search: generateEndpointUrl("users", "search"),
    updateRole: (userId: number) =>
      generateEndpointUrl("users", "updateRole", { userId }),
    updateRoles: (userIds: number[]) =>
      generateEndpointUrl("users", "updateRoles", { userIds }),
  }),
  
  version: mergeConfigurations(endpointConfigurations.version, {
    getVersion: generateEndpointUrl("version", "getVersion"),
    updateVersion: generateEndpointUrl("version", "updateVersion"),
    deleteVersion: generateEndpointUrl("version", "deleteVersion"),
    backend: generateEndpointUrl("version", "backend"),
    frontend: generateEndpointUrl("version", "frontend"),
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
