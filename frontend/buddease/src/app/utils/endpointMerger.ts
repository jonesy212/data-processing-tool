// endpointMerger.ts
import { EndpointConfigurations } from '@/app/config/EndpointConfig';
import mergeConfigurations from './mergeConfigurations';
import { generateEndpointUrl } from './urlGenerator';

// Import React hooks dependencies (these might need to be handled differently)
// const { handleFilterTasks } = useSearchOptions();
// const { addFilter } = useFiltering(searchOptions);



export const createMergedEndpoints = (endpointConfigurations: EndpointConfigurations) => {
  const updatedEndpoints = {
    apiWebBase: mergeConfigurations(endpointConfigurations.apiWebBase, {
      login: generateEndpointUrl("apiWebBase", "login"),
      logout: generateEndpointUrl("apiWebBase", "logout"),
    }),

    apiConfig: mergeConfigurations(endpointConfigurations.apiConfig, {
      getUserApiConfig: generateEndpointUrl("apiConfig", "getUserApiConfig"),
      updateUserApiConfig: generateEndpointUrl("apiConfig", "updateUserApiConfig"),
      aquaConfig: generateEndpointUrl("apiConfig", "aquaConfig"),
      // Add any other apiConfig endpoints that might be missing
    }),

    analytics: mergeConfigurations(endpointConfigurations.analytics, {
      single: generateEndpointUrl("analytics", "single"),
      list: generateEndpointUrl("analytics", "list"),
      add: generateEndpointUrl("analytics", "add"),
      update: generateEndpointUrl("analytics", "update"),
      remove: generateEndpointUrl("analytics", "remove"),
    }),

    auth: mergeConfigurations(endpointConfigurations.auth, {
      login: generateEndpointUrl("auth", "login"),
      logout: generateEndpointUrl("auth", "logout"),
      refresh: generateEndpointUrl("auth", "refresh"),
      register: generateEndpointUrl("auth", "register"),
    }),

    batch: mergeConfigurations(endpointConfigurations.batch, {
      process: generateEndpointUrl("batch", "process"),
      status: generateEndpointUrl("batch", "status"),
    }),

    blogs: mergeConfigurations(endpointConfigurations.blogs, {
      single: generateEndpointUrl("blogs", "single"),
      list: generateEndpointUrl("blogs", "list"),
      add: generateEndpointUrl("blogs", "add"),
      update: generateEndpointUrl("blogs", "update"),
      remove: generateEndpointUrl("blogs", "remove"),
    }),

    calendar: mergeConfigurations(endpointConfigurations.calendar, {
      events: generateEndpointUrl("calendar", "events"),
      addEvent: generateEndpointUrl("calendar", "addEvent"),
      updateEvent: generateEndpointUrl("calendar", "updateEvent"),
      removeEvent: generateEndpointUrl("calendar", "removeEvent"),
    }),

    categories: mergeConfigurations(endpointConfigurations.categories, {
      createCategory: generateEndpointUrl("categories", "createCategory"),
      updateCategory: generateEndpointUrl("categories", "updateCategory"),
      deleteCategory: generateEndpointUrl("categories", "deleteCategory"),
      listCategories: generateEndpointUrl("categories", "listCategories"),
      getSubcategories: generateEndpointUrl("categories", "getSubcategories"),
      moveCategory: generateEndpointUrl("categories", "moveCategory"),
      updateCategoryOrder: generateEndpointUrl("categories", "updateCategoryOrder"),
      getCategoryContent: generateEndpointUrl("categories", "getCategoryContent"),
      addContentToCategory: generateEndpointUrl("categories", "addContentToCategory"),
      removeContentFromCategory: generateEndpointUrl("categories", "removeContentFromCategory"),
      bulkUpdateCategories: generateEndpointUrl("categories", "bulkUpdateCategories"),
      bulkDeleteCategories: generateEndpointUrl("categories", "bulkDeleteCategories"),
      searchCategories: generateEndpointUrl("categories", "searchCategories"),
      filterCategories: generateEndpointUrl("categories", "filterCategories"),
      getCategoryStats: generateEndpointUrl("categories", "getCategoryStats"),
      getCategoryUsage: generateEndpointUrl("categories", "getCategoryUsage"),
    }),
    
    chat: mergeConfigurations(endpointConfigurations.chat, {
      sendMessage: generateEndpointUrl("chat", "sendMessage"),
      fetchMessages: generateEndpointUrl("chat", "fetchMessages"),
      deleteMessage: generateEndpointUrl("chat", "deleteMessage"),
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

    collaborationTools: mergeConfigurations(endpointConfigurations.collaborationTools, {
      createWorkspace: generateEndpointUrl("collaborationTools", "createWorkspace"),
      updateWorkspace: generateEndpointUrl("collaborationTools", "updateWorkspace"),
      deleteWorkspace: generateEndpointUrl("collaborationTools", "deleteWorkspace"),
      listWorkspaces: generateEndpointUrl("collaborationTools", "listWorkspaces"),
    }),

    comments: mergeConfigurations(endpointConfigurations.comments, {
      list: generateEndpointUrl("comments", "list"),
      single: (commentId: number) => generateEndpointUrl("comments", "single"),
    }),

    communication: mergeConfigurations(endpointConfigurations.communication, {
      send: generateEndpointUrl("communication", "send"),
      receive: generateEndpointUrl("communication", "receive"),
      history: generateEndpointUrl("communication", "history"),
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

    communityInteraction: mergeConfigurations(endpointConfigurations.communityInteraction, {
      post: generateEndpointUrl("communityInteraction", "post"),
      comment: generateEndpointUrl("communityInteraction", "comment"),
      like: generateEndpointUrl("communityInteraction", "like"),
      list: generateEndpointUrl("communityInteraction", "list"),
    }),

    crypto: mergeConfigurations(endpointConfigurations.crypto, {
      getRates: generateEndpointUrl("crypto", "getRates"),
      trade: generateEndpointUrl("crypto", "trade"),
      history: generateEndpointUrl("crypto", "history"),
    }),

    dataAnalysis: mergeConfigurations(endpointConfigurations.dataAnalysis, {
      run: generateEndpointUrl("dataAnalysis", "run"),
      report: generateEndpointUrl("dataAnalysis", "report"),
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

    dataProviders: mergeConfigurations(endpointConfigurations.dataProviders, {
      fetch: generateEndpointUrl("dataProviders", "fetch"),
      update: generateEndpointUrl("dataProviders", "update"),
    }),

    database: mergeConfigurations(endpointConfigurations.database, {
      query: generateEndpointUrl("database", "query"),
      insert: generateEndpointUrl("database", "insert"),
      update: generateEndpointUrl("database", "update"),
      delete: generateEndpointUrl("database", "delete"),
    }),

    details: mergeConfigurations(endpointConfigurations.details, {
      get: generateEndpointUrl("details", "get"),
      update: generateEndpointUrl("details", "update"),
    }),

    dev: mergeConfigurations(endpointConfigurations.dev, {
      test: generateEndpointUrl("dev", "test"),
      build: generateEndpointUrl("dev", "build"),
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


    donations: mergeConfigurations(endpointConfigurations.donations, {
      create: generateEndpointUrl("donations", "create"),
      list: generateEndpointUrl("donations", "list"),
      update: generateEndpointUrl("donations", "update"),
      remove: generateEndpointUrl("donations", "remove"),
    }),

    drawing: mergeConfigurations(endpointConfigurations.drawing, {
      create: generateEndpointUrl("drawing", "create"),
      update: generateEndpointUrl("drawing", "update"),
      delete: generateEndpointUrl("drawing", "delete"),
      list: generateEndpointUrl("drawing", "list"),
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

    externalAuth: mergeConfigurations(endpointConfigurations.externalAuth, {
      login: generateEndpointUrl("externalAuth", "login"),
      logout: generateEndpointUrl("externalAuth", "logout"),
      register: generateEndpointUrl("externalAuth", "register"),
    }),

    feedback: mergeConfigurations(endpointConfigurations.feedback, {
      submit: generateEndpointUrl("feedback", "submit"),
      list: generateEndpointUrl("feedback", "list"),
    }),

    files: mergeConfigurations(endpointConfigurations.files, {
      upload: generateEndpointUrl("files", "upload"),
      download: generateEndpointUrl("files", "download"),
      delete: generateEndpointUrl("files", "delete"),
    }),

    filtering: mergeConfigurations(endpointConfigurations.filtering, {
      filterTasks: generateEndpointUrl("filtering", "filterTasks"),
    }),

    freelancers: mergeConfigurations(endpointConfigurations.freelancers, {
      list: generateEndpointUrl("freelancers", "list"),
      hire: generateEndpointUrl("freelancers", "hire"),
      rate: generateEndpointUrl("freelancers", "rate"),
    }),


    generators: mergeConfigurations(endpointConfigurations.generators, {
      generate: generateEndpointUrl("generators", "generate"),
      status: generateEndpointUrl("generators", "status"),
    }),

    globalCollaboration: mergeConfigurations(endpointConfigurations.globalCollaboration, {
      sync: generateEndpointUrl("globalCollaboration", "sync"),
      status: generateEndpointUrl("globalCollaboration", "status"),
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

    logs: mergeConfigurations(endpointConfigurations.logs, {
      create: generateEndpointUrl("logs", "create"),
      list: generateEndpointUrl("logs", "list"),
    }),

    marker: mergeConfigurations(endpointConfigurations.marker, {
      add: generateEndpointUrl("marker", "add"),
      remove: generateEndpointUrl("marker", "remove"),
    }),

    moderators: mergeConfigurations(endpointConfigurations.moderators, {
      list: generateEndpointUrl("moderators", "list"),
      ban: generateEndpointUrl("moderators", "ban"),
      unban: generateEndpointUrl("moderators", "unban"),
    }),

    monetization: mergeConfigurations(endpointConfigurations.monetization, {
      enable: generateEndpointUrl("monetization", "enable"),
      disable: generateEndpointUrl("monetization", "disable"),
      report: generateEndpointUrl("monetization", "report"),
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

    notes: mergeConfigurations(endpointConfigurations.notes, {
      // Core CRUD operations
      list: generateEndpointUrl("notes", "list"),
      single: (noteId: number) => generateEndpointUrl("notes", "single"),
      create: generateEndpointUrl("notes", "create"),
      update: (noteId: number) => generateEndpointUrl("notes", "update"),
      delete: (noteId: number) => generateEndpointUrl("notes", "delete"),
      
      // State management
      archive: (noteId: number) => generateEndpointUrl("notes", "archive"),
      restore: (noteId: number) => generateEndpointUrl("notes", "restore"),
      move: (noteId: number) => generateEndpointUrl("notes", "move"),
      pin: (noteId: number) => generateEndpointUrl("notes", "pin"),
      unpin: (noteId: number) => generateEndpointUrl("notes", "unpin"),
      duplicate: (noteId: number) => generateEndpointUrl("notes", "duplicate"),
      
      // Content operations
      merge: generateEndpointUrl("notes", "merge"),
      split: (noteId: number) => generateEndpointUrl("notes", "split"),
      
      // Search and filter
      search: generateEndpointUrl("notes", "search"),
      filter: generateEndpointUrl("notes", "filter"),
      
      // Bulk operations
      bulkUpdate: generateEndpointUrl("notes", "bulkUpdate"),
      bulkDelete: generateEndpointUrl("notes", "bulkDelete"),
      
      // Import/Export
      export: generateEndpointUrl("notes", "export"),
      import: generateEndpointUrl("notes", "import"),
      
      // Tag management
      tags: (noteId: number) => generateEndpointUrl("notes", "tags"),
      addTag: (noteId: number) => generateEndpointUrl("notes", "addTag"),
      removeTag: (noteId: number, tagId: number) => generateEndpointUrl("notes", "removeTag"),
      
      // Attachment management
      attachments: (noteId: number) => generateEndpointUrl("notes", "attachments"),
      addAttachment: (noteId: number) => generateEndpointUrl("notes", "addAttachment"),
      removeAttachment: (noteId: number, attachmentId: number) => generateEndpointUrl("notes", "removeAttachment"),
      
      // Version management
      versions: (noteId: number) => generateEndpointUrl("notes", "versions"),
      restoreVersion: (noteId: number, versionId: number) => generateEndpointUrl("notes", "restoreVersion"),
      
      // Collaboration
      share: (noteId: number) => generateEndpointUrl("notes", "share"),
      unshare: (noteId: number) => generateEndpointUrl("notes", "unshare"),
      collaborators: (noteId: number) => generateEndpointUrl("notes", "collaborators"),
      addCollaborator: (noteId: number) => generateEndpointUrl("notes", "addCollaborator"),
      removeCollaborator: (noteId: number, collaboratorId: number) => generateEndpointUrl("notes", "removeCollaborator"),
      
      // Comments
      comments: (noteId: number) => generateEndpointUrl("notes", "comments"),
      addComment: (noteId: number) => generateEndpointUrl("notes", "addComment"),
      updateComment: (noteId: number, commentId: number) => generateEndpointUrl("notes", "updateComment"),
      deleteComment: (noteId: number, commentId: number) => generateEndpointUrl("notes", "deleteComment"),
      
      // Analytics
      analytics: (noteId: number) => generateEndpointUrl("notes", "analytics"),
      
      // Templates
      templates: generateEndpointUrl("notes", "templates"),
      createFromTemplate: (templateId: number) => generateEndpointUrl("notes", "createFromTemplate"),
    }),

    parameterCustomization: mergeConfigurations(endpointConfigurations.parameterCustomization, {
      set: generateEndpointUrl("parameterCustomization", "set"),
      get: generateEndpointUrl("parameterCustomization", "get"),
    }),

    participants: mergeConfigurations(endpointConfigurations.participants, {
      add: generateEndpointUrl("participants", "add"),
      remove: generateEndpointUrl("participants", "remove"),
      list: generateEndpointUrl("participants", "list"),
    }),

    payment: mergeConfigurations(endpointConfigurations.payment, {
      create: generateEndpointUrl("payment", "create"),
      refund: generateEndpointUrl("payment", "refund"),
      status: generateEndpointUrl("payment", "status"),
    }),

    personas: mergeConfigurations(endpointConfigurations.personas, {
      create: generateEndpointUrl("personas", "create"),
      update: generateEndpointUrl("personas", "update"),
      delete: generateEndpointUrl("personas", "delete"),
      list: generateEndpointUrl("personas", "list"),
    }),

    phases: mergeConfigurations(endpointConfigurations.phases, {
      add: generateEndpointUrl("phases", "add"),
      update: generateEndpointUrl("phases", "update"),
      remove: generateEndpointUrl("phases", "remove"),
      list: generateEndpointUrl("phases", "list"),
    }),

    projects: mergeConfigurations(endpointConfigurations.projects, {
      list: generateEndpointUrl("projects", "list"),
      single: (projectId: number) => generateEndpointUrl("projects", "single"),
    }),


    projectManagement: mergeConfigurations(endpointConfigurations.projectManagement, {
      create: generateEndpointUrl("projectManagement", "create"),
      update: generateEndpointUrl("projectManagement", "update"),
      delete: generateEndpointUrl("projectManagement", "delete"),
      list: generateEndpointUrl("projectManagement", "list"),
    }),

    projectOwner: mergeConfigurations(endpointConfigurations.projectOwner, {
      get: generateEndpointUrl("projectOwner", "get"),
      update: generateEndpointUrl("projectOwner", "update"),
    }),

    sorting: mergeConfigurations(endpointConfigurations.sorting, {
      sortEvents: generateEndpointUrl("sorting", "sortEvents"),
      sortMessages: generateEndpointUrl("sorting", "sortMessages"),
      snapshots: generateEndpointUrl("sorting", "snapshots"),
    }),

    randomWalk: mergeConfigurations(endpointConfigurations.randomWalk, {
      start: generateEndpointUrl("randomWalk", "start"),
      status: generateEndpointUrl("randomWalk", "status"),
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

    registration: mergeConfigurations(endpointConfigurations.registration, {
      register: generateEndpointUrl("registration", "register"),
      confirm: generateEndpointUrl("registration", "confirm"),
    }),

    reports: mergeConfigurations(endpointConfigurations.reports, {
      generate: generateEndpointUrl("reports", "generate"),
      list: generateEndpointUrl("reports", "list"),
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

    security: mergeConfigurations(endpointConfigurations.security, {
      check: generateEndpointUrl("security", "check"),
      update: generateEndpointUrl("security", "update"),
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

    stateGovCities: mergeConfigurations(endpointConfigurations.stateGovCities, {
      list: generateEndpointUrl("stateGovCities", "list"),
      get: generateEndpointUrl("stateGovCities", "get"),
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

    teamManagement: mergeConfigurations(endpointConfigurations.teamManagement, {
      create: generateEndpointUrl("teamManagement", "create"),
      update: generateEndpointUrl("teamManagement", "update"),
      delete: generateEndpointUrl("teamManagement", "delete"),
      list: generateEndpointUrl("teamManagement", "list"),
    }),

    theme: mergeConfigurations(endpointConfigurations.theme, {
      get: generateEndpointUrl("theme", "get"),
      set: generateEndpointUrl("theme", "set"),
    }),

    toolbar: mergeConfigurations(endpointConfigurations.toolbar, {
      addButton: generateEndpointUrl("toolbar", "addButton"),
      removeButton: generateEndpointUrl("toolbar", "removeButton"),
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

    trading: mergeConfigurations(endpointConfigurations.trading, {
      buy: generateEndpointUrl("trading", "buy"),
      sell: generateEndpointUrl("trading", "sell"),
      history: generateEndpointUrl("trading", "history"),
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

    uiSettings: mergeConfigurations(endpointConfigurations.uiSettings, {
      // Interface & Layout
      fetchInterfaceContent: generateEndpointUrl("uiSettings", "fetchInterfaceContent"),
      updateInterfaceSettings: generateEndpointUrl("uiSettings", "updateInterfaceSettings"),
      fetchUserDashboard: generateEndpointUrl("uiSettings", "fetchUserDashboard"),
      updateUserDashboardLayout: generateEndpointUrl("uiSettings", "updateUserDashboardLayout"),
      
      // Widgets
      fetchUserWidgets: generateEndpointUrl("uiSettings", "fetchUserWidgets"),
      customizeUserWidget: generateEndpointUrl("uiSettings", "customizeUserWidget"),
      
      // Themes
      fetchUserThemes: generateEndpointUrl("uiSettings", "fetchUserThemes"),
      switchUserTheme: generateEndpointUrl("uiSettings", "switchUserTheme"),
      
      // Preferences
      fetchUserPreferences: generateEndpointUrl("uiSettings", "fetchUserPreferences"),
      updateUserPreferences: generateEndpointUrl("uiSettings", "updateUserPreferences"),
      
      // Notifications
      fetchUserNotifications: generateEndpointUrl("uiSettings", "fetchUserNotifications"),
      markNotificationAsRead: generateEndpointUrl("uiSettings", "markNotificationAsRead"),
      clearAllNotifications: generateEndpointUrl("uiSettings", "clearAllNotifications"),
      
      // Messaging
      fetchUserMessages: generateEndpointUrl("uiSettings", "fetchUserMessages"),
      sendMessageToUser: generateEndpointUrl("uiSettings", "sendMessageToUser"),
      
      // Display
      toggleDarkMode: generateEndpointUrl("uiSettings", "toggleDarkMode"),
      
      // Avatar
      fetchUserAvatar: generateEndpointUrl("uiSettings", "fetchUserAvatar"),
      updateUserAvatar: generateEndpointUrl("uiSettings", "updateUserAvatar"),
      
      // User Settings
      fetchUserSettings: generateEndpointUrl("uiSettings", "fetchUserSettings"),
      updateUserSettings: generateEndpointUrl("uiSettings", "updateUserSettings"),
      
      // User Preferences & Settings
      getUserPreferences: generateEndpointUrl("uiSettings", "getUserPreferences"),
      resetUserPreferences: generateEndpointUrl("uiSettings", "resetUserPreferences"),
      
      // Theme & Appearance
      getThemeSettings: generateEndpointUrl("uiSettings", "getThemeSettings"),
      updateThemeSettings: generateEndpointUrl("uiSettings", "updateThemeSettings"),
      resetThemeSettings: generateEndpointUrl("uiSettings", "resetThemeSettings"),
      
      // Layout & Display
      getLayoutSettings: generateEndpointUrl("uiSettings", "getLayoutSettings"),
      updateLayoutSettings: generateEndpointUrl("uiSettings", "updateLayoutSettings"),
      saveLayoutPreset: generateEndpointUrl("uiSettings", "saveLayoutPreset"),
      deleteLayoutPreset: generateEndpointUrl("uiSettings", "deleteLayoutPreset"),
      
      // Notifications
      getNotificationSettings: generateEndpointUrl("uiSettings", "getNotificationSettings"),
      updateNotificationSettings: generateEndpointUrl("uiSettings", "updateNotificationSettings"),
      muteNotifications: generateEndpointUrl("uiSettings", "muteNotifications"),
      unmuteNotifications: generateEndpointUrl("uiSettings", "unmuteNotifications"),
      
      // Accessibility
      getAccessibilitySettings: generateEndpointUrl("uiSettings", "getAccessibilitySettings"),
      updateAccessibilitySettings: generateEndpointUrl("uiSettings", "updateAccessibilitySettings"),
      toggleHighContrast: generateEndpointUrl("uiSettings", "toggleHighContrast"),
      toggleScreenReader: generateEndpointUrl("uiSettings", "toggleScreenReader"),
      
      // Performance
      getPerformanceSettings: generateEndpointUrl("uiSettings", "getPerformanceSettings"),
      updatePerformanceSettings: generateEndpointUrl("uiSettings", "updatePerformanceSettings"),
      setDataSaverMode: generateEndpointUrl("uiSettings", "setDataSaverMode"),
      setHighPerformanceMode: generateEndpointUrl("uiSettings", "setHighPerformanceMode"),
      
      // Privacy
      getPrivacySettings: generateEndpointUrl("uiSettings", "getPrivacySettings"),
      updatePrivacySettings: generateEndpointUrl("uiSettings", "updatePrivacySettings"),
      updateDataCollection: generateEndpointUrl("uiSettings", "updateDataCollection"),
      exportUserData: generateEndpointUrl("uiSettings", "exportUserData"),
      
      // Language & Region
      getLanguageSettings: generateEndpointUrl("uiSettings", "getLanguageSettings"),
      updateLanguageSettings: generateEndpointUrl("uiSettings", "updateLanguageSettings"),
      getRegionSettings: generateEndpointUrl("uiSettings", "getRegionSettings"),
      updateRegionSettings: generateEndpointUrl("uiSettings", "updateRegionSettings"),
      
      // Shortcuts & Hotkeys
      getShortcutSettings: generateEndpointUrl("uiSettings", "getShortcutSettings"),
      updateShortcutSettings: generateEndpointUrl("uiSettings", "updateShortcutSettings"),
      resetShortcuts: generateEndpointUrl("uiSettings", "resetShortcuts"),
      importShortcuts: generateEndpointUrl("uiSettings", "importShortcuts"),
      exportShortcuts: generateEndpointUrl("uiSettings", "exportShortcuts"),
      
      // Widgets & Components
      getWidgetSettings: generateEndpointUrl("uiSettings", "getWidgetSettings"),
      updateWidgetSettings: generateEndpointUrl("uiSettings", "updateWidgetSettings"),
      toggleWidget: generateEndpointUrl("uiSettings", "toggleWidget"),
      reorderWidgets: generateEndpointUrl("uiSettings", "reorderWidgets"),
      
      // Dashboard
      getDashboardSettings: generateEndpointUrl("uiSettings", "getDashboardSettings"),
      updateDashboardSettings: generateEndpointUrl("uiSettings", "updateDashboardSettings"),
      createDashboardPreset: generateEndpointUrl("uiSettings", "createDashboardPreset"),
      deleteDashboardPreset: generateEndpointUrl("uiSettings", "deleteDashboardPreset"),
      
      // Export/Import
      exportAllSettings: generateEndpointUrl("uiSettings", "exportAllSettings"),
      importSettings: generateEndpointUrl("uiSettings", "importSettings"),
      resetAllSettings: generateEndpointUrl("uiSettings", "resetAllSettings"),
      
      // Sync
      getSyncSettings: generateEndpointUrl("uiSettings", "getSyncSettings"),
      updateSyncSettings: generateEndpointUrl("uiSettings", "updateSyncSettings"),
      forceSync: generateEndpointUrl("uiSettings", "forceSync"),
      pauseSync: generateEndpointUrl("uiSettings", "pauseSync")
    }),

    userManagement: mergeConfigurations(endpointConfigurations.userManagement, {
      create: generateEndpointUrl("userManagement", "create"),
      update: generateEndpointUrl("userManagement", "update"),
      delete: generateEndpointUrl("userManagement", "delete"),
      list: generateEndpointUrl("userManagement", "list"),
    }),

    userRoles: mergeConfigurations(endpointConfigurations.userRoles, {
      assign: generateEndpointUrl("userRoles", "assign"),
      revoke: generateEndpointUrl("userRoles", "revoke"),
    }),

    userRolesNFT: mergeConfigurations(endpointConfigurations.userRolesNFT, {
      assign: generateEndpointUrl("userRolesNFT", "assign"),
      revoke: generateEndpointUrl("userRolesNFT", "revoke"),
    }),

    userSettings: mergeConfigurations(endpointConfigurations.userSettings, {
      get: generateEndpointUrl("userSettings", "get"),
      update: generateEndpointUrl("userSettings", "update"),
    }),

    version: mergeConfigurations(endpointConfigurations.version, {
      getVersion: generateEndpointUrl("version", "getVersion"),
      updateVersion: generateEndpointUrl("version", "updateVersion"),
      deleteVersion: generateEndpointUrl("version", "deleteVersion"),
      backend: generateEndpointUrl("version", "backend"),
      frontend: generateEndpointUrl("version", "frontend"),
    }),

    videos: mergeConfigurations(endpointConfigurations.videos, {
      list: generateEndpointUrl("videos", "list"),
      uploadVideo: generateEndpointUrl("videos", "uploadVideo"),
      single: generateEndpointUrl("videos", "single"),
      add: generateEndpointUrl("videos", "add"),
      remove: generateEndpointUrl("videos", "remove"),
      update: generateEndpointUrl("videos", "update"),

      // Conference endpoints
      conferenceCreate: generateEndpointUrl("videos", "conference.create"),
      conferenceJoin: generateEndpointUrl("videos", "conference.join"),
      conferenceEnd: generateEndpointUrl("videos", "conference.end"),

      // Messaging endpoints
      messagesSend: generateEndpointUrl("videos", "messages.send"),
      messagesRetrieve: generateEndpointUrl("videos", "messages.retrieve"),

      // Annotation endpoints
      annotationsAdd: generateEndpointUrl("videos", "annotations.add"),
      annotationsRetrieve: generateEndpointUrl("videos", "annotations.retrieve"),

      // Playback endpoints
      playbackSpeed: generateEndpointUrl("videos", "playback.speed"),
      playbackFrame: generateEndpointUrl("videos", "playback.frame"),

      // Analytics
      analytics: generateEndpointUrl("videos", "analytics"),

      // Live streaming
      liveStart: generateEndpointUrl("videos", "live.start"),
      liveEnd: generateEndpointUrl("videos", "live.end"),
      liveStatus: generateEndpointUrl("videos", "live.status"),

      // Editing & Transcription
      edit: generateEndpointUrl("videos", "edit"),
      transcribe: generateEndpointUrl("videos", "transcribe"),

      // Collaboration
      collaborationCreate: generateEndpointUrl("videos", "collaboration.create"),
      collaborationInvite: generateEndpointUrl("videos", "collaboration.invite"),
      collaborationJoin: generateEndpointUrl("videos", "collaboration.join"),

      // Management & Tags
      manage: generateEndpointUrl("videos", "manage"),
      updateVideoTags: generateEndpointUrl("videos", "updateVideoTags"),
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