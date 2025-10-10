// endpointMerger.ts
import { EndpointConfigurations } from '../types/EndpointConfigurations';
import { generateEndpointUrl } from './urlGenerator';
import mergeConfigurations from './mergeConfigurations';

// Import React hooks dependencies (these might need to be handled differently)
// const { handleFilterTasks } = useSearchOptions();
// const { addFilter } = useFiltering(searchOptions);

/**
 * Creates dynamically merged endpoints with generated URLs
 */
export const createMergedEndpoints = (endpointConfigurations: EndpointConfigurations) => {
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
    manageSubscriptions: generateEndpointUrl("documents", "manageSubscriptions"),
    handleSubscriptions: generateEndpointUrl("documents", "handleSubscriptions"),
    notificationSettings: generateEndpointUrl("documents", "notificationSettings"),
    notifyChanges: generateEndpointUrl("documents", "notifyChanges"),
    backup: generateEndpointUrl("documents", "backup"),
    retrieveBackup: generateEndpointUrl("documents", "retrieveBackup"),
    redact: generateEndpointUrl("documents", "redact"),
    accessControls: generateEndpointUrl("documents", "accessControls"),
    templates: generateEndpointUrl("documents", "templates"),
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
      logInfo: generateEndpointUrl("logging", "logInfo"),
      logSuccess: generateEndpointUrl("logging", "logSuccess"),
      logFailure: generateEndpointUrl("logging", "logFailure"),
    }),

    news: mergeConfigurations(endpointConfigurations.news, {
      list: generateEndpointUrl("news", "list"),
      single: (newsId: number) => generateEndpointUrl("news", "single"),
      add: generateEndpointUrl("news", "add"),
      update: (newsId: number) => generateEndpointUrl("news", "update"),
      remove: (newsId: number) => generateEndpointUrl("news", "remove"),
      search: generateEndpointUrl("news", "search"),
      publish: (newsId: number) => generateEndpointUrl("news", "publish"),
      unpublish: (newsId: number) => generateEndpointUrl("news", "unpublish"),
    }),

    projects: mergeConfigurations(endpointConfigurations.projects, {
      list: generateEndpointUrl("projects", "list"),
      single: (projectId: number) => generateEndpointUrl("projects", "single"),
    }),

    comments: mergeConfigurations(endpointConfigurations.comments, {
      list: generateEndpointUrl("comments", "list"),
      single: (commentId: number) => generateEndpointUrl("comments", "single"),
    }),

    // ... continue with all other categories in the same pattern
    // Note: I've simplified the pattern - you'll need to complete all categories

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

    // Add remaining categories here...
  };

  return updatedEndpoints;
};