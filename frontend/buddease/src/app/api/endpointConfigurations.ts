import { usersConfig } from '@/config/endpoints/usersConfig';
import { EndpointConfigurations } from '@/config/EndpointConfig';
import { apiWebBaseConfig } from '@/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/config/endpoints/commentsConfig';
import { contentConfig } from '@/config/endpoints/contentConfig';
import { dataConfig } from '@/config/endpoints/dataConfig';
import { documentsConfig } from '@/config/endpoints/documentsConfig';
import { delegatesConfig } from '@/config/endpoints/delegatesConfig';
import { webConfig } from '@/config/endpoints/webConfig';
import { sortingConfig } from '@/config/endpoints/sortingConfig';
import { filteringConfig } from '@/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/config/endpoints/loggingConfig';
import { newsConfig } from '@/config/endpoints/newsConfig';
import { notesConfig } from '@/config/endpoints/notesConfig';
import { projectsConfig } from '@/config/endpoints/projectsConfig';
import { searchingConfig } from '@/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/config/endpoints/snapshotsConfig';
import { uiConfig } from '@/config/endpoints/uiConfig';
import { versionConfig } from '@/config/endpoints/versionConfig';
import { tasksConfig } from '@/config/endpoints/tasksConfig';
import { teamsConfig } from '@/config/endpoints/teamsConfig';
import { todosConfig } from '@/config/endpoints/todosConfig';
import { usersConfig } from '@/config/endpoints/usersConfig';

import { authConfig } from '@/config/endpoints/authConfig';
import { blogsConfig } from '@/config/endpoints/blogsConfig';
import { calendarConfig } from '@/config/endpoints/calendarConfig';
import { chatConfig } from '@/config/endpoints/chatConfig';
import { clientConfig } from '@/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/config/endpoints/dataProvidersConfig';
import { dexConfig } from '@/config/endpoints/dexConfig';
import { detailsConfig } from '@/config/endpoints/detailsConfig';
import { donationsConfig } from '@/config/endpoints/donationsConfig';
import { drawingConfig } from '@/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/config/endpoints/feedbackConfig';
import { filesConfig } from '@/config/endpoints/filesConfig';
import { freelancersConfig } from '@/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/config/endpoints/globalCollaborationConfig';
import { markerConfig } from '@/config/endpoints/markerConfig';
import { moderatorsConfig } from '@/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/config/endpoints/parameterCustomizationConfig';
import { paymentConfig } from '@/config/endpoints/paymentConfig';
import { personasConfig } from '@/config/endpoints/personasConfig';
import { phasesConfig } from '@/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/config/endpoints/randomWalkConfig';
import { registrationConfig } from '@/config/endpoints/registrationConfig';
import { reportsConfig } from '@/config/endpoints/reportsConfig';
import { securityConfig } from '@/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/config/endpoints/themeConfig';
import { toolbarConfig } from '@/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/config/endpoints/videosConfig';
import { databaseConfig } from '@/config/endpoints/databaseConfig';
import { apiEndpointConfig } from '@/config/endpoints/apiEndpointConfig';
import { devConfig } from '@/config/endpoints/devConfig';
import { documentConfig } from '@/config/endpoints/documentConfig';
import { participantsConfig } from '@/config/endpoints/participantsConfig';
import { messagesConfig } from '@/config/endpoints/messagesConfig';
import { screenSharingConfig } from '@/config/endpoints/screenSharingConfig';
import { dataAnalysisConfig } from '@/config/endpoints/dataAnalysisConfig';
import { logsConfig } from '@/config/endpoints/logsConfig';
import { batchConfig } from '@/config/endpoints/batchConfig';

import { createMergedEndpoints } from './utils/endpointMerger';
import { createApiConfig } from './ApiConfig';



// Main endpoint configurations
export const endpointConfigurations: EndpointConfigurations = {
  apiWebBase: apiWebBaseConfig,
  comments: commentsConfig,
  content: contentConfig,
  data: dataConfig,
  documents: documentsConfig,
  delegates: delegatesConfig,
  web: webConfig,
  sorting: sortingConfig,
  filtering: filteringConfig,
  highlights: highlightsConfig,
  logging: loggingConfig,
  news: newsConfig,
  notes: notesConfig,
  projects: projectsConfig,
  searching: searchingConfig,
  snapshots: snapshotsConfig,
  ui: uiConfig,
  version: versionConfig,
  tasks: tasksConfig,
  teams: teamsConfig,
  todos: todosConfig,
  users: usersConfig,

  auth: authConfig,
  blogs: blogsConfig,
  calendar: calendarConfig,
  chat: chatConfig,
  client: clientConfig,
  collaborationTools: collaborationToolsConfig,
  communication: communicationConfig,
  communityInteraction: communityInteractionConfig,
  crypto: cryptoConfig,
  dataProviders: dataProvidersConfig,
  dex: dexConfig,
  details: detailsConfig,
  donations: donationsConfig,
  drawing: drawingConfig,
  externalAuth: externalAuthConfig,
  feedback: feedbackConfig,
  files: filesConfig,
  realtime: realtimeConfig,

  freelancers: freelancersConfig,
  generators: generatorsConfig,
  globalCollaboration: globalCollaborationConfig,
  marker: markerConfig,
  moderators: moderatorsConfig,
  monetization: monetizationConfig,
  parameterCustomization: parameterCustomizationConfig,
  payment: paymentConfig,
  personas: personasConfig,
  phases: phasesConfig,
  projectManagement: projectManagementConfig,
  projectOwner: projectOwnerConfig,
  randomWalk: randomWalkConfig,
  registration: registrationConfig,
  reports: reportsConfig,
  security: securityConfig,
  stateGovCities: stateGovCitiesConfig,
  teamManagement: teamManagementConfig,
  theme: themeConfig,
  toolbar: toolbarConfig,
  trading: tradingConfig,
  userManagement: userManagementConfig,
  userRoles: userRolesConfig,
  userRolesNFT: userRolesNFTConfig,
  userSettings: userSettingsConfig,
  videos: videosConfig,
  database: databaseConfig,
  apiConfig: apiEndpointConfig,
  dev: devConfig,
  document: documentConfig,
  participants: participantsConfig,
  messages: messagesConfig,
  screenSharing: screenSharingConfig,
  dataAnalysis: dataAnalysisConfig,
  logs: logsConfig,
  batch: batchConfig,
  users: usersConfig
};

// Export types
export type { EndpointConfig, EndpointConfigurations } from './types/EndpointConfigurations';

// Export individual configurations for selective imports
export {
  apiWebBaseConfig,
  commentsConfig,
  contentConfig,
  dataConfig,
  documentsConfig,
  delegatesConfig,
  webConfig,
  sortingConfig,
  filteringConfig,
  highlightsConfig,
  loggingConfig,
  newsConfig,
  notesConfig,
  projectsConfig,
  searchingConfig,
  snapshotsConfig,
  uiConfig,
  versionConfig,
  tasksConfig,
  teamsConfig,
  todosConfig,
  usersConfig,
  realtimeConfig,
  authConfig,
  blogsConfig,
  calendarConfig,
  chatConfig,
  clientConfig,
  collaborationToolsConfig,
  communicationConfig,
  communityInteractionConfig,
  cryptoConfig,
  dataProvidersConfig,
  dexConfig,
  detailsConfig,
  donationsConfig,
  drawingConfig,
  externalAuthConfig,
  feedbackConfig,
  filesConfig,
  freelancersConfig,
  generatorsConfig,
  globalCollaborationConfig,
  markerConfig,
  moderatorsConfig,
  monetizationConfig,
  parameterCustomizationConfig,
  paymentConfig,
  personasConfig,
  phasesConfig,
  projectManagementConfig,
  projectOwnerConfig,
  randomWalkConfig,
  registrationConfig,
  reportsConfig,
  securityConfig,
  stateGovCitiesConfig,
  teamManagementConfig,
  themeConfig,
  toolbarConfig,
  tradingConfig,
  userManagementConfig,
  userRolesConfig,
  userRolesNFTConfig,
  userSettingsConfig,
  videosConfig,
  databaseConfig,
  apiEndpointConfig,
  devConfig,
  documentConfig,
  participantsConfig,
  messagesConfig,
  screenSharingConfig,
  dataAnalysisConfig,
  logsConfig,
  batchConfig,
};



// Create merged endpoints
export const updatedEndpoints = createMergedEndpoints(endpointConfigurations);

// Export endpoints alias
export const endpoints = updatedEndpoints;

// Create API config instance
export const apiConfig = createApiConfig(endpointConfigurations, endpoints);

// Export types
export type { EndpointConfig, EndpointConfigurations } from './types/EndpointConfigurations';



// import useFiltering from "@/app/hooks/useFiltering";
// import { searchOptions } from "@/app/pages/searchs/SearchOptions";
// import useSearchOptions from "@/app/pages/searchs/useSearchOptions";
// import { BASE_URL } from "./baseUrl";
// import mergeConfigurations from "./mergeConfigurations";
// import { createApiConfig } from '@/app/api/ApiConfig'


// Helper function to get endpoint info
export const getApiEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => {
  return apiConfig.getEndpointInfo(category, endpointKey, ...params);
};

// Helper function to get endpoint URL
export const getApiEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => {
  return apiConfig.getEndpointUrl(category, endpointKey, ...params);
};






// // Define endpoint configurations

// const endpointConfigurations: EndpointConfigurations = {
//   apiWebBase: {
//     login: { path: "/login", method: "POST" },
//     logout: { path: "/logout", method: "POST" },
//   },
//   comments: {
//     list: { path: "/api/comments/list", method: "GET" },
//     single: (commentId: number) => ({ path: `/note/${commentId}`, method: "GET" }),
//   },
//   content: {
//     fetchContent: { path: "/api/content/fetch", method: "GET" },
//     createContent: { path: "/api/content/create", method: "POST" },
//     updateContent: { path: "/api/content/update", method: "PUT" },
//     deleteContent: { path: "/api/content/delete", method: "DELETE" },
//     publishContent: { path: "/api/content/publish", method: "POST" },
//     unpublishContent: { path: "/api/content/unpublish", method: "POST" },
//     searchContent: { path: "/api/content/search", method: "POST" },
//   },
//   data: {
//     single: { path: "/api/data/single", method: "GET" },
//     list: { path: "/api/data/list", method: "GET" },
//     getData: { path: "/api/data", method: "GET" },
//     addData: { path: "/api/data", method: "POST" },
//     getSpecificData: { path: "/api/data/{dataId}", method: "GET" },
//     deleteData: { path: "/api/data/{dataId}", method: "DELETE" },
//     updateDataTitle: { path: "/api/data/update_title", method: "PUT" },
//     streamData: { path: "/api/stream_data", method: "GET" },
//     dataProcessing: { path: "/api/data/data-processing", method: "POST" },
//     updateData: { path: "/api/data/update", method: "PUT" },
//     highlightList: { path: "/api/highlights", method: "GET" },
//     addHighlight: { path: "/api/highlights", method: "POST" },
//     getSpecificHighlight: { path: "/api/highlights/{highlightId}", method: "GET" },
//     updateHighlight: { path: "/api/highlights/{highlightId}", method: "PUT" },
//     deleteHighlight: { path: "/api/highlights/{highlightId}", method: "DELETE" },
//     uploadData: { path: "/api/data/upload", method: "POST" },
//     hypothesisTest: { path: `${BASE_URL}/api/data/hypothesis-test`, method: "POST" },
//   },

//   documents: {
//     // List all documents
//     list: { path: `${BASE_URL}/api/documents`, method: "GET" },
//     // Get a single document by its ID
//     single: (documentId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/documents/${documentId}`,
//       method: "GET",
//     }),
  
//     // Add a new document
//     add: { path: `${BASE_URL}/api/documents`, method: "POST" },

//     // Remove a document by its ID
//     remove: (documentId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/documents/${documentId}`,
//       method: "DELETE",
//     }),
  
//     // Update a document by its ID
//     update: (documentId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/documents/${documentId}`,
//       method: "PUT",
//     }),
  
//     // Download a document by its ID
//     download: (documentId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/documents/downloadDocument/${documentId}`,
//       method: "GET",
//     }),
   
//     // Search for documents
//     search: { path: `${BASE_URL}/api/documents/search`, method: "POST" },
//     // Filter documents
//     filter: { path: `${BASE_URL}/api/documents/filter`, method: "POST" },
//     // Upload a document
//     upload: { path: `${BASE_URL}/api/documents/upload`, method: "POST" },
//     // Share a document
//     share: { path: `${BASE_URL}/api/documents/share`, method: "POST" },
//     // Lock a document
//     lock: { path: `${BASE_URL}/api/documents/lock`, method: "POST" },
//     // Unlock a document
//     unlock: { path: `${BASE_URL}/api/documents/unlock`, method: "POST" },
//     // Archive a document
//     archive: { path: `${BASE_URL}/api/documents/archive`, method: "POST" },
//     // Restore a document
//     restore: { path: `${BASE_URL}/api/documents/restore`, method: "POST" },
//     // Move a document
//     move: { path: `${BASE_URL}/api/documents/move`, method: "POST" },
//     // Copy a document
//     copy: { path: `${BASE_URL}/api/documents/copy`, method: "POST" },
//     // Rename a document
//     rename: { path: `${BASE_URL}/api/documents/rename`, method: "PUT" },
//     // Change permissions on a document
//     changePermissions: { path: `${BASE_URL}/api/documents/changePermissions`, method: "POST" },
//     // Merge documents
//     merge: { path: `${BASE_URL}/api/documents/merge`, method: "POST" },
//     // Split a document
//     split: { path: `${BASE_URL}/api/documents/split`, method: "POST" },
//     // Validate a document
//     validate: { path: `${BASE_URL}/api/documents/validate`, method: "POST" },
//     // Encrypt a document
//     encrypt: { path: `${BASE_URL}/api/documents/encrypt`, method: "POST" },
//     // Decrypt a document
//     decrypt: { path: `${BASE_URL}/api/documents/decrypt`, method: "POST" },
//     // Track changes in a document
//     trackChanges: { path: `${BASE_URL}/api/documents/trackChanges`, method: "POST" },
//     // Compare two documents
//     compare: { path: `${BASE_URL}/api/documents/compare`, method: "POST" },
//     // Tag a document
//     tag: { path: `${BASE_URL}/api/documents/tag`, method: "POST" },
//     // Categorize a document
//     categorize: { path: `${BASE_URL}/api/documents/categorize`, method: "POST" },
//     // Customize the view for a document
//     customizeView: { path: `${BASE_URL}/api/documents/customizeView`, method: "POST" },
//     // Comment on a document
//     comment: { path: `${BASE_URL}/api/documents/comment`, method: "POST" },
//     // Mention a user in a document
//     mentionUser: { path: `${BASE_URL}/api/documents/mentionUser`, method: "POST" },
//     // Assign a task in a document
//     assignTask: { path: `${BASE_URL}/api/documents/assignTask`, method: "POST" },
//     // Request a review of a document
//     requestReview: { path: `${BASE_URL}/api/documents/requestReview`, method: "POST" },
//     // Approve a document
//     approve: { path: `${BASE_URL}/api/documents/approve`, method: "POST" },
//     // Reject a document
//     reject: { path: `${BASE_URL}/api/documents/reject`, method: "POST" },
//     // Request feedback on a document
//     requestFeedback: { path: `${BASE_URL}/api/documents/requestFeedback`, method: "POST" },
//     // Provide feedback on a document
//     provideFeedback: { path: `${BASE_URL}/api/documents/provideFeedback`, method: "POST" },
//     // Resolve feedback on a document
//     resolveFeedback: { path: `${BASE_URL}/api/documents/resolveFeedback`, method: "POST" },
//     // Collaborative editing of a document
//     collaborativeEditing: { path: `${BASE_URL}/api/documents/collaborativeEditing`, method: "POST" },
//     // Smart tagging of documents
//     smartTagging: { path: `${BASE_URL}/api/documents/smartTagging`, method: "POST" },
//     // Annotate a document
//     annotation: { path: `${BASE_URL}/api/documents/annotation`, method: "POST" },
//     // Log document activity
//     activityLogging: { path: `${BASE_URL}/api/documents/activityLogging`, method: "POST" },
//     // Intelligent search for documents
//     intelligentSearch: { path: `${BASE_URL}/api/documents/intelligentSearch`, method: "POST" },
//     // Create a new version of a document
//     createVersion: { path: `${BASE_URL}/api/documents/createVersion`, method: "POST" },
//     // Revert to a previous version of a document
//     revertVersion: { path: `${BASE_URL}/api/documents/revertVersion`, method: "POST" },
//     // View the history of a document
//     viewHistory: { path: `${BASE_URL}/api/documents/viewHistory`, method: "GET" },
//     // Compare versions of a document
//     compareVersions: { path: `${BASE_URL}/api/documents/compareVersions`, method: "POST" },
//     // Grant access to a document
//     grantAccess: { path: `${BASE_URL}/api/documents/grantAccess`, method: "POST" },
//     // Revoke access to a document
//     revokeAccess: { path: `${BASE_URL}/api/documents/revokeAccess`, method: "POST" },
//     // Manage permissions for a document
//     managePermissions: { path: `${BASE_URL}/api/documents/managePermissions`, method: "POST" },
//     // Initiate a workflow for a document
//     initiateWorkflow: { path: `${BASE_URL}/api/documents/initiateWorkflow`, method: "POST" },
//     // Automate tasks related to a document
//     automateTasks: { path: `${BASE_URL}/api/documents/automateTasks`, method: "POST" },
//     // Trigger events related to a document
//     triggerEvents: { path: `${BASE_URL}/api/documents/triggerEvents`, method: "POST" },
//     // Manage the document approval workflow
//     approvalWorkflow: { path: `${BASE_URL}/api/documents/approvalWorkflow`, method: "POST" },
//     // Manage the document lifecycle
//     lifecycleManagement: { path: `${BASE_URL}/api/documents/lifecycleManagement`, method: "POST" },
//     // Connect a document to an external system
//     connectExternalSystem: { path: `${BASE_URL}/api/documents/connectExternalSystem`, method: "POST" },
//     // Synchronize a document with cloud storage
//     synchronizeStorage: { path: `${BASE_URL}/api/documents/synchronizeStorage`, method: "POST" },
//     // Import a document from an external source
//     importFromExternal: { path: `${BASE_URL}/api/documents/importFromExternal`, method: "POST" },
//     // Export a document to an external system
//     exportToExternal: { path: `${BASE_URL}/api/documents/exportToExternal`, method: "POST" },
//     // Generate a report for a document
//     generateReport: { path: `${BASE_URL}/api/documents/generateReport`, method: "POST" },
//     // Export a report for a document
//     exportReport: { path: `${BASE_URL}/api/documents/exportReport`, method: "POST" },
//     // Schedule a report generation for a document
//     scheduleReport: { path: `${BASE_URL}/api/documents/scheduleReport`, method: "POST" },
//     // Customize the report for a document
//     customizeReport: { path: `${BASE_URL}/api/documents/customizeReport`, method: "POST" },
//     // Manage subscriptions to document updates
//     manageSubscriptions: { path: `${BASE_URL}/api/documents/manageSubscriptions`, method: "POST" },
//     // Handle document subscriptions
//     handleSubscriptions: { path: `${BASE_URL}/api/documents/handleSubscriptions`, method: "POST" },
//     // Notify users of document changes
//     notifyChanges: { path: `${BASE_URL}/api/documents/notifyChanges`, method: "POST" },
//     // Retrieve notification settings for documents
//     notificationSettings: { path: `${BASE_URL}/api/documents/notificationSettings`, method: "POST" },
//     // Backup documents
//     backup: { path: `${BASE_URL}/api/documents/backup`, method: "POST" },
//     // Retrieve a backup
//     retrieveBackup: { path: `${BASE_URL}/api/documents/retrieveBackup`, method: "GET" },
//     // Redact a document
//     redact: { path: `${BASE_URL}/api/documents/redact`, method: "PUT" },
//     // Access controls for documents
//     accessControls: { path: `${BASE_URL}/api/documents/accessControls`, method: "POST" },
//     // Get document templates
//     templates: { path: `${BASE_URL}/api/documents/templates`, method: "GET" },

//   },  
  
//   delegates: {
//     list: { path: "/api/delegates", method: "GET" },
//     single: (delegateId: number) => ({ path: `/api/delegates/${delegateId}`, method: "GET" }),
//     add: { path: "/api/delegates/add", method: "POST" },
//     remove: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/remove`, method: "DELETE" }),
//     update: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/update`, method: "PUT" }),
//     updateList: { path: "/api/delegates/updateList", method: "POST" },
//     search: { path: "/api/delegates/search", method: "POST" },
//     updateRole: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/updateRole`, method: "PUT" }),
//     updateRoles: (delegateIds: number[]) => ({ path: "/api/delegates/updateRoles", method: "POST", body: delegateIds }),
//     fetch: { path: "/api/delegates/fetch", method: "GET" },
//     create: { path: "/api/delegates/create", method: "POST" },
//     delete: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/delete`, method: "DELETE" }),
//     fetchById: (delegateId: number) => ({ path: `/api/delegates/${delegateId}/fetchById`, method: "GET" }),
//   },
//   filtering: {
//     filterTasks: { path: "/api/filtering/tasks", method: "POST" },
//   },
//   highlights: {
//     list: { path: "/api/highlights", method: "GET" },
//     add: { path: "/api/highlights", method: "POST" },
//     getSpecific: { path: "/api/highlights/{highlightId}", method: "GET" },
//     update: { path: "/api/highlights/{highlightId}", method: "PUT" },
//     delete: { path: "/api/highlights/{highlightId}", method: "DELETE" },
//     backend: { path: "/api/highlights/backend", method: "POST"},
//     frontend: { path: "/api/highlights/frontend", method: "POST"},
//   },
//   logging: {
//     logs: { path: `${BASE_URL}/logging`, method: "POST" },
//     logInfo: { path: `${BASE_URL}/logging/info`, method: "POST" },
//     logWarning: { path: `${BASE_URL}/logging/warning`, method: "POST" },
//     logError: { path: `${BASE_URL}/logging/error`, method: "POST" },
//     logSuccess: { path: `${BASE_URL}/logging/success`, method: "POST" },
//     logFailure: { path: `${BASE_URL}/logging/failure`, method: "POST" },
//   },
//   news: {
//     list: { path: "/news", method: "GET" },
//     single: (newsId: number) => ({ path: `/news/${newsId}`, method: "GET" }),
//     add: { path: "/news", method: "POST" },
//     update: (newsId: number) => ({ path: `/news/${newsId}`, method: "PUT" }),
//     remove: (newsId: number) => ({ path: `/news/${newsId}`, method: "DELETE" }),
//     search: { path: "/news/search", method: "POST" },
//     publish: (newsId: number) => ({ path: `/news/${newsId}/publish`, method: "PUT" }),
//     unpublish: (newsId: number) => ({ path: `/news/${newsId}/unpublish`, method: "PUT" }),
//   },
//   notes: {
//     list: { path: "/notes", method: "GET" },
//     single: (notesId: number) => ({ path: `/note/${notesId}`, method: "GET" }),
   
//   },
//   projects: {
//     list: { path: "/news", method: "GET" },
//     single: (projectId: number) => ({ path: `/projects/${projectId}`, method: "GET" }),
   
//   },
  
//   sorting: {
//     sortEvents: { path: "/api/sorting/events", method: "POST" },
//     sortMessages: { path: "/api/sorting/messages", method: "POST" },
//     snapshots: { path: "/api/sorting/snapshots", method: "POST" },
//   },
//   searching: {
//     searchMessages: { path: "/api/searching/messages", method: "POST" },
//     searchDelegates: { path: "/api/searching/delegates", method: "POST" },
//     searchTasks: { path: "/api/searching/tasks", method: "POST" },
//     searchContent: { path: "/api/searching/content", method: "POST" },
//     searchData: { path: "/api/searching/data", method: "POST" },
//     searchHighlights: { path: "/api/searching/highlights", method: "POST" },
//     searchTodos: { path: "/api/searching/todos", method: "POST" },
//   },
//   snapshots: {
//     list: { path: "/api/snapshots", method: "GET" },
//     create: { path: "/api/snapshots/create", method: "POST" },
//     single: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "GET" }),
//     add: { path: "/api/snapshots/add", method: "POST" },
//     remove: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/remove`, method: "DELETE" }),
//     update: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "PUT" }),
//     fetchUpdatedData: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/fetch-updated-data`, method: "GET" }),
//     bulkAdd: { path: "/api/snapshots/bulk-add", method: "POST" },
//     bulkRemove: { path: "/api/snapshots/bulk-remove", method: "POST" },
//     bulkUpdate: { path: "/api/snapshots/bulk-update", method: "POST" },
//   },

//   ui: {
//     // User Data & Settings
//     userData: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/data`,
//       method: "GET",
//     }),
//     userSettings: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/settings`,
//       method: "GET",
//     }),
//     updateUserSettings: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/settings`,
//       method: "PUT",
//     }),
    
//     // Dashboard
//     userDashboard: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/dashboard`,
//       method: "GET",
//     }),
//     updateDashboardLayout: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/dashboard/layout`,
//       method: "PUT",
//     }),
    
//     // Widgets
//     userWidgets: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/widgets`,
//       method: "GET",
//     }),
//     customizeWidget: (userId: string, widgetId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/widgets/${widgetId}/customize`,
//       method: "PUT",
//     }),
    
//     // Themes
//     userThemes: { 
//       path: `${BASE_URL}/api/ui/themes`, 
//       method: "GET" 
//     },
//     switchTheme: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/theme`,
//       method: "PUT",
//     }),
    
//     // Preferences
//     userPreferences: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/preferences`,
//       method: "GET",
//     }),
//     updateUserPreferences: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/preferences`,
//       method: "PUT",
//     }),
    
//     // Notifications
//     userNotifications: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/notifications`,
//       method: "GET",
//     }),
//     markNotificationRead: (userId: string, notificationId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/notifications/${notificationId}/read`,
//       method: "PUT",
//     }),
//     clearAllNotifications: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/notifications/clear`,
//       method: "DELETE",
//     }),
    
//     // Messages
//     userMessages: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/messages`,
//       method: "GET",
//     }),
//     sendMessage: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/messages/send`,
//       method: "POST",
//     }),
    
//     // Appearance
//     toggleDarkMode: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/dark-mode`,
//       method: "PUT",
//     }),
    
//     // Avatars
//     userAvatar: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/avatar`,
//       method: "GET",
//     }),
//     updateUserAvatar: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/avatar`,
//       method: "PUT",
//     }),
    
//     // Branding & Interface
//     branding: { 
//       path: `${BASE_URL}/api/ui/branding`, 
//       method: "GET" 
//     },
//     interfaceContent: { 
//       path: `${BASE_URL}/api/ui/interface/content`, 
//       method: "GET" 
//     },
//     updateInterfaceSettings: { 
//       path: `${BASE_URL}/api/ui/interface/settings`, 
//       method: "PUT" 
//     },
    
//     // UI Components
//     fetchComponents: { 
//       path: `${BASE_URL}/api/ui/components`, 
//       method: "GET" 
//     },
//     updateComponentState: (componentId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/components/${componentId}/state`,
//       method: "PUT",
//     }),
    
//     // Layout Management
//     saveLayout: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/layout/save`,
//       method: "POST",
//     }),
//     loadLayout: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/layout/load`,
//       method: "GET",
//     }),
//     resetLayout: (userId: string): EndpointConfig => ({
//       path: `${BASE_URL}/api/ui/user/${userId}/layout/reset`,
//       method: "DELETE",
//     }),
//   },
//   tasks: {
//     create: { path: "/api/tasks/create", method: "POST" },
//     list: { path: "/api/tasks", method: "GET" },
//     single: (taskId: number) => `/api/tasks/${taskId}`,
//     add: { path: "/api/tasks/add", method: "POST" },
//     remove: (taskId: number) => `/api/tasks/${taskId}/remove`,
//     process: { path: "/api/tasks/process", method: "POST" },
//     completeAll: { path: "/api/tasks/completeAll", method: "POST" },
//     toggle: (taskId: number) => `/api/tasks/${taskId}/toggle`,
//     removeMultiple: { path: "/api/tasks/removeMultiple", method: "POST" },
//     toggleMultiple: { path: "/api/tasks/toggleMultiple", method: "POST" },
//     markInProgress: (taskId: number) => `/api/tasks/${taskId}/markInProgress`,
//     update: (taskId: number) => `/api/tasks/${taskId}/update`,
//   },
//   teams: {
//     list: { path: "/api/teams", method: "GET" },
//     single: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "GET" }),
//     add: { path: "/api/teams", method: "POST" },
//     fetchTeamData: (teamId: number) => ({ path: `/api/teams/${teamId}/data`, method: "GET" }),
//     remove: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "DELETE" }),
//     update: (teamId: number) => ({ path: `/api/teams/${teamId}`, method: "PUT" }),
//     updateTeams: (teamIds: number[]) => ({ path: `/api/teams/${teamIds.join(",")}`, method: "PUT" }),
//   },
//   todos: {
//     create: `${BASE_URL}/api/todos/create`,
//     list: { path: "/api/todos", method: "GET" },
//     single: (todoId: number) => `${BASE_URL}/api/todos/${todoId}`,
//     add: { path: "/api/todos/add", method: "POST" },
//     remove: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/remove`,
//     process: { path: "/api/todos/process", method: "POST" },
//     update: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/update`,
//     delete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/delete`,
//     complete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/complete`,
//     uncomplete: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/uncomplete`,
//     fetch: `${BASE_URL}/api/todos`,
//     assign: (todoId: number, teamId: number) => `${BASE_URL}/api/todos/${todoId}/assign/${teamId}`,
//     reassign: (todoId: number, newTeamId: number) => `${BASE_URL}/api/todos/${todoId}/reassign/${newTeamId}`,
//     unassign: (todoId: number) => `${BASE_URL}/api/todos/${todoId}/unassign`,
//     toggle: (entityId: number, entityType: string) => `${BASE_URL}/api/toggle/${entityType}/${entityId}`,
//     search: `${BASE_URL}/api/todos/search`,
//     bulkAssign: `${BASE_URL}/api/todos/bulk-assign`,
//     bulkUnassign: `${BASE_URL}/api/todos/bulk-unassign`,
//     removeMultiple: { path: "/api/todos/removeMultiple", method: "POST" },
//     toggleMultiple: { path: "/api/todos/toggleMultiple", method: "POST" },
//   },
//   users: {
//     list: { path: "/users", method: "GET" },
//     single: (userId: number) => ({ path: `/users/${userId}`, method: "GET" }),
//     add: { path: "/users", method: "POST" },
//     remove: (userId: number) => ({ path: `/users/${userId}`, method: "DELETE" }),
//     update: (userId: number) => ({ path: `/users/${userId}`, method: "PUT" }),
//     updateList: { path: "/users/update-list", method: "POST" },
//     search: { path: "/users/search", method: "POST" },
//     updateRole: (userId: number) => ({ path: `/users/${userId}/update-role`, method: "PUT" }),
//     updateRoles: (userIds: number[]) => ({ path: `/users/${userIds.join(",")}/update-roles`, method: "PUT" }),
//   },
//   version: {
//     getVersion: { path: "/version", method: "GET" },
//     updateVersion: { path: "/version", method: "PUT" },
//     deleteVersion: { path: "/version", method: "DELETE" },
//     backend: { path: "/version/backend", method: "GET" },
//     frontend: {path: "/version/frontend", method: "GET"},
//   },
//   web: {
//     send: { path: "/api/messages/web/send", method: "POST" },
//     get: { path: "/api/messages/web/get", method: "GET" },
//     update: { path: "/api/messages/web/update", method: "PUT" },
//     delete: { path: "/api/messages/web/delete", method: "DELETE" },
//   },
// };
// /**
//  * Function to generate endpoint URL based on configuration.
//  * @param category - The category of the endpoint.
//  * @param endpoint - The specific endpoint to generate the URL for.
//  * @param params - Any parameters to include in the URL.
//  * @returns The generated endpoint URL.
//  */

// const generateEndpointUrl = (
//   category: keyof EndpointConfigurations,
//   endpoint: string,
//   params?: any
// ): string => {
//   const endpointConfig = endpointConfigurations[category][endpoint as keyof typeof endpointConfigurations[typeof category]] as EndpointConfig;
//   let url = `${BASE_URL}${endpointConfig.path}`;

//   // Handle dynamic parameters if needed
//   if (params) {
//     if (endpointConfig.method === "GET") {
//       const queryString = Object.keys(params)
//         .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
//         .join("&");
//       url += `?${queryString}`;
//     }
//   }

//   return url;
// };

// const { handleFilterTasks } = useSearchOptions();
// const { addFilter } = useFiltering(searchOptions);

// // Merge configurations dynamically
const updatedEndpoints = {


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
};

// export const endpoints = updatedEndpoints;

// export default endpointConfigurations;
// export { updatedEndpoints };
// export type {EndpointConfig, EndpointConfigurations}

// // Create API config instance
// export const apiConfig = createApiConfig(endpointConfigurations, endpoints);
