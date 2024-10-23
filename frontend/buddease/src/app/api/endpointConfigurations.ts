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


interface NotesEndpoints {
  list: EndpointConfig;
  single: (noteId: number) => EndpointConfig;
 
}

interface EndpointConfigurations {
  apiWebBase: {
    login: EndpointConfig;
    logout: EndpointConfig;
  };
  comments: {
    list: EndpointConfig;
    single: (commentId: number) => EndpointConfig;
    
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

  documents: {
    list: EndpointConfig;
    single: (documentId: string) => EndpointConfig;
    add: EndpointConfig;
    remove: (documentId: string) => EndpointConfig;
    update: (documentId: string) => EndpointConfig;
    download: (documentId: string) => EndpointConfig;
    search: EndpointConfig;
    filter: EndpointConfig;
    upload: EndpointConfig;
    share: EndpointConfig;
    lock: EndpointConfig;
    unlock: EndpointConfig;
    archive: EndpointConfig;
    restore: EndpointConfig;
    move: EndpointConfig;
    copy: EndpointConfig;
    rename: EndpointConfig;
    changePermissions: EndpointConfig;
    merge: EndpointConfig;
    split: EndpointConfig;
    validate: EndpointConfig;
    encrypt: EndpointConfig;
    decrypt: EndpointConfig;
    trackChanges: EndpointConfig;
    compare: EndpointConfig;
    tag: EndpointConfig;
    categorize: EndpointConfig;
    customizeView: EndpointConfig;
    comment: EndpointConfig;
    mentionUser: EndpointConfig;
    assignTask: EndpointConfig;
    requestReview: EndpointConfig;
    approve: EndpointConfig;
    reject: EndpointConfig;
    requestFeedback: EndpointConfig;
    provideFeedback: EndpointConfig;
    resolveFeedback: EndpointConfig;
    collaborativeEditing: EndpointConfig;
    smartTagging: EndpointConfig;
    annotation: EndpointConfig;
    activityLogging: EndpointConfig;
    intelligentSearch: EndpointConfig;
    createVersion: EndpointConfig;
    revertVersion: EndpointConfig;
    viewHistory: EndpointConfig;
    compareVersions: EndpointConfig;
    grantAccess: EndpointConfig;
    revokeAccess: EndpointConfig;
    managePermissions: EndpointConfig;
    initiateWorkflow: EndpointConfig;
    automateTasks: EndpointConfig;
    triggerEvents: EndpointConfig;
    approvalWorkflow: EndpointConfig;
    lifecycleManagement: EndpointConfig;
    connectExternalSystem: EndpointConfig;
    synchronizeStorage: EndpointConfig;
    importFromExternal: EndpointConfig;
    exportToExternal: EndpointConfig;
    generateReport: EndpointConfig;
    exportReport: EndpointConfig;
    scheduleReport: EndpointConfig;
    customizeReport: EndpointConfig;
    manageSubscriptions: EndpointConfig;
    handleSubscriptions: EndpointConfig;
    notificationSettings: EndpointConfig
    notifyChanges: EndpointConfig
    backup: EndpointConfig;
    retrieveBackup: EndpointConfig;
    redact: EndpointConfig;
    accessControls: EndpointConfig;
    templates: EndpointConfig;
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
  logging: EndpointConfig;
  news: NewsEndpoints;

  notes: NotesEndpoints
  projects: {
    list: EndpointConfig;
    single: (projectId: number) => EndpointConfig;
    
  };

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


  comments: {
    list: { path: "/api/comments/list", method: "GET" },
    single: (commentId: number) => ({ path: `/note/${commentId}`, method: "GET" }),
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

  documents: {
    // List all documents
    list: { path: `${BASE_URL}/api/documents`, method: "GET" },
    // Get a single document by its ID
    single: (documentId: string): EndpointConfig => ({
      path: `${BASE_URL}/api/documents/${documentId}`,
      method: "GET",
    }),
  
    // Add a new document
    add: { path: `${BASE_URL}/api/documents`, method: "POST" },

    // Remove a document by its ID
    remove: (documentId: string): EndpointConfig => ({
      path: `${BASE_URL}/api/documents/${documentId}`,
      method: "DELETE",
    }),
  
    // Update a document by its ID
    update: (documentId: string): EndpointConfig => ({
      path: `${BASE_URL}/api/documents/${documentId}`,
      method: "PUT",
    }),
  
    // Download a document by its ID
    download: (documentId: string): EndpointConfig => ({
      path: `${BASE_URL}/api/documents/downloadDocument/${documentId}`,
      method: "GET",
    }),
   
    // Search for documents
    search: { path: `${BASE_URL}/api/documents/search`, method: "POST" },
    // Filter documents
    filter: { path: `${BASE_URL}/api/documents/filter`, method: "POST" },
    // Upload a document
    upload: { path: `${BASE_URL}/api/documents/upload`, method: "POST" },
    // Share a document
    share: { path: `${BASE_URL}/api/documents/share`, method: "POST" },
    // Lock a document
    lock: { path: `${BASE_URL}/api/documents/lock`, method: "POST" },
    // Unlock a document
    unlock: { path: `${BASE_URL}/api/documents/unlock`, method: "POST" },
    // Archive a document
    archive: { path: `${BASE_URL}/api/documents/archive`, method: "POST" },
    // Restore a document
    restore: { path: `${BASE_URL}/api/documents/restore`, method: "POST" },
    // Move a document
    move: { path: `${BASE_URL}/api/documents/move`, method: "POST" },
    // Copy a document
    copy: { path: `${BASE_URL}/api/documents/copy`, method: "POST" },
    // Rename a document
    rename: { path: `${BASE_URL}/api/documents/rename`, method: "PUT" },
    // Change permissions on a document
    changePermissions: { path: `${BASE_URL}/api/documents/changePermissions`, method: "POST" },
    // Merge documents
    merge: { path: `${BASE_URL}/api/documents/merge`, method: "POST" },
    // Split a document
    split: { path: `${BASE_URL}/api/documents/split`, method: "POST" },
    // Validate a document
    validate: { path: `${BASE_URL}/api/documents/validate`, method: "POST" },
    // Encrypt a document
    encrypt: { path: `${BASE_URL}/api/documents/encrypt`, method: "POST" },
    // Decrypt a document
    decrypt: { path: `${BASE_URL}/api/documents/decrypt`, method: "POST" },
    // Track changes in a document
    trackChanges: { path: `${BASE_URL}/api/documents/trackChanges`, method: "POST" },
    // Compare two documents
    compare: { path: `${BASE_URL}/api/documents/compare`, method: "POST" },
    // Tag a document
    tag: { path: `${BASE_URL}/api/documents/tag`, method: "POST" },
    // Categorize a document
    categorize: { path: `${BASE_URL}/api/documents/categorize`, method: "POST" },
    // Customize the view for a document
    customizeView: { path: `${BASE_URL}/api/documents/customizeView`, method: "POST" },
    // Comment on a document
    comment: { path: `${BASE_URL}/api/documents/comment`, method: "POST" },
    // Mention a user in a document
    mentionUser: { path: `${BASE_URL}/api/documents/mentionUser`, method: "POST" },
    // Assign a task in a document
    assignTask: { path: `${BASE_URL}/api/documents/assignTask`, method: "POST" },
    // Request a review of a document
    requestReview: { path: `${BASE_URL}/api/documents/requestReview`, method: "POST" },
    // Approve a document
    approve: { path: `${BASE_URL}/api/documents/approve`, method: "POST" },
    // Reject a document
    reject: { path: `${BASE_URL}/api/documents/reject`, method: "POST" },
    // Request feedback on a document
    requestFeedback: { path: `${BASE_URL}/api/documents/requestFeedback`, method: "POST" },
    // Provide feedback on a document
    provideFeedback: { path: `${BASE_URL}/api/documents/provideFeedback`, method: "POST" },
    // Resolve feedback on a document
    resolveFeedback: { path: `${BASE_URL}/api/documents/resolveFeedback`, method: "POST" },
    // Collaborative editing of a document
    collaborativeEditing: { path: `${BASE_URL}/api/documents/collaborativeEditing`, method: "POST" },
    // Smart tagging of documents
    smartTagging: { path: `${BASE_URL}/api/documents/smartTagging`, method: "POST" },
    // Annotate a document
    annotation: { path: `${BASE_URL}/api/documents/annotation`, method: "POST" },
    // Log document activity
    activityLogging: { path: `${BASE_URL}/api/documents/activityLogging`, method: "POST" },
    // Intelligent search for documents
    intelligentSearch: { path: `${BASE_URL}/api/documents/intelligentSearch`, method: "POST" },
    // Create a new version of a document
    createVersion: { path: `${BASE_URL}/api/documents/createVersion`, method: "POST" },
    // Revert to a previous version of a document
    revertVersion: { path: `${BASE_URL}/api/documents/revertVersion`, method: "POST" },
    // View the history of a document
    viewHistory: { path: `${BASE_URL}/api/documents/viewHistory`, method: "GET" },
    // Compare versions of a document
    compareVersions: { path: `${BASE_URL}/api/documents/compareVersions`, method: "POST" },
    // Grant access to a document
    grantAccess: { path: `${BASE_URL}/api/documents/grantAccess`, method: "POST" },
    // Revoke access to a document
    revokeAccess: { path: `${BASE_URL}/api/documents/revokeAccess`, method: "POST" },
    // Manage permissions for a document
    managePermissions: { path: `${BASE_URL}/api/documents/managePermissions`, method: "POST" },
    // Initiate a workflow for a document
    initiateWorkflow: { path: `${BASE_URL}/api/documents/initiateWorkflow`, method: "POST" },
    // Automate tasks related to a document
    automateTasks: { path: `${BASE_URL}/api/documents/automateTasks`, method: "POST" },
    // Trigger events related to a document
    triggerEvents: { path: `${BASE_URL}/api/documents/triggerEvents`, method: "POST" },
    // Manage the document approval workflow
    approvalWorkflow: { path: `${BASE_URL}/api/documents/approvalWorkflow`, method: "POST" },
    // Manage the document lifecycle
    lifecycleManagement: { path: `${BASE_URL}/api/documents/lifecycleManagement`, method: "POST" },
    // Connect a document to an external system
    connectExternalSystem: { path: `${BASE_URL}/api/documents/connectExternalSystem`, method: "POST" },
    // Synchronize a document with cloud storage
    synchronizeStorage: { path: `${BASE_URL}/api/documents/synchronizeStorage`, method: "POST" },
    // Import a document from an external source
    importFromExternal: { path: `${BASE_URL}/api/documents/importFromExternal`, method: "POST" },
    // Export a document to an external system
    exportToExternal: { path: `${BASE_URL}/api/documents/exportToExternal`, method: "POST" },
    // Generate a report for a document
    generateReport: { path: `${BASE_URL}/api/documents/generateReport`, method: "POST" },
    // Export a report for a document
    exportReport: { path: `${BASE_URL}/api/documents/exportReport`, method: "POST" },
    // Schedule a report generation for a document
    scheduleReport: { path: `${BASE_URL}/api/documents/scheduleReport`, method: "POST" },
    // Customize the report for a document
    customizeReport: { path: `${BASE_URL}/api/documents/customizeReport`, method: "POST" },
    // Manage subscriptions to document updates
    manageSubscriptions: { path: `${BASE_URL}/api/documents/manageSubscriptions`, method: "POST" },
    // Handle document subscriptions
    handleSubscriptions: { path: `${BASE_URL}/api/documents/handleSubscriptions`, method: "POST" },
    // Notify users of document changes
    notifyChanges: { path: `${BASE_URL}/api/documents/notifyChanges`, method: "POST" },
    // Retrieve notification settings for documents
    notificationSettings: { path: `${BASE_URL}/api/documents/notificationSettings`, method: "POST" },
    // Backup documents
    backup: { path: `${BASE_URL}/api/documents/backup`, method: "POST" },
    // Retrieve a backup
    retrieveBackup: { path: `${BASE_URL}/api/documents/retrieveBackup`, method: "GET" },
    // Redact a document
    redact: { path: `${BASE_URL}/api/documents/redact`, method: "PUT" },
    // Access controls for documents
    accessControls: { path: `${BASE_URL}/api/documents/accessControls`, method: "POST" },
    // Get document templates
    templates: { path: `${BASE_URL}/api/documents/templates`, method: "GET" },

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
  logging: {
    logs: { path: `${BASE_URL}/logging`, method: "POST" },
    logInfo: { path: `${BASE_URL}/logging/info`, method: "POST" },
    logWarning: { path: `${BASE_URL}/logging/warning`, method: "POST" },
    logError: { path: `${BASE_URL}/logging/error`, method: "POST" },
    logSuccess: { path: `${BASE_URL}/logging/success`, method: "POST" },
    logFailure: { path: `${BASE_URL}/logging/failure`, method: "POST" },
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
  notes: {
    list: { path: "/notes", method: "GET" },
    single: (notesId: number) => ({ path: `/note/${notesId}`, method: "GET" }),
   
  },
  projects: {
    list: { path: "/news", method: "GET" },
    single: (projectId: number) => ({ path: `/projects/${projectId}`, method: "GET" }),
   
  },
  
  sorting: {
    sortEvents: { path: "/api/sorting/events", method: "POST" },
    sortMessages: { path: "/api/sorting/messages", method: "POST" },
    snapshots: { path: "/api/sorting/snapshots", method: "POST" },
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

  logging: mergeConfigurations(endpointConfigurations.logging, {
    logInfo: generateEndpointUrl("logging", "logInfo" ),
    logSuccess: generateEndpointUrl("logging", "logSuccess" ),
    logFailure: generateEndpointUrl("logging", "logFailure" ),
  }),// Include logging in the updated endpoints
 
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

  projects: mergeConfigurations(endpointConfigurations.projects, {
    list: generateEndpointUrl("projects", "list"),
    single: (projectId: number) => generateEndpointUrl("projects", `single/${projectId}`),
   
  }),


  comments: mergeConfigurations(endpointConfigurations.comments, {
    list: generateEndpointUrl("comments", "list"),
    single: (commentId: number) => generateEndpointUrl("comments", `single/${commentId}`),
   
  }),


  documents: mergeConfigurations(endpointConfigurations.documents, {
    list: generateEndpointUrl("documents", "list"),
    single: (documentId: string) => generateEndpointUrl("documents", `single/${documentId}`),
    add: generateEndpointUrl("documents", "add"),
    remove: (documentId: string) => generateEndpointUrl("documents", `remove/${documentId}`),
    update: (documentId: string) => generateEndpointUrl("documents", `update/${documentId}`),
    download: (documentId: string) => generateEndpointUrl("documents", `download/${documentId}`),
    search: generateEndpointUrl("documents", "search"),
    filter: generateEndpointUrl("documents", "filter"),
    upload: generateEndpointUrl("documents", "upload"),
    share: generateEndpointUrl("documents", "share"),
    lock: generateEndpointUrl("documents", "lock"),
    unlock: generateEndpointUrl("documents", "unlock"),
    archive: generateEndpointUrl("documents", "archive"),
    restore: generateEndpointUrl("documents", "restore"),
    move: generateEndpointUrl("documents", "move"),
    copy: generateEndpointUrl("documents", "copy"),
    rename: generateEndpointUrl("documents", "rename"),
    changePermissions: generateEndpointUrl("documents", "changePermissions"),
    merge: generateEndpointUrl("documents", "merge"),
    split: generateEndpointUrl("documents", "split"),
    validate: generateEndpointUrl("documents", "validate"),
    encrypt: generateEndpointUrl("documents", "encrypt"),
    decrypt: generateEndpointUrl("documents", "decrypt"),
    trackChanges: generateEndpointUrl("documents", "trackChanges"),
    compare: generateEndpointUrl("documents", "compare"),
    tag: generateEndpointUrl("documents", "tag"),
    categorize: generateEndpointUrl("documents", "categorize"),
    customizeView: generateEndpointUrl("documents", "customizeView"),
    comment: generateEndpointUrl("documents", "comment"),
    mentionUser: generateEndpointUrl("documents", "mentionUser"),
    assignTask: generateEndpointUrl("documents", "assignTask"),
    requestReview: generateEndpointUrl("documents", "requestReview"),
    approve: generateEndpointUrl("documents", "approve"),
    reject: generateEndpointUrl("documents", "reject"),
    requestFeedback: generateEndpointUrl("documents", "requestFeedback"),
    provideFeedback: generateEndpointUrl("documents", "provideFeedback"),
    resolveFeedback: generateEndpointUrl("documents", "resolveFeedback"),
    collaborativeEditing: generateEndpointUrl("documents", "collaborativeEditing"),
    smartTagging: generateEndpointUrl("documents", "smartTagging"),
    annotation: generateEndpointUrl("documents", "annotation"),
    activityLogging: generateEndpointUrl("documents", "activityLogging"),
    intelligentSearch: generateEndpointUrl("documents", "intelligentSearch"),
    createVersion: generateEndpointUrl("documents", "createVersion"),
    revertVersion: generateEndpointUrl("documents", "revertVersion"),
    viewHistory: generateEndpointUrl("documents", "viewHistory"),
    compareVersions: generateEndpointUrl("documents", "compareVersions"),
    grantAccess: generateEndpointUrl("documents", "grantAccess"),
    revokeAccess: generateEndpointUrl("documents", "revokeAccess"),
    managePermissions: generateEndpointUrl("documents", "managePermissions"),
    initiateWorkflow: generateEndpointUrl("documents", "initiateWorkflow"),
    automateTasks: generateEndpointUrl("documents", "automateTasks"),
    triggerEvents: generateEndpointUrl("documents", "triggerEvents"),
    approvalWorkflow: generateEndpointUrl("documents", "approvalWorkflow"),
    lifecycleManagement: generateEndpointUrl("documents", "lifecycleManagement"),
    connectExternalSystem: generateEndpointUrl("documents", "connectExternalSystem"),
    synchronizeStorage: generateEndpointUrl("documents", "synchronizeStorage"),
    importFromExternal: generateEndpointUrl("documents", "importFromExternal"),
    exportToExternal: generateEndpointUrl("documents", "exportToExternal"),
    generateReport: generateEndpointUrl("documents", "generateReport"),
    exportReport: generateEndpointUrl("documents", "exportReport"),
    scheduleReport: generateEndpointUrl("documents", "scheduleReport"),
    customizeReport: generateEndpointUrl("documents", "customizeReport"),
    backup: generateEndpointUrl("documents", "backup"),
    retrieveBackup: generateEndpointUrl("documents", "retrieveBackup"),
    redact: generateEndpointUrl("documents", "redact"),
    accessControls: generateEndpointUrl("documents", "accessControls"),
    templates: generateEndpointUrl("documents", "templates"),
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
export type {EndpointConfig}