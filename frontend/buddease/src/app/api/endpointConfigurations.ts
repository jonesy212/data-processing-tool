// endpointConfigurations.ts
import useFiltering from '@/app/hooks/useFiltering';
import { BASE_URL } from '@/app/api/baseUrl'
import { searchOptions } from '@/app/pages/searches/SearchOptions';
import useSearchOptions from "@/app/pages/searches/useSearchOptions";
import { uiSettingsConfig } from '@/app/config/endpoints/uiSettingsConfig'
import { usersConfig } from '@/app/config/endpoints/usersConfig';
import { apiWebBaseConfig } from '@/app/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/app/config/endpoints/commentsConfig';
import { contentConfig } from '@/app/config/endpoints/contentConfig';
import { dataConfig } from '@/app/config/endpoints/dataConfig';
import { delegatesConfig } from '@/app/config/endpoints/delegatesConfig';
import { webConfig } from '@/app/config/endpoints/webConfig';
import { sortingConfig } from '@/app/config/endpoints/sortingConfig';
import { filteringConfig } from '@/app/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/app/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/app/config/endpoints/loggingConfig';
import { newsConfig } from '@/app/config/endpoints/newsConfig';
import { notesConfig } from '@/app/config/endpoints/notesConfig';
import { projectsConfig } from '@/app/config/endpoints/projectsConfig';
import { searchingConfig } from '@/app/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/app/config/endpoints/snapshotsConfig';
import { uiConfig } from '@/app/config/endpoints/uiConfig';
import { versionConfig } from '@/app/config/endpoints/versionConfig';
import { tasksConfig } from '@/app/config/endpoints/tasksConfig';
import { teamsConfig } from '@/app/config/endpoints/teamsConfig';
import { todosConfig } from '@/app/config/endpoints/todosConfig';

import { categoryConfig } from '@/app/config/endpoints/categoryConfig';
import { authConfig } from '@/app/config/endpoints/authConfig';
import { blogsConfig } from '@/app/config/endpoints/blogsConfig';
import { calendarConfig } from '@/app/config/endpoints/calendarConfig';
import { chatConfig } from '@/app/config/endpoints/chatConfig';
import { clientConfig } from '@/app/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/app/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/app/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/app/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/app/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/app/config/endpoints/dataProvidersConfig';
import { dexConfig } from '@/app/config/endpoints/dexConfig';
import { detailsConfig } from '@/app/config/endpoints/detailsConfig';
import { donationsConfig } from '@/app/config/endpoints/donationsConfig';

import { drawingConfig } from '@/app/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/app/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/app/config/endpoints/feedbackConfig';
import { filesConfig } from '@/app/config/endpoints/filesConfig';
import { freelancersConfig } from '@/app/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/app/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/app/config/endpoints/globalCollaborationConfig';
import { markerConfig } from '@/app/config/endpoints/markerConfig';
import { moderatorsConfig } from '@/app/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/app/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/app/config/endpoints/parameterCustomizationConfig';
import { paymentConfig } from '@/app/config/endpoints/paymentConfig';
import { personasConfig } from '@/app/config/endpoints/personasConfig';
import { phasesConfig } from '@/app/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/app/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/app/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/app/config/endpoints/randomWalkConfig';
import { registrationConfig } from '@/app/config/endpoints/registrationConfig';
import { reportsConfig } from '@/app/config/endpoints/reportsConfig';
import { securityConfig } from '@/app/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/app/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/app/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/app/config/endpoints/themeConfig';
import { toolbarConfig } from '@/app/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/app/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/app/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/app/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/app/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/app/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/app/config/endpoints/videosConfig';
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { apiEndpointConfig } from '@/app/config/endpoints/apiEndpointConfig';
import { devConfig } from '@/app/config/endpoints/devConfig';
import { documentsConfig } from '@/app/config/endpoints/documentsConfig';
import { participantsConfig } from '@/app/config/endpoints/participantsConfig';
import { messagesConfig } from '@/app/config/endpoints/messagesConfig';
import { screenSharingConfig } from '@/app/config/endpoints/screenSharingConfig';
import { dataAnalysisConfig } from '@/app/config/endpoints/dataAnalysisConfig';
import { logsConfig } from '@/app/config/endpoints/logsConfig';
import { realtimeConfig } from '@/app/config/endpoints/realtimeConfig';
import { batchConfig } from '@/app/config/endpoints/batchConfig';
import { analyticsConfig } from '@/app/config/endpoints/analyticsConfig';
import { createMergedEndpoints } from '@/app/utils/endpointMerger';
import ApiConfig from './ApiConfig';
import { EndpointConfigurations } from '@/app/config/EndpointConfig';

// Main endpoint configurations
export const endpointConfigurations: EndpointConfigurations = {
  analytics: analyticsConfig,
  apiConfig: apiEndpointConfig,
  apiWebBase: apiWebBaseConfig,
  auth: authConfig,
  batch: batchConfig,
  blogs: blogsConfig,
  calendar: calendarConfig,
  categories: categoryConfig,
  chat: chatConfig,
  client: clientConfig,
  collaborationTools: collaborationToolsConfig,
  comments: commentsConfig,
  communication: communicationConfig,
  communityInteraction: communityInteractionConfig,
  content: contentConfig,
  crypto: cryptoConfig,
  data: dataConfig,
  database: databaseConfig,
  dataAnalysis: dataAnalysisConfig,
  dataProviders: dataProvidersConfig,
  delegates: delegatesConfig,
  details: detailsConfig,
  dev: devConfig,
  dex: dexConfig,
  documents: documentsConfig,
  donations: donationsConfig,
  drawing: drawingConfig,
  externalAuth: externalAuthConfig,
  
  feedback: feedbackConfig,
  files: filesConfig,
  filtering: filteringConfig,
  
  freelancers: freelancersConfig,
  generators: generatorsConfig,
  globalCollaboration: globalCollaborationConfig,
  highlights: highlightsConfig,
  logging: loggingConfig,
  marker: markerConfig,
  messages: messagesConfig,
  moderators: moderatorsConfig,
  monetization: monetizationConfig,
  news: newsConfig,
  notes: notesConfig,
  payment: paymentConfig,
  parameterCustomization: parameterCustomizationConfig,
  participants: participantsConfig,
  personas: personasConfig,
  projects: projectsConfig,
  phases: phasesConfig,
  projectManagement: projectManagementConfig,
  projectOwner: projectOwnerConfig,
  randomWalk: randomWalkConfig,
  registration: registrationConfig,
  reports: reportsConfig,
  security: securityConfig,
  stateGovCities: stateGovCitiesConfig,
  sorting: sortingConfig,
  searching: searchingConfig,
  snapshots: snapshotsConfig,
  realtime: realtimeConfig,
  tasks: tasksConfig,
  teams: teamsConfig,
  teamManagement: teamManagementConfig,
  theme: themeConfig,
  toolbar: toolbarConfig,
  trading: tradingConfig,
  todos: todosConfig,
  ui: uiConfig,
  userManagement: userManagementConfig,
  userRoles: userRolesConfig,
  userRolesNFT: userRolesNFTConfig,
  userSettings: userSettingsConfig,
  videos: videosConfig,
  users: usersConfig,
  version: versionConfig,
  web: webConfig,

  screenSharing: screenSharingConfig,
  logs: logsConfig,
  uiSettings: uiSettingsConfig
};

// Export individual configurations for selective imports
export {
  analyticsConfig,
  apiWebBaseConfig,
  apiEndpointConfig,
  authConfig,
  batchConfig,
  blogsConfig,
  calendarConfig,
  categoryConfig,
  chatConfig,
  clientConfig,
  collaborationToolsConfig,
  commentsConfig,
  communicationConfig,
  communityInteractionConfig,
  contentConfig,
  cryptoConfig,
  dataConfig,
  databaseConfig,
  dataAnalysisConfig,
  dataProvidersConfig,
  delegatesConfig,
  detailsConfig,
  devConfig,
  dexConfig,
  documentsConfig,
  donationsConfig,
  drawingConfig,
  externalAuthConfig,
  feedbackConfig,
  filesConfig,
  filteringConfig,
  freelancersConfig,
  generatorsConfig,
  globalCollaborationConfig,
  highlightsConfig,
  loggingConfig,
  markerConfig,
  messagesConfig,
  moderatorsConfig,
  monetizationConfig,
  newsConfig,
  notesConfig,
  paymentConfig,
  parameterCustomizationConfig,
  participantsConfig,
  personasConfig,
  phasesConfig,
  projectManagementConfig,
  projectOwnerConfig,
  projectsConfig,
  randomWalkConfig,
  registrationConfig,
  reportsConfig,
  securityConfig,
  stateGovCitiesConfig,
  sortingConfig,
  searchingConfig,
  snapshotsConfig,
  realtimeConfig,
  tasksConfig,
  teamsConfig,
  teamManagementConfig,
  themeConfig,
  toolbarConfig,
  tradingConfig,
  todosConfig,
  uiConfig,
  userManagementConfig,
  userRolesConfig,
  userRolesNFTConfig,
  userSettingsConfig,
  usersConfig,
  videosConfig,
  versionConfig,
  webConfig,
  screenSharingConfig,
  logsConfig,
  uiSettingsConfig
};

// Merge endpoints and keep strong typing
export const endpoints: EndpointConfigurations = createMergedEndpoints(endpointConfigurations);

// Create API config instance with typed endpoints
export const apiConfig = new ApiConfig(endpointConfigurations, endpoints);

// Factory function for custom ApiConfig instances
export const createApiConfig = (
  configurations: EndpointConfigurations,
  endpoints: EndpointConfigurations
): ApiConfig => {
  return new ApiConfig(configurations, endpoints);
};

// Helper function to get endpoint info
export const getApiEndpoint = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => apiConfig.getEndpointInfo(category, endpointKey, ...params);

// Helper function to get endpoint URL
export const getApiEndpointUrl = <T extends keyof EndpointConfigurations>(
  category: T,
  endpointKey: keyof EndpointConfigurations[T],
  ...params: any[]
) => apiConfig.getUrl(category, endpointKey, ...params);

// Export default API instance
export default apiConfig;

// UI hooks (keep if used)
const { handleFilterTasks } = useSearchOptions();
const { addFilter } = useFiltering(searchOptions);
