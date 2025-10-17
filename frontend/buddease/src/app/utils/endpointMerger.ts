// endpointMerger.ts
import { EndpointConfigurations } from '@/config/EndpointConfig';
import mergeConfigurations from './mergeConfigurations';
import { generateEndpointUrl } from './urlGenerator';

// Import React hooks dependencies (these might need to be handled differently)
// const { handleFilterTasks } = useSearchOptions();
// const { addFilter } = useFiltering(searchOptions);

/**
 * Creates dynamically merged endpoints with generated URLs
 */




#TODO
// The following are declared in EndpointConfigurations but missing in merged definitions:

// analytics

// auth

// batch

// blogs

// calendar

// chat

// collaborationTools

// communication

// communityInteraction

// crypto

// dataProviders

// database

// details

// dev

// donations

// drawing

// externalAuth

// feedback

// files

// freelancers

// generators

// globalCollaboration

// marker

// moderators

// monetization

// parameterCustomization

// participants

// payment

// personas

// phases

// projectManagement

// projectOwner

// randomWalk

// registration

// reports

// security

// stateGovCities

// teamManagement

// theme

// toolbar

// trading

// userManagement

// userRoles

// userRolesNFT

// userSettings

// videos

// dataAnalysis

// logs

// uiSettings

// That’s 49 missing endpoint groups (based on your definition list).


export const createMergedEndpoints = (endpointConfigurations: EndpointConfigurations) => {
  const updatedEndpoints = {
    apiWebBase: mergeConfigurations(endpointConfigurations.apiWebBase, {
      login: generateEndpointUrl("apiWebBase", "login"),
      logout: generateEndpointUrl("apiWebBase", "logout"),
    }),

    client: mergeConfigurations(endpointConfigurations.client, {
      fetchClientDetails: (clientId: number) => generateEndpointUrl("client", "fetchClientDetails", { clientId }),
      updateClientDetails: (clientId: number) => generateEndpointUrl("client", "updateClientDetails", { clientId }),
      connectWithTenant: (tenantId: number) => generateEndpointUrl("client", "connectWithTenant", { tenantId }),
      sendMessageToTenant: (tenantId: number) => generateEndpointUrl("client", "sendMessageToTenant", { tenantId }),
      listConnectedTenants: generateEndpointUrl("client", "listConnectedTenants"),
      listMessages: generateEndpointUrl("client", "listMessages"),
      createTask: generateEndpointUrl("client", "createTask"),
      listTasks: generateEndpointUrl("client", "listTasks"),
      submitProjectProposal: generateEndpointUrl("client", "submitProjectProposal"),
      participateInCommunityChallenges: generateEndpointUrl("client", "participateInCommunityChallenges"),
      listRewards: generateEndpointUrl("client", "listRewards"),
      listFiles: generateEndpointUrl("client", "listFiles"),
      fetchFiles: generateEndpointUrl("client", "fetchFiles"),
      uploadFile: generateEndpointUrl("client", "uploadFile"),
      batchRemoveFiles: generateEndpointUrl("client", "batchRemoveFiles"),
      markFileAsComplete: generateEndpointUrl("client", "markFileAsComplete"),
      startCollaborativeEdit: generateEndpointUrl("client", "startCollaborativeEdit"),
      createFileVersion: generateEndpointUrl("client", "createFileVersion"),
      fetchFileVersions: generateEndpointUrl("client", "fetchFileVersions"),
      shareFile: generateEndpointUrl("client", "shareFile"),
      requestAccessToFile: generateEndpointUrl("client", "requestAccessToFile"),
      receiveFileUpdate: generateEndpointUrl("client", "receiveFileUpdate"),
      exportFile: generateEndpointUrl("client", "exportFile"),
      archiveFile: generateEndpointUrl("client", "archiveFile"),
      determineFileType: generateEndpointUrl("client", "determineFileType"),
      importFile: generateEndpointUrl("client", "importFile"),
    }),

    comments: mergeConfigurations(endpointConfigurations.comments, {
      list: generateEndpointUrl("comments", "list"),
      single: (commentId: number) => generateEndpointUrl("comments", "single"),
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


    sorting: mergeConfigurations(endpointConfigurations.sorting, {
      sortEvents: generateEndpointUrl("sorting", "sortEvents"),
      sortMessages: generateEndpointUrl("sorting", "sortMessages"),
      snapshots: generateEndpointUrl("sorting", "snapshots"),
    }),

    realtime: mergeConfigurations(endpointConfigurations.realtime, {
      list: generateEndpointUrl("realtime", "list"),
      single: (realtimeId: number) => generateEndpointUrl("realtime", `single/${realtimeId}`),
      add: generateEndpointUrl("realtime", "add"),
      remove: (realtimeId: number) => generateEndpointUrl("realtime", `remove/${realtimeId}`),
      update: (realtimeId: number) => generateEndpointUrl("realtime", `update/${realtimeId}`),
      updateList: generateEndpointUrl("realtime", "updateList"),
      search: generateEndpointUrl("realtime", "search"),
      updateRole: (realtimeId: number) => generateEndpointUrl("realtime", `updateRole/${realtimeId}`),
      updateRoles: generateEndpointUrl("realtime", "updateRoles"),
      fetch: generateEndpointUrl("realtime", "fetch"),
      create: generateEndpointUrl("realtime", "create"),
      delete: (realtimeId: number) => generateEndpointUrl("realtime", `delete/${realtimeId}`),
      fetchById: (realtimeId: number) => generateEndpointUrl("realtime", `fetchById/${realtimeId}`),
      connect: generateEndpointUrl("realtime", "connect"),
      disconnect: generateEndpointUrl("realtime", "disconnect"),
      sendMessage: generateEndpointUrl("realtime", "sendMessage"),
      fetchMessages: generateEndpointUrl("realtime", "fetchMessages"),
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
  
    teams: mergeConfigurations(endpointConfigurations.teams, {
      list: generateEndpointUrl("teams", "list"),
      single: (teamId: number) =>
        generateEndpointUrl("teams", "single", teamId),
      add: generateEndpointUrl("teams", "add"),
      fetchTeamData: (teamId: number) =>
        generateEndpointUrl("teams", "fetchTeamData", teamId),
      remove: (teamId: number) =>
        generateEndpointUrl("teams", "remove", teamId),
      update: (teamId: number) =>
        generateEndpointUrl("teams", "update", teamId),
      updateTeams: (teamIds: number[]) =>
        generateEndpointUrl("teams", "updateTeams", teamIds),
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
  
    ui: mergeConfigurations(endpointConfigurations.ui, {
      userData: (userId: string) => generateEndpointUrl("ui", "userData", { userId }),
      userSettings: (userId: string) => generateEndpointUrl("ui", "userSettings", { userId }),
      updateUserSettings: (userId: string) => generateEndpointUrl("ui", "updateUserSettings", { userId }),
      userDashboard: (userId: string) => generateEndpointUrl("ui", "userDashboard", { userId }),
      updateDashboardLayout: (userId: string) => generateEndpointUrl("ui", "updateDashboardLayout", { userId }),
      userWidgets: (userId: string) => generateEndpointUrl("ui", "userWidgets", { userId }),
      customizeWidget: (userId: string, widgetId: string) => generateEndpointUrl("ui", "customizeWidget", { userId, widgetId }),
      userThemes: generateEndpointUrl("ui", "userThemes"),
      switchTheme: (userId: string) => generateEndpointUrl("ui", "switchTheme", { userId }),
      userPreferences: (userId: string) => generateEndpointUrl("ui", "userPreferences", { userId }),
      updateUserPreferences: (userId: string) => generateEndpointUrl("ui", "updateUserPreferences", { userId }),
      userNotifications: (userId: string) => generateEndpointUrl("ui", "userNotifications", { userId }),
      markNotificationRead: (userId: string, notificationId: string) => generateEndpointUrl("ui", "markNotificationRead", { userId, notificationId }),
      clearAllNotifications: (userId: string) => generateEndpointUrl("ui", "clearAllNotifications", { userId }),
      userMessages: (userId: string) => generateEndpointUrl("ui", "userMessages", { userId }),
      sendMessage: (userId: string) => generateEndpointUrl("ui", "sendMessage", { userId }),
      toggleDarkMode: (userId: string) => generateEndpointUrl("ui", "toggleDarkMode", { userId }),
      userAvatar: (userId: string) => generateEndpointUrl("ui", "userAvatar", { userId }),
      updateUserAvatar: (userId: string) => generateEndpointUrl("ui", "updateUserAvatar", { userId }),
      branding: generateEndpointUrl("ui", "branding"),
      interfaceContent: generateEndpointUrl("ui", "interfaceContent"),
      updateInterfaceSettings: generateEndpointUrl("ui", "updateInterfaceSettings"),
      fetchComponents: generateEndpointUrl("ui", "fetchComponents"),
      updateComponentState: (componentId: string) => generateEndpointUrl("ui", "updateComponentState", { componentId }),
      saveLayout: (userId: string) => generateEndpointUrl("ui", "saveLayout", { userId }),
      loadLayout: (userId: string) => generateEndpointUrl("ui", "loadLayout", { userId }),
      resetLayout: (userId: string) => generateEndpointUrl("ui", "resetLayout", { userId }),
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
    // Add remaining categories here...
  };

  return updatedEndpoints;
};