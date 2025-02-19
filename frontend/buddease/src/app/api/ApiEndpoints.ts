import HighlightEvent from "../components/documents/screenFunctionality/HighlightEvent";

// apiEndpoints.ts
const BASE_URL = "https://your-api-base-url";
const FACEBOOK_API_BASE_URL = 'https://graph.facebook.com/v12.0';
const TWITTER_API_BASE_URL = 'https://api.twitter.com/1.1';

type NestedEndpoints = {
  [key: string]: string | ((...args: any[]) => string) | NestedEndpoints;
};

// Interface representing endpoints with categories
interface Endpoints {
  [category: string]: NestedEndpoints;
}

export const endpoints: Endpoints = {
  apiWebBase: {
    login: `${BASE_URL}/login`,
    logout: `${BASE_URL}/logout`,
    register: `${BASE_URL}/register`,
    forgotPassword: `${BASE_URL}/forgot-password`,
    resetPassword: `${BASE_URL}/reset-password`,
    verifyEmail: `${BASE_URL}/verify-email`,
    resendVerificationEmail: `${BASE_URL}/resend-verification-email`,
  },
  database: {
    backend: `${BASE_URL}/api/user/backend`,
    frontend: `${BASE_URL}/api/user/frontend`

  },
  delegates: {
    fetch: `${BASE_URL}/delegates`,
    fetchById: (id: number) => `${BASE_URL}/delegates/${id}`,
    create: `${BASE_URL}/delegates/create`,
    update: (id: number) => `${BASE_URL}/delegates/update/${id}`,
    delete: (id: number) => `${BASE_URL}/delegates/delete/${id}`,
  },
  drawing: {
    fetch: `${BASE_URL}/drawing/fetch`, // GET request for fetching all drawings
    fetchById: `${BASE_URL}/drawing/fetch`, // GET request for fetching a drawing by ID
    create: `${BASE_URL}/drawing/create`, // POST request for creating a new drawing
    update: `${BASE_URL}/drawing/update`, // PUT request for updating an existing drawing
    save: `${BASE_URL}/drawing/save`, // POST request for saving a drawing to the database
    delete: `${BASE_URL}/drawing/delete`, // DELETE request for deleting a drawing
  },
  apiConfig: {
    getUserApiConfig: `${BASE_URL}/api/user/api-config`, // GET request for fetching user's API configuration
    updateUserApiConfig: `${BASE_URL}/api/user/api-config`, // PUT request for updating user's API configuration
    aquaConfig: `${BASE_URL}/api/aqua-config`, // Endpoint for fetching AquaConfig
  },

  users: {
    list: `${BASE_URL}/users`,
    single: (userId: number) => `${BASE_URL}/users/${userId}`,
    add: `${BASE_URL}/users`,
    remove: (userId: number) => `${BASE_URL}/users/${userId}`,
    update: (userId: number) => `${BASE_URL}/users/${userId}`,
    updateList: `${BASE_URL}/users/update-list`,
    search: `${BASE_URL}/users/search`,
    updateRole: (userId: number) => `${BASE_URL}/users/${userId}/update-role`,
    updateRoles: (userIds: number[]) =>
      `${BASE_URL}/users/${userIds.join(",")}/update-roles`,
  },

  userSettings: {
    getUserSettings: `${BASE_URL}/api/user-settings`, // Endpoint to get user settings
    updateUserSettings: `${BASE_URL}/api/user-settings/update`, // Endpoint to update user settings
    resetUserSettings: `${BASE_URL}/api/user-settings/reset`, // Endpoint to reset user settings
    // Add more endpoints as needed

    validateUserSettings: `${BASE_URL}/api/user-settings/validate`,
    saveUserSettings: `${BASE_URL}/api/user-settings/save`,

    getDefaultSettings: `${BASE_URL}/api/user-settings/default`,

    backupUserSettings: `${BASE_URL}/api/user-settings/backup`,

    restoreUserSettings: `${BASE_URL}/api/user-settings/restore`,

    exportUserSettings: `${BASE_URL}/api/user-settings/export`,

    importUserSettings: `${BASE_URL}/api/user-settings/import`,
  },

  files: {
    getFileType: (file: string) => `${BASE_URL}/${file}/type`,
    fetchFiles: `${BASE_URL}`,
    fetchFileAPI: (fileId: string) => `${BASE_URL}/${fileId}`,
    uploadFileAPI: `${BASE_URL}/upload`,
    determineFileTypeAPI: `${BASE_URL}/type`,
    // Define other file operations as needed
  },

  userRoles: {
    list: `${BASE_URL}/api/user-roles`,
    single: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
    add: `${BASE_URL}/api/user-roles`,
    remove: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
    update: (roleId: number) => `${BASE_URL}/api/user-roles/${roleId}`,
  },

  userManagement: {
    registerUser: `${BASE_URL}/api/users/register`,
    updateUserProfile: (userId: number) =>
      `${BASE_URL}/api/users/${userId}/update`,
    deleteUserAccount: (userId: number) =>
      `${BASE_URL}/api/users/${userId}/delete`,
    getUserDetails: (userId: number) => `${BASE_URL}/api/users/${userId}`,
    listUsers: `${BASE_URL}/api/users`,
  },

  userRolesNFT: {
    list: `${BASE_URL}/api/user-roles-nft`,
    single: (roleId: number) => `${BASE_URL}/api/user-roles-nft/${roleId}`,
    add: `${BASE_URL}/api/user-roles-nft`,
    remove: (roleId: number) => `${BASE_URL}/api/user-roles-nft/${roleId}`,
    update: (roleId: number) => `${BASE_URL}/api/user-roles-nft/${roleId}`,
    // Add more endpoints as needed
  },

  externaAuth: {
    wixAuthentication: `${BASE_URL}/external/wix/authenticate`,
    // Add more external authentication endpoints as needed
  },

  auth: {
    admin: `${BASE_URL}/api/admin/login`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    verifyEmail: (token: string) => `${BASE_URL}/auth/verify-email/${token}`,
    resendVerificationEmail: `${BASE_URL}/auth/resend-verification-email`,
    changePassword: `${BASE_URL}/auth/change-password`,
    updateProfile: `${BASE_URL}/auth/update-profile`,
    deactivateAccount: `${BASE_URL}/auth/deactivate-account`,
    reactivateAccount: `${BASE_URL}/auth/reactivate-account`,
    userHistory: `${BASE_URL}/auth/user-history`,
    oauthLogin: `${BASE_URL}/auth/oauth-login`,
    setup2FA: `${BASE_URL}/auth/setup-2fa`,
    verify2FA: `${BASE_URL}/auth/verify-2fa`,
    userRolesPermissions: `${BASE_URL}/auth/user-roles-permissions`,
    userActivityLog: `${BASE_URL}/auth/user-activity-log`,
    userSearch: `${BASE_URL}/auth/user-search`,
    exportUserData: `${BASE_URL}/auth/export-user-data`,
    updateNotificationSettings: `${BASE_URL}/auth/update-notification-settings`,
    updatePrivacySettings: `${BASE_URL}/auth/update-privacy-settings`,
    uploadAvatar: `${BASE_URL}/auth/upload-avatar`,
    revokeToken: `${BASE_URL}/auth/revoke-token`,
    profile: `${BASE_URL}/auth/profile`,
    logout: `${BASE_URL}/auth/logout`,
  },

  blogs: {
    list: `${BASE_URL}/blogs`,
    single: (blogId: string) => `${BASE_URL}/blogs/${blogId}`,
    add: `${BASE_URL}/blogs`,
    remove: (blogId: string) => `${BASE_URL}/blogs/${blogId}`,
    update: (blogId: string) => `${BASE_URL}/blogs/${blogId}`,
    // Add more blog-related endpoints as needed
  },

  content: {
    fetchContent: (contentId: string) => `${BASE_URL}/api/content/${contentId}`, // Endpoint to fetch content by ID
    createContent: `${BASE_URL}/api/content/create`, // Endpoint to create new content
    updateContent: (contentId: string) =>
      `${BASE_URL}/api/content/${contentId}/update`, // Endpoint to update content
    deleteContent: (contentId: string) =>
      `${BASE_URL}/api/content/${contentId}/delete`, // Endpoint to delete content
    publishContent: (contentId: string) =>
      `${BASE_URL}/api/content/${contentId}/publish`, // Endpoint to publish content
    unpublishContent: (contentId: string) =>
      `${BASE_URL}/api/content/${contentId}/unpublish`, // Endpoint to unpublish content
    searchContent: `${BASE_URL}/api/content/search`, // Endpoint to search content
    // Add more content-related endpoints as needed
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
    eventDetails: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}/details`,
    // Event Reminder
    setEventReminder: `${BASE_URL}/api/calendar/events/set-reminder`,

    // Delete Event
    deleteEvent: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}/delete`,

    // Filter Events
    filterEventsByCategory: `${BASE_URL}/api/calendar/events/filter-by-category`,

    // Search Events
    searchEvents: `${BASE_URL}/api/calendar/events/search`,

    // Export Calendar
    exportCalendar: `${BASE_URL}/api/calendar/export`,

    // Undo/Redo Actions
    undoAction: `${BASE_URL}/api/calendar/undo`,
    redoAction: `${BASE_URL}/api/calendar/redo`,

    // View Event Details
    viewEventDetails: (eventId: string) =>
      `${BASE_URL}/api/calendar/events/${eventId}/details`,

    // Bulk Edit Events
    bulkEditEvents: `${BASE_URL}/api/calendar/events/bulk-edit`,

    // Recurring Events
    createRecurringEvent: `${BASE_URL}/api/calendar/events/create-recurring`,

    // Custom Event Notifications
    setCustomEventNotifications: `${BASE_URL}/api/calendar/events/set-custom-notifications`,

    // Event Comments/Notes
    addEventComment: `${BASE_URL}/api/calendar/events/add-comment`,

    // Event Attachments
    attachEventFile: `${BASE_URL}/api/calendar/events/attach-file`,

    // Task Visibility
    toggleShowTasks: `${BASE_URL}/api/calendar/toggle-show-tasks`,
  },
  chat: {
    getThreads: `${BASE_URL}/api/chat/threads`,
    getMessages: `${BASE_URL}/api/chat/messages`,
    createThread: `${BASE_URL}/api/chat/threads`,
    addMessage: `${BASE_URL}/api/chat/messages`,
  },

  client: {
    fetchClientDetails: (clientId: number) => `/api/client/${clientId}`, // Endpoint to fetch client details
    updateClientDetails: (clientId: number) => `/api/client/${clientId}/update`, // Endpoint to update client details
    connectWithTenant: (tenantId: number) => `/api/client/connect/${tenantId}`, // Endpoint to connect with a specific tenant
    sendMessageToTenant: (tenantId: number) =>
      `/api/client/message/${tenantId}`, // Endpoint to send a message to a specific tenant
    listConnectedTenants: "/api/client/connected-tenants", // Endpoint to list all connected tenants
    listMessages: "/api/client/messages", // Endpoint to list messages between client and tenants
    createTask: "/api/client/tasks/create", // Endpoint to create a task for project management
    listTasks: "/api/client/tasks", // Endpoint to list all tasks related to the client
    submitProjectProposal: "/api/client/projects/submit-proposal", // Endpoint to submit a project proposal
    participateInCommunityChallenges:
      "/api/client/community/challenges/participate", // Endpoint to participate in community challenges
    listRewards: "/api/client/rewards", // Endpoint to list rewards earned by the client
    listFiles: "/api/client/files", // Endpoint to list files shared with the
    fetchFiles: "/api/client/fetchFiles", // Endpoint to fetch files
    uploadFile: "/api/client/uploadFile", // Endpoint to upload a file
    batchRemoveFiles: "/api/client/batchRemoveFiles", // Endpoint to remove multiple files
    markFileAsComplete: "/api/client/markFileAsComplete", // Endpoint to mark a file as complete
    startCollaborativeEdit: "/api/client/startCollaborativeEdit", // Endpoint to start collaborative editing
    createFileVersion: "/api/client/createFileVersion", // Endpoint to create a new version of a file
    fetchFileVersions: "/api/client/fetchFileVersions", // Endpoint to fetch file versions
    shareFile: "/api/client/shareFile", // Endpoint to share a file
    requestAccessToFile: "/api/client/requestAccessToFile", // Endpoint to request access to a file
    receiveFileUpdate: "/api/client/receiveFileUpdate", // Endpoint to receive an updated file
    exportFile: "/api/client/exportFile", // Endpoint to export a file
    archiveFile: "/api/client/archiveFile", // Endpoint to archive a file
    determineFileType: "/api/client/determineFileType", // Endpoint to determine file type
    importFile: "/api/client/importFile", // Endpoint to import a file
    // Add more client-specific endpoints related to tenant interaction or communication with businesses
  },

  dev: {
    // Add development endpoints here
    getMockData: `${BASE_URL}/mock/data`,
    generateMockResponse: `${BASE_URL}/mock/generate`,
    list: `${BASE_URL}/api/dev/mocks`,
    create: `${BASE_URL}/api/dev/mocks`,
    delete: `${BASE_URL}/api/dev/mocks/delete`,
    update: `${BASE_URL}/api/dev/mocks/update`,
  },

  documents: {
    list: `${BASE_URL}/api/documents`,
    single: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    add: `${BASE_URL}/api/documents`,
    remove: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    update: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    download: (documentId: string) =>
      `${BASE_URL}/api/documents/downloadDocument/${documentId}`,
    // Add more document-related endpoints as needed

    search: `${BASE_URL}/api/documents/search`, // Search Documents
    filter: `${BASE_URL}/api/documents/filter`, // Filter Documents
    upload: `${BASE_URL}/api/documents/upload`, // Upload Document
    share: `${BASE_URL}/api/documents/share`, // Share Document
    lock: `${BASE_URL}/api/documents/lock`, // Lock Document
    unlock: `${BASE_URL}/api/documents/unlock`, // Unlock Document
    archive: `${BASE_URL}/api/documents/archive`, // Archive Document
    restore: `${BASE_URL}/api/documents/restore`, // Restore Document
    move: `${BASE_URL}/api/documents/move`, // Move Document
    copy: `${BASE_URL}/api/documents/copy`, // Copy Document
    rename: `${BASE_URL}/api/documents/rename`, // Rename Document
    changePermissions: `${BASE_URL}/api/documents/changePermissions`, // Change Document Permissions
    // Add more document-related endpoints as needed

    merge: `${BASE_URL}/api/documents/merge`, // Merge Documents
    split: `${BASE_URL}/api/documents/split`, // Split Document
    validate: `${BASE_URL}/api/documents/validate`, // Validate Document
    encrypt: `${BASE_URL}/api/documents/encrypt`, // Encrypt Document
    decrypt: `${BASE_URL}/api/documents/decrypt`, // Decrypt Document
    trackChanges: `${BASE_URL}/api/documents/trackChanges`, // Track Document Changes
    compare: `${BASE_URL}/api/documents/compare`, // Compare Documents
    tag: `${BASE_URL}/api/documents/tag`, // Tag Documents
    categorize: `${BASE_URL}/api/documents/categorize`, // Categorize Documents
    customizeView: `${BASE_URL}/api/documents/customizeView`, // Customize Document View
    comment: `${BASE_URL}/api/documents/comment`, // Comment on Document
    mentionUser: `${BASE_URL}/api/documents/mentionUser`, // Mention User in Document
    assignTask: `${BASE_URL}/api/documents/assignTask`, // Assign Task in Document
    requestReview: `${BASE_URL}/api/documents/requestReview`, // Request Review of Document
    approve: `${BASE_URL}/api/documents/approve`, // Approve Document
    reject: `${BASE_URL}/api/documents/reject`, // Reject Document
    requestFeedback: `${BASE_URL}/api/documents/requestFeedback`, // Request Feedback on Document
    provideFeedback: `${BASE_URL}/api/documents/provideFeedback`, // Provide Feedback on Document
    resolveFeedback: `${BASE_URL}/api/documents/resolveFeedback`, // Resolve Feedback on Document
    collaborativeEditing: `${BASE_URL}/api/documents/collaborativeEditing`, // Collaborative Editing
    smartTagging: `${BASE_URL}/api/documents/smartTagging`, // Smart Document Tagging
    annotation: `${BASE_URL}/api/documents/annotation`, // Document Annotation
    activityLogging: `${BASE_URL}/api/documents/activityLogging`, // Document Activity Logging
    intelligentSearch: `${BASE_URL}/api/documents/intelligentSearch`, // Intelligent Document Search
    createVersion: `${BASE_URL}/api/documents/createVersion`, // Create Document Version
    revertVersion: `${BASE_URL}/api/documents/revertVersion`, // Revert to Document Version
    viewHistory: `${BASE_URL}/api/documents/viewHistory`, // View Document History
    compareVersions: `${BASE_URL}/api/documents/compareVersions`, // Document Version Comparison
    grantAccess: `${BASE_URL}/api/documents/grantAccess`, // Grant Document Access
    revokeAccess: `${BASE_URL}/api/documents/revokeAccess`, // Revoke Document Access
    managePermissions: `${BASE_URL}/api/documents/managePermissions`, // Manage Document Permissions
    initiateWorkflow: `${BASE_URL}/api/documents/initiateWorkflow`, // Initiate Document Workflow
    automateTasks: `${BASE_URL}/api/documents/automateTasks`, // Automate Document Tasks
    triggerEvents: `${BASE_URL}/api/documents/triggerEvents`, // Trigger Document Events
    approvalWorkflow: `${BASE_URL}/api/documents/approvalWorkflow`, // Document Approval Workflow
    lifecycleManagement: `${BASE_URL}/api/documents/lifecycleManagement`, // Document Lifecycle Management
    connectExternalSystem: `${BASE_URL}/api/documents/connectExternalSystem`, // Connect with External System
    synchronizeStorage: `${BASE_URL}/api/documents/synchronizeStorage`, // Synchronize with Cloud Storage
    importFromExternal: `${BASE_URL}/api/documents/importFromExternal`, // Import from External Source
    exportToExternal: `${BASE_URL}/api/documents/exportToExternal`, // Export to External System
    generateReport: `${BASE_URL}/api/documents/generateReport`, // Generate Document Report
    exportReport: `${BASE_URL}/api/documents/exportReport`, // Export Document Report
    scheduleReport: `${BASE_URL}/api/documents/scheduleReport`, // Schedule Report Generation
    customizeReport: `${BASE_URL}/api/documents/customizeReport`, // Customize Report Settings
    backup: `${BASE_URL}/api/documents/backup`, // Backup Documents
    retrieveBackup: `${BASE_URL}/api/documents/retrieveBackup`, // Retrieve Backup
    redact: `${BASE_URL}/api/documents/redact`, // Document Redaction
    accessControls: `${BASE_URL}/api/documents/accessControls`, // Document Access Controls
    templates: `${BASE_URL}/api/documents/templates`, // Document Templates
  },

  collaborationTools: {
    createTask: `${BASE_URL}/api/collaboration/tasks/create`,
    updateTask: (taskId: number) =>
      `${BASE_URL}/api/collaboration/tasks/${taskId}/update`,
    deleteTask: (taskId: number) =>
      `${BASE_URL}/api/collaboration/tasks/${taskId}/delete`,
    getTaskDetails: (taskId: number) =>
      `${BASE_URL}/api/collaboration/tasks/${taskId}`,
    listTasks: `${BASE_URL}/api/collaboration/tasks`,

    fetchCollaborationData: `${BASE_URL}/api/collaboration/fetch-collaboration-data`,
    //todo impeement
    startBrainstorming: `${BASE_URL}/api/collaboration/start-brainstorming`,
    endBrainstorming: `${BASE_URL}/api/collaboration/end-brainstorming`,
    createWhiteboard: `${BASE_URL}/api/collaboration/create-whiteboard`,
    updateWhiteboard: (whiteboardId: number) =>
      `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/update`,
    deleteWhiteboard: (whiteboardId: number) =>
      `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}/delete`,
    getWhiteboardDetails: (whiteboardId: number) =>
      `${BASE_URL}/api/collaboration/whiteboards/${whiteboardId}`,
    listWhiteboards: `${BASE_URL}/api/collaboration/whiteboards`,
    shareDocument: `${BASE_URL}/api/collaboration/share-document`,
    commentOnDocument: `${BASE_URL}/api/collaboration/comment-on-document`,
    resolveComment: `${BASE_URL}/api/collaboration/resolve-comment`,
    updateDocument: (documentId: number) =>
      `${BASE_URL}/api/collaboration/documents/${documentId}/update`,
    deleteDocument: (documentId: number) =>
      `${BASE_URL}/api/collaboration/documents/${documentId}/delete`,
    getDocumentDetails: (documentId: number) =>
      `${BASE_URL}/api/collaboration/documents/${documentId}`,
    listDocuments: `${BASE_URL}/api/collaboration/documents`,
    // Add more collaboration endpoints as needed
  },

  communication: {
    audioCall: `${BASE_URL}/api/communication/audio-call`,
    videoCall: `${BASE_URL}/api/communication/video-call`,
    textChat: `${BASE_URL}/api/communication/text-chat`,
    collaboration: `${BASE_URL}/api/communication/collaboration`,
    startSession: `${BASE_URL}/api/communication/start-session`,
    endSession: `${BASE_URL}/api/communication/end-session`,
    getSessionDetails: (sessionId: string) =>
      `${BASE_URL}/api/communication/session-details/${sessionId}`,
    // Additional endpoints
    uploadFile: `${BASE_URL}/api/communication/upload`,
    downloadFile: `${BASE_URL}/api/communication/download/:fileId`,
    getUserPresence: `${BASE_URL}/api/communication/user-presence/:userId`,
    setUserPresence: `${BASE_URL}/api/communication/set-presence`,
    sendNotification: `${BASE_URL}/api/communication/send-notification`,
    getNotifications: `${BASE_URL}/api/communication/notifications`,
    markNotificationAsRead: `${BASE_URL}/api/communication/notifications/mark-read/:notificationId`,
    deleteNotification: `${BASE_URL}/api/communication/notifications/delete/:notificationId`,

    shareFile: `${BASE_URL}/api/communication/share-file`,
    whiteboard: `${BASE_URL}/api/communication/whiteboard`,
    realTimeEditing: `${BASE_URL}/api/communication/real-time-editing`,
    screenSharing: `${BASE_URL}/api/communication/screen-sharing`,
    userPresenceStatus: `${BASE_URL}/api/communication/user-presence-status`,
    pushNotifications: `${BASE_URL}/api/communication/push-notifications`,
    communityForums: `${BASE_URL}/api/communication/community-forums`,
    analytics: `${BASE_URL}/api/communication/analytics`,
  },

  communityInteraction: {
    createPost: `${BASE_URL}/api/community-interaction/create-post`,
    getPosts: `${BASE_URL}/api/community-interaction/posts`,
    getPostDetails: (postId: string) =>
      `${BASE_URL}/api/community-interaction/posts/${postId}`,
    updatePost: (postId: string) =>
      `${BASE_URL}/api/community-interaction/posts/${postId}`,
    deletePost: (postId: string) =>
      `${BASE_URL}/api/community-interaction/posts/${postId}`,
  },

  crypto: {
    settings: `${BASE_URL}/api/crypto/settings`,
    list: `${BASE_URL}/api/crypto/list`,
    fetchCryptoData: `${BASE_URL}/api/crypto/data`,
    fetchCryptoDetails: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}`,
    addCrypto: `${BASE_URL}/api/crypto/add`,
    removeCrypto: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/remove`,
    updateCrypto: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/update`,
    getHistoricalData: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/historical-data`,
    getNews: (cryptoId: string) => `${BASE_URL}/api/crypto/${cryptoId}/news`,
    getPricePrediction: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/price-prediction`,
    getTransactions: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/transactions`,
    getExchangeRates: `${BASE_URL}/api/crypto/exchange-rates`,
    getMarketCap: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/market-cap`,
    getSocialSentiment: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/social-sentiment`,
    getCommunityDiscussions: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/community-discussions`,
    getTechnicalAnalysis: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/technical-analysis`,
    getMarketTrend: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/market-trend`,
    getTradingVolume: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/trading-volume`,

    // Additional endpoints related to community-driven global collaboration:
    getCommunitySentiment: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/community-sentiment`,
    getSocialImpactAnalysis: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/social-impact-analysis`,
    getGlobalAdoptionTrends: (cryptoId: string) =>
      `${BASE_URL}/api/crypto/${cryptoId}/global-adoption-trends`,
    getUserContributionRewards: (userId: string) =>
      `${BASE_URL}/api/crypto/users/${userId}/contribution-rewards`,

    // New endpoints:
    getCommunityProjects: `${BASE_URL}/api/crypto/community-projects`, // Endpoint for retrieving community-driven crypto projects
    getDeveloperCompensation: `${BASE_URL}/api/crypto/developer-compensation`, // Endpoint for calculating developer compensation based on project quality and complexity
    getGlobalCollaborationTools: `${BASE_URL}/api/crypto/global-collaboration-tools`, // Endpoint for accessing global collaboration tools for crypto projects
    getMonetizationOpportunities: `${BASE_URL}/api/crypto/monetization-opportunities`, // Endpoint for exploring monetization opportunities for developers within the crypto ecosystem
    getRevenueDistribution: `${BASE_URL}/api/crypto/revenue-distribution`, // Endpoint for managing revenue distribution among contributors within crypto projects
    getImpactAssessment: `${BASE_URL}/api/crypto/impact-assessment`, // Endpoint for assessing the impact of crypto projects on the community and ecosystem

    getMarketData: `${BASE_URL}/api/crypto/market-data`, // Endpoint for retrieving market data related to cryptocurrencies
    getPortfolioSummary: `${BASE_URL}/api/crypto/portfolio-summary`, // Endpoint for fetching summary data of user portfolios
    getTopGainers: `${BASE_URL}/api/crypto/top-gainers`, // Endpoint for retrieving top gaining cryptocurrencies
    getTopLosers: `${BASE_URL}/api/crypto/top-losers`, // Endpoint for retrieving top losing cryptocurrencies
    getExchangeListings: `${BASE_URL}/api/crypto/exchange-listings`, // Endpoint for fetching listings of cryptocurrency exchanges
    getMarketTrends: `${BASE_URL}/api/crypto/market-trends`, // Endpoint for retrieving trends in the cryptocurrency market
    getTransactionHistory: `${BASE_URL}/api/crypto/transaction-history`, // Endpoint for fetching transaction history related to cryptocurrencies
    getWalletBalance: `${BASE_URL}/api/crypto/wallet-balance`, // Endpoint for retrieving wallet balances for cryptocurrencies
    getAlertSettings: `${BASE_URL}/api/crypto/alert-settings`, // Endpoint for managing alert settings for cryptocurrencies
    getPriceAlerts: `${BASE_URL}/api/crypto/price-alerts`, // Endpoint for retrieving price alerts for specific cryptocurrencies
    getInsights: `${BASE_URL}/api/crypto/insights`, // Endpoint for fetching insights and analytics related to cryptocurrencies
    getStakingRewards: `${BASE_URL}/api/crypto/staking-rewards`, // Endpoint for retrieving staking rewards for cryptocurrencies
    getLiquidityPools: `${BASE_URL}/api/crypto/liquidity-pools`, // Endpoint for fetching liquidity pool data for cryptocurrencies
    getNFTMarketplace: `${BASE_URL}/api/crypto/nft-marketplace`, // Endpoint for accessing the NFT marketplace for cryptocurrencies
    getGovernanceProposals: `${BASE_URL}/api/crypto/governance-proposals`, // Endpoint for retrieving governance proposals for cryptocurrency projects
    getChainAnalysis: `${BASE_URL}/api/crypto/chain-analysis`, // Endpoint for conducting chain analysis on specific cryptocurrencies
    getDEXTransactions: `${BASE_URL}/api/crypto/dex-transactions`, // Endpoint for retrieving decentralized exchange transactions for cryptocurrencies
    getRegulatoryCompliance: `${BASE_URL}/api/crypto/regulatory-compliance`, // Endpoint for managing regulatory compliance related to cryptocurrencies
    getDeveloperDocumentation: `${BASE_URL}/api/crypto/developer-docs`, // Endpoint for accessing developer documentation for cryptocurrency projects
    getIntegrationGuides: `${BASE_URL}/api/crypto/integration-guides`, // Endpoint for accessing integration guides for using cryptocurrencies in applications
    getDeveloperTools: `${BASE_URL}/api/crypto/developer-tools`, // Endpoint for accessing developer tools for crypto
    getDeveloperResources: `${BASE_URL}/api/crypto/developer-resources`, // Endpoint for accessing developer resources for crypto
    getDeveloperEcosystem: `${BASE_URL}/api/crypto/developer-ecosystem`, // Endpoint for accessing
    getDeveloperCommunity: `${BASE_URL}/api/crypto/developer-community`, // Endpoint for accessing developer community for
  },

  data: {
    single: (dataId: number) => `${BASE_URL}/api/data/${dataId}`,
    list: `${BASE_URL}/api/data`,
    getData: `${BASE_URL}/data`,
    addData: `${BASE_URL}/data`,
    getSpecificData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    // updateData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    deleteData: (dataId: number) => `${BASE_URL}/data/${dataId}`,
    updateDataTitle: `${BASE_URL}/data/update_title`,
    streamData: `${BASE_URL}/stream_data`,
    dataProcessing: `${BASE_URL}/data/data-processing`,
    updateData: `${BASE_URL}/data/update`,

    highlightList: `${BASE_URL}/api/highlights`, // Highlight list endpoint
    addHighlight: (newHighlight: Omit<HighlightEvent, "id">) =>
      `${BASE_URL}/api/highlights/${newHighlight}`,
    getSpecificHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Get specific highlight endpoint

    updateHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Update highlight endpoint

    deleteHighlight: (highlightId: number) =>
      `${BASE_URL}/api/highlights/${highlightId}`, // Delete highlight endpoint

    uploadData: `${BASE_URL}/api/data/upload`, // Upload data endpoint
  },

  datasetPath: {
    list: `${BASE_URL}/api/dataset-paths`,
  },

  dataProviders: {
    list: `${BASE_URL}/api/data-providers`,
    single: (providerId: string) =>
      `${BASE_URL}/api/data-providers/${providerId}`,
    create: `${BASE_URL}/api/data-providers/create`, // Endpoint for creating a data provider
    update: (providerId: string) =>
      `${BASE_URL}/api/data-providers/update/${providerId}`, // Endpoint for updating a data provider
    delete: (providerId: string) =>
      `${BASE_URL}/api/data-providers/delete/${providerId}`, // Endpoint for deleting a data provider
    getMany: `${BASE_URL}/api/data-providers/getBatchDataProviders`, // Endpoint for getting multiple data providers
    createMany: `${BASE_URL}/api/data-providers/createBatchDataProviders`, // Endpoint for creating multiple data providers
    updateMany: `${BASE_URL}/api/data-providers/updateBatchDataProviders`, // Endpoint for updating multiple data providers
    deleteMany: `${BASE_URL}/api/data-providers/deleteBatchDataProviders`, // Endpoint for deleting multiple data providers
  },

  dex: {
    list: `${BASE_URL}/api/dex`,
    single: (dexId: string) => `${BASE_URL}/api/dex/${dexId}`,
    add: `${BASE_URL}/api/dex`,
    remove: (dexId: string) => `${BASE_URL}/api/dex/${dexId}`,
    update: (dexId: string) => `${BASE_URL}/api/update/${dexId}`,
  },

  document: {
    list: `${BASE_URL}/api/documents`,
    single: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    add: `${BASE_URL}/api/documents`,
    remove: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    update: (documentId: string) => `${BASE_URL}/api/documents/${documentId}`,
    // Add more document-related endpoints as needed
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
      fetchMessages: `${BASE_URL}/me/faceook/messages`,
      postMessage: `${BASE_URL}/me/faceook/feed`, // Assuming posting a message is done to the feed
      addMessage: `${BASE_URL}/me/faceook/messages`, // Adjust as needed, placeholder for adding a message
      fetchPosts: `${FACEBOOK_API_BASE_URL}/me/facebook/posts`,
      likePost: (postId: string) => `${BASE_URL}/${postId}/likes`,
      commentOnPost: (postId: string) => `${BASE_URL}/${postId}/comments`,
      fetchAllNotes: `${BASE_URL}/me/notes`,
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
      fetchMessages: `${TWITTER_API_BASE_URL}/api/twitter/messages`, // Fetching messages might not be applicable in Twitter, consider removing or adjusting this endpoint
      postMessage: `${TWITTER_API_BASE_URL}/api/twitter/post`, // Posting a new tweet
    
      updateTweet: `${TWITTER_API_BASE_URL}/api/twitter/update`, // Endpoint for updating a tweet
      deleteTweet: `${TWITTER_API_BASE_URL}/api/twitter/delete`, // Endpoint for deleting a tweet
    
      likeTweet: (tweetId: string) => `${TWITTER_API_BASE_URL}/api/twitter/like/${tweetId}`, // Endpoint for liking a tweet
      retweet: (tweetId: string) => `${TWITTER_API_BASE_URL}/api/twitter/retweet/${tweetId}`, // Endpoint for retweeting a tweet
    
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

  donations: {
    makeDonation: (userId: string, amount: number) =>
      `${BASE_URL}/api/donations/make-donation/${userId}/${amount}`,
    getDonationHistory: (userId: string) =>
      `${BASE_URL}/api/donations/donation-history/${userId}`,
  },

  generators: {
    generateTransferToken: `${BASE_URL}/api/generators/generate-transfer-token`,
    // Add more generator endpoints as needed...
  },

  theme: {
    list: `${BASE_URL}/api/themes`,
    single: (themeId: number) => `${BASE_URL}/api/themes/${themeId}`,
    add: `${BASE_URL}/api/themes`,
    remove: (themeId: number) => `${BASE_URL}/api/themes/${themeId}`,
    settings: `${BASE_URL}/api/theme-settings`, // Endpoint for fetching theme settings
    updateSettings: `${BASE_URL}/api/theme-settings/update`, // Endpoint for updating theme settings
    // Add more theme endpoints as needed
  },

  marker: {
    list: `${BASE_URL}/api/markers`,
    fetchMarkers: "/api/markers",
    addMarker: "/api/markers/add",
    removeMarker: (markerId: number) => `/api/markers/${markerId}/remove`,
  },

  participants: {
    single: (userId: string | number) => `/api/participants/${userId}`,
  },

  phases: {
    list: `${BASE_URL}/api/phases`,
    single: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,
    add: `${BASE_URL}/api/phases`,
    remove: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,
    update: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,

    createPhase: `${BASE_URL}/api/phases/create`,
    updatePhase: (phaseId: number) =>
      `${BASE_URL}/api/phases/${phaseId}/update`,
    deletePhase: (phaseId: number) =>
      `${BASE_URL}/api/phases/${phaseId}/delete`,
    getPhaseDetails: (phaseId: number) => `${BASE_URL}/api/phases/${phaseId}`,

    addSuccess: `${BASE_URL}/api/phases/add-success`,
    addFailure: `${BASE_URL}/api/phases/add-failure`,

    bulkAssign: `${BASE_URL}/api/phases/bulk-assign`,
    bulkUnassign: `${BASE_URL}/api/phases/bulk-unassign`,
    search: `${BASE_URL}/api/phases/search`,
    // Add more phase-related endpoints as needed
  },

  logging: {
    logs: `${BASE_URL}/logging`,
    logInfo: `${BASE_URL}/logging/info`,
    logWarning: `${BASE_URL}/logging/warning`,
    logError: `${BASE_URL}/logging/error`,
    logSuccess: `${BASE_URL}/logging/success`,
    logFailure: `${BASE_URL}/logging/failure`,
  },

  messages: {
    textMessages: {
      send: `${BASE_URL}/api/messages/text/send`,
      get: `${BASE_URL}/api/messages/text/get`,
      update: `${BASE_URL}/api/messages/text/update`,
      delete: `${BASE_URL}/api/messages/text/delete`,
    },
    audioMessages: {
      send: `${BASE_URL}/api/messages/audio/send`,
      get: `${BASE_URL}/api/messages/audio/get`,
      update: `${BASE_URL}/api/messages/audio/update`,
      delete: `${BASE_URL}/api/messages/audio/delete`,
    },

    videos: {
      send: `${BASE_URL}/api/messages/video/send`,
      get: `${BASE_URL}/api/messages/video/get`,
      edit: `${BASE_URL}/api/videos/edit`,
    },

    videoMessages: {
      send: `${BASE_URL}/api/messages/video/send`,
      get: `${BASE_URL}/api/messages/video/get`,
      update: `${BASE_URL}/api/messages/video/update`,
      delete: `${BASE_URL}/api/messages/video/delete`,
    },

    notifications: {
      send: `${BASE_URL}/api/messages/notifications/send`,
      get: `${BASE_URL}/api/messages/notifications/get`,
      update: `${BASE_URL}/api/messages/notifications/update`,
      delete: `${BASE_URL}/api/messages/notifications/delete`,
    },
  },
  web: {
    send: `${BASE_URL}/api/messages/web/send`,
    get: `${BASE_URL}/api/messages/web/get`,
    update: `${BASE_URL}/api/messages/web/update`,
    delete: `${BASE_URL}/api/messages/web/delete`,
  },
  payment: {
    initiatePayment: `${BASE_URL}/api/payment/initiate`, // Endpoint for initiating a payment transaction
    verifyPayment: `${BASE_URL}/api/payment/verify`, // Endpoint for verifying a payment transaction
    cancelPayment: `${BASE_URL}/api/payment/cancel`, // Endpoint for cancelling a payment transaction
    processRefund: `${BASE_URL}/api/payment/refund`, // Endpoint for processing a refund transaction
    getPaymentStatus: `${BASE_URL}/api/payment/status`, // Endpoint for retrieving the status of a payment transaction
    addPaymentMethod: `${BASE_URL}/api/payment/method/add`, // Endpoint for adding a new payment method
    removePaymentMethod: `${BASE_URL}/api/payment/method/remove`, // Endpoint for removing an existing payment method
    updatePaymentMethod: `${BASE_URL}/api/payment/method/update`, // Endpoint for updating payment method details
    listPaymentMethods: `${BASE_URL}/api/payment/methods`, // Endpoint for listing available payment methods
    getUserPayments: `${BASE_URL}/api/payment/user`, // Endpoint for retrieving payment history for a user
    getPaymentDetails: (paymentId: string) =>
      `${BASE_URL}/api/payment/${paymentId}`, // Endpoint for retrieving details of a specific payment transaction
    generateInvoice: `${BASE_URL}/api/payment/invoice/generate`, // Endpoint for generating an invoice
    sendInvoice: `${BASE_URL}/api/payment/invoice/send`, // Endpoint for sending an invoice to a recipient
    viewInvoice: `${BASE_URL}/api/payment/invoice/view`, // Endpoint for viewing an invoice
    trackInvoice: `${BASE_URL}/api/payment/invoice/track`, // Endpoint for tracking invoice views and payments
    markInvoicePaid: `${BASE_URL}/api/payment/invoice/mark-paid`, // Endpoint for marking an invoice as paid
    updateInvoiceStatus: `${BASE_URL}/api/payment/invoice/update-status`, // Endpoint for updating invoice status
    getInvoiceHistory: `${BASE_URL}/api/payment/invoice/history`, // Endpoint for retrieving invoice payment history
  },

  personas: {
    selectedPersona: `${BASE_URL}/api/persona`,
  },

  feedback: {
    customizeFeedbackForm: `${BASE_URL}/api/customize_feedback_form`,
  },

  parameterCustomization: {
    getParameterForm: `${BASE_URL}/api/parameter-customization/form`,
    fetchParameterCustomization: `${BASE_URL}/api/parameter-customization`,
  },

  projectOwner: {
    base: `${BASE_URL}/api/project/owner`, // Endpoint for project owner operations
    list: `${BASE_URL}/api/project-owners`,
    single: (ownerId: number) => `${BASE_URL}/api/project-owners/${ownerId}`,
    createProject: `${BASE_URL}/api/project-owners/create-project`,
    addTeamMember: `${BASE_URL}/api/project/owner/team/members`, // Endpoint for adding a team member to a project
    removeTeamMember: (projectId: number, memberId: number) =>
      `${BASE_URL}/api/project/owner/team/members/${projectId}/${memberId}`, // Endpoint for removing a team member from a project
    signTask: (taskId: number) =>
      `${BASE_URL}/api/project/owner/tasks/${taskId}/assign`, // Endpoint for assigning a task to a team member
    createMeeting: `${BASE_URL}/api/project/owner/meetings`, // Endpoint for creating a meeting
    updateMeeting: (meetingId: number) =>
      `${BASE_URL}/api/project/owner/meetings/${meetingId}`, // Endpoint for updating a meeting
    deleteMeeting: (meetingId: number) =>
      `${BASE_URL}/api/project/owner/meetings/${meetingId}`, // Endpoint for deleting a meeting
    manageProject: (projectId: number) =>
      `${BASE_URL}/api/project-owners/projects/${projectId}/manage`,
    inviteMember: (projectId: number, memberId: number) =>
      `${BASE_URL}/api/project-owners/projects/${projectId}/invite/${memberId}`,

    fetchProjectMembers: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/members`, // Endpoint for fetching project members
    fetchProjectTasks: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/tasks`, // Endpoint for fetching project tasks
    fetchProjectMeetings: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/meetings`, // Endpoint for fetching project meetings
    fetchProjectComments: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/comments`, // Endpoint for fetching project comments
    uploadFileToProject: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/files`, // Endpoint for uploading file to project
    fetchProjectFiles: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/files`, // Endpoint for fetching project files
    generateProjectReport: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/report`, // Endpoint for generating project report
    fetchProjectAnalytics: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/analytics`, // Endpoint for fetching project analytics
    manageProjectNotifications: (projectId: string) =>
      `${BASE_URL}/api/project/owner/${projectId}/notifications`, // Endpoint for managing project notifications
    // Add more project owner-related endpoints as needed
  },

  projects: {
    list: `${BASE_URL}/api/projects`,
    single: (projectId: number) => `${BASE_URL}/api/projects/${projectId}`,
    add: `${BASE_URL}/api/projects`,
    remove: (projectId: number) => `${BASE_URL}/api/projects/${projectId}`,
    update: (projectId: number) => `${BASE_URL}/api/projects/${projectId}`,
    tasks: (projectId: number) => `${BASE_URL}/api/projects/${projectId}/tasks`,
    members: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/members`,
    phases: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/phases`,
    milestones: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/milestones`,

    // Additional endpoints based on Redux actions
    teams: (projectId: number) => `${BASE_URL}/api/projects/${projectId}/teams`,
    identifyTeamNeeds: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/identifyTeamNeeds`,
    defineJobRoles: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/defineJobRoles`,
    createJobDescriptions: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/createJobDescriptions`,
    advertisePositions: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/advertisePositions`,
    reviewApplications: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/reviewApplications`,
    conductInterviews: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/conductInterviews`,
    assessCulturalFit: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/assessCulturalFit`,
    checkReferences: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/checkReferences`,
    coordinateSelectionProcess: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/coordinateSelectionProcess`,
    onboardNewTeamMembers: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/onboardNewTeamMembers`,
    brainstormProduct: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/brainstormProduct`,
    launchProduct: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/launchProduct`,
    analyzeData: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/analyzeData`,
    rewardContributors: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/rewardContributors`,
    reinvestEarnings: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/reinvestEarnings`,
    buildCustomApp: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/buildCustomApp`,
    meetProjectMetrics: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/meetProjectMetrics`,
    generateRevenue: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/generateRevenue`,
    joinCommunityProject: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/joinCommunityProject`,
    promoteUnity: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/promoteUnity`,
    shareProjectProgress: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/shareProjectProgress`,
    celebrateMilestones: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/celebrateMilestones`,
    provideFeedback: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/provideFeedback`,
    inviteMembers: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/inviteMembers`,
    assignTasks: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/assignTasks`,
    scheduleMeetings: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/scheduleMeetings`,
    shareResources: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/shareResources`,
    trackProgress: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/trackProgress`,
    resolveConflicts: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/resolveConflicts`,
    resolveBugs: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/resolveBugs`,
    conductSurveys: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/conductSurveys`,
    facilitateTraining: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/facilitateTraining`,
    provideMentorship: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/provideMentorship`,
    ensureAccessibility: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/ensureAccessibility`,
    implementSecurityMeasures: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/implementSecurityMeasures`,
    ensurePrivacy: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/ensurePrivacy`,
    implementDataProtection: (projectId: number) =>
      `${BASE_URL}/api/projects/${projectId}/implementDataProtection`,
    // Add more project-related endpoints as needed
  },

  projectManagement: {
    createProject: `${BASE_URL}/api/project-management/create`,
    updateProject: (projectId: number) =>
      `${BASE_URL}/api/project-management/${projectId}/update`,
    deleteProject: (projectId: number) =>
      `${BASE_URL}/api/project-management/${projectId}/delete`,
    getProjectDetails: (projectId: number) =>
      `${BASE_URL}/api/project-management/${projectId}`,
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

  reports: {
    list: `${BASE_URL}/api/reports`,
    generate: `${BASE_URL}/api/reports/generate`, // Endpoint to generate a new report
    download: (reportId: string) =>
      `${BASE_URL}/api/reports/${reportId}/download`, // Endpoint to download a report by ID
    delete: (reportId: string) => `${BASE_URL}/api/reports/${reportId}`, // Endpoint to delete a report by ID
  },

  registration: {
    registerUser: `${BASE_URL}/api/users/register`, // POST request for registering a new user
    updateUserProfile: (userId: number) =>
      `${BASE_URL}/api/users/${userId}/update`, // PUT request for updating a user's profile by ID
    deleteUserAccount: (userId: number) =>
      `${BASE_URL}/api/users/${userId}/delete`, // DELETE request for deleting a user's account by ID
    getUserDetails: (userId: number) => `${BASE_URL}/api/users/${userId}`, // GET request for fetching details of a specific user by ID
    listUsers: `${BASE_URL}/api/users`, // GET request for fetching a list of all users
  },

  snapshots: {
    list: `${BASE_URL}/api/snapshots`,
    single: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,
    add: `${BASE_URL}/api/snapshots`,
    remove: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,
    update: (snapshotId: string) => `${BASE_URL}/api/snapshots/${snapshotId}`,

    fetchUpdatedData: (snapshotId: string) =>
      `${BASE_URL}/api/snapshots/${snapshotId}/fetch-updated-data`,
    // New endpoints for bulk actions
    bulkAdd: `${BASE_URL}/api/snapshots/bulk-add`,
    bulkRemove: `${BASE_URL}/api/snapshots/bulk-remove`,
    bulkUpdate: `${BASE_URL}/api/snapshots/bulk-update`,
  },

  stateGovCities: {
    list: `${BASE_URL}/api/state-gov-cities`,
    single: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    add: `${BASE_URL}/api/state-gov-cities`,
    remove: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    update: (cityId: number) => `${BASE_URL}/api/state-gov-cities/${cityId}`,
    // Add more endpoints as needed
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
    markInProgress: (taskId: number) =>
      `${BASE_URL}/api/tasks/${taskId}/mark-in-progress`,
  },

  todos: {
    create: `${BASE_URL}/api/todos/create`, // Endpoint for creating a new todo
    update: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/update`, // Endpoint for updating a todo
    delete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/delete`, // Endpoint for deleting a todo
    complete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/complete`, // Endpoint for marking a todo as completed
    uncomplete: (todoId: number) =>
      `${BASE_URL}/api/todos/${todoId}/uncomplete`, // Endpoint for marking a todo as uncompleted

    fetch: `${BASE_URL}/api/todos`,
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

  teams: {
    list: `${BASE_URL}/api/teams`,
    single: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    add: `${BASE_URL}/api/teams`,
    fetchTeamData: (teamId: number) => `${BASE_URL}/api/teams/${teamId}/data`,
    remove: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    update: (teamId: number) => `${BASE_URL}/api/teams/${teamId}`,
    updateTeams: (teamIds: number[]) =>
      `${BASE_URL}/api/teams/${teamIds.join(",")}`,
    // Add other team-related endpoints as needed
  },

  // Team Management endpoints

  teamManagement: {
    list: `${BASE_URL}/api/team-management`,
    single: (teamId: number) => `${BASE_URL}/api/team-management/${teamId}`,
    add: `${BASE_URL}/api/team-management`,
    remove: (teamId: number) => `${BASE_URL}/api/team-management/${teamId}`,
    update: (teamId: number) => `${BASE_URL}/api/team-management/${teamId}`,
    createTeam: `${BASE_URL}/api/team-management/create-team`,
    deleteTeam: (teamId: number) => `${BASE_URL}/api/team-management/${teamId}`,
    fetchTeamMemberData: `${BASE_URL}/api/team-management/teammember-data`,
    // Add other team-management endpoints as needed
  },
  uiSettings: {
    fetchInterfaceContent: "/ui/fetchInterfaceContent",
    updateInterfaceSettings: "/ui/updateInterfaceSettings",
    fetchUserDashboard: "/ui/fetchUserDashboard",
    updateUserDashboardLayout: "/ui/updateUserDashboardLayout",
    fetchUserWidgets: "/ui/fetchUserWidgets",
    customizeUserWidget: "/ui/customizeUserWidget",
    fetchUserThemes: "/ui/fetchUserThemes",
    switchUserTheme: "/ui/switchUserTheme",
    fetchUserPreferences: "/ui/fetchUserPreferences",
    updateUserPreferences: "/ui/updateUserPreferences",
    fetchUserNotifications: "/ui/fetchUserNotifications",
    markNotificationAsRead: "/ui/markNotificationAsRead",
    clearAllNotifications: "/ui/clearAllNotifications",
    fetchUserMessages: "/ui/fetchUserMessages",
    sendMessageToUser: "/ui/sendMessageToUser",
    toggleDarkMode: "/ui/toggleDarkMode",
    fetchUserAvatar: "/ui/fetchUserAvatar",
    updateUserAvatar: "/ui/updateUserAvatar",
    fetchUserSettings: "/ui/fetchUserSettings",
    updateUserSettings: "/ui/updateUserSettings",
  },
  // Video content endpoints
  videos: {
    list: `${BASE_URL}/api/videos`, // Endpoint to list all videos
    uploadVideo: `${BASE_URL}/api/videos/upload`, // Endpoint to upload a video

    single: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`, // Endpoint to fetch a single video by ID
    add: `${BASE_URL}/api/videos`, // Endpoint to add a new video
    remove: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`, // Endpoint to remove a video by ID
    update: (videoId: string) => `${BASE_URL}/api/videos/${videoId}`, // Endpoint to update a video by ID

    conference: {
      create: `${BASE_URL}/conference/create`,
      join: `${BASE_URL}/conference/join`,
      end: `${BASE_URL}/conference/end`,
    },
    messages: {
      send: `${BASE_URL}/messages/send`,
      retrieve: `${BASE_URL}/messages/retrieve`,
    },
    annotations: {
      add: `${BASE_URL}/annotations/add`,
      retrieve: `${BASE_URL}/annotations/retrieve`,
    },
    playback: {
      speed: `${BASE_URL}/playback/speed`,
      frame: `${BASE_URL}/playback/frame`,
    },
    analytics: `${BASE_URL}/analytics`,
    live: {
      start: `${BASE_URL}/live/start`,
      end: `${BASE_URL}/live/end`,
      status: `${BASE_URL}/live/status`,
    },
    edit: `${BASE_URL}/edit`,
    transcribe: `${BASE_URL}/transcribe`,
    collaboration: {
      create: `${BASE_URL}/collaboration/create`,
      invite: `${BASE_URL}/collaboration/invite`,
      join: `${BASE_URL}/collaboration/join`,
    },
    manage: `${BASE_URL}/manage`,

    updateVideoTags: `${BASE_URL}/api/videos/update-tags`,
  },
  batch: {
    fetchVideos: `${BASE_URL}/api/videos/batch`, // Endpoint for batch fetching videos
    uploadVideos: `${BASE_URL}/api/videos/batch/upload`, // Endpoint for batch uploading videos
    addVideos: `${BASE_URL}/api/videos/batch/add`, // Endpoint for batch adding videos
    removeVideos: `${BASE_URL}/api/videos/batch/remove`, // Endpoint for batch removing videos
    updateVideos: `${BASE_URL}/api/videos/batch/update`, // Endpoint for batch updating videos
    // Add more batch operations as needed
  },

  screenSharing: {
    startSession: `${BASE_URL}/api/screen-sharing/start-session`,
    endSession: `${BASE_URL}/api/screen-sharing/end-session`,
    getSessionDetails: (sessionId: string) =>
      `${BASE_URL}/api/screen-sharing/session-details/${sessionId}`,
  },

  dataAnalysis: {
    analyzeData: `${BASE_URL}/api/data-analysis/analyze`,
    getAnalysisResults: `${BASE_URL}/api/data-analysis/results`,
    exportAnalysisResults: `${BASE_URL}/api/data-analysis/export`,
    startAnalysis: `${BASE_URL}/api/data-analysis/start-analysis`,
    exportResults: `${BASE_URL}/api/data-analysis/export-results`,
  },

  freelancers: {
    list: `${BASE_URL}/api/freelancers`,
    single: (freelancerId: number) =>
      `${BASE_URL}/api/freelancers/${freelancerId}`,
    submitProposal: `${BASE_URL}/api/freelancers/submit-proposal`,
    engageInDiscussion: `${BASE_URL}/api/freelancers/engage-discussion`,
    joinProject: (projectId: number) =>
      `${BASE_URL}/api/freelancers/projects/${projectId}/join`,
    // Add more freelancer-related endpoints as needed
  },

  globalCollaboration: {
    startProject: `${BASE_URL}/api/global-collaboration/start-project`,
    getProjects: `${BASE_URL}/api/global-collaboration/projects`,
    getProjectDetails: (projectId: string) =>
      `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    updateProjectDetails: (projectId: string) =>
      `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    deleteProject: (projectId: string) =>
      `${BASE_URL}/api/global-collaboration/projects/${projectId}`,
    translateContent: `${BASE_URL}/api/global-collaboration/translate`,
    culturalAdaptation: `${BASE_URL}/api/global-collaboration/adapt`,
  },

  logs: {
    logSession: `${BASE_URL}/api/log/session`,
    logVideoEvent: `${BASE_URL}/api/log/video-event`,
    logAudioEvent: `${BASE_URL}/api/log/audio-event`,
    logChannelEvent: `${BASE_URL}/api/log/channel-event`,
    logDocumentEvent: `${BASE_URL}/api/log/document-event`,
    logCollaborationEvent: `${BASE_URL}/api/log/collaboration-event`,
    logCalendarEvent: `${BASE_URL}/api/log/calendar-event`,
    logCalendarEventUrl: `${BASE_URL}/api/log/calendar-event-url`,
  },

  moderators: {
    list: `${BASE_URL}/api/moderators`,
    single: (moderatorId: number) =>
      `${BASE_URL}/api/moderators/${moderatorId}`,
    manageCommunity: `${BASE_URL}/api/moderators/manage-community`,
    moderateContent: `${BASE_URL}/api/moderators/moderate-content`,
    participateInDecisions: `${BASE_URL}/api/moderators/participate-decisions`,
    // Add more moderator-related endpoints as needed
  },

  monetization: {
    startClientProject: `${BASE_URL}/api/monetization/start-client-project`,
    getClientProjects: `${BASE_URL}/api/monetization/client-projects`,
    getClientProjectDetails: (projectId: string) =>
      `${BASE_URL}/api/monetization/client-projects/${projectId}`,
    updateClientProject: (projectId: string) =>
      `${BASE_URL}/api/monetization/client-projects/${projectId}`,
    deleteClientProject: (projectId: string) =>
      `${BASE_URL}/api/monetization/client-projects/${projectId}`,
    sendGift: (userId: string, giftId: string) =>
      `${BASE_URL}/api/virtual-gifting/send-gift/${userId}/${giftId}`,
    getReceivedGifts: (userId: string) =>
      `${BASE_URL}/api/virtual-gifting/received-gifts/${userId}`,
    redeemGift: (giftId: string) =>
      `${BASE_URL}/api/virtual-gifting/redeem-gift/${giftId}`,
  },

  toolbar: {
    fetchToolbarSize: `${BASE_URL}/api/toolbar/size`,
    updateToolbarSize: `${BASE_URL}/api/toolbar/size`,
  },

  security: {
    fetchEvents: `${BASE_URL}/api/security/events`,
    // You can add more endpoints related to security here if needed
  },  
  trading: {
    
  }
  // Add more sections as needed
};

export type { Endpoints, NestedEndpoints };

