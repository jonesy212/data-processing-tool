// apiEndpoints.ts
const BASE_URL = "https://your-api-base-url";

export const endpoints = {
  userRoles: {
    list: `${BASE_URL}/api/user-roles`,
    single: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
    add: `${BASE_URL}/api/user-roles`,
    remove: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
    update: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
    
  },

  collaborationTools: {
    createTask: `${BASE_URL}/api/collaboration/tasks/create`,
    updateTask: (taskId: number) => `${BASE_URL}/api/collaboration/tasks/${taskId}/update`,
    deleteTask: (taskId: number) => `${BASE_URL}/api/collaboration/tasks/${taskId}/delete`,
    getTaskDetails: (taskId: number) => `${BASE_URL}/api/collaboration/tasks/${taskId}`,
    listTasks: `${BASE_URL}/api/collaboration/tasks`,


    //todo impeement
    startBrainstorming: `${BASE_URL}/api/collaboration/start-brainstorming`,
    endBrainstorming: `${BASE_URL}/api/collaboration/end-brainstorming`,
    createWhiteboard: `${BASE_URL}/api/collaboration/create-whiteboard`,
    updateWhiteboard: (whiteboardId: number) => `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/update`,
    deleteWhiteboard: (whiteboardId: number) => `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/delete`,
    getWhiteboardDetails: (whiteboardId: number) => `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}`,
    listWhiteboards: `${BASE_URL}/api/collaboration/whiteboards`,
    shareDocument: `${BASE_URL}/api/collaboration/share-document`,
    commentOnDocument: `${BASE_URL}/api/collaboration/comment-on-document`,
    resolveComment: `${BASE_URL}/api/collaboration/resolve-comment`,
    updateDocument: (documentId: number) => `${BASE_URL}/api/collaboration/documents/${documentId}/update`,
    deleteDocument: (documentId: number) => `${BASE_URL}/api/collaboration/documents/${documentId}/delete`,
    getDocumentDetails: (documentId: number) => `${BASE_URL}/api/collaboration/documents/${documentId}`,
    listDocuments: `${BASE_URL}/api/collaboration/documents`,
    // Add more collaboration endpoints as needed

  },
  tasks: {
    list: `${BASE_URL}/api/tasks`,
    single: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    add: `${BASE_URL}/api/tasks`,
    remove: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    update: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}`,
    completeAll: `${BASE_URL}/api/tasks/complete-all`,
    toggle: (taskId: number) => `${BASE_URL}/api/tasks/${taskId}/toggle`,
    removeMultiple: `${BASE_URL}/api/tasks/remove-multiple`,
    toggleMultiple: `${BASE_URL}/api/tasks/toggle-multiple`,
    assign: (taskId: number, teamId: number) =>
      `${BASE_URL}/api/tasks/${taskId}/assign/${teamId}`,
    unassign: (taskId: number) => `${BASE_URL}/api/todos/${taskId}/unassign`,

    // New endpoints for PersonaBuilderData
    initializeUserData: `${BASE_URL}/api/initialize-user-data`,
    handleQuestionnaireSubmit: `${BASE_URL}/api/handle-questionnaire-submit`,

    bulkAssign: `${BASE_URL}/api/tasks/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/tasks/bulk-unassign`,






    // Filter endpoints
    filter: (status: string, dueDate: string, assignedUser: string) =>
      `${BASE_URL}/api/tasks?status=${status}&dueDate=${dueDate}&assignedUser=${assignedUser}`,

    setFilterOptions: `${BASE_URL}/api/filter/options`,
    clearFilter: `${BASE_URL}/api/filter/clear`,
    applyFilter: `${BASE_URL}/api/filter/apply`,
    updateFilterOptions: `${BASE_URL}/api/filter/update-options`,
    getFilterOptions: `${BASE_URL}/api/filter/get-options`,
    saveFilterOptions: `${BASE_URL}/api/filter/save-options`,
    deleteFilterOptions: `${BASE_URL}/api/filter/delete-options`,
    getFilteredData: `${BASE_URL}/api/filter/data`,
    addFilterCriteria: `${BASE_URL}/api/filter/add-criteria`,
    removeFilterCriteria: `${BASE_URL}/api/filter/remove-criteria`,
    // Sort endpoints
    setSortOptions: `${BASE_URL}/api/sort/options`,
    applySort: `${BASE_URL}/api/sort/apply`,
    updateSortOptions: `${BASE_URL}/api/sort/update-options`,
    getSortOptions: `${BASE_URL}/api/sort/get-options`,
    saveSortOptions: `${BASE_URL}/api/sort/save-options`,
    deleteSortOptions: `${BASE_URL}/api/sort/delete-options`,
    // Combined filter and sort endpoints
    getFilteredAndSortedData: `${BASE_URL}/api/filter-sort/data`,
    resetFilterAndSort: `${BASE_URL}/api/filter-sort/reset`,

    // Pagination endpoints
    applyPagination: `${BASE_URL}/api/pagination/apply`,
    updatePaginationOptions: `${BASE_URL}/api/pagination/update-options`,
  },

  snapshots: {
    list: `${BASE_URL}/api/snapshots`,
    single: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,
    add: `${BASE_URL}/api/snapshots`,
    remove: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,
    update: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,

    // New endpoints for bulk actions
    bulkAdd: `${BASE_URL}/api/snapshots/bulk-add`,
    bulkRemove: `${BASE_URL}/api/snapshots/bulk-remove`,
    bulkUpdate: `${BASE_URL}/api/snapshots/bulk-update`,
  },

  todos: {
    assign: (todoId: number, teamId: number) =>
      `${BASE_URL}/api/tasks/${todoId}/assign/${teamId}`,
    reassign: (todoId: number, newTeamId: number) =>
      `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`,
    unassign: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/unassign`,
    toggle: (entityId: number, entityType: string) =>
      `${BASE_URL}/api/toggle/${entityType}/${entityId}`,

    search: `${BASE_URL}/api/todos/search`,

    bulkAssign: `${BASE_URL}/api/todos/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/todos/bulk-unassign`,

    // Define todo endpoints here
  },

  calendar: {
    events: `${BASE_URL}/api/calendar/events`,
    singleEvent: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}`,
    completeAllEvents: `${BASE_URL}/api/calendar/events/complete-all`,
    reassignEvent: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}/reassign`,
    updateEvent: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}`,
    removeEvent: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}`,
    search: `${BASE_URL}/api/calendar/events/search`,
  },

  communityInteraction: {
    createPost: `${BASE_URL}/api/community-interaction/create-post`,
    getPosts: `${BASE_URL}/api/community-interaction/posts`,
    getPostDetails: (postId: string) => `${BASE_URL}/api/community-interaction/posts/${postId}`,
    updatePost: (postId: string) => `${BASE_URL}/api/community-interaction/posts/${postId}`,
    deletePost: (postId: string) => `${BASE_URL}/api/community-interaction/posts/${postId}`,
  },

  
  data: {
    single: (dataId: number) => `${BASE_URL}/api/data/${dataId}`,
    list: `${BASE_URL}/api/data`,
    getData: `${BASE_URL}/data`,
    addData: `${BASE_URL}/data`,
    getSpecificData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    updateData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    deleteData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    updateDataTitle: `${BASE_URL}/data/update_title`,
    streamData: `${BASE_URL}/stream_data`,
    dataProcessing: `${BASE_URL}/data/data-processing`,
    highlightList: `${BASE_URL}/api/highlights`, // Highlight list endpoint
    addHighlight: `${BASE_URL}/api/highlights/add`, // Add highlight endpoint
    getSpecificHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Get specific highlight endpoint
    updateHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Update highlight endpoint
    deleteHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Delete highlight endpoint
    // Add data-processing endpoint
  },

  donations: {
    makeDonation: (userId: string, amount: number) => `${BASE_URL}/api/donations/make-donation/${userId}/${amount}`,
    getDonationHistory: (userId: string) => `${BASE_URL}/api/donations/donation-history/${userId}`,  
  },

  users: {
    list: `${BASE_URL}/users`, // GET request for fetching all users
    single: (userId: number) => `${BASE_URL}/users/${userId}`, // GET request for fetching a specific user by ID
    add: `${BASE_URL}/users`, // POST request for adding a new user
    remove: (userId: number) => `${BASE_URL}/users/${userId}`, // DELETE request for deleting a user by ID
    update: (userId: number) => `${BASE_URL}/users/${userId}`, // PUT request for updating a user by ID
    updateList: `${BASE_URL}/users/update-list`, // PUT request for updating multiple users
    search: `${BASE_URL}/users/search`, // GET request for searching users
  },

  phases: {
    list: `${BASE_URL}/api/phases`,
    single: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,
    add: `${BASE_URL}/api/phases`,
    remove: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,
    update: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,

    createPhase: `${BASE_URL}/api/phases/create`,
    updatePhase: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}/update`,
    deletePhase: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}/delete`,
    getPhaseDetails: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,
  
    addSuccess: `${BASE_URL}/api/phases/add-success`,
    addFailure: `${BASE_URL}/api/phases/add-failure`,

    bulkAssign: `${BASE_URL}/api/phases/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/phases/bulk-unassign`,
    search: `${BASE_URL}/api/phases/search`,
    // Add more phase-related endpoints as needed
  },

  projectManagement: {
    createProject: `${BASE_URL}/api/project-management/create`,
    updateProject: (projectId: number) => `${BASE_URL}/api/project-management/${projectId}/update`,
    deleteProject: (projectId: number) => `${BASE_URL}/api/project-management/${projectId}/delete`,
    getProjectDetails: (projectId: number) => `${BASE_URL}/api/project-management/${projectId}`,
    listProjects: `${BASE_URL}/api/project-management/projects`,
  },
  randomWalk: {
    list: `${BASE_URL}/api/random-walks`,
    single: (walkId: string) => `${BASE_URL}/api/random-walks/${walkId}`,
    add: `${BASE_URL}/api/random-walks`,
    remove: (walkId: string) => `${BASE_URL}/api/random-walks/${walkId}`,
    update: (walkId: string) => `${BASE_URL}/api/random-walks/${walkId}`,
    // Add other random walk endpoints as needed
  },
  teams: {
    list: `${BASE_URL}/api/teams`,
    single: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    add: `${BASE_URL}/api/teams`,
    remove: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    update: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    // Add other team-related endpoints as needed
  },

  details: {
    list: `${BASE_URL}/api/details`,
    single: (detailsId: string) => `${BASE_URL}/api/details/${detailsId}`,
    add: `${BASE_URL}/api/details`,
    remove: (detailsId: string) => `${BASE_URL}/api/details/${detailsId}`,
    update: (detailsId: string) => `${BASE_URL}/api/details/${detailsId}`,
    // Add more details-related endpoints as needed

    //SOCIA MEDIA:
    // Facebook integration endpoints
    facebook: {
      fetchMessages: `${BASE_URL}/api/facebook/messages`,
      postMessage: `${BASE_URL}/api/facebook/post`,
      // Add more endpoints as needed
    },

    // Instagram integration endpoints
    instagram: {
      fetchMessages: `${BASE_URL}/api/instagram/messages`,
      postMessage: `${BASE_URL}/api/instagram/post`,
      // Add more endpoints as needed
    },

    // Twitter integration endpoints
    twitter: {
      fetchMessages: `${BASE_URL}/api/twitter/messages`,
      postMessage: `${BASE_URL}/api/twitter/post`,
      // Add more endpoints as needed
    },

    // YouTube integration endpoints
    youtube: {
      fetchMessages: `${BASE_URL}/api/youtube/messages`,
      postMessage: `${BASE_URL}/api/youtube/post`,
      // Add more endpoints as needed
    },

    // TikTok integration endpoints
    tiktok: {
      fetchMessages: `${BASE_URL}/api/tiktok/messages`,
      postMessage: `${BASE_URL}/api/tiktok/post`,
      // Add more endpoints as needed
    },
  },

  stateGovCities: {
    list: `${BASE_URL}/api/state-gov-cities`,
    single: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    add: `${BASE_URL}/api/state-gov-cities`,
    remove: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    update: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    // Add more endpoints as needed
  },


  //todo create actions.sagas.ist.ice.backkend_routes:
  communication: {
    audioCall: `${BASE_URL}/api/communication/audio-call`,
    videoCall: `${BASE_URL}/api/communication/video-call`,
    textChat: `${BASE_URL}/api/communication/text-chat`,
    collaboration: `${BASE_URL}/api/communication/collaboration`,
    startSession: `${BASE_URL}/api/communication/start-session`,
    endSession: `${BASE_URL}/api/communication/end-session`,
    getSessionDetails: (sessionId: string) => `${BASE_URL}/api/communication/session-details/${sessionId}`,
  },

  userManagement: {
    registerUser: `${BASE_URL}/api/users/register`,
    updateUserProfile: (userId: number) => `${BASE_URL}/api/users/${userId}/update`,
    deleteUserAccount: (userId: number) => `${BASE_URL}/api/users/${userId}/delete`,
    getUserDetails: (userId: number) => `${BASE_URL}/api/users/${userId}`,
    listUsers: `${BASE_URL}/api/users`,
  },
   // Video content endpoints
   videos: {
    list: `${BASE_URL}/api/videos`,
    single: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`,
    add: `${BASE_URL}/api/videos`,
    remove: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`,
    update: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`,
    // Add more video content endpoints as needed
  },
  screenSharing: {
    startSession: `${BASE_URL}/api/screen-sharing/start-session`,
    endSession: `${BASE_URL}/api/screen-sharing/end-session`,
    getSessionDetails: (sessionId: string) => `${BASE_URL}/api/screen-sharing/session-details/${sessionId}`,
  },
  dataAnalysis: {
    analyzeData: `${BASE_URL}/api/data-analysis/analyze`,
    getAnalysisResults: `${BASE_URL}/api/data-analysis/results`,
    exportAnalysisResults: `${BASE_URL}/api/data-analysis/export`,
    startAnalysis: `${BASE_URL}/api/data-analysis/start-analysis`,
    exportResults: `${BASE_URL}/api/data-analysis/export-results`,
  },

  globalCollaboration: {
    startProject: `${BASE_URL}/api/global-collaboration/start-project`,
    getProjects: `${BASE_URL}/api/global-collaboration/projects`,
    getProjectDetails: (projectId: string) => `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    updateProjectDetails: (projectId: string) => `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    deleteProject: (projectId: string) => `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    translateContent: `${BASE_URL}/api/global-collaboration/translate`,
    culturalAdaptation: `${BASE_URL}/api/global-collaboration/adapt`,
  },
  freelancers: {
    list: `${BASE_URL}/api/freelancers`,
    single: (freelancerId: number) => `${BASE_URL}/api/freelancers/${freelancerId}`,
    submitProposal: `${BASE_URL}/api/freelancers/submit-proposal`,
    engageInDiscussion: `${BASE_URL}/api/freelancers/engage-discussion`,
    joinProject: (projectId: number) => `${BASE_URL}/api/freelancers/projects/${projectId}/join`,
    // Add more freelancer-related endpoints as needed
  },
  projectOwners: {
    list: `${BASE_URL}/api/project-owners`,
    single: (ownerId: number) => `${BASE_URL}/api/project-owners/${ownerId}`,
    createProject: `${BASE_URL}/api/project-owners/create-project`,
    manageProject: (projectId: number) => `${BASE_URL}/api/project-owners/projects/${projectId}/manage`,
    inviteMember: (projectId: number, memberId: number) => `${BASE_URL}/api/project-owners/projects/${projectId}/invite/${memberId}`,
    // Add more project owner-related endpoints as needed
  },
  moderators: {
    list: `${BASE_URL}/api/moderators`,
    single: (moderatorId: number) => `${BASE_URL}/api/moderators/${moderatorId}`,
    manageCommunity: `${BASE_URL}/api/moderators/manage-community`,
    moderateContent: `${BASE_URL}/api/moderators/moderate-content`,
    participateInDecisions: `${BASE_URL}/api/moderators/participate-decisions`,
    // Add more moderator-related endpoints as needed
  },
  monetization: {
    
    startClientProject: `${BASE_URL}/api/monetization/start-client-project`,
    getClientProjects: `${BASE_URL}/api/monetization/client-projects`,
    getClientProjectDetails: (projectId: string) => `${BASE_URL}/api/monetization/client-projects/${projectId}`,
    updateClientProject: (projectId: string) => `${BASE_URL}/api/monetization/client-projects/${projectId}`,
    deleteClientProject: (projectId: string) => `${BASE_URL}/api/monetization/client-projects/${projectId}`,

    sendGift: (userId: string, giftId: string) => `${BASE_URL}/api/virtual-gifting/send-gift/${userId}/${giftId}`,
    getReceivedGifts: (userId: string) => `${BASE_URL}/api/virtual-gifting/received-gifts/${userId}`,
    redeemGift: (giftId: string) => `${BASE_URL}/api/virtual-gifting/redeem-gift/${giftId}`,
  
  },
  toolbar: {
    fetchToolbarSize: `${BASE_URL}/api/toolbar/size`,
    updateToolbarSize: `${BASE_URL}/api/toolbar/size`,
  }

  
  // Add more sections as needed
};
